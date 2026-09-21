import { CONTENT_VERSION } from '@/domain/types';
import {
  PROGRESS_VERSION,
  SCHEMA_VERSION,
  createEmptyProgress,
  type ProgressState,
} from '@/domain/progress';

/**
 * Migraciones de persistencia (contrato §15).
 * - Se separan `schemaVersion`, `contentVersion` y versión de progreso.
 * - Las migraciones conservan progreso con IDs compatibles.
 * - Está PROHIBIDO usar `localStorage.clear()` como actualización.
 */

export interface MigrationResult {
  state: ProgressState;
  migratedFrom: number | null;
  notes: string[];
}

type AnyRecord = Record<string, unknown>;

function isRecord(value: unknown): value is AnyRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * v1 -> v2: el banco de intentos de entrevista se llamaba `prompts` y no existían
 * `cases`, `checklists`, `mocks` ni `seenHints`. Se conserva todo el progreso previo.
 */
function migrateV1ToV2(raw: AnyRecord, notes: string[]): AnyRecord {
  const next: AnyRecord = { ...raw };
  if (isRecord(raw.prompts) && !isRecord(raw.interview)) {
    next.interview = raw.prompts;
    delete next.prompts;
    notes.push('v1→v2: intentos de entrevista movidos de `prompts` a `interview`.');
  }
  next.cases = isRecord(raw.cases) ? raw.cases : {};
  next.checklists = isRecord(raw.checklists) ? raw.checklists : {};
  next.mocks = Array.isArray(raw.mocks) ? raw.mocks : [];
  next.seenHints = Array.isArray(raw.seenHints) ? raw.seenHints : [];
  next.schemaVersion = 2;
  return next;
}

const MIGRATIONS: Record<number, (raw: AnyRecord, notes: string[]) => AnyRecord> = {
  1: migrateV1ToV2,
};

/** Rellena campos ausentes sin destruir lo existente. */
function reconcile(raw: AnyRecord, now: string): ProgressState {
  const empty = createEmptyProgress(now, CONTENT_VERSION);
  const preferences = isRecord(raw.preferences) ? raw.preferences : {};
  const rawTarget = isRecord(raw.targetInterview) ? raw.targetInterview : {};
  const mergedTarget = { ...empty.targetInterview, ...(rawTarget as object) };
  if (!mergedTarget.date) {
    mergedTarget.enabled = true;
    mergedTarget.date = '2026-09-21';
    mergedTarget.time = '14:00';
  }
  return {
    ...empty,
    ...(raw as Partial<ProgressState>),
    schemaVersion: SCHEMA_VERSION,
    progressVersion: PROGRESS_VERSION,
    contentVersion: typeof raw.contentVersion === 'string' ? raw.contentVersion : CONTENT_VERSION,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : now,
    updatedAt: now,
    preferences: { ...empty.preferences, ...(preferences as object) },
    targetInterview: mergedTarget,
    objectives: isRecord(raw.objectives) ? (raw.objectives as ProgressState['objectives']) : {},
    questions: isRecord(raw.questions) ? (raw.questions as ProgressState['questions']) : {},
    flashcards: isRecord(raw.flashcards) ? (raw.flashcards as ProgressState['flashcards']) : {},
    interview: isRecord(raw.interview) ? (raw.interview as ProgressState['interview']) : {},
    cases: isRecord(raw.cases) ? (raw.cases as ProgressState['cases']) : {},
    checklists: isRecord(raw.checklists) ? (raw.checklists as ProgressState['checklists']) : {},
    errors: Array.isArray(raw.errors) ? (raw.errors as ProgressState['errors']) : [],
    sessions: Array.isArray(raw.sessions) ? (raw.sessions as ProgressState['sessions']) : [],
    mocks: Array.isArray(raw.mocks) ? (raw.mocks as ProgressState['mocks']) : [],
    activeSession: isRecord(raw.activeSession)
      ? (raw.activeSession as unknown as ProgressState['activeSession'])
      : null,
    lastActivity: isRecord(raw.lastActivity)
      ? (raw.lastActivity as unknown as ProgressState['lastActivity'])
      : null,
    seenHints: Array.isArray(raw.seenHints) ? (raw.seenHints as string[]) : [],
  };
}

export function migrate(input: unknown, now: string): MigrationResult {
  const notes: string[] = [];
  if (!isRecord(input)) {
    return { state: createEmptyProgress(now, CONTENT_VERSION), migratedFrom: null, notes: ['Sin datos previos.'] };
  }

  let raw: AnyRecord = { ...input };
  const originalVersion = typeof raw.schemaVersion === 'number' ? raw.schemaVersion : 1;
  let version = originalVersion;

  while (version < SCHEMA_VERSION) {
    const migration = MIGRATIONS[version];
    if (!migration) {
      notes.push(`No hay migración desde la versión ${version}; se conservan los datos compatibles.`);
      break;
    }
    raw = migration(raw, notes);
    version = typeof raw.schemaVersion === 'number' ? raw.schemaVersion : version + 1;
  }

  if (originalVersion > SCHEMA_VERSION) {
    notes.push(
      `Los datos vienen de una versión más nueva (${originalVersion}). Se conservan y se leen los campos compatibles.`,
    );
  }

  const state = reconcile(raw, now);
  if (state.contentVersion !== CONTENT_VERSION) {
    notes.push(
      `El contenido cambió de ${state.contentVersion} a ${CONTENT_VERSION}: el progreso se conserva por ID.`,
    );
    state.contentVersion = CONTENT_VERSION;
  }

  return {
    state,
    migratedFrom: originalVersion === SCHEMA_VERSION ? null : originalVersion,
    notes,
  };
}
