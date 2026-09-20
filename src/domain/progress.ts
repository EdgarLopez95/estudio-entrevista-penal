import type {
  FlashcardRating,
  GapKind,
  Level,
  MockProfile,
  SelfRating,
  SessionItem,
  SessionMode,
  SessionScope,
  TimeBudget,
  Track,
} from './types';

export const SCHEMA_VERSION = 2;
export const PROGRESS_VERSION = 1;

export type ThemePreference = 'system' | 'light' | 'dark';
export type StudyModePreference = 'first-interview' | 'technical';

export interface TargetInterview {
  enabled: boolean;
  /** ISO date (YYYY-MM-DD). */
  date: string | null;
  time?: string | null;
  title: string;
  location?: string | null;
  focus: string;
}

export interface Preferences {
  theme: ThemePreference;
  mode: StudyModePreference;
  /** "Incluir Nivel 2" requiere elección explícita (contrato §8.5). */
  includeLevel2: boolean;
  /** Último tiempo elegido en el selector, para no volver a preguntar lo mismo. */
  lastTimeBudget: TimeBudget;
}

export interface RecallEvent {
  at: string;
  correct: boolean;
  sessionId: string;
  /** Origen de la recuperación: pregunta, flashcard o prompt oral. */
  via: 'question' | 'flashcard' | 'prompt';
}

export interface ObjectiveProgress {
  lessonStudiedAt?: string;
  recalls: RecallEvent[];
  /** Porcentaje de acierto por intento de quiz temático del objetivo. */
  quizScores: { at: string; percent: number; sessionId: string }[];
  lastSeenAt?: string;
}

export interface QuestionAttempt {
  at: string;
  chosenOptionId: string;
  correct: boolean;
  sessionId: string;
}

export interface FlashcardAttempt {
  at: string;
  rating: FlashcardRating;
  sessionId: string;
}

export interface InterviewAttempt {
  at: string;
  selfRating: SelfRating;
  coveredKeyPointIds: string[];
  sessionId: string;
  usedModelAnswer: boolean;
}

export interface ErrorRecord {
  id: string;
  kind: GapKind;
  resourceId: string;
  resourceType: string;
  objectiveId: string;
  track: Track;
  level: Level;
  priority: string;
  topic: string;
  title: string;
  lastResponse?: string;
  explanation?: string;
  attempts: number;
  laterCorrect: number;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'improving' | 'resolved';
}

export interface ActiveSession {
  sessionId: string;
  mode: SessionMode;
  scope: SessionScope;
  items: SessionItem[];
  currentIndex: number;
  startedAt: string;
  completedAt: string | null;
  status: 'active' | 'completed' | 'abandoned';
  /** Respuestas dentro de la sesión, por índice de ítem. */
  answers: Record<number, SessionAnswer>;
  /** Perfil cuando la sesión es un simulacro. */
  mockProfile?: MockProfile;
  /** Título legible para la barra de contexto. */
  label: string;
}

export type SessionAnswer =
  | { kind: 'question'; chosenOptionId: string; correct: boolean; revealed: boolean }
  | { kind: 'flashcard'; rating: FlashcardRating }
  | {
      kind: 'interview';
      attempted: boolean;
      selfRating?: SelfRating;
      coveredKeyPointIds: string[];
      usedModelAnswer: boolean;
    }
  | { kind: 'lesson'; studied: boolean }
  | { kind: 'case'; elementsChecked: Record<string, string[]>; completed: boolean }
  | { kind: 'checklist'; checkedItemIds: string[] };

export interface SessionSummary {
  sessionId: string;
  mode: SessionMode;
  label: string;
  startedAt: string;
  completedAt: string;
  itemCount: number;
  answeredCount: number;
  objectiveIds: string[];
  timeBudget: TimeBudget;
}

export interface MockResult {
  id: string;
  profile: MockProfile;
  at: string;
  /** Conocimiento Penal: aciertos sobre preguntas respondidas. */
  penal: { correct: number; answered: number };
  /** Casos: elementos identificados sobre esperados. */
  cases: { identified: number; expected: number };
  /** Preparación de entrevista: key points practicados sobre posibles. */
  interview: { covered: number; possible: number; blank: number; partial: number; good: number };
  priorityErrorIds: string[];
}

export interface ProgressState {
  schemaVersion: number;
  contentVersion: string;
  progressVersion: number;
  createdAt: string;
  updatedAt: string;
  preferences: Preferences;
  targetInterview: TargetInterview;
  objectives: Record<string, ObjectiveProgress>;
  questions: Record<string, QuestionAttempt[]>;
  flashcards: Record<string, FlashcardAttempt[]>;
  interview: Record<string, InterviewAttempt[]>;
  cases: Record<string, { at: string; elementsChecked: Record<string, string[]> }[]>;
  checklists: Record<string, string[]>;
  errors: ErrorRecord[];
  activeSession: ActiveSession | null;
  sessions: SessionSummary[];
  mocks: MockResult[];
  lastActivity: {
    at: string;
    resourceId: string | null;
    objectiveId: string | null;
    mode: SessionMode | null;
    /** Posición útil dentro de la última sesión. */
    itemIndex: number | null;
  } | null;
  /** Avisos ya vistos, para no repetir tooltips contextuales. */
  seenHints: string[];
}

export function createEmptyProgress(now: string, contentVersion: string): ProgressState {
  return {
    schemaVersion: SCHEMA_VERSION,
    contentVersion,
    progressVersion: PROGRESS_VERSION,
    createdAt: now,
    updatedAt: now,
    preferences: {
      theme: 'system',
      mode: 'first-interview',
      includeLevel2: false,
      lastTimeBudget: 20,
    },
    targetInterview: {
      enabled: false,
      date: null,
      time: null,
      title: 'Entrevista Abogada Junior en Derecho Penal',
      location: null,
      focus: 'Primera entrevista',
    },
    objectives: {},
    questions: {},
    flashcards: {},
    interview: {},
    cases: {},
    checklists: {},
    errors: [],
    activeSession: null,
    sessions: [],
    mocks: [],
    lastActivity: null,
    seenHints: [],
  };
}

export function objectiveProgress(state: ProgressState, objectiveId: string): ObjectiveProgress {
  return state.objectives[objectiveId] ?? { recalls: [], quizScores: [] };
}
