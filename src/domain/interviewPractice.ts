import type { InterviewPrompt, SelfRating } from './types';
import type { ProgressState } from './progress';

/**
 * Estado de preparación de una respuesta de entrevista.
 * No califica personalidad, voz ni estilo: mide preparación y cobertura (contrato §7.1).
 */
export type InterviewPromptState =
  | 'unpracticed'
  | 'blank'
  | 'partial'
  | 'good-not-consolidated'
  | 'consolidated';

/**
 * Regla de consolidación (contrato §13.3): practicada al menos dos veces en intentos separados,
 * la última fue "Bien", cubrió la mayoría de los keyPoints esenciales y no tiene
 * interview-content-gap activo.
 */
export function promptState(
  state: ProgressState,
  prompt: InterviewPrompt,
  hasActiveContentGap: boolean,
): InterviewPromptState {
  const attempts = state.interview[prompt.id] ?? [];
  if (attempts.length === 0) return 'unpracticed';

  const last = attempts[attempts.length - 1];
  if (last.selfRating === 'blank') return 'blank';
  if (last.selfRating === 'partial') return 'partial';

  const separateSessions = new Set(attempts.map((a) => a.sessionId));
  const essentialIds = prompt.keyPoints.filter((k) => k.essential).map((k) => k.id);
  const coveredEssential = essentialIds.filter((id) => last.coveredKeyPointIds.includes(id)).length;
  const majorityCovered =
    essentialIds.length === 0 ? true : coveredEssential * 2 > essentialIds.length;

  if (attempts.length >= 2 && separateSessions.size >= 2 && majorityCovered && !hasActiveContentGap) {
    return 'consolidated';
  }
  return 'good-not-consolidated';
}

/** Prioridad interna para entrevista Nivel 1 (contrato §13.3). */
export const PROMPT_STATE_PRIORITY: Record<InterviewPromptState, number> = {
  blank: 0,
  partial: 1,
  unpracticed: 2,
  'good-not-consolidated': 3,
  consolidated: 4,
};

export const PROMPT_STATE_LABEL: Record<InterviewPromptState, string> = {
  unpracticed: 'Sin practicar',
  blank: 'Me quedé en blanco',
  partial: 'Parcial',
  'good-not-consolidated': 'Bien, por consolidar',
  consolidated: 'Consolidada',
};

export const SELF_RATING_LABEL: Record<SelfRating, string> = {
  blank: 'Me quedé en blanco',
  partial: 'Parcial',
  good: 'Bien',
};

/**
 * Question Readiness de entrevista: contadores por objetivo, no conteo bruto (contrato §8.5).
 */
export interface InterviewReadinessCounters {
  total: number;
  practiced: number;
  good: number;
  toReinforce: number;
  unpracticed: number;
}

export function interviewReadiness(
  state: ProgressState,
  prompts: InterviewPrompt[],
  hasActiveContentGap: (promptId: string) => boolean,
): InterviewReadinessCounters {
  let practiced = 0;
  let good = 0;
  let toReinforce = 0;
  let unpracticed = 0;
  for (const prompt of prompts) {
    const currentState = promptState(state, prompt, hasActiveContentGap(prompt.id));
    if (currentState === 'unpracticed') {
      unpracticed += 1;
      continue;
    }
    practiced += 1;
    if (currentState === 'consolidated' || currentState === 'good-not-consolidated') good += 1;
    else toReinforce += 1;
  }
  return { total: prompts.length, practiced, good, toReinforce, unpracticed };
}
