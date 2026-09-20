import { INTERVIEW_PROMPTS, LESSONS, QUESTIONS, FLASHCARDS, CHECKLIST_RESOURCES } from './index';
import { LEVEL_1_OBJECTIVES } from './objectives';
import { trace } from './sources/traceability';

/**
 * Colecciones derivadas (contrato §8.2). No duplican datos: solo referencian ids de recursos
 * y objetivos ya existentes.
 */

export interface DerivedCollection {
  id: string;
  title: string;
  description: string;
  promptIds?: string[];
  objectiveIds?: string[];
  source: ReturnType<typeof trace>;
}

/** Top 10 — Primera entrevista: los diez prompts del mini simulacro fuente (ENT §46). */
export const TOP_10_PROMPT_IDS = [
  'P-INT-001',
  'P-INT-002',
  'P-INT-003',
  'P-INT-004',
  'P-INT-005',
  'P-INT-006',
  'P-INT-007',
  'P-INT-008',
  'P-INT-009',
  'P-INT-010',
];

/**
 * Preguntas difíciles: preguntas personales que pueden afectar la candidatura y están
 * respaldadas por `ENTREVISTA_MD`.
 */
export const HARD_PROMPT_IDS = [
  'P-INT-004',
  'P-INT-005',
  'P-INT-008',
  'P-INT-010',
  'P-INT-011',
  'P-X-001',
];

/** Penal esencial para entrevista: ruta inicial compacta de conceptos Nivel 1. */
export const PENAL_ESSENTIAL_OBJECTIVE_IDS = LEVEL_1_OBJECTIVES.filter(
  (o) => o.track === 'penal',
).map((o) => o.id);

export const TOP_10: DerivedCollection = {
  id: 'top10',
  title: 'Top 10 — Primera entrevista',
  description: 'Las diez preguntas del mini simulacro de alta probabilidad de la fuente.',
  promptIds: TOP_10_PROMPT_IDS,
  source: trace('ent-s46-lista'),
};

export const HARD_QUESTIONS: DerivedCollection = {
  id: 'dificiles',
  title: 'Preguntas difíciles',
  description:
    'Preguntas personales que pueden afectar la candidatura y tienen respuesta preparada en la fuente.',
  promptIds: HARD_PROMPT_IDS,
  source: trace('ent-s45-cierre'),
};

export const PENAL_ESSENTIAL: DerivedCollection = {
  id: 'penal-esencial',
  title: 'Penal esencial para entrevista',
  description: 'Ruta inicial compacta de los conceptos penales de Nivel 1.',
  objectiveIds: PENAL_ESSENTIAL_OBJECTIVE_IDS,
  source: trace('pen-s1-maxima'),
};

export const DERIVED_COLLECTIONS = [TOP_10, HARD_QUESTIONS, PENAL_ESSENTIAL];

/** Recursos del repaso antes de salir que no son preguntas (checklists). */
export const EXIT_REVIEW_CHECKLIST_IDS = ['CHK-NO-DECIR', 'CHK-GANAR-TIEMPO', 'CHK-DESPACHO'];

export function collectionById(id: string): DerivedCollection | undefined {
  return DERIVED_COLLECTIONS.find((c) => c.id === id);
}

/** Datos de apoyo para la búsqueda y el panel de corpus disponible. */
export const CORPUS_SUMMARY = {
  prompts: INTERVIEW_PROMPTS.length,
  lessons: LESSONS.length,
  questions: QUESTIONS.length,
  flashcards: FLASHCARDS.length,
  checklists: CHECKLIST_RESOURCES.length,
};
