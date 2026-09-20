import type { SourceRef } from '@/content/sources/traceability';

/** Contenido actual del corpus curado. Cambiarlo obliga a revisar migraciones. */
export const CONTENT_VERSION = '0.1.0';

export type Track = 'interview' | 'penal' | 'cross-track';
export type Level = 1 | 2 | 3 | 'reference';
export type Priority = 'critical' | 'high' | 'medium' | 'reference';
export type EstimatedMinutes = 2 | 5 | 10 | 15 | 20;
export type InterviewStageRelevance = 'initial' | 'technical' | 'any';
export type ReviewStatus = 'verified' | 'needs-review' | 'blocked';
export type Difficulty = 'intro' | 'media' | 'alta';

export type ResourceType =
  | 'lesson'
  | 'flashcard'
  | 'question'
  | 'interview-prompt'
  | 'star-story'
  | 'case'
  | 'checklist';

export type QuestionType =
  | 'recall'
  | 'distinction'
  | 'application'
  | 'situational'
  | 'case'
  | 'interview';

/** Tipos de brecha (contrato §16). */
export type GapKind =
  | 'knowledge-gap'
  | 'application-gap'
  | 'recall-gap'
  | 'interview-expression-gap'
  | 'interview-content-gap';

/** Campos obligatorios de todo recurso estudiable (contrato §16). */
export interface BaseResource extends SourceRef {
  id: string;
  type: ResourceType;
  title: string;
  topic: string;
  subtopic: string;
  track: Track;
  level: Level;
  priority: Priority;
  estimatedMinutes: EstimatedMinutes;
  interviewStageRelevance: InterviewStageRelevance;
  learningObjectiveId: string;
  difficulty: Difficulty;
  contentVersion: string;
  reviewStatus: ReviewStatus;
  tags: string[];
}

export interface LearningObjective {
  id: string;
  title: string;
  track: Track;
  level: Level;
  priority: Priority;
  /** Orden por defecto dentro de su frente (Apéndice A). */
  order: number;
  estimatedMinutes: EstimatedMinutes;
  source: SourceRef;
  /** Etiquetas de fuente adicionales declaradas en el Apéndice A ("PEN §39, §43-44, §55"). */
  sourceSummary: string;
  /** Cómo se practica según el Apéndice A. */
  practiceMode: string;
  allowedPrerequisiteObjectiveIds?: string[];
  /** Objetivo que se intercala junto a este (Apéndice A, cross-track). */
  interleaveAfterObjectiveId?: string;
}

export interface Lesson extends BaseResource {
  type: 'lesson';
  essentialIdea: string;
  explanation: string[];
  whatToRemember: string[];
  difference?: { a: string; b: string; distinction: string };
  sourceExample?: string;
  /** Comprobación inmediata: 1-3 preguntas del mismo objetivo (contrato §7.2). */
  checkQuestionIds: string[];
}

export interface Flashcard extends BaseResource {
  type: 'flashcard';
  front: string;
  back: string;
}

export interface QuestionOptionData {
  id: string;
  text: string;
}

export interface Question extends BaseResource {
  type: 'question';
  questionType: QuestionType;
  question: string;
  options: QuestionOptionData[];
  correctOptionId: string;
  explanation: string;
  wrongAnswerExplanations: Record<string, string>;
  /** Apoyo opcional tras "Ver más detalle"; no amplía el scope del nivel. */
  deeperDetail?: string;
  questionScope: { track: Track; level: Level; objectiveId: string };
}

export interface InterviewFollowUp {
  id: string;
  prompt: string;
  ideaThatMustLand: string;
  source: SourceRef;
}

export interface InterviewPrompt extends BaseResource {
  type: 'interview-prompt';
  /** Pregunta tal como la haría la entrevistadora. */
  prompt: string;
  ideaThatMustLand: string;
  keyPoints: { id: string; text: string; essential: boolean }[];
  avoid: string[];
  /** Apoyo secundario y colapsado: nunca un guion obligatorio. */
  recommendedAnswer: string[];
  relatedStarStoryIds: string[];
  followUps: InterviewFollowUp[];
  /** Módulo especial "Háblame de ti": pasado -> presente -> siguiente paso. */
  structure?: { label: string; hint: string }[];
}

export interface StarStory extends BaseResource {
  type: 'star-story';
  situation: string;
  task?: string;
  action: string;
  result: string;
  learning?: string;
  competencies: string[];
  /** "Esta historia te sirve para…" */
  usefulFor: string[];
  /** Prompts de entrevista que puede alimentar. */
  servesPromptIds: string[];
}

export interface CaseStep {
  id: string;
  kind: 'open' | 'verifiable';
  label: string;
  prompt: string;
  /** Solo en pasos abiertos: "Elementos que debías considerar", exclusivamente fuente. */
  elementsToConsider?: { id: string; text: string }[];
  /** Solo en pasos verificables. */
  questionId?: string;
}

export interface CaseResource extends BaseResource {
  type: 'case';
  facts: string;
  legalProblem: string;
  steps: CaseStep[];
  /** No se inventa sentencia: conclusión preliminar y abierta. */
  preliminaryConclusion: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  source: SourceRef;
}

export interface ChecklistResource extends BaseResource {
  type: 'checklist';
  intro: string;
  items: ChecklistItem[];
}

export type StudyResource =
  | Lesson
  | Flashcard
  | Question
  | InterviewPrompt
  | StarStory
  | CaseResource
  | ChecklistResource;

/** Scope de sesión: el Session Builder no lo amplía silenciosamente (contrato §8.4). */
export interface SessionScope {
  activeTrack: Track | 'mixed';
  activeLevel: Level;
  maxLevel: Level;
  timeBudget: TimeBudget;
  mode: SessionMode;
  allowedObjectiveIds: string[];
  recentErrors: string[];
  recentDoubts: string[];
  newQuestionBudget: number;
  reviewQuestionBudget: number;
}

export type TimeBudget = 10 | 20 | 30 | 60 | 'full';

export type SessionMode =
  | 'just-studied'
  | 'current-level'
  | 'mixed-review'
  | 'plan-of-day'
  | 'interview-practice'
  | 'penal-quiz'
  | 'flashcards'
  | 'top10'
  | 'hard-questions'
  | 'penal-essential'
  | 'exit-review'
  | 'mock-quick'
  | 'mock-standard'
  | 'errors'
  | 'case';

export type SessionItemKind =
  | 'interview'
  | 'flashcard'
  | 'question'
  | 'lesson'
  | 'case'
  | 'checklist';

export interface SessionItem {
  kind: SessionItemKind;
  resourceId: string;
  objectiveId: string;
  /** Marca los ítems que entran por error/duda previa en lugar de contenido nuevo. */
  reason: 'new' | 'review-error' | 'review-doubt' | 'reinforce';
}

export type MasteryState = 'not-started' | 'learning' | 'needs-review' | 'mastered';

export type SelfRating = 'blank' | 'partial' | 'good';
export type FlashcardRating = 'unknown' | 'doubt' | 'known';

export interface QuizBlueprint {
  track: Track;
  level: Level;
  maxLevel: Level;
  questionCount: number;
  objectiveIds: string[];
  /** Distribución de tipos para no repetir seis preguntas del mismo tipo (contrato §8.5). */
  typeDistribution: Partial<Record<QuestionType, number>>;
}

export interface InterviewPracticeBlueprint {
  level: Level;
  /** Áreas obligatorias del blueprint Nivel 1 (contrato §8.5). */
  areas: {
    id: string;
    label: string;
    objectiveIds: string[];
    count: number;
  }[];
  followUpCount: number;
}

export type MockProfile = 'quick' | 'standard' | 'full';
