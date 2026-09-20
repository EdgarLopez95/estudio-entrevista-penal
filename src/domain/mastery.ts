import type { MasteryState } from './types';
import type { ProgressState } from './progress';
import { objectiveProgress } from './progress';

/**
 * Dominio V1 determinista (contrato §13.1).
 *
 * | Estado          | Regla                                                                    |
 * |-----------------|--------------------------------------------------------------------------|
 * | No iniciado     | Sin interacción significativa.                                           |
 * | Aprendiendo     | Lección estudiada o primera recuperación.                                |
 * | Necesita repaso | Error reciente, flashcard "No la sabía", quiz <80% o error recurrente.    |
 * | Dominado        | Lección estudiada; dos recuperaciones correctas en intentos separados;   |
 * |                 | quiz >=80%; sin error recurrente activo.                                 |
 *
 * Precisiones de implementación, deterministas y documentadas:
 * - "Intentos separados" = recuperaciones correctas con `sessionId` distinto.
 * - La condición de quiz se evalúa sobre el ÚLTIMO intento de quiz del objetivo. Si el objetivo
 *   no tiene preguntas de opción múltiple (por ejemplo, objetivos orales), la condición se
 *   considera satisfecha: no se puede exigir un quiz que no existe.
 * - Abrir una pantalla nunca domina: `lastSeenAt` no cambia el estado.
 * - Un fallo posterior al dominio devuelve a "Necesita repaso" porque genera un error activo
 *   y una recuperación incorrecta reciente.
 */

export const QUIZ_MASTERY_THRESHOLD = 80;

export interface MasteryInput {
  objectiveId: string;
  /** El objetivo tiene al menos una pregunta de opción múltiple disponible. */
  hasQuestions: boolean;
  /** Hay un error activo (no resuelto) asociado al objetivo. */
  hasActiveError: boolean;
}

export function masteryFor(state: ProgressState, input: MasteryInput): MasteryState {
  const progress = objectiveProgress(state, input.objectiveId);
  const hasLesson = Boolean(progress.lessonStudiedAt);
  const recalls = progress.recalls;
  const hasAnyInteraction = hasLesson || recalls.length > 0 || progress.quizScores.length > 0;

  if (!hasAnyInteraction) return 'not-started';

  const lastQuiz = progress.quizScores.at(-1);
  const quizOk = input.hasQuestions ? (lastQuiz ? lastQuiz.percent >= QUIZ_MASTERY_THRESHOLD : false) : true;
  const quizBelowThreshold = Boolean(lastQuiz && lastQuiz.percent < QUIZ_MASTERY_THRESHOLD);

  const correctSessions = new Set(recalls.filter((r) => r.correct).map((r) => r.sessionId));
  const twoSeparateCorrect = correctSessions.size >= 2;

  const lastRecall = recalls.at(-1);
  const lastRecallFailed = Boolean(lastRecall && !lastRecall.correct);

  if (input.hasActiveError || lastRecallFailed || quizBelowThreshold) {
    return 'needs-review';
  }

  if (hasLesson && twoSeparateCorrect && quizOk) {
    return 'mastered';
  }

  return 'learning';
}

export const MASTERY_LABEL: Record<MasteryState, string> = {
  'not-started': 'Sin empezar',
  learning: 'Aprendiendo',
  'needs-review': 'Necesita repaso',
  mastered: 'Dominado',
};

/** Orden de urgencia para ordenar listas: primero lo que necesita repaso. */
export const MASTERY_URGENCY: Record<MasteryState, number> = {
  'needs-review': 0,
  'not-started': 1,
  learning: 2,
  mastered: 3,
};
