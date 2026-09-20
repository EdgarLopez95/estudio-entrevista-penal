import type { EstimatedMinutes, SessionMode, StudyResource } from './types';
import type { ProgressState } from './progress';
import { INTERVIEW_PROMPTS, lessonForObjective, requireResource } from '@/content';
import { LEARNING_OBJECTIVES, getObjective } from '@/content/objectives';
import { PROMPT_STATE_PRIORITY, promptState } from './interviewPractice';
import { activeErrors, hasActiveGap, orderErrors } from './errors';
import { objectiveStatuses, shouldSuggestLevel2 } from './readiness';
import { daysUntil, interviewPhase } from './time';

export type RecommendationKind =
  | 'interview-prompt'
  | 'critical-error'
  | 'cross-track'
  | 'penal-objective'
  | 'doubt'
  | 'unfinished-session'
  | 'level2'
  | 'level3'
  | 'exit-review'
  | 'all-covered';

export interface Recommendation {
  kind: RecommendationKind;
  /** Recurso que se abrirá. `null` solo en 'all-covered'. */
  resourceId: string | null;
  objectiveId: string | null;
  title: string;
  /** "Te recomendamos esto porque…" con causa concreta (contrato §13.3). */
  reason: string;
  estimatedMinutes: EstimatedMinutes;
  mode: SessionMode;
  /** Prioridad de la lista del contrato §8.3 (1 = más urgente). */
  bucket: number;
}

function promptRecommendation(state: ProgressState): Recommendation | null {
  const prompts = INTERVIEW_PROMPTS.filter((p) => p.level === 1 && p.track === 'interview');
  const scored = prompts
    .map((prompt) => {
      const currentState = promptState(
        state,
        prompt,
        hasActiveGap(state, prompt.id, 'interview-content-gap'),
      );
      const objective = getObjective(prompt.learningObjectiveId);
      return {
        prompt,
        state: currentState,
        priority: PROMPT_STATE_PRIORITY[currentState],
        order: objective?.order ?? 99,
      };
    })
    .filter((entry) => entry.state !== 'consolidated')
    .sort((a, b) => a.priority - b.priority || a.order - b.order);

  const best = scored[0];
  if (!best) return null;

  const reasonByState: Record<string, string> = {
    blank: 'la última vez te quedaste en blanco y es una de las preguntas más probables',
    partial: 'la última vez la respondiste solo en parte',
    unpracticed: 'todavía no la has practicado en voz alta y es de Nivel 1',
    'good-not-consolidated': 'te salió bien, pero falta una repetición para consolidarla',
  };

  return {
    kind: 'interview-prompt',
    resourceId: best.prompt.id,
    objectiveId: best.prompt.learningObjectiveId,
    title: best.prompt.title,
    reason: `Porque ${reasonByState[best.state] ?? 'es prioridad de Nivel 1'}.`,
    estimatedMinutes: best.prompt.estimatedMinutes,
    mode: 'interview-practice',
    bucket: best.state === 'unpracticed' ? 1 : 2,
  };
}

function criticalErrorRecommendation(state: ProgressState): Recommendation | null {
  const errors = orderErrors(activeErrors(state)).filter(
    (e) => e.level === 1 && e.priority === 'critical',
  );
  const first = errors[0];
  if (!first) return null;
  let resource: StudyResource | undefined;
  try {
    resource = requireResource(first.resourceId);
  } catch {
    resource = undefined;
  }
  if (!resource) return null;
  return {
    kind: 'critical-error',
    resourceId: resource.id,
    objectiveId: resource.learningObjectiveId,
    title: resource.title,
    reason: `Porque tienes un error activo de Nivel 1 en ${first.topic}.`,
    estimatedMinutes: resource.estimatedMinutes,
    mode: 'errors',
    bucket: 3,
  };
}

function crossTrackRecommendation(state: ProgressState): Recommendation | null {
  const prompts = INTERVIEW_PROMPTS.filter(
    (p) => p.level === 1 && p.track === 'cross-track' && p.priority === 'critical',
  );
  for (const prompt of prompts) {
    const currentState = promptState(
      state,
      prompt,
      hasActiveGap(state, prompt.id, 'interview-content-gap'),
    );
    if (currentState !== 'consolidated') {
      return {
        kind: 'cross-track',
        resourceId: prompt.id,
        objectiveId: prompt.learningObjectiveId,
        title: prompt.title,
        reason:
          'Porque conectar tu experiencia real con la candidatura penal es crítico y aún no está consolidado.',
        estimatedMinutes: prompt.estimatedMinutes,
        mode: 'interview-practice',
        bucket: 4,
      };
    }
  }
  return null;
}

function penalRecommendation(state: ProgressState): Recommendation | null {
  const statuses = objectiveStatuses(
    state,
    LEARNING_OBJECTIVES.filter((o) => o.level === 1 && o.track === 'penal').sort(
      (a, b) => a.order - b.order,
    ),
  );
  const needsReview = statuses.find((s) => s.mastery === 'needs-review');
  const notStarted = statuses.find((s) => s.mastery === 'not-started');
  const learning = statuses.find((s) => s.mastery === 'learning');
  const target = needsReview ?? notStarted ?? learning;
  if (!target) return null;

  const objective = target.objective;
  const lesson = lessonForObjective(objective.id);
  const prompt = INTERVIEW_PROMPTS.find((p) => p.learningObjectiveId === objective.id);
  const resource = lesson ?? prompt;
  if (!resource) return null;

  const reason =
    target.mastery === 'needs-review'
      ? `Porque este concepto necesita repaso: ${objective.title.toLowerCase()}.`
      : target.mastery === 'not-started'
        ? `Porque es parte de Penal esencial y aún no lo has trabajado.`
        : `Porque te falta una recuperación para consolidarlo.`;

  return {
    kind: 'penal-objective',
    resourceId: resource.id,
    objectiveId: objective.id,
    title: objective.title,
    reason,
    estimatedMinutes: resource.estimatedMinutes,
    mode: resource.type === 'lesson' ? 'current-level' : 'interview-practice',
    bucket: 5,
  };
}

function doubtRecommendation(state: ProgressState): Recommendation | null {
  const doubts = Object.entries(state.flashcards)
    .filter(([, attempts]) => attempts.at(-1)?.rating === 'doubt')
    .map(([id]) => id);
  for (const id of doubts) {
    let resource: StudyResource | undefined;
    try {
      resource = requireResource(id);
    } catch {
      resource = undefined;
    }
    if (resource && resource.level === 1) {
      return {
        kind: 'doubt',
        resourceId: resource.id,
        objectiveId: resource.learningObjectiveId,
        title: resource.title,
        reason: 'Porque marcaste que dudaste en esta tarjeta de Nivel 1.',
        estimatedMinutes: resource.estimatedMinutes,
        mode: 'flashcards',
        bucket: 6,
      };
    }
  }
  return null;
}

function unfinishedSessionRecommendation(state: ProgressState): Recommendation | null {
  const session = state.activeSession;
  if (!session || session.status !== 'active') return null;
  const item = session.items[session.currentIndex] ?? session.items[0];
  if (!item) return null;
  return {
    kind: 'unfinished-session',
    resourceId: item.resourceId,
    objectiveId: item.objectiveId,
    title: session.label,
    reason: 'Porque dejaste una sesión esencial a medias.',
    estimatedMinutes: 5,
    mode: session.mode,
    bucket: 7,
  };
}

function level2Recommendation(state: ProgressState): Recommendation | null {
  if (!shouldSuggestLevel2(state) && !state.preferences.includeLevel2) return null;
  const statuses = objectiveStatuses(
    state,
    LEARNING_OBJECTIVES.filter((o) => o.level === 2).sort((a, b) => a.order - b.order),
  );
  const target = statuses.find((s) => s.mastery === 'not-started' || s.mastery === 'needs-review');
  if (!target) return null;
  const resource =
    lessonForObjective(target.objective.id) ??
    INTERVIEW_PROMPTS.find((p) => p.learningObjectiveId === target.objective.id);
  if (!resource) return null;
  return {
    kind: 'level2',
    resourceId: resource.id,
    objectiveId: target.objective.id,
    title: target.objective.title,
    reason: 'Ya cubriste gran parte de lo esencial. Si tienes tiempo, puedes profundizar.',
    estimatedMinutes: resource.estimatedMinutes,
    mode: 'current-level',
    bucket: 8,
  };
}

/**
 * Recomendación de Home (contrato §8.3, §13.3). Devuelve una sola recomendación explicable y
 * siempre ignorable, más alternativas para "elegir otra cosa".
 */
export function recommend(state: ProgressState, now: Date = new Date()): Recommendation {
  const phase = interviewPhase(state.targetInterview, now);

  if (phase === 'today') {
    // Día de entrevista: recall, no expansión (contrato §12.1.1).
    return {
      kind: 'exit-review',
      resourceId: null,
      objectiveId: null,
      title: 'Repaso antes de salir',
      reason: 'Hoy conviene reforzar lo que ya preparaste, sin incorporar temas nuevos.',
      estimatedMinutes: 10,
      mode: 'exit-review',
      bucket: 0,
    };
  }

  const candidates = [
    promptRecommendation(state),
    criticalErrorRecommendation(state),
    crossTrackRecommendation(state),
    penalRecommendation(state),
    doubtRecommendation(state),
    unfinishedSessionRecommendation(state),
    level2Recommendation(state),
  ].filter((c): c is Recommendation => Boolean(c));

  candidates.sort((a, b) => a.bucket - b.bucket);

  const best = candidates[0];
  if (best) {
    if (phase === 'tomorrow' && best.kind === 'penal-objective') {
      // D-1: se priorizan respuestas difíciles y recall sobre contenido nuevo de Penal.
      const alternative = candidates.find((c) => c.kind === 'interview-prompt' || c.kind === 'critical-error');
      if (alternative) return alternative;
    }
    return best;
  }

  return {
    kind: 'all-covered',
    resourceId: null,
    objectiveId: null,
    title: 'Ya cubriste los objetivos esenciales de esta sesión',
    reason: 'No hay errores críticos pendientes y las preguntas principales están practicadas.',
    estimatedMinutes: 10,
    mode: 'mixed-review',
    bucket: 99,
  };
}

/** Alternativas para "Elegir otra cosa", sin bloquear la recomendación. */
export function alternatives(state: ProgressState, limit = 3): Recommendation[] {
  const all = [
    promptRecommendation(state),
    criticalErrorRecommendation(state),
    crossTrackRecommendation(state),
    penalRecommendation(state),
    doubtRecommendation(state),
  ].filter((c): c is Recommendation => Boolean(c));
  const primary = recommend(state);
  return all.filter((c) => c.resourceId !== primary.resourceId).slice(0, limit);
}

export { daysUntil };
