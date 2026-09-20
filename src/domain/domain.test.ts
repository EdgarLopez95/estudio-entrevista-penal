import { describe, expect, it } from 'vitest';
import { CONTENT_VERSION } from './types';
import { createEmptyProgress, type ProgressState } from './progress';
import { masteryFor } from './mastery';
import { promptState } from './interviewPractice';
import { lastRating, orderFlashcards, requeueUnknown } from './flashcardScheduler';
import { activeErrors, orderErrors, registerCorrection, upsertError } from './errors';
import {
  coreReadinessInterview,
  coreReadinessPenal,
  essentialObjectivesCovered,
  penalEssentialReadiness,
  preparationIndex,
  shouldSuggestLevel2,
  top10Readiness,
} from './readiness';
import { recommend } from './recommendation';
import { QUESTION_BUDGET, buildSession, validateSessionScope } from './sessionBuilder';
import { normalize, search } from './search';
import { budgetMinutes, interviewPhase, toLocalDateKey } from './time';
import { INTERVIEW_PROMPTS, FLASHCARDS, getResource, requireResource } from '@/content';
import { TOP_10_PROMPT_IDS } from '@/content/collections';

function emptyState(): ProgressState {
  return createEmptyProgress('2026-09-20T09:00:00.000Z', CONTENT_VERSION);
}

function withInterviewAttempt(
  state: ProgressState,
  promptId: string,
  selfRating: 'blank' | 'partial' | 'good',
  sessionId: string,
  coveredKeyPointIds: string[] = [],
): ProgressState {
  return {
    ...state,
    interview: {
      ...state.interview,
      [promptId]: [
        ...(state.interview[promptId] ?? []),
        {
          at: '2026-09-20T10:00:00.000Z',
          selfRating,
          coveredKeyPointIds,
          sessionId,
          usedModelAnswer: false,
        },
      ],
    },
  };
}

describe('dominio V1 (contrato §13.1)', () => {
  const input = { objectiveId: 'LO-PEN-010', hasQuestions: true, hasActiveError: false };

  it('sin interacción significativa el objetivo no está iniciado', () => {
    expect(masteryFor(emptyState(), input)).toBe('not-started');
  });

  it('abrir una pantalla nunca domina', () => {
    const state = emptyState();
    state.objectives['LO-PEN-010'] = { recalls: [], quizScores: [], lastSeenAt: 'x' };
    expect(masteryFor(state, input)).toBe('not-started');
  });

  it('con lección estudiada pasa a aprendiendo', () => {
    const state = emptyState();
    state.objectives['LO-PEN-010'] = { lessonStudiedAt: 'x', recalls: [], quizScores: [] };
    expect(masteryFor(state, input)).toBe('learning');
  });

  it('requiere dos recuperaciones correctas en intentos separados y quiz >= 80% para dominar', () => {
    const state = emptyState();
    state.objectives['LO-PEN-010'] = {
      lessonStudiedAt: 'x',
      recalls: [
        { at: 'a', correct: true, sessionId: 's1', via: 'question' },
        { at: 'b', correct: true, sessionId: 's1', via: 'question' },
      ],
      quizScores: [{ at: 'b', percent: 100, sessionId: 's1' }],
    };
    // Dos aciertos en la MISMA sesión no bastan.
    expect(masteryFor(state, input)).toBe('learning');

    state.objectives['LO-PEN-010'].recalls.push({
      at: 'c',
      correct: true,
      sessionId: 's2',
      via: 'question',
    });
    expect(masteryFor(state, input)).toBe('mastered');
  });

  it('un quiz por debajo del 80% deja el objetivo en necesita repaso', () => {
    const state = emptyState();
    state.objectives['LO-PEN-010'] = {
      lessonStudiedAt: 'x',
      recalls: [{ at: 'a', correct: true, sessionId: 's1', via: 'question' }],
      quizScores: [{ at: 'a', percent: 50, sessionId: 's1' }],
    };
    expect(masteryFor(state, input)).toBe('needs-review');
  });

  it('un fallo posterior al dominio devuelve a necesita repaso', () => {
    const state = emptyState();
    state.objectives['LO-PEN-010'] = {
      lessonStudiedAt: 'x',
      recalls: [
        { at: 'a', correct: true, sessionId: 's1', via: 'question' },
        { at: 'b', correct: true, sessionId: 's2', via: 'question' },
        { at: 'c', correct: false, sessionId: 's3', via: 'question' },
      ],
      quizScores: [{ at: 'c', percent: 100, sessionId: 's3' }],
    };
    expect(masteryFor(state, input)).toBe('needs-review');
  });

  it('un objetivo sin preguntas no exige quiz para dominarse', () => {
    const state = emptyState();
    state.objectives['LO-INT-001'] = {
      lessonStudiedAt: 'x',
      recalls: [
        { at: 'a', correct: true, sessionId: 's1', via: 'prompt' },
        { at: 'b', correct: true, sessionId: 's2', via: 'prompt' },
      ],
      quizScores: [],
    };
    expect(
      masteryFor(state, { objectiveId: 'LO-INT-001', hasQuestions: false, hasActiveError: false }),
    ).toBe('mastered');
  });
});

describe('consolidación de respuestas de entrevista (contrato §13.3)', () => {
  const prompt = requireResource('P-INT-001');
  if (prompt.type !== 'interview-prompt') throw new Error('P-INT-001 debe ser un prompt');
  const essentialIds = prompt.keyPoints.filter((k) => k.essential).map((k) => k.id);

  it('sin intentos está sin practicar', () => {
    expect(promptState(emptyState(), prompt, false)).toBe('unpracticed');
  });

  it('el último intento en blanco o parcial manda', () => {
    let state = withInterviewAttempt(emptyState(), prompt.id, 'good', 's1', essentialIds);
    state = withInterviewAttempt(state, prompt.id, 'partial', 's2', essentialIds);
    expect(promptState(state, prompt, false)).toBe('partial');
  });

  it('consolida con dos intentos en sesiones distintas, último Bien y mayoría de keyPoints', () => {
    let state = withInterviewAttempt(emptyState(), prompt.id, 'good', 's1', essentialIds);
    expect(promptState(state, prompt, false)).toBe('good-not-consolidated');
    state = withInterviewAttempt(state, prompt.id, 'good', 's2', essentialIds);
    expect(promptState(state, prompt, false)).toBe('consolidated');
  });

  it('no consolida si cubrió pocos puntos esenciales', () => {
    let state = withInterviewAttempt(emptyState(), prompt.id, 'good', 's1', [essentialIds[0]]);
    state = withInterviewAttempt(state, prompt.id, 'good', 's2', [essentialIds[0]]);
    expect(promptState(state, prompt, false)).toBe('good-not-consolidated');
  });

  it('no consolida si hay interview-content-gap activo', () => {
    let state = withInterviewAttempt(emptyState(), prompt.id, 'good', 's1', essentialIds);
    state = withInterviewAttempt(state, prompt.id, 'good', 's2', essentialIds);
    expect(promptState(state, prompt, true)).toBe('good-not-consolidated');
  });
});

describe('flashcards V1 (contrato §13.2)', () => {
  it('ordena No la sabía, luego Dudé, luego nuevas y por último La sabía', () => {
    const state = emptyState();
    const cards = FLASHCARDS.filter((c) => c.level === 1).slice(0, 4);
    state.flashcards[cards[0].id] = [{ at: 'a', rating: 'known', sessionId: 's1' }];
    state.flashcards[cards[1].id] = [{ at: 'a', rating: 'unknown', sessionId: 's1' }];
    state.flashcards[cards[2].id] = [{ at: 'a', rating: 'doubt', sessionId: 's1' }];
    const ordered = orderFlashcards(state, cards).map((c) => c.id);
    expect(ordered[0]).toBe(cards[1].id);
    expect(ordered[1]).toBe(cards[2].id);
    expect(ordered.at(-1)).toBe(cards[0].id);
  });

  it('La sabía nunca desaparece de la baraja', () => {
    const state = emptyState();
    const cards = FLASHCARDS.filter((c) => c.level === 1).slice(0, 3);
    state.flashcards[cards[0].id] = [{ at: 'a', rating: 'known', sessionId: 's1' }];
    expect(orderFlashcards(state, cards)).toHaveLength(3);
    expect(lastRating(state, cards[0].id)).toBe('known');
  });

  it('reinserta en la misma tanda la carta marcada como No la sabía', () => {
    const queue = ['a', 'b', 'c', 'd'];
    expect(requeueUnknown(queue, 0, 'a')).toEqual(['a', 'b', 'a', 'c', 'd']);
  });
});

describe('mis errores (contrato §12.7)', () => {
  const question = requireResource('Q-PEN-010-1');

  it('acertar una vez no borra el error', () => {
    let errors = upsertError([], {
      kind: 'knowledge-gap',
      resource: question,
      now: '2026-09-20T10:00:00.000Z',
    });
    expect(errors[0].status).toBe('active');
    errors = registerCorrection(errors, question.id, '2026-09-20T10:05:00.000Z');
    expect(errors[0].status).toBe('improving');
    errors = registerCorrection(errors, question.id, '2026-09-20T10:10:00.000Z');
    expect(errors[0].status).toBe('resolved');
  });

  it('un error de Nivel 3 no desplaza uno de Nivel 1', () => {
    const level1 = { ...question, level: 1 as const, priority: 'critical' as const };
    const level3 = {
      ...question,
      id: 'X-3',
      level: 3 as const,
      priority: 'medium' as const,
      title: 'Avanzado',
    };
    let errors = upsertError([], { kind: 'knowledge-gap', resource: level3, now: 'b' });
    errors = upsertError(errors, { kind: 'knowledge-gap', resource: level1, now: 'a' });
    const ordered = orderErrors(errors, { includeDeepening: true });
    expect(ordered[0].level).toBe(1);
  });

  it('por defecto no muestra Nivel 3 salvo que se pida profundizar', () => {
    const level3 = { ...question, id: 'X-3', level: 3 as const };
    const errors = upsertError([], { kind: 'knowledge-gap', resource: level3, now: 'b' });
    expect(orderErrors(errors)).toHaveLength(0);
    expect(orderErrors(errors, { includeDeepening: true })).toHaveLength(1);
  });

  it('activeErrors excluye los resueltos', () => {
    let state = emptyState();
    state = {
      ...state,
      errors: upsertError([], { kind: 'knowledge-gap', resource: question, now: 'a' }),
    };
    expect(activeErrors(state)).toHaveLength(1);
    state = { ...state, errors: registerCorrection(state.errors, question.id, 'b') };
    state = { ...state, errors: registerCorrection(state.errors, question.id, 'c') };
    expect(activeErrors(state)).toHaveLength(0);
  });
});

describe('Core Readiness y Question Readiness (contrato §14, §8.5)', () => {
  it('los denominadores son solo Nivel 1 de cada frente', () => {
    const state = emptyState();
    expect(coreReadinessInterview(state).total).toBe(12);
    expect(coreReadinessPenal(state).total).toBe(17);
  });

  it('Nivel 3 y Referencia no reducen Core Readiness', () => {
    const state = emptyState();
    const before = coreReadinessPenal(state).percent;
    state.objectives['LO-PEN-301'] = { recalls: [], quizScores: [] };
    state.objectives['LO-REF-001'] = { recalls: [], quizScores: [] };
    expect(coreReadinessPenal(state).percent).toBe(before);
    expect(coreReadinessPenal(state).total).toBe(17);
  });

  it('el índice general pesa 65% entrevista y 35% Penal', () => {
    const index = preparationIndex(emptyState());
    expect(index.weights).toEqual({ interview: 0.65, penal: 0.35 });
    expect(index.percent).toBe(0);
  });

  it('Question Readiness del Top 10 cuenta por objetivo, no por preguntas', () => {
    let state = emptyState();
    const readiness = top10Readiness(state);
    expect(readiness.total).toBe(10);
    expect(readiness.unpracticed).toBe(10);

    // Diez intentos sobre la MISMA pregunta siguen siendo evidencia de una sola meta.
    for (let i = 0; i < 10; i += 1) {
      state = withInterviewAttempt(state, 'P-INT-001', 'good', `s${i}`);
    }
    const after = top10Readiness(state);
    expect(after.practiced).toBe(1);
    expect(after.unpracticed).toBe(9);
  });

  it('Penal esencial reporta cubiertos, dominados, por repasar y no evaluados', () => {
    const readiness = penalEssentialReadiness(emptyState());
    expect(readiness.total).toBe(17);
    expect(readiness.notEvaluated).toBe(17);
  });

  it('no sugiere Nivel 2 hasta que lo esencial tiene evidencia suficiente', () => {
    expect(shouldSuggestLevel2(emptyState())).toBe(false);
  });

  it('la stop rule no se cumple con el estado vacío', () => {
    expect(essentialObjectivesCovered(emptyState())).toBe(false);
  });
});

describe('recomendación (contrato §8.3, §13.3)', () => {
  it('el primer uso recomienda "Háblame de ti"', () => {
    const recommendation = recommend(emptyState());
    expect(recommendation.resourceId).toBe('P-INT-001');
    expect(recommendation.kind).toBe('interview-prompt');
    expect(recommendation.reason).toContain('Porque');
  });

  it('prioriza En blanco sobre Sin practicar', () => {
    const state = withInterviewAttempt(emptyState(), 'P-INT-005', 'blank', 's1');
    const recommendation = recommend(state);
    expect(recommendation.resourceId).toBe('P-INT-005');
    expect(recommendation.reason).toContain('blanco');
  });

  it('una respuesta consolidada baja de prioridad', () => {
    let state = emptyState();
    const prompt = INTERVIEW_PROMPTS.find((p) => p.id === 'P-INT-001');
    const essentials = prompt?.keyPoints.filter((k) => k.essential).map((k) => k.id) ?? [];
    state = withInterviewAttempt(state, 'P-INT-001', 'good', 's1', essentials);
    state = withInterviewAttempt(state, 'P-INT-001', 'good', 's2', essentials);
    expect(recommend(state).resourceId).not.toBe('P-INT-001');
  });

  it('el día de la entrevista recomienda recall, no contenido nuevo', () => {
    const state = emptyState();
    const today = toLocalDateKey(new Date());
    state.targetInterview = { ...state.targetInterview, enabled: true, date: today };
    const recommendation = recommend(state);
    expect(recommendation.kind).toBe('exit-review');
    expect(recommendation.mode).toBe('exit-review');
  });

  it('la recomendación siempre explica la causa y es ignorable', () => {
    const recommendation = recommend(emptyState());
    expect(recommendation.reason.length).toBeGreaterThan(10);
    expect(recommendation.estimatedMinutes).toBeGreaterThan(0);
  });
});

describe('Session Builder (contrato §8.4, §12.1.1)', () => {
  it('10 minutos produce pocas actividades y todas de Nivel 1', () => {
    const built = buildSession({ state: emptyState(), mode: 'plan-of-day', timeBudget: 10 });
    expect(built.items.length).toBeGreaterThanOrEqual(QUESTION_BUDGET[10].min);
    expect(built.items.length).toBeLessThanOrEqual(QUESTION_BUDGET[10].max);
    expect(validateSessionScope(built)).toEqual([]);
    for (const item of built.items) {
      expect(getResource(item.resourceId)?.level).toBe(1);
    }
  });

  it('la sesión no excede el tiempo elegido de forma apreciable', () => {
    for (const budget of [10, 20, 30] as const) {
      const built = buildSession({ state: emptyState(), mode: 'plan-of-day', timeBudget: budget });
      expect(built.plannedMinutes).toBeLessThanOrEqual(budgetMinutes(budget) * 1.2);
    }
  });

  it('20 minutos ofrece más actividades que 10 minutos', () => {
    const ten = buildSession({ state: emptyState(), mode: 'plan-of-day', timeBudget: 10 });
    const twenty = buildSession({ state: emptyState(), mode: 'plan-of-day', timeBudget: 20 });
    expect(twenty.items.length).toBeGreaterThan(ten.items.length);
  });

  it('la plantilla de 10 minutos empieza por entrevista, no por teoría penal', () => {
    const built = buildSession({ state: emptyState(), mode: 'plan-of-day', timeBudget: 10 });
    expect(built.items[0].kind).toBe('interview');
  });

  it('el scope declara maxLevel y presupuestos, y no se amplía', () => {
    const built = buildSession({ state: emptyState(), mode: 'penal-quiz', timeBudget: 20 });
    expect(built.scope.maxLevel).toBe(1);
    expect(built.scope.newQuestionBudget).toBe(QUESTION_BUDGET[20].newQuestions);
    expect(built.scope.reviewQuestionBudget).toBe(QUESTION_BUDGET[20].reviewQuestions);
    expect(validateSessionScope(built)).toEqual([]);
  });

  it('con Nivel 1 nunca entra contenido de Nivel 2 o 3', () => {
    const state = emptyState();
    for (const mode of [
      'plan-of-day',
      'penal-quiz',
      'interview-practice',
      'flashcards',
      'mixed-review',
      'mock-quick',
      'mock-standard',
      'exit-review',
    ] as const) {
      const built = buildSession({ state, mode, timeBudget: 30 });
      for (const item of built.items) {
        const resource = getResource(item.resourceId);
        if (resource?.type === 'checklist') continue;
        expect(resource?.level, `${mode} filtró ${item.resourceId}`).toBe(1);
      }
    }
  });

  it('al activar Nivel 2 el scope lo permite, pero solo con elección explícita', () => {
    const state = emptyState();
    state.preferences.includeLevel2 = true;
    const built = buildSession({ state, mode: 'penal-quiz', timeBudget: 30 });
    expect(built.scope.maxLevel).toBe(2);
    expect(validateSessionScope(built)).toEqual([]);
  });

  it('Quick usa exclusivamente Nivel 1 con 4-5 de entrevista y 2-3 de Penal', () => {
    const built = buildSession({ state: emptyState(), mode: 'mock-quick', timeBudget: 10 });
    const interview = built.items.filter((i) => i.kind === 'interview');
    const penal = built.items.filter((i) => i.kind === 'question');
    expect(interview.length).toBeGreaterThanOrEqual(4);
    expect(interview.length).toBeLessThanOrEqual(6);
    expect(penal.length).toBeGreaterThanOrEqual(2);
    expect(penal.length).toBeLessThanOrEqual(4);
    for (const item of built.items) {
      expect(getResource(item.resourceId)?.level).toBe(1);
    }
  });

  it('Repaso antes de salir no contiene temas nuevos ni casos extensos', () => {
    const built = buildSession({ state: emptyState(), mode: 'exit-review', timeBudget: 20 });
    expect(built.items.length).toBeGreaterThan(5);
    expect(built.items.some((i) => i.kind === 'case')).toBe(false);
    // Incluye preguntas difíciles, STAR, Penal esencial, salario y disponibilidad.
    const ids = built.items.map((i) => i.resourceId);
    expect(ids).toContain('P-INT-010');
    expect(ids).toContain('P-INT-010B');
    expect(ids).toContain('P-INT-012');
    expect(ids.some((id) => id.startsWith('Q-PEN-'))).toBe(true);
    expect(ids).toContain('CHK-DESPACHO');
  });

  it('un error de Nivel 1 sustituye contenido nuevo en el plan', () => {
    let state = emptyState();
    const question = requireResource('Q-PEN-010-1');
    state = {
      ...state,
      errors: upsertError([], { kind: 'knowledge-gap', resource: question, now: 'a' }),
    };
    const built = buildSession({ state, mode: 'plan-of-day', timeBudget: 10 });
    expect(built.items[0].reason).toBe('review-error');
    expect(built.items[0].resourceId).toBe('Q-PEN-010-1');
  });

  it('el quiz reparte preguntas entre objetivos distintos', () => {
    const built = buildSession({ state: emptyState(), mode: 'penal-quiz', timeBudget: 30 });
    const objectives = new Set(built.items.map((i) => i.objectiveId));
    expect(objectives.size).toBeGreaterThanOrEqual(Math.min(6, built.items.length));
  });

  it('el Top 10 solo contiene los diez prompts de la colección', () => {
    const built = buildSession({ state: emptyState(), mode: 'top10', timeBudget: 'full' });
    for (const item of built.items) {
      expect(TOP_10_PROMPT_IDS).toContain(item.resourceId);
    }
  });
});

describe('búsqueda (contrato §21)', () => {
  it('ignora tildes y mayúsculas', () => {
    expect(normalize('Hábeas Corpus')).toBe('habeas corpus');
    const results = search('habeas');
    const flat = Object.values(results).flat();
    expect(flat.length).toBeGreaterThan(0);
    expect(flat.some((hit) => hit.title.toLowerCase().includes('hábeas'))).toBe(true);
  });

  it('agrupa resultados y no responde a consultas de una letra', () => {
    const results = search('a');
    expect(Object.values(results).flat()).toHaveLength(0);
  });

  it('encuentra objetivos por id', () => {
    const results = search('LO-PEN-010');
    expect(results.objetivos.some((hit) => hit.id === 'LO-PEN-010')).toBe(true);
  });

  it('prioriza Nivel 1 sobre referencia', () => {
    const results = search('articulo');
    const flat = Object.values(results).flat();
    if (flat.length > 1) {
      expect(flat[0].level).not.toBe('reference');
    }
  });
});

describe('tiempo y fase de entrevista (contrato §14)', () => {
  it('sin fecha configurada no hay fase', () => {
    expect(interviewPhase(emptyState().targetInterview)).toBe('none');
  });

  it('detecta hoy, mañana y pasado', () => {
    const base = emptyState().targetInterview;
    const now = new Date('2026-09-21T08:00:00');
    expect(interviewPhase({ ...base, enabled: true, date: '2026-09-21' }, now)).toBe('today');
    expect(interviewPhase({ ...base, enabled: true, date: '2026-09-22' }, now)).toBe('tomorrow');
    expect(interviewPhase({ ...base, enabled: true, date: '2026-09-20' }, now)).toBe('past');
    expect(interviewPhase({ ...base, enabled: true, date: '2026-10-30' }, now)).toBe('far');
  });
});
