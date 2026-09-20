import type {
  InterviewPracticeBlueprint,
  Level,
  MockProfile,
  QuestionType,
  QuizBlueprint,
} from './types';
import { LEARNING_OBJECTIVES } from '@/content/objectives';

/**
 * QuizBlueprint (contrato §8.5): declara track, level, maxLevel, número, objetivos y
 * distribución de tipos, para cubrir metas relevantes sin seis preguntas de tipicidad y
 * ninguna de medida o hábeas.
 */
export function penalQuizBlueprint(options: {
  questionCount: number;
  maxLevel?: Level;
  objectiveIds?: string[];
}): QuizBlueprint {
  const maxLevel = options.maxLevel ?? 1;
  const objectiveIds =
    options.objectiveIds ??
    LEARNING_OBJECTIVES.filter(
      (o) => o.track === 'penal' && o.level === 1 && o.priority !== 'reference',
    ).map((o) => o.id);
  const distribution = distributeTypes(options.questionCount);
  return {
    track: 'penal',
    level: 1,
    maxLevel,
    questionCount: options.questionCount,
    objectiveIds,
    typeDistribution: distribution,
  };
}

/**
 * Distribución orientativa fundamento / distinción / aplicación.
 * Con pocas preguntas se prioriza fundamento y distinción; la aplicación entra desde 4.
 */
export function distributeTypes(count: number): Partial<Record<QuestionType, number>> {
  if (count <= 0) return {};
  if (count <= 2) return { recall: 1, distinction: count - 1 };
  const recall = Math.max(1, Math.round(count * 0.4));
  const distinction = Math.max(1, Math.round(count * 0.35));
  const application = Math.max(0, count - recall - distinction);
  return { recall, distinction, application };
}

/**
 * InterviewPracticeBlueprint Nivel 1 (contrato §8.5): cubre presentación/motivación,
 * experiencia Penal, cambio laboral, pregunta difícil, STAR, condiciones y un follow-up fuente.
 */
export const INTERVIEW_BLUEPRINT_LEVEL_1: InterviewPracticeBlueprint = {
  level: 1,
  areas: [
    {
      id: 'presentacion',
      label: 'Presentación y motivación',
      objectiveIds: ['LO-INT-001', 'LO-INT-002'],
      count: 1,
    },
    {
      id: 'experiencia',
      label: 'Experiencia Penal',
      objectiveIds: ['LO-INT-003', 'LO-PEN-001', 'LO-X-001'],
      count: 1,
    },
    {
      id: 'cambio',
      label: 'Cambio laboral',
      objectiveIds: ['LO-INT-005', 'LO-INT-011'],
      count: 1,
    },
    {
      id: 'dificil',
      label: 'Pregunta difícil',
      objectiveIds: ['LO-INT-004', 'LO-INT-008'],
      count: 1,
    },
    {
      id: 'star',
      label: 'STAR',
      objectiveIds: ['LO-INT-006', 'LO-INT-012'],
      count: 1,
    },
    {
      id: 'condiciones',
      label: 'Condiciones',
      objectiveIds: ['LO-INT-010'],
      count: 1,
    },
  ],
  followUpCount: 1,
};

/**
 * Perfiles de simulacro (contrato §12.6). Son perfiles de entrenamiento, no predicción
 * del entrevistador.
 */
export interface MockBlueprint {
  profile: MockProfile;
  label: string;
  description: string;
  approximateMinutes: number;
  maxLevel: Level;
  interviewCount: number;
  penalCount: number;
  caseCount: number;
  requiresExplicitRequest: boolean;
}

export const MOCK_BLUEPRINTS: Record<MockProfile, MockBlueprint> = {
  quick: {
    profile: 'quick',
    label: 'Simulacro Quick',
    description:
      'Unos 10 minutos: presentación, motivación, experiencia, una difícil o STAR y 2-3 de Penal esencial. Solo Nivel 1.',
    approximateMinutes: 10,
    maxLevel: 1,
    interviewCount: 5,
    penalCount: 3,
    caseCount: 0,
    requiresExplicitRequest: false,
  },
  standard: {
    profile: 'standard',
    label: 'Simulacro Standard',
    description:
      'Entre 20 y 30 minutos: 60-70% personal, profesional y situacional; 30-40% Penal y casos. Respeta el máximo nivel que has estudiado.',
    approximateMinutes: 25,
    maxLevel: 1,
    interviewCount: 7,
    penalCount: 4,
    caseCount: 0,
    requiresExplicitRequest: false,
  },
  full: {
    profile: 'full',
    label: 'Simulacro Full',
    description:
      'Profundización: mayor componente técnico y de casos. Requiere solicitarlo expresamente.',
    approximateMinutes: 45,
    maxLevel: 2,
    interviewCount: 9,
    penalCount: 8,
    caseCount: 1,
    requiresExplicitRequest: true,
  },
};

/** Composición de Quick: 4-5 personal/profesional y 2-3 Penal/cross-track, exclusivamente Nivel 1. */
export function mockComposition(profile: MockProfile, includeLevel2: boolean): MockBlueprint {
  const blueprint = MOCK_BLUEPRINTS[profile];
  if (profile === 'standard' && includeLevel2) {
    return { ...blueprint, maxLevel: 2 };
  }
  return blueprint;
}
