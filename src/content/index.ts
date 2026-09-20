import type {
  CaseResource,
  ChecklistResource,
  Flashcard,
  InterviewPrompt,
  Lesson,
  Question,
  StarStory,
  StudyResource,
} from '@/domain/types';
import {
  CROSS_PROMPTS_LEVEL_1,
  INTERVIEW_PROMPTS_LEVEL_1,
  PENAL_PROMPTS_LEVEL_1,
} from './interview/prompts.level1';
import { INTERVIEW_PROMPTS_LEVEL_2 } from './interview/prompts.level2';
import { STAR_STORIES } from './interview/star';
import { PENAL_LESSONS_LEVEL_1 } from './penal/lessons.level1';
import { PENAL_FLASHCARDS_LEVEL_1 } from './penal/flashcards.level1';
import { PENAL_QUESTIONS_LEVEL_1 } from './penal/questions.level1';
import {
  PENAL_FLASHCARDS_LEVEL_2_3,
  PENAL_LESSONS_LEVEL_2_3,
  PENAL_QUESTIONS_LEVEL_2,
} from './penal/level23';
import { PENAL_CASES } from './penal/cases';
import { CHECKLISTS } from './checklists';

/**
 * Corpus completo, sin filtrar. La aplicación NUNCA debe consumir este arreglo directamente:
 * usa `RESOURCES`, que solo contiene recursos `verified` (contrato §16).
 */
const ALL_RESOURCES_RAW: StudyResource[] = [
  ...INTERVIEW_PROMPTS_LEVEL_1,
  ...CROSS_PROMPTS_LEVEL_1,
  ...PENAL_PROMPTS_LEVEL_1,
  ...INTERVIEW_PROMPTS_LEVEL_2,
  ...STAR_STORIES,
  ...PENAL_LESSONS_LEVEL_1,
  ...PENAL_LESSONS_LEVEL_2_3,
  ...PENAL_FLASHCARDS_LEVEL_1,
  ...PENAL_FLASHCARDS_LEVEL_2_3,
  ...PENAL_QUESTIONS_LEVEL_1,
  ...PENAL_QUESTIONS_LEVEL_2,
  ...PENAL_CASES,
  ...CHECKLISTS,
];

export const ALL_RESOURCES_INCLUDING_UNVERIFIED = ALL_RESOURCES_RAW;

/** Único punto de entrada de contenido para la aplicación: solo `verified`. */
export const RESOURCES: StudyResource[] = ALL_RESOURCES_RAW.filter(
  (r) => r.reviewStatus === 'verified',
);

const BY_ID = new Map<string, StudyResource>(RESOURCES.map((r) => [r.id, r]));

export function getResource(id: string): StudyResource | undefined {
  return BY_ID.get(id);
}

export function requireResource(id: string): StudyResource {
  const resource = BY_ID.get(id);
  if (!resource) throw new Error(`Recurso desconocido o no verificado: ${id}`);
  return resource;
}

function byType<T extends StudyResource>(type: StudyResource['type']): T[] {
  return RESOURCES.filter((r) => r.type === type) as T[];
}

export const LESSONS: Lesson[] = byType<Lesson>('lesson');
export const FLASHCARDS: Flashcard[] = byType<Flashcard>('flashcard');
export const QUESTIONS: Question[] = byType<Question>('question');
export const INTERVIEW_PROMPTS: InterviewPrompt[] = byType<InterviewPrompt>('interview-prompt');
export const STARS: StarStory[] = byType<StarStory>('star-story');
export const CASES: CaseResource[] = byType<CaseResource>('case');
export const CHECKLIST_RESOURCES: ChecklistResource[] = byType<ChecklistResource>('checklist');

export function resourcesForObjective(objectiveId: string): StudyResource[] {
  return RESOURCES.filter((r) => r.learningObjectiveId === objectiveId);
}

export function questionsForObjective(objectiveId: string): Question[] {
  return QUESTIONS.filter((q) => q.learningObjectiveId === objectiveId);
}

export function flashcardsForObjective(objectiveId: string): Flashcard[] {
  return FLASHCARDS.filter((f) => f.learningObjectiveId === objectiveId);
}

export function lessonForObjective(objectiveId: string): Lesson | undefined {
  return LESSONS.find((l) => l.learningObjectiveId === objectiveId);
}

export function promptsForObjective(objectiveId: string): InterviewPrompt[] {
  return INTERVIEW_PROMPTS.filter((p) => p.learningObjectiveId === objectiveId);
}

export function casesForObjective(objectiveId: string): CaseResource[] {
  return CASES.filter((c) => c.learningObjectiveId === objectiveId);
}

export function starStory(id: string): StarStory | undefined {
  return STARS.find((s) => s.id === id);
}

export { PENAL_CASES, CASE_PRIORITY_ORDER, LEGAL_NOTICE } from './penal/cases';
export { STAR_STORIES } from './interview/star';
