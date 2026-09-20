import type { TargetInterview } from './progress';
import type { TimeBudget } from './types';

/** Fecha local en formato YYYY-MM-DD, sin usar UTC para no desplazar el día. */
export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Días completos hasta la fecha objetivo. Negativo si ya pasó. */
export function daysUntil(dateKey: string | null, now: Date = new Date()): number | null {
  if (!dateKey) return null;
  const target = parseDateKey(dateKey);
  if (!target) return null;
  const today = parseDateKey(toLocalDateKey(now));
  if (!today) return null;
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export type InterviewPhase = 'none' | 'far' | 'week' | 'tomorrow' | 'today' | 'past';

/**
 * Fase respecto de la entrevista (contrato §12.1.1, §14).
 * Solo se muestra "Mañana es tu entrevista" si la fecha configurada lo permite.
 * Tras la fecha la app sigue usable en Modo estudio, sin romper datos.
 */
export function interviewPhase(target: TargetInterview, now: Date = new Date()): InterviewPhase {
  if (!target.enabled || !target.date) return 'none';
  const days = daysUntil(target.date, now);
  if (days === null) return 'none';
  if (days < 0) return 'past';
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days <= 7) return 'week';
  return 'far';
}

export function phaseLabel(phase: InterviewPhase, target: TargetInterview, now = new Date()): string {
  switch (phase) {
    case 'today':
      return 'Hoy es tu entrevista';
    case 'tomorrow':
      return 'Mañana es tu entrevista';
    case 'week': {
      const days = daysUntil(target.date, now);
      return `Tu entrevista es en ${days} días`;
    }
    case 'far': {
      const date = target.date ? parseDateKey(target.date) : null;
      return date
        ? `Entrevista: ${date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}`
        : 'Entrevista programada';
    }
    case 'past':
      return 'Modo estudio';
    default:
      return 'Sin fecha de entrevista configurada';
  }
}

/** Minutos efectivos de un presupuesto de tiempo. 'full' equivale a una sesión larga. */
export function budgetMinutes(budget: TimeBudget): number {
  return budget === 'full' ? 90 : budget;
}

export const TIME_BUDGET_OPTIONS: { value: TimeBudget; label: string; short: string }[] = [
  { value: 10, label: '10 minutos', short: '10 min' },
  { value: 20, label: '20 minutos', short: '20 min' },
  { value: 30, label: '30 minutos', short: '30 min' },
  { value: 60, label: '1 hora', short: '1 hora' },
  { value: 'full', label: 'Sesión completa', short: 'Completa' },
];

/**
 * Sugerencia de pausa tras un bloque continuo (contrato §12.1.1): entre 20 y 30 minutos.
 * Nunca condiciona continuar a una racha.
 */
export const BLOCK_SUGGESTION_MINUTES = 25;

export function minutesSince(iso: string, now: Date = new Date()): number {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 0;
  return Math.max(0, Math.round((now.getTime() - then) / 60_000));
}
