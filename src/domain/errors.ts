import type { GapKind, Level, StudyResource, Track } from './types';
import type { ErrorRecord, ProgressState } from './progress';

/**
 * Mis errores (contrato §12.7, §16).
 * Tipos de registro: error de conocimiento, error de aplicación, duda de flashcard,
 * concepto omitido en caso y entrevista no practicada.
 *
 * Regla determinista de cierre: "acertar una vez no borra".
 * - `laterCorrect === 0` -> activo
 * - `laterCorrect === 1` -> mejorando (sigue apareciendo en repaso)
 * - `laterCorrect >= 2` -> resuelto
 */

export const RESOLVE_THRESHOLD = 2;

export const GAP_LABEL: Record<GapKind, string> = {
  'knowledge-gap': 'Error de conocimiento',
  'application-gap': 'Error de aplicación',
  'recall-gap': 'Duda de recuperación',
  'interview-expression-gap': 'Falta practicar la respuesta',
  'interview-content-gap': 'Falta contenido de la respuesta',
};

export function errorId(kind: GapKind, resourceId: string): string {
  return `${kind}:${resourceId}`;
}

export interface RecordErrorInput {
  kind: GapKind;
  resource: StudyResource;
  lastResponse?: string;
  explanation?: string;
  now: string;
}

export function upsertError(errors: ErrorRecord[], input: RecordErrorInput): ErrorRecord[] {
  const id = errorId(input.kind, input.resource.id);
  const existing = errors.find((e) => e.id === id);
  if (existing) {
    return errors.map((e) =>
      e.id === id
        ? {
            ...e,
            attempts: e.attempts + 1,
            laterCorrect: 0,
            status: 'active',
            lastResponse: input.lastResponse ?? e.lastResponse,
            explanation: input.explanation ?? e.explanation,
            updatedAt: input.now,
          }
        : e,
    );
  }
  const record: ErrorRecord = {
    id,
    kind: input.kind,
    resourceId: input.resource.id,
    resourceType: input.resource.type,
    objectiveId: input.resource.learningObjectiveId,
    track: input.resource.track,
    level: input.resource.level,
    priority: input.resource.priority,
    topic: input.resource.topic,
    title: input.resource.title,
    lastResponse: input.lastResponse,
    explanation: input.explanation,
    attempts: 1,
    laterCorrect: 0,
    createdAt: input.now,
    updatedAt: input.now,
    status: 'active',
  };
  return [...errors, record];
}

export function registerCorrection(
  errors: ErrorRecord[],
  resourceId: string,
  now: string,
): ErrorRecord[] {
  return errors.map((e) => {
    if (e.resourceId !== resourceId || e.status === 'resolved') return e;
    const laterCorrect = e.laterCorrect + 1;
    return {
      ...e,
      laterCorrect,
      status: laterCorrect >= RESOLVE_THRESHOLD ? 'resolved' : 'improving',
      updatedAt: now,
    };
  });
}

export function activeErrors(state: ProgressState): ErrorRecord[] {
  return state.errors.filter((e) => e.status !== 'resolved');
}

export function hasActiveErrorForObjective(state: ProgressState, objectiveId: string): boolean {
  return activeErrors(state).some((e) => e.objectiveId === objectiveId);
}

export function hasActiveGap(state: ProgressState, resourceId: string, kind: GapKind): boolean {
  return state.errors.some(
    (e) => e.resourceId === resourceId && e.kind === kind && e.status !== 'resolved',
  );
}

function levelWeight(level: Level): number {
  if (level === 1) return 0;
  if (level === 2) return 1;
  if (level === 3) return 2;
  return 3;
}

function trackWeight(track: Track): number {
  // En modo Primera entrevista, la entrevista pesa más que Penal.
  if (track === 'interview') return 0;
  if (track === 'cross-track') return 1;
  return 2;
}

/**
 * Orden de Mis errores: crítico y Nivel 1 primero, luego Nivel 2; Nivel 3 solo si se elige
 * profundizar (contrato §16). Un error de Nivel 3 nunca desplaza uno de Nivel 1.
 */
export function orderErrors(
  errors: ErrorRecord[],
  options: { includeDeepening?: boolean } = {},
): ErrorRecord[] {
  const visible = options.includeDeepening
    ? errors
    : errors.filter((e) => e.level === 1 || e.level === 2);
  return [...visible].sort((a, b) => {
    const levelDiff = levelWeight(a.level) - levelWeight(b.level);
    if (levelDiff !== 0) return levelDiff;
    const criticalA = a.priority === 'critical' ? 0 : 1;
    const criticalB = b.priority === 'critical' ? 0 : 1;
    if (criticalA !== criticalB) return criticalA - criticalB;
    const trackDiff = trackWeight(a.track) - trackWeight(b.track);
    if (trackDiff !== 0) return trackDiff;
    const statusWeight = (status: ErrorRecord['status']) => (status === 'active' ? 0 : 1);
    const statusDiff = statusWeight(a.status) - statusWeight(b.status);
    if (statusDiff !== 0) return statusDiff;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

/** Errores críticos recientes de Nivel 1, para Repaso antes de salir y recomendación. */
export function criticalLevel1Errors(state: ProgressState): ErrorRecord[] {
  return orderErrors(
    activeErrors(state).filter((e) => e.level === 1 && e.priority === 'critical'),
  );
}
