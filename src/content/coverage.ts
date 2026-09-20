import type { LearningObjective, StudyResource } from '@/domain/types';
import { LEARNING_OBJECTIVES, getObjective } from './objectives';
import { RESOURCES, QUESTIONS } from './index';

export interface CoverageRow {
  objective: LearningObjective;
  lessons: string[];
  flashcards: string[];
  questions: string[];
  prompts: string[];
  cases: string[];
  checklists: string[];
  stars: string[];
  /** Tiene al menos un recurso de exposición (lección, prompt o checklist). */
  hasContent: boolean;
  /** Tiene al menos una forma de práctica (pregunta, flashcard, prompt oral o caso). */
  hasPractice: boolean;
}

/**
 * Coverage Matrix (contrato §7.3): LearningObjective -> lección -> flashcard -> pregunta(s)
 * -> caso/prompt -> nivel -> fuente. Es auditable y se valida en pruebas.
 */
export function buildCoverageMatrix(resources: StudyResource[] = RESOURCES): CoverageRow[] {
  return LEARNING_OBJECTIVES.map((objective) => {
    const own = resources.filter((r) => r.learningObjectiveId === objective.id);
    const pick = (type: StudyResource['type']) => own.filter((r) => r.type === type).map((r) => r.id);
    const lessons = pick('lesson');
    const flashcards = pick('flashcard');
    const questions = pick('question');
    const prompts = pick('interview-prompt');
    const cases = pick('case');
    const checklists = pick('checklist');
    const stars = pick('star-story');
    return {
      objective,
      lessons,
      flashcards,
      questions,
      prompts,
      cases,
      checklists,
      stars,
      hasContent: lessons.length + prompts.length + checklists.length + stars.length > 0,
      hasPractice: questions.length + flashcards.length + prompts.length + cases.length > 0,
    };
  });
}

export interface CoverageIssue {
  severity: 'critico' | 'importante' | 'mejora';
  objectiveId?: string;
  resourceId?: string;
  message: string;
}

/**
 * Validación de contenido y de la Coverage Matrix (contrato §22).
 * Se ejecuta en pruebas unitarias y en el modo auditoría local.
 */
export function validateCoverage(resources: StudyResource[] = RESOURCES): CoverageIssue[] {
  const issues: CoverageIssue[] = [];
  const seenIds = new Set<string>();

  for (const resource of resources) {
    if (seenIds.has(resource.id)) {
      issues.push({ severity: 'critico', resourceId: resource.id, message: 'ID de recurso duplicado' });
    }
    seenIds.add(resource.id);

    const objective = getObjective(resource.learningObjectiveId);
    if (!objective) {
      issues.push({
        severity: 'critico',
        resourceId: resource.id,
        message: `Objetivo inexistente: ${resource.learningObjectiveId}`,
      });
      continue;
    }
    if (resource.level !== objective.level) {
      issues.push({
        severity: 'critico',
        resourceId: resource.id,
        objectiveId: objective.id,
        message: `El nivel del recurso (${resource.level}) no coincide con el del objetivo (${objective.level})`,
      });
    }
    if (resource.reviewStatus !== 'verified') {
      issues.push({
        severity: 'critico',
        resourceId: resource.id,
        message: `reviewStatus distinto de verified: ${resource.reviewStatus}`,
      });
    }
    if (!resource.sourceExcerptHash || resource.sourceExcerptHash.length !== 64) {
      issues.push({
        severity: 'critico',
        resourceId: resource.id,
        message: 'Falta sourceExcerptHash válido (SHA-256)',
      });
    }
    if (!resource.sourceSection || !resource.sourceAnchor) {
      issues.push({
        severity: 'critico',
        resourceId: resource.id,
        message: 'Falta sección o anchor de fuente',
      });
    }

    if (resource.type === 'question') {
      const optionIds = resource.options.map((o) => o.id);
      if (new Set(optionIds).size !== optionIds.length) {
        issues.push({ severity: 'critico', resourceId: resource.id, message: 'Opciones con id duplicado' });
      }
      const texts = resource.options.map((o) => o.text.trim().toLowerCase());
      if (new Set(texts).size !== texts.length) {
        issues.push({ severity: 'critico', resourceId: resource.id, message: 'Opciones con texto duplicado' });
      }
      if (!optionIds.includes(resource.correctOptionId)) {
        issues.push({
          severity: 'critico',
          resourceId: resource.id,
          message: 'La respuesta correcta no corresponde a ninguna opción',
        });
      }
      if (resource.options.length < 2) {
        issues.push({ severity: 'critico', resourceId: resource.id, message: 'Menos de dos opciones' });
      }
      if (!resource.explanation.trim()) {
        issues.push({ severity: 'importante', resourceId: resource.id, message: 'Pregunta sin explicación' });
      }
      if (resource.questionScope.objectiveId !== resource.learningObjectiveId) {
        issues.push({
          severity: 'critico',
          resourceId: resource.id,
          message: 'questionScope.objectiveId no coincide con learningObjectiveId',
        });
      }
      if (resource.questionScope.level !== resource.level) {
        issues.push({
          severity: 'critico',
          resourceId: resource.id,
          message: 'questionScope.level no coincide con el nivel del recurso',
        });
      }
      for (const option of resource.options) {
        if (/todas las anteriores|ninguna de las anteriores/i.test(option.text)) {
          issues.push({
            severity: 'importante',
            resourceId: resource.id,
            message: 'Opción del tipo "todas/ninguna de las anteriores"',
          });
        }
      }
    }

    if (resource.type === 'lesson') {
      for (const questionId of resource.checkQuestionIds) {
        const question = QUESTIONS.find((q) => q.id === questionId);
        if (!question) {
          issues.push({
            severity: 'critico',
            resourceId: resource.id,
            message: `Comprobación inmediata apunta a una pregunta inexistente: ${questionId}`,
          });
        } else if (question.learningObjectiveId !== resource.learningObjectiveId) {
          issues.push({
            severity: 'critico',
            resourceId: resource.id,
            message: `La comprobación ${questionId} mide otro objetivo`,
          });
        }
      }
    }

    if (resource.type === 'interview-prompt') {
      if (resource.keyPoints.length === 0) {
        issues.push({ severity: 'critico', resourceId: resource.id, message: 'Prompt sin keyPoints' });
      }
      if (!resource.keyPoints.some((k) => k.essential)) {
        issues.push({
          severity: 'importante',
          resourceId: resource.id,
          message: 'Prompt sin ningún keyPoint esencial',
        });
      }
      if (resource.followUps.length > 2) {
        issues.push({
          severity: 'importante',
          resourceId: resource.id,
          message: 'Más de dos follow-ups (banco inicial limitado, contrato §23)',
        });
      }
    }

    if (resource.type === 'case') {
      for (const step of resource.steps) {
        if (step.kind === 'open' && (!step.elementsToConsider || step.elementsToConsider.length === 0)) {
          issues.push({
            severity: 'critico',
            resourceId: resource.id,
            message: `Paso abierto sin "Elementos que debías considerar": ${step.id}`,
          });
        }
        if (step.kind === 'verifiable' && !step.questionId) {
          issues.push({
            severity: 'critico',
            resourceId: resource.id,
            message: `Paso verificable sin pregunta: ${step.id}`,
          });
        }
      }
    }
  }

  for (const row of buildCoverageMatrix(resources)) {
    const { objective } = row;
    if (objective.level === 'reference') continue;
    if (!row.hasContent) {
      issues.push({
        severity: objective.priority === 'critical' ? 'critico' : 'importante',
        objectiveId: objective.id,
        message: 'Objetivo sin contenido de exposición',
      });
    }
    if (objective.priority === 'critical' && !row.hasPractice) {
      issues.push({
        severity: 'critico',
        objectiveId: objective.id,
        message: 'Objetivo crítico con contenido pero sin práctica',
      });
    }
    if (objective.level === 1 && objective.track === 'penal' && row.questions.length > 4) {
      issues.push({
        severity: 'importante',
        objectiveId: objective.id,
        message: `Banco inicial: ${row.questions.length} preguntas (máximo 4 por objetivo Penal)`,
      });
    }
    if (objective.allowedPrerequisiteObjectiveIds) {
      for (const prerequisiteId of objective.allowedPrerequisiteObjectiveIds) {
        const prerequisite = getObjective(prerequisiteId);
        if (!prerequisite) {
          issues.push({
            severity: 'critico',
            objectiveId: objective.id,
            message: `Prerrequisito inexistente: ${prerequisiteId}`,
          });
        } else if (prerequisite.level !== objective.level) {
          issues.push({
            severity: 'critico',
            objectiveId: objective.id,
            message: `Un objetivo de Nivel ${objective.level} no puede depender de Nivel ${prerequisite.level}`,
          });
        }
      }
    }
  }

  return issues;
}
