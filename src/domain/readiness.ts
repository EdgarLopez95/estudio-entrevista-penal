import type { LearningObjective, MasteryState } from './types';
import type { ProgressState } from './progress';
import { masteryFor } from './mastery';
import { hasActiveErrorForObjective } from './errors';
import { interviewReadiness, promptState } from './interviewPractice';
import { LEARNING_OBJECTIVES } from '@/content/objectives';
import { INTERVIEW_PROMPTS, questionsForObjective } from '@/content';
import { TOP_10_PROMPT_IDS, PENAL_ESSENTIAL_OBJECTIVE_IDS } from '@/content/collections';
import { hasActiveGap } from './errors';

/**
 * Core Readiness (contrato §14).
 * - Core Readiness — Entrevista: SOLO objetivos Nivel 1 de track `interview`.
 * - Core Readiness — Penal: SOLO objetivos Nivel 1 de track `penal`.
 * - Los objetivos cross-track Nivel 1 se reportan aparte y se suman al lado de entrevista en el
 *   índice general, porque se entrenan como entrevista precisa sobre experiencia real (§7.4).
 * - Nivel 3 y Referencia nunca reducen Core Readiness ni actúan como denominador.
 */

export interface ObjectiveStatus {
  objective: LearningObjective;
  mastery: MasteryState;
  hasEvidence: boolean;
}

export function objectiveStatuses(
  state: ProgressState,
  objectives: LearningObjective[] = LEARNING_OBJECTIVES,
): ObjectiveStatus[] {
  return objectives.map((objective) => {
    const hasQuestions = questionsForObjective(objective.id).length > 0;
    const mastery = masteryFor(state, {
      objectiveId: objective.id,
      hasQuestions,
      hasActiveError: hasActiveErrorForObjective(state, objective.id),
    });
    return {
      objective,
      mastery,
      hasEvidence: mastery === 'mastered' || mastery === 'learning',
    };
  });
}

export interface CoreReadiness {
  /** Objetivos del denominador (Nivel 1 del frente). */
  total: number;
  mastered: number;
  learning: number;
  needsReview: number;
  notStarted: number;
  /** Porcentaje redondeado a entero, calculado con evidencia y no con visitas. */
  percent: number;
  /** Detalle por objetivo, en orden del Apéndice A. */
  statuses: ObjectiveStatus[];
}

function summarize(statuses: ObjectiveStatus[]): CoreReadiness {
  const total = statuses.length;
  const mastered = statuses.filter((s) => s.mastery === 'mastered').length;
  const learning = statuses.filter((s) => s.mastery === 'learning').length;
  const needsReview = statuses.filter((s) => s.mastery === 'needs-review').length;
  const notStarted = statuses.filter((s) => s.mastery === 'not-started').length;
  // Evidencia: dominado cuenta 1, aprendiendo cuenta 0.5, necesita repaso cuenta 0.25.
  const evidence = mastered + learning * 0.5 + needsReview * 0.25;
  const percent = total === 0 ? 0 : Math.round((evidence / total) * 100);
  return { total, mastered, learning, needsReview, notStarted, percent, statuses };
}

function level1(track: LearningObjective['track']): LearningObjective[] {
  return LEARNING_OBJECTIVES.filter((o) => o.level === 1 && o.track === track).sort(
    (a, b) => a.order - b.order,
  );
}

export function coreReadinessInterview(state: ProgressState): CoreReadiness {
  return summarize(objectiveStatuses(state, level1('interview')));
}

export function coreReadinessPenal(state: ProgressState): CoreReadiness {
  return summarize(objectiveStatuses(state, level1('penal')));
}

export function coreReadinessCrossTrack(state: ProgressState): CoreReadiness {
  return summarize(objectiveStatuses(state, level1('cross-track')));
}

/** Extended Readiness usa Nivel 1+2; Depth usa Nivel 3 (contrato §14). */
export function extendedReadiness(state: ProgressState): CoreReadiness {
  return summarize(
    objectiveStatuses(
      state,
      LEARNING_OBJECTIVES.filter((o) => o.level === 1 || o.level === 2),
    ),
  );
}

export function depthReadiness(state: ProgressState): CoreReadiness {
  return summarize(objectiveStatuses(state, LEARNING_OBJECTIVES.filter((o) => o.level === 3)));
}

/**
 * Índice general opcional y secundario en modo Primera entrevista:
 * 65% entrevista personal/profesional (incluye cross-track) y 35% Penal técnico.
 * Es estrategia de tiempo y prioridad, no pronóstico de preguntas.
 */
export interface PreparationIndex {
  percent: number;
  interviewPercent: number;
  penalPercent: number;
  weights: { interview: number; penal: number };
}

export function preparationIndex(state: ProgressState): PreparationIndex {
  const interview = summarize([
    ...objectiveStatuses(state, level1('interview')),
    ...objectiveStatuses(state, level1('cross-track')),
  ]);
  const penal = coreReadinessPenal(state);
  const percent = Math.round(interview.percent * 0.65 + penal.percent * 0.35);
  return {
    percent,
    interviewPercent: interview.percent,
    penalPercent: penal.percent,
    weights: { interview: 0.65, penal: 0.35 },
  };
}

/** Question Readiness — Top 10 (contrato §8.5): contadores, no conteo bruto. */
export function top10Readiness(state: ProgressState) {
  const prompts = TOP_10_PROMPT_IDS.map((id) => INTERVIEW_PROMPTS.find((p) => p.id === id)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p),
  );
  return interviewReadiness(state, prompts, (promptId) =>
    hasActiveGap(state, promptId, 'interview-content-gap'),
  );
}

/** Question Readiness — Penal esencial: objetivos cubiertos/dominados/por repasar/no evaluados. */
export interface PenalEssentialReadiness {
  total: number;
  covered: number;
  mastered: number;
  needsReview: number;
  notEvaluated: number;
}

export function penalEssentialReadiness(state: ProgressState): PenalEssentialReadiness {
  const statuses = objectiveStatuses(
    state,
    LEARNING_OBJECTIVES.filter((o) => PENAL_ESSENTIAL_OBJECTIVE_IDS.includes(o.id)),
  );
  return {
    total: statuses.length,
    covered: statuses.filter((s) => s.mastery !== 'not-started').length,
    mastered: statuses.filter((s) => s.mastery === 'mastered').length,
    needsReview: statuses.filter((s) => s.mastery === 'needs-review').length,
    notEvaluated: statuses.filter((s) => s.mastery === 'not-started').length,
  };
}

/**
 * Umbral para sugerir Nivel 2 sin bloquearlo (contrato §13.3): aproximadamente 80% de los
 * objetivos Nivel 1 con evidencia suficiente, sin gaps críticos, Top 10 cubierto y Penal
 * esencial con cobertura razonable.
 */
export function shouldSuggestLevel2(state: ProgressState): boolean {
  const level1Objectives = LEARNING_OBJECTIVES.filter((o) => o.level === 1);
  const statuses = objectiveStatuses(state, level1Objectives);
  const withEvidence = statuses.filter((s) => s.mastery === 'mastered' || s.mastery === 'learning');
  const ratio = statuses.length === 0 ? 0 : withEvidence.length / statuses.length;
  const criticalGap = statuses.some(
    (s) => s.objective.priority === 'critical' && s.mastery === 'needs-review',
  );
  const top10 = top10Readiness(state);
  const penal = penalEssentialReadiness(state);
  return (
    ratio >= 0.8 &&
    !criticalGap &&
    top10.unpracticed === 0 &&
    penal.covered >= Math.ceil(penal.total * 0.7)
  );
}

/**
 * Stop rule (contrato §8.3): ambas áreas esenciales suficientemente preparadas, sin error
 * crítico y con las preguntas principales practicadas.
 */
export function essentialObjectivesCovered(state: ProgressState): boolean {
  const interview = coreReadinessInterview(state);
  const penal = coreReadinessPenal(state);
  const top10 = top10Readiness(state);
  const criticalErrors = state.errors.filter(
    (e) => e.status !== 'resolved' && e.level === 1 && e.priority === 'critical',
  );
  return (
    top10.unpracticed === 0 &&
    interview.needsReview === 0 &&
    penal.needsReview === 0 &&
    criticalErrors.length === 0 &&
    interview.percent >= 70 &&
    penal.percent >= 60
  );
}

/** Estado de una respuesta de entrevista, con el gap de contenido ya resuelto. */
export function promptStateFor(state: ProgressState, promptId: string) {
  const prompt = INTERVIEW_PROMPTS.find((p) => p.id === promptId);
  if (!prompt) return null;
  return promptState(state, prompt, hasActiveGap(state, promptId, 'interview-content-gap'));
}
