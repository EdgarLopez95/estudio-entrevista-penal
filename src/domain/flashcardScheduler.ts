import type { Flashcard, FlashcardRating } from './types';
import type { ProgressState } from './progress';

/**
 * Flashcards V1 (contrato §13.2).
 * - "No la sabía": reaparece dentro de la sesión si es posible y tiene alta prioridad en la siguiente.
 * - "Dudé": prioridad media, antes de "La sabía".
 * - "La sabía": prioridad baja, pero nunca desaparece.
 * - Con fecha objetivo cercana, errores y dudas prevalecen sobre intervalos largos.
 */

export const RATING_PRIORITY: Record<FlashcardRating | 'new', number> = {
  unknown: 0,
  doubt: 1,
  new: 2,
  known: 3,
};

export const RATING_LABEL: Record<FlashcardRating, string> = {
  unknown: 'No la sabía',
  doubt: 'Dudé',
  known: 'La sabía',
};

export function lastRating(state: ProgressState, flashcardId: string): FlashcardRating | 'new' {
  const attempts = state.flashcards[flashcardId];
  if (!attempts || attempts.length === 0) return 'new';
  return attempts[attempts.length - 1].rating;
}

export interface FlashcardOrderOptions {
  /** La entrevista es hoy o mañana: errores y dudas prevalecen. */
  targetIsImminent: boolean;
}

/** Orden determinista de una tanda de flashcards. */
export function orderFlashcards(
  state: ProgressState,
  cards: Flashcard[],
  options: FlashcardOrderOptions = { targetIsImminent: false },
): Flashcard[] {
  return [...cards].sort((a, b) => {
    const priorityA = RATING_PRIORITY[lastRating(state, a.id)];
    const priorityB = RATING_PRIORITY[lastRating(state, b.id)];
    if (priorityA !== priorityB) return priorityA - priorityB;
    if (options.targetIsImminent) {
      const criticalA = a.priority === 'critical' ? 0 : 1;
      const criticalB = b.priority === 'critical' ? 0 : 1;
      if (criticalA !== criticalB) return criticalA - criticalB;
    }
    return a.id.localeCompare(b.id);
  });
}

/**
 * Reinserta dentro de la misma sesión las cartas marcadas como "No la sabía".
 * Devuelve la nueva cola a partir de la posición actual, sin duplicar la carta inmediatamente
 * siguiente (para no mostrar la misma dos veces consecutivas).
 */
export function requeueUnknown(queue: string[], currentIndex: number, cardId: string): string[] {
  const next = [...queue];
  const insertAt = Math.min(currentIndex + 2, next.length);
  next.splice(insertAt, 0, cardId);
  return next;
}
