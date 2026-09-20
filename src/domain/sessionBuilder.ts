import type {
  Level,
  MockProfile,
  SessionItem,
  SessionItemKind,
  SessionMode,
  SessionScope,
  StudyResource,
  TimeBudget,
} from './types';
import type { ProgressState } from './progress';
import {
  CASES,
  FLASHCARDS,
  INTERVIEW_PROMPTS,
  LESSONS,
  QUESTIONS,
  getResource,
  lessonForObjective,
  questionsForObjective,
} from '@/content';
import { LEARNING_OBJECTIVES, getObjective } from '@/content/objectives';
import {
  EXIT_REVIEW_CHECKLIST_IDS,
  HARD_PROMPT_IDS,
  PENAL_ESSENTIAL_OBJECTIVE_IDS,
  TOP_10_PROMPT_IDS,
} from '@/content/collections';
import { PROMPT_STATE_PRIORITY, promptState } from './interviewPractice';
import { activeErrors, hasActiveGap, orderErrors } from './errors';
import { lastRating, orderFlashcards } from './flashcardScheduler';
import { objectiveStatuses } from './readiness';
import { INTERVIEW_BLUEPRINT_LEVEL_1, mockComposition, penalQuizBlueprint } from './blueprints';
import { budgetMinutes, interviewPhase } from './time';

/**
 * Session Builder (contrato §8.4). Recibe exclusivamente activeTrack, activeLevel/maxLevel,
 * timeBudget, mode, allowedObjectiveIds, recentErrors, recentDoubts, newQuestionBudget y
 * reviewQuestionBudget; guarda `sessionScope` con esos valores y NO lo amplía silenciosamente.
 */

/** Peso en minutos de planificación por tipo de ítem. Los prompts orales pesan más. */
export const ITEM_WEIGHT: Record<SessionItemKind, number> = {
  interview: 3,
  lesson: 2.5,
  question: 1,
  flashcard: 0.75,
  case: 10,
  checklist: 1.5,
};

/** Question budget orientativo del contrato §8.4. */
export const QUESTION_BUDGET: Record<
  Exclude<TimeBudget, 'full'> | 'full',
  { min: number; max: number; newQuestions: number; reviewQuestions: number }
> = {
  10: { min: 3, max: 5, newQuestions: 3, reviewQuestions: 2 },
  20: { min: 5, max: 8, newQuestions: 5, reviewQuestions: 3 },
  30: { min: 8, max: 12, newQuestions: 8, reviewQuestions: 4 },
  60: { min: 12, max: 22, newQuestions: 14, reviewQuestions: 6 },
  full: { min: 14, max: 30, newQuestions: 20, reviewQuestions: 8 },
};

export function maxLevelFor(state: ProgressState): Level {
  return state.preferences.includeLevel2 ? 2 : 1;
}

function levelAllowed(resourceLevel: Level, maxLevel: Level): boolean {
  if (resourceLevel === 'reference') return false;
  if (maxLevel === 'reference') return false;
  const numericMax = typeof maxLevel === 'number' ? maxLevel : 1;
  return typeof resourceLevel === 'number' && resourceLevel <= numericMax;
}

export interface BuildSessionInput {
  state: ProgressState;
  mode: SessionMode;
  timeBudget: TimeBudget;
  now?: Date;
  /** Objetivos permitidos, si el modo los restringe (por ejemplo "lo que acabo de estudiar"). */
  allowedObjectiveIds?: string[];
  mockProfile?: MockProfile;
  /** Colección concreta que origina la sesión (top10, dificiles, penal-esencial). */
  collectionId?: string;
  /** Recurso único que se abre directamente desde una recomendación. */
  focusResourceId?: string;
}

export interface BuiltSession {
  scope: SessionScope;
  items: SessionItem[];
  label: string;
  /** Minutos de planificación estimados. */
  plannedMinutes: number;
}

function uniqueItems(items: SessionItem[]): SessionItem[] {
  const seen = new Set<string>();
  const result: SessionItem[] = [];
  for (const item of items) {
    if (seen.has(item.resourceId)) continue;
    seen.add(item.resourceId);
    result.push(item);
  }
  return result;
}

function toItem(resource: StudyResource, reason: SessionItem['reason']): SessionItem {
  const kind: SessionItemKind =
    resource.type === 'interview-prompt'
      ? 'interview'
      : resource.type === 'star-story'
        ? 'interview'
        : (resource.type as SessionItemKind);
  return { kind, resourceId: resource.id, objectiveId: resource.learningObjectiveId, reason };
}

function weight(items: SessionItem[]): number {
  return items.reduce((total, item) => total + ITEM_WEIGHT[item.kind], 0);
}

/** Prompts de entrevista Nivel <= maxLevel ordenados por prioridad interna (§13.3). */
function orderedPrompts(
  state: ProgressState,
  maxLevel: Level,
  filter: (promptId: string) => boolean = () => true,
) {
  return INTERVIEW_PROMPTS.filter(
    (prompt) => levelAllowed(prompt.level, maxLevel) && filter(prompt.id),
  )
    .map((prompt) => ({
      prompt,
      priority:
        PROMPT_STATE_PRIORITY[
          promptState(state, prompt, hasActiveGap(state, prompt.id, 'interview-content-gap'))
        ],
      order: getObjective(prompt.learningObjectiveId)?.order ?? 99,
    }))
    .sort((a, b) => a.priority - b.priority || a.order - b.order)
    .map((entry) => entry.prompt);
}

/** Preguntas Penal dentro del scope, cubriendo objetivos distintos antes de repetir objetivo. */
function spreadQuestions(
  state: ProgressState,
  objectiveIds: string[],
  count: number,
  maxLevel: Level,
): SessionItem[] {
  const statuses = objectiveStatuses(
    state,
    LEARNING_OBJECTIVES.filter((o) => objectiveIds.includes(o.id)),
  ).sort((a, b) => {
    const urgency = (mastery: string) =>
      mastery === 'needs-review' ? 0 : mastery === 'not-started' ? 1 : mastery === 'learning' ? 2 : 3;
    return urgency(a.mastery) - urgency(b.mastery) || a.objective.order - b.objective.order;
  });

  const picked: SessionItem[] = [];
  const usedQuestionIds = new Set<string>();
  let round = 0;
  while (picked.length < count && round < 4) {
    for (const status of statuses) {
      if (picked.length >= count) break;
      const pool = questionsForObjective(status.objective.id).filter(
        (q) => levelAllowed(q.level, maxLevel) && !usedQuestionIds.has(q.id),
      );
      const next = pool[round];
      if (next) {
        usedQuestionIds.add(next.id);
        picked.push(toItem(next, 'new'));
      }
    }
    round += 1;
  }
  return picked;
}

function reviewItems(state: ProgressState, limit: number, maxLevel: Level): SessionItem[] {
  if (limit <= 0) return [];
  const items: SessionItem[] = [];
  for (const error of orderErrors(activeErrors(state))) {
    if (items.length >= limit) break;
    const resource = getResource(error.resourceId);
    if (!resource || !levelAllowed(resource.level, maxLevel)) continue;
    items.push(toItem(resource, 'review-error'));
  }
  if (items.length < limit) {
    const doubts = FLASHCARDS.filter(
      (card) => levelAllowed(card.level, maxLevel) && lastRating(state, card.id) === 'doubt',
    );
    for (const card of doubts) {
      if (items.length >= limit) break;
      items.push(toItem(card, 'review-doubt'));
    }
  }
  return items;
}

/** Plantillas de Plan de hoy por tiempo (contrato §12.1.1). */
function planOfDayItems(
  state: ProgressState,
  timeBudget: TimeBudget,
  maxLevel: Level,
  reviewBudget: number,
): SessionItem[] {
  const review = reviewItems(state, reviewBudget, maxLevel);
  const prompts = orderedPrompts(state, maxLevel, (id) => !id.startsWith('P-PEN-'));
  const crossPrompts = orderedPrompts(state, maxLevel).filter((p) => p.track === 'cross-track');
  const starPrompt = INTERVIEW_PROMPTS.find((p) => p.id === 'P-INT-012');
  const penalObjectives = PENAL_ESSENTIAL_OBJECTIVE_IDS;

  const items: SessionItem[] = [];
  const pushPrompts = (n: number) => {
    for (const prompt of prompts) {
      if (items.filter((i) => i.kind === 'interview').length >= n) break;
      items.push(toItem(prompt, 'new'));
    }
  };

  switch (timeBudget) {
    case 10: {
      // 2 entrevistas prioritarias + 1 STAR/cross-track + 2-3 comprobaciones Penal.
      pushPrompts(2);
      const cross = crossPrompts[0] ?? starPrompt;
      if (cross) items.push(toItem(cross, 'new'));
      items.push(...spreadQuestions(state, penalObjectives, 2, maxLevel));
      break;
    }
    case 20: {
      // 3-4 entrevistas + 1 STAR + 1 concepto Penal breve + 3-4 preguntas Penal.
      pushPrompts(3);
      if (starPrompt) items.push(toItem(starPrompt, 'new'));
      const lesson = pickPenalLesson(state, maxLevel);
      if (lesson) items.push(toItem(lesson, 'new'));
      items.push(...spreadQuestions(state, penalObjectives, 3, maxLevel));
      break;
    }
    case 30: {
      // Bloque entrevista + STAR + 2 conceptos Penal + práctica corta.
      pushPrompts(4);
      if (starPrompt) items.push(toItem(starPrompt, 'new'));
      const lessons = pickPenalLessons(state, 2, maxLevel);
      items.push(...lessons.map((lesson) => toItem(lesson, 'new')));
      items.push(...spreadQuestions(state, penalObjectives, 4, maxLevel));
      break;
    }
    case 60:
    case 'full': {
      // Bloques breves con cambio de modalidad y mini simulacro final.
      pushPrompts(4);
      items.push(...spreadQuestions(state, penalObjectives, 4, maxLevel));
      const lessons = pickPenalLessons(state, 2, maxLevel);
      items.push(...lessons.map((lesson) => toItem(lesson, 'new')));
      const cards = orderFlashcards(
        state,
        FLASHCARDS.filter((card) => levelAllowed(card.level, maxLevel)),
      ).slice(0, 4);
      items.push(...cards.map((card) => toItem(card, 'reinforce')));
      // Mini simulacro final: prompts del Top 10 con más necesidad.
      const finalPrompts = orderedPrompts(state, maxLevel, (id) => TOP_10_PROMPT_IDS.includes(id)).slice(
        0,
        3,
      );
      items.push(...finalPrompts.map((prompt) => toItem(prompt, 'reinforce')));
      if (timeBudget === 'full') {
        items.push(...spreadQuestions(state, penalObjectives, 4, maxLevel));
      }
      break;
    }
  }

  // Un error de Nivel 1 sustituye contenido nuevo: los ítems de repaso van primero y desplazan.
  return uniqueItems([...review, ...items]);
}

function pickPenalLesson(state: ProgressState, maxLevel: Level) {
  return pickPenalLessons(state, 1, maxLevel)[0];
}

function pickPenalLessons(state: ProgressState, count: number, maxLevel: Level) {
  const statuses = objectiveStatuses(
    state,
    LEARNING_OBJECTIVES.filter(
      (o) => o.track === 'penal' && levelAllowed(o.level, maxLevel),
    ),
  ).sort((a, b) => {
    const urgency = (mastery: string) =>
      mastery === 'needs-review' ? 0 : mastery === 'not-started' ? 1 : mastery === 'learning' ? 2 : 3;
    return urgency(a.mastery) - urgency(b.mastery) || a.objective.order - b.objective.order;
  });
  const lessons = [];
  for (const status of statuses) {
    if (lessons.length >= count) break;
    const lesson = lessonForObjective(status.objective.id);
    if (lesson && levelAllowed(lesson.level, maxLevel)) lessons.push(lesson);
  }
  return lessons;
}

/** Repaso antes de salir (contrato §12.7). No contiene temas nuevos, Nivel 3 ni casos extensos. */
function exitReviewItems(state: ProgressState): SessionItem[] {
  const items: SessionItem[] = [];

  // 3-5 preguntas personales difíciles.
  const hard = orderedPrompts(state, 1, (id) => HARD_PROMPT_IDS.includes(id)).slice(0, 4);
  items.push(...hard.map((prompt) => toItem(prompt, 'reinforce')));

  // Dos STAR.
  const star = INTERVIEW_PROMPTS.find((p) => p.id === 'P-INT-012');
  if (star) items.push(toItem(star, 'reinforce'));
  const errorStar = INTERVIEW_PROMPTS.find((p) => p.id === 'P-INT-006');
  if (errorStar) items.push(toItem(errorStar, 'reinforce'));

  // 3-5 Penal esenciales, priorizando lo que necesita repaso.
  items.push(...spreadQuestions(state, PENAL_ESSENTIAL_OBJECTIVE_IDS, 4, 1));

  // Errores críticos recientes.
  items.push(...reviewItems(state, 2, 1));

  // Salario y disponibilidad.
  const salary = INTERVIEW_PROMPTS.find((p) => p.id === 'P-INT-010');
  if (salary) items.push(toItem(salary, 'reinforce'));
  const availability = INTERVIEW_PROMPTS.find((p) => p.id === 'P-INT-010B');
  if (availability) items.push(toItem(availability, 'reinforce'));

  // 2-3 preguntas al despacho y recordatorios (recursos no evaluados).
  for (const id of EXIT_REVIEW_CHECKLIST_IDS) {
    const checklist = getResource(id);
    if (checklist) items.push(toItem(checklist, 'reinforce'));
  }

  return uniqueItems(items);
}

function mockItems(state: ProgressState, profile: MockProfile, includeLevel2: boolean): SessionItem[] {
  const blueprint = mockComposition(profile, includeLevel2);
  const maxLevel = blueprint.maxLevel;
  const items: SessionItem[] = [];

  // Entrevista: cubre las áreas del blueprint sin repetir en exceso.
  const used = new Set<string>();
  for (const area of INTERVIEW_BLUEPRINT_LEVEL_1.areas) {
    const pool = orderedPrompts(state, maxLevel, (id) => !used.has(id)).filter((prompt) =>
      area.objectiveIds.includes(prompt.learningObjectiveId),
    );
    for (let i = 0; i < area.count && i < pool.length; i += 1) {
      used.add(pool[i].id);
      items.push(toItem(pool[i], 'new'));
    }
    if (items.filter((i) => i.kind === 'interview').length >= blueprint.interviewCount) break;
  }
  while (items.filter((i) => i.kind === 'interview').length < blueprint.interviewCount) {
    const extra = orderedPrompts(state, maxLevel, (id) => !used.has(id))[0];
    if (!extra) break;
    used.add(extra.id);
    items.push(toItem(extra, 'new'));
  }

  // Penal y cross-track.
  const blueprintQuiz = penalQuizBlueprint({
    questionCount: blueprint.penalCount,
    maxLevel,
  });
  items.push(...spreadQuestions(state, blueprintQuiz.objectiveIds, blueprint.penalCount, maxLevel));

  // Casos solo en perfiles que los declaran.
  if (blueprint.caseCount > 0) {
    const cases = CASES.filter((c) => levelAllowed(c.level, maxLevel)).slice(0, blueprint.caseCount);
    items.push(...cases.map((c) => toItem(c, 'new')));
  }

  return uniqueItems(items);
}

const MODE_LABEL: Record<SessionMode, string> = {
  'just-studied': 'Practicar lo que acabas de estudiar',
  'current-level': 'Practicar nivel actual',
  'mixed-review': 'Repaso mixto',
  'plan-of-day': 'Plan de hoy',
  'interview-practice': 'Práctica de entrevista',
  'penal-quiz': 'Quiz Penal Nivel 1',
  flashcards: 'Flashcards',
  top10: 'Top 10 — Primera entrevista',
  'hard-questions': 'Preguntas difíciles',
  'penal-essential': 'Penal esencial',
  'exit-review': 'Repaso antes de salir',
  'mock-quick': 'Simulacro Quick',
  'mock-standard': 'Simulacro Standard',
  errors: 'Mis errores',
  case: 'Caso',
};

export function buildSession(input: BuildSessionInput): BuiltSession {
  const { state, mode } = input;
  const now = input.now ?? new Date();
  const maxLevel = maxLevelFor(state);
  const timeBudget = input.timeBudget;
  const budgetKey = timeBudget === 'full' ? 'full' : timeBudget;
  const budget = QUESTION_BUDGET[budgetKey];
  const phase = interviewPhase(state.targetInterview, now);

  let items: SessionItem[] = [];
  let activeTrack: SessionScope['activeTrack'] = 'mixed';

  switch (mode) {
    case 'plan-of-day': {
      items = planOfDayItems(state, timeBudget, maxLevel, budget.reviewQuestions);
      break;
    }
    case 'exit-review': {
      items = exitReviewItems(state);
      break;
    }
    case 'interview-practice':
    case 'top10':
    case 'hard-questions': {
      activeTrack = 'interview';
      const allowedIds =
        mode === 'top10'
          ? TOP_10_PROMPT_IDS
          : mode === 'hard-questions'
            ? HARD_PROMPT_IDS
            : undefined;
      const prompts = orderedPrompts(state, maxLevel, (id) =>
        allowedIds ? allowedIds.includes(id) : true,
      );
      const limit = mode === 'interview-practice' ? Math.max(3, budget.newQuestions) : prompts.length;
      items = prompts.slice(0, limit).map((prompt) => toItem(prompt, 'new'));
      break;
    }
    case 'penal-quiz':
    case 'penal-essential': {
      activeTrack = 'penal';
      const blueprint = penalQuizBlueprint({
        questionCount: Math.min(budget.max, mode === 'penal-quiz' ? budget.newQuestions + 2 : 8),
        maxLevel,
      });
      items = spreadQuestions(state, blueprint.objectiveIds, blueprint.questionCount, maxLevel);
      if (mode === 'penal-essential') {
        const lessons = pickPenalLessons(state, 2, maxLevel);
        items = uniqueItems([...lessons.map((lesson) => toItem(lesson, 'new')), ...items]);
      }
      break;
    }
    case 'flashcards': {
      const cards = orderFlashcards(
        state,
        FLASHCARDS.filter((card) => levelAllowed(card.level, maxLevel)),
        { targetIsImminent: phase === 'today' || phase === 'tomorrow' },
      ).slice(0, Math.max(5, budget.max));
      items = cards.map((card) => toItem(card, 'reinforce'));
      break;
    }
    case 'errors': {
      items = reviewItems(state, Math.max(3, budget.reviewQuestions + 2), maxLevel);
      break;
    }
    case 'mock-quick': {
      items = mockItems(state, 'quick', state.preferences.includeLevel2);
      break;
    }
    case 'mock-standard': {
      items = mockItems(state, 'standard', state.preferences.includeLevel2);
      break;
    }
    case 'just-studied': {
      const allowed = input.allowedObjectiveIds ?? [];
      const pool = [...QUESTIONS, ...FLASHCARDS, ...INTERVIEW_PROMPTS].filter(
        (r) => allowed.includes(r.learningObjectiveId) && levelAllowed(r.level, maxLevel),
      );
      items = pool.slice(0, budget.max).map((r) => toItem(r, 'new'));
      break;
    }
    case 'current-level': {
      const allowed =
        input.allowedObjectiveIds ??
        LEARNING_OBJECTIVES.filter((o) => levelAllowed(o.level, maxLevel)).map((o) => o.id);
      if (input.focusResourceId) {
        const focus = getResource(input.focusResourceId);
        if (focus) items.push(toItem(focus, 'new'));
        if (focus?.type === 'lesson') {
          for (const questionId of focus.checkQuestionIds) {
            const question = getResource(questionId);
            if (question) items.push(toItem(question, 'new'));
          }
        }
      }
      if (items.length === 0) {
        items = spreadQuestions(state, allowed, budget.newQuestions, maxLevel);
      }
      break;
    }
    case 'mixed-review': {
      const review = reviewItems(state, budget.reviewQuestions, maxLevel);
      const prompts = orderedPrompts(state, maxLevel).slice(0, 2).map((p) => toItem(p, 'reinforce'));
      const questions = spreadQuestions(
        state,
        PENAL_ESSENTIAL_OBJECTIVE_IDS,
        Math.max(2, budget.newQuestions - 2),
        maxLevel,
      );
      items = uniqueItems([...review, ...prompts, ...questions]);
      break;
    }
    case 'case': {
      const focus = input.focusResourceId ? getResource(input.focusResourceId) : undefined;
      if (focus) items = [toItem(focus, 'new')];
      break;
    }
  }

  // Recorte por presupuesto de tiempo: la sesión no excede el tiempo elegido.
  // Los modos de repaso final y simulacro tienen su propia composición declarada.
  if (mode !== 'exit-review' && mode !== 'mock-quick' && mode !== 'mock-standard' && mode !== 'case') {
    const limitMinutes = budgetMinutes(timeBudget) * 1.15;
    const trimmed: SessionItem[] = [];
    for (const item of items) {
      if (weight([...trimmed, item]) > limitMinutes && trimmed.length >= budget.min) break;
      if (trimmed.length >= budget.max) break;
      trimmed.push(item);
    }
    items = trimmed;
  }

  const objectiveIds = Array.from(new Set(items.map((item) => item.objectiveId)));
  const scope: SessionScope = {
    activeTrack,
    activeLevel: 1,
    maxLevel,
    timeBudget,
    mode,
    allowedObjectiveIds: input.allowedObjectiveIds ?? objectiveIds,
    recentErrors: items.filter((i) => i.reason === 'review-error').map((i) => i.resourceId),
    recentDoubts: items.filter((i) => i.reason === 'review-doubt').map((i) => i.resourceId),
    newQuestionBudget: budget.newQuestions,
    reviewQuestionBudget: budget.reviewQuestions,
  };

  return {
    scope,
    items,
    label: MODE_LABEL[mode],
    plannedMinutes: Math.round(weight(items)),
  };
}

/** Bloque lineal de entrevista para el nivel permitido, preservando el orden del Top 10 en Nivel 1. */
export function buildInterviewBlock(state: ProgressState): BuiltSession {
  const base = buildSession({ state, mode: 'top10', timeBudget: 'full' });
  return { ...base, label: 'Entrevista · bloque actual' };
}

/**
 * Constructor de sesión lineal pura: modo (estudiar/practicar), frente (entrevista/penal)
 * y nivel (1: Esencial, 2: Ampliación, 3: Profundización).
 */
export function buildLinearSession({
  mode,
  track,
  level,
}: {
  mode: 'study' | 'practice';
  track: 'interview' | 'penal';
  level: 1 | 2 | 3;
}): BuiltSession {
  let resources: StudyResource[] = [];

  if (track === 'interview') {
    const pool = INTERVIEW_PROMPTS.filter((p) => p.level === level);
    if (pool.length === 0 && level === 3) {
      resources = [...INTERVIEW_PROMPTS.filter((p) => p.level === 2)];
    } else {
      resources = [...pool];
    }
    resources.sort((a, b) => {
      const ordA = getObjective(a.learningObjectiveId)?.order ?? 99;
      const ordB = getObjective(b.learningObjectiveId)?.order ?? 99;
      return ordA - ordB;
    });
  } else {
    if (mode === 'study') {
      const pool = LESSONS.filter((l) => l.level === level);
      resources = [...pool];
      resources.sort((a, b) => {
        const ordA = getObjective(a.learningObjectiveId)?.order ?? 99;
        const ordB = getObjective(b.learningObjectiveId)?.order ?? 99;
        return ordA - ordB;
      });
    } else {
      const pool = QUESTIONS.filter((q) => q.level === level);
      if (pool.length > 0) {
        resources = [...pool];
        resources.sort((a, b) => {
          const ordA = getObjective(a.learningObjectiveId)?.order ?? 99;
          const ordB = getObjective(b.learningObjectiveId)?.order ?? 99;
          return ordA - ordB;
        });
      } else {
        const cards = FLASHCARDS.filter((f) => f.level === level);
        resources = [...cards];
        resources.sort((a, b) => {
          const ordA = getObjective(a.learningObjectiveId)?.order ?? 99;
          const ordB = getObjective(b.learningObjectiveId)?.order ?? 99;
          return ordA - ordB;
        });
      }
    }
  }

  const items = resources.map((r) => toItem(r, 'new'));
  const modeLabel = mode === 'study' ? 'Estudiar' : 'Practicar';
  const trackLabel = track === 'interview' ? 'Entrevista' : 'Penal';
  const levelLabel = level === 1 ? 'Esencial' : level === 2 ? 'Ampliación' : 'Profundización';
  const label = `${modeLabel} › ${trackLabel} › ${levelLabel}`;

  const scope: SessionScope = {
    activeTrack: track,
    activeLevel: level,
    maxLevel: level,
    timeBudget: 'full',
    mode: mode === 'study' ? 'just-studied' : 'current-level',
    allowedObjectiveIds: Array.from(new Set(items.map((i) => i.objectiveId))),
    recentErrors: [],
    recentDoubts: [],
    newQuestionBudget: items.length,
    reviewQuestionBudget: 0,
  };

  return {
    scope,
    items,
    label,
    plannedMinutes: Math.round(weight(items)),
  };
}

/**
 * Comprueba que una sesión construida respeta su propio scope: ningún ítem supera `maxLevel`
 * y todo ítem pertenece a un objetivo. Se usa en pruebas y en el modo auditoría.
 *
 * Excepción declarada: los recursos de tipo `checklist` del Repaso antes de salir no son
 * evaluados (no hay correcto/incorrecto ni feedback), de modo que pueden pertenecer a un
 * objetivo de Nivel 2 sin vulnerar Study-Practice Alignment (contrato §12.7).
 */
export function validateSessionScope(session: BuiltSession): string[] {
  const problems: string[] = [];
  for (const item of session.items) {
    const resource = getResource(item.resourceId);
    if (!resource) {
      problems.push(`Ítem sin recurso verificado: ${item.resourceId}`);
      continue;
    }
    if (!getObjective(item.objectiveId)) {
      problems.push(`Ítem sin objetivo válido: ${item.resourceId}`);
    }
    if (resource.type === 'checklist') continue;
    if (!levelAllowed(resource.level, session.scope.maxLevel)) {
      problems.push(
        `El recurso ${resource.id} es de Nivel ${resource.level} y el scope permite hasta ${session.scope.maxLevel}`,
      );
    }
  }
  return problems;
}

export { LESSONS };
