import { CONTENT_VERSION } from '@/domain/types';
import type {
  BaseResource,
  Difficulty,
  EstimatedMinutes,
  InterviewStageRelevance,
  Level,
  Priority,
  ResourceType,
  Track,
} from '@/domain/types';
import { trace } from './sources/traceability';

export interface BaseInput {
  id: string;
  title: string;
  topic: string;
  subtopic: string;
  track: Track;
  level: Level;
  priority: Priority;
  estimatedMinutes: EstimatedMinutes;
  stage: InterviewStageRelevance;
  objectiveId: string;
  difficulty: Difficulty;
  anchor: string;
  tags?: string[];
}

/**
 * Construye los campos obligatorios de un recurso (contrato §16) resolviendo la fuente.
 * `reviewStatus` es 'verified' porque cada recurso se cura contra un fragmento fuente
 * verificado por `scripts/verify-excerpts.mjs`. Un recurso sin fragmento válido no compila.
 */
export function base(input: BaseInput, type: ResourceType): BaseResource {
  return {
    ...trace(input.anchor),
    id: input.id,
    type,
    title: input.title,
    topic: input.topic,
    subtopic: input.subtopic,
    track: input.track,
    level: input.level,
    priority: input.priority,
    estimatedMinutes: input.estimatedMinutes,
    interviewStageRelevance: input.stage,
    learningObjectiveId: input.objectiveId,
    difficulty: input.difficulty,
    contentVersion: CONTENT_VERSION,
    reviewStatus: 'verified',
    tags: input.tags ?? [],
  };
}
