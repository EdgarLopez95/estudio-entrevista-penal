import type {
  FlashcardRating,
  MockProfile,
  SelfRating,

  TimeBudget,
} from '@/domain/types';
import type {
  ObjectiveProgress,
  ProgressState,
  SessionAnswer,
  TargetInterview,
  ThemePreference,
} from '@/domain/progress';
import { createEmptyProgress } from '@/domain/progress';
import { CONTENT_VERSION } from '@/domain/types';
import { getResource, requireResource } from '@/content';
import { registerCorrection, upsertError } from '@/domain/errors';
import type { BuiltSession } from '@/domain/sessionBuilder';
import { loadProgress, resetProgress, saveProgress, saveProgressNow } from '@/storage/repository';

type Listener = () => void;

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

function withObjective(
  state: ProgressState,
  objectiveId: string,
  update: (progress: ObjectiveProgress) => ObjectiveProgress,
): ProgressState {
  const current: ObjectiveProgress = state.objectives[objectiveId] ?? { recalls: [], quizScores: [] };
  return {
    ...state,
    objectives: { ...state.objectives, [objectiveId]: update(current) },
  };
}

/** Recalcula la puntuación del quiz temático del objetivo dentro de la sesión actual. */
function updateQuizScore(
  state: ProgressState,
  objectiveId: string,
  sessionId: string,
  at: string,
): ProgressState {
  const attempts = Object.entries(state.questions).flatMap(([questionId, list]) => {
    const resource = getResource(questionId);
    if (!resource || resource.learningObjectiveId !== objectiveId) return [];
    return list.filter((attempt) => attempt.sessionId === sessionId);
  });
  if (attempts.length === 0) return state;
  const correct = attempts.filter((a) => a.correct).length;
  const percent = Math.round((correct / attempts.length) * 100);
  return withObjective(state, objectiveId, (progress) => {
    const existingIndex = progress.quizScores.findIndex((s) => s.sessionId === sessionId);
    const entry = { at, percent, sessionId };
    const quizScores =
      existingIndex >= 0
        ? progress.quizScores.map((s, i) => (i === existingIndex ? entry : s))
        : [...progress.quizScores, entry];
    return { ...progress, quizScores: quizScores.slice(-20) };
  });
}

export class ProgressStore {
  private state: ProgressState;
  private listeners = new Set<Listener>();
  readonly notes: string[];
  readonly recoveredFromCorruption: boolean;

  constructor(initial?: ProgressState) {
    if (initial) {
      this.state = initial;
      this.notes = [];
      this.recoveredFromCorruption = false;
    } else {
      const loaded = loadProgress();
      this.state = loaded.state;
      this.notes = loaded.notes;
      this.recoveredFromCorruption = loaded.recoveredFromCorruption;
    }
  }

  getState = (): ProgressState => this.state;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private commit(next: ProgressState, options: { immediate?: boolean } = {}) {
    this.state = { ...next, updatedAt: nowIso() };
    if (options.immediate) saveProgressNow(this.state);
    else saveProgress(this.state);
    for (const listener of this.listeners) listener();
  }

  // ---------------------------------------------------------------- preferencias

  setTheme = (theme: ThemePreference) => {
    this.commit({ ...this.state, preferences: { ...this.state.preferences, theme } });
  };

  setStudyMode = (mode: ProgressState['preferences']['mode']) => {
    this.commit({ ...this.state, preferences: { ...this.state.preferences, mode } });
  };

  setIncludeLevel2 = (includeLevel2: boolean) => {
    this.commit({ ...this.state, preferences: { ...this.state.preferences, includeLevel2 } });
  };

  setTimeBudget = (lastTimeBudget: TimeBudget) => {
    this.commit({ ...this.state, preferences: { ...this.state.preferences, lastTimeBudget } });
  };

  setTargetInterview = (target: Partial<TargetInterview>) => {
    this.commit({ ...this.state, targetInterview: { ...this.state.targetInterview, ...target } });
  };

  dismissHint = (hintId: string) => {
    if (this.state.seenHints.includes(hintId)) return;
    this.commit({ ...this.state, seenHints: [...this.state.seenHints, hintId] });
  };

  // ---------------------------------------------------------------- sesión

  startSession = (
    built: BuiltSession,
    options: { mockProfile?: MockProfile; label?: string } = {},
  ): string => {
    const sessionId = newId('s');
    const at = nowIso();
    const previous = this.state.activeSession;
    const sessions =
      previous && previous.status === 'active'
        ? [
            ...this.state.sessions,
            {
              sessionId: previous.sessionId,
              mode: previous.mode,
              label: previous.label,
              startedAt: previous.startedAt,
              completedAt: at,
              itemCount: previous.items.length,
              answeredCount: Object.keys(previous.answers).length,
              objectiveIds: Array.from(new Set(previous.items.map((i) => i.objectiveId))),
              timeBudget: previous.scope.timeBudget,
            },
          ].slice(-40)
        : this.state.sessions;

    this.commit(
      {
        ...this.state,
        sessions,
        activeSession: {
          sessionId,
          mode: built.scope.mode,
          scope: built.scope,
          items: built.items,
          currentIndex: 0,
          startedAt: at,
          completedAt: null,
          status: 'active',
          answers: {},
          label: options.label ?? built.label,
          ...(options.mockProfile ? { mockProfile: options.mockProfile } : {}),
        },
        lastActivity: {
          at,
          resourceId: built.items[0]?.resourceId ?? null,
          objectiveId: built.items[0]?.objectiveId ?? null,
          mode: built.scope.mode,
          itemIndex: 0,
        },
      },
      { immediate: true },
    );
    return sessionId;
  };

  goToItem = (index: number) => {
    const session = this.state.activeSession;
    if (!session) return;
    const bounded = Math.max(0, Math.min(index, session.items.length - 1));
    const item = session.items[bounded];
    // Guardado inmediato: una recarga justo después de avanzar debe continuar en la misma
    // posición útil (contrato §15).
    this.commit(
      {
        ...this.state,
        activeSession: { ...session, currentIndex: bounded },
        lastActivity: {
          at: nowIso(),
          resourceId: item?.resourceId ?? null,
          objectiveId: item?.objectiveId ?? null,
          mode: session.mode,
          itemIndex: bounded,
        },
      },
      { immediate: true },
    );
  };

  nextItem = () => {
    const session = this.state.activeSession;
    if (!session) return;
    if (session.currentIndex >= session.items.length - 1) {
      this.completeSession();
      return;
    }
    this.goToItem(session.currentIndex + 1);
  };

  completeSession = () => {
    const session = this.state.activeSession;
    if (!session) return;
    const at = nowIso();
    this.commit(
      {
        ...this.state,
        activeSession: { ...session, status: 'completed', completedAt: at },
        sessions: [
          ...this.state.sessions,
          {
            sessionId: session.sessionId,
            mode: session.mode,
            label: session.label,
            startedAt: session.startedAt,
            completedAt: at,
            itemCount: session.items.length,
            answeredCount: Object.keys(session.answers).length,
            objectiveIds: Array.from(new Set(session.items.map((i) => i.objectiveId))),
            timeBudget: session.scope.timeBudget,
          },
        ].slice(-40),
      },
      { immediate: true },
    );
  };

  abandonSession = () => {
    const session = this.state.activeSession;
    if (!session) return;
    this.commit(
      { ...this.state, activeSession: { ...session, status: 'abandoned' } },
      { immediate: true },
    );
  };

  clearSession = () => {
    if (!this.state.activeSession) return;
    this.commit({ ...this.state, activeSession: null }, { immediate: true });
  };

  private setAnswer(index: number, answer: SessionAnswer, state: ProgressState): ProgressState {
    const session = state.activeSession;
    if (!session) return state;
    return {
      ...state,
      activeSession: { ...session, answers: { ...session.answers, [index]: answer } },
    };
  }

  private currentSessionId(): string {
    return this.state.activeSession?.sessionId ?? 'sin-sesion';
  }

  // ---------------------------------------------------------------- práctica

  answerQuestion = (questionId: string, optionId: string, itemIndex?: number) => {
    const resource = requireResource(questionId);
    if (resource.type !== 'question') return;
    const at = nowIso();
    const sessionId = this.currentSessionId();
    const correct = resource.correctOptionId === optionId;

    let next: ProgressState = {
      ...this.state,
      questions: {
        ...this.state.questions,
        [questionId]: [
          ...(this.state.questions[questionId] ?? []),
          { at, chosenOptionId: optionId, correct, sessionId },
        ].slice(-20),
      },
    };

    next = withObjective(next, resource.learningObjectiveId, (progress) => ({
      ...progress,
      recalls: [...progress.recalls, { at, correct, sessionId, via: 'question' as const }].slice(-40),
      lastSeenAt: at,
    }));

    next = updateQuizScore(next, resource.learningObjectiveId, sessionId, at);

    if (correct) {
      next = { ...next, errors: registerCorrection(next.errors, questionId, at) };
    } else {
      const kind =
        resource.questionType === 'application' ||
        resource.questionType === 'situational' ||
        resource.questionType === 'case'
          ? 'application-gap'
          : 'knowledge-gap';
      next = {
        ...next,
        errors: upsertError(next.errors, {
          kind,
          resource,
          lastResponse: resource.options.find((o) => o.id === optionId)?.text,
          explanation: resource.explanation,
          now: at,
        }),
      };
    }

    if (typeof itemIndex === 'number') {
      next = this.setAnswer(
        itemIndex,
        { kind: 'question', chosenOptionId: optionId, correct, revealed: true },
        next,
      );
    }

    next = {
      ...next,
      lastActivity: {
        at,
        resourceId: questionId,
        objectiveId: resource.learningObjectiveId,
        mode: next.activeSession?.mode ?? null,
        itemIndex: itemIndex ?? null,
      },
    };

    this.commit(next);
  };

  rateFlashcard = (flashcardId: string, rating: FlashcardRating, itemIndex?: number) => {
    const resource = requireResource(flashcardId);
    if (resource.type !== 'flashcard') return;
    const at = nowIso();
    const sessionId = this.currentSessionId();

    let next: ProgressState = {
      ...this.state,
      flashcards: {
        ...this.state.flashcards,
        [flashcardId]: [...(this.state.flashcards[flashcardId] ?? []), { at, rating, sessionId }].slice(
          -20,
        ),
      },
    };

    next = withObjective(next, resource.learningObjectiveId, (progress) => ({
      ...progress,
      recalls: [
        ...progress.recalls,
        { at, correct: rating === 'known', sessionId, via: 'flashcard' as const },
      ].slice(-40),
      lastSeenAt: at,
    }));

    if (rating === 'known') {
      next = { ...next, errors: registerCorrection(next.errors, flashcardId, at) };
    } else {
      next = {
        ...next,
        errors: upsertError(next.errors, {
          kind: 'recall-gap',
          resource,
          lastResponse: rating === 'unknown' ? 'No la sabía' : 'Dudé',
          now: at,
        }),
      };
    }

    if (typeof itemIndex === 'number') {
      next = this.setAnswer(itemIndex, { kind: 'flashcard', rating }, next);
    }

    next = {
      ...next,
      lastActivity: {
        at,
        resourceId: flashcardId,
        objectiveId: resource.learningObjectiveId,
        mode: next.activeSession?.mode ?? null,
        itemIndex: itemIndex ?? null,
      },
    };

    this.commit(next);
  };

  /** Registra el intento de una respuesta de entrevista: preparación, no calidad personal. */
  recordInterviewAttempt = (
    promptId: string,
    input: { selfRating: SelfRating; coveredKeyPointIds: string[]; usedModelAnswer: boolean },
    itemIndex?: number,
  ) => {
    const resource = requireResource(promptId);
    if (resource.type !== 'interview-prompt') return;
    const at = nowIso();
    const sessionId = this.currentSessionId();

    let next: ProgressState = {
      ...this.state,
      interview: {
        ...this.state.interview,
        [promptId]: [
          ...(this.state.interview[promptId] ?? []),
          {
            at,
            selfRating: input.selfRating,
            coveredKeyPointIds: input.coveredKeyPointIds,
            sessionId,
            usedModelAnswer: input.usedModelAnswer,
          },
        ].slice(-20),
      },
    };

    next = withObjective(next, resource.learningObjectiveId, (progress) => ({
      ...progress,
      recalls: [
        ...progress.recalls,
        { at, correct: input.selfRating === 'good', sessionId, via: 'prompt' as const },
      ].slice(-40),
      lastSeenAt: at,
      // Practicar una respuesta oral cuenta como haber trabajado el objetivo.
      lessonStudiedAt: progress.lessonStudiedAt ?? at,
    }));

    const essential = resource.keyPoints.filter((k) => k.essential);
    const coveredEssential = essential.filter((k) => input.coveredKeyPointIds.includes(k.id)).length;
    const majorityCovered = essential.length === 0 ? true : coveredEssential * 2 > essential.length;

    if (input.selfRating === 'good' && majorityCovered) {
      next = { ...next, errors: registerCorrection(next.errors, promptId, at) };
    } else {
      if (input.selfRating !== 'good') {
        next = {
          ...next,
          errors: upsertError(next.errors, {
            kind: 'interview-expression-gap',
            resource,
            lastResponse:
              input.selfRating === 'blank' ? 'Me quedé en blanco' : 'Respuesta parcial',
            explanation: resource.ideaThatMustLand,
            now: at,
          }),
        };
      }
      if (!majorityCovered) {
        next = {
          ...next,
          errors: upsertError(next.errors, {
            kind: 'interview-content-gap',
            resource,
            lastResponse: `Cubriste ${coveredEssential} de ${essential.length} puntos esenciales`,
            explanation: resource.ideaThatMustLand,
            now: at,
          }),
        };
      }
    }

    if (typeof itemIndex === 'number') {
      next = this.setAnswer(
        itemIndex,
        {
          kind: 'interview',
          attempted: true,
          selfRating: input.selfRating,
          coveredKeyPointIds: input.coveredKeyPointIds,
          usedModelAnswer: input.usedModelAnswer,
        },
        next,
      );
    }

    next = {
      ...next,
      lastActivity: {
        at,
        resourceId: promptId,
        objectiveId: resource.learningObjectiveId,
        mode: next.activeSession?.mode ?? null,
        itemIndex: itemIndex ?? null,
      },
    };

    this.commit(next);
  };

  markLessonStudied = (lessonId: string, itemIndex?: number) => {
    const resource = requireResource(lessonId);
    if (resource.type !== 'lesson') return;
    const at = nowIso();
    let next = withObjective(this.state, resource.learningObjectiveId, (progress) => ({
      ...progress,
      lessonStudiedAt: progress.lessonStudiedAt ?? at,
      lastSeenAt: at,
    }));
    if (typeof itemIndex === 'number') {
      next = this.setAnswer(itemIndex, { kind: 'lesson', studied: true }, next);
    }
    next = {
      ...next,
      lastActivity: {
        at,
        resourceId: lessonId,
        objectiveId: resource.learningObjectiveId,
        mode: next.activeSession?.mode ?? null,
        itemIndex: itemIndex ?? null,
      },
    };
    this.commit(next);
  };

  recordCaseStep = (
    caseId: string,
    elementsChecked: Record<string, string[]>,
    options: { expectedTotal: number; itemIndex?: number; completed?: boolean } = {
      expectedTotal: 0,
    },
  ) => {
    const resource = requireResource(caseId);
    if (resource.type !== 'case') return;
    const at = nowIso();
    let next: ProgressState = {
      ...this.state,
      cases: {
        ...this.state.cases,
        [caseId]: [...(this.state.cases[caseId] ?? []), { at, elementsChecked }].slice(-10),
      },
    };

    const identified = Object.values(elementsChecked).reduce((total, list) => total + list.length, 0);
    if (options.completed && options.expectedTotal > 0 && identified * 2 <= options.expectedTotal) {
      next = {
        ...next,
        errors: upsertError(next.errors, {
          kind: 'application-gap',
          resource,
          lastResponse: `Identificaste ${identified} de ${options.expectedTotal} elementos`,
          explanation: resource.preliminaryConclusion,
          now: at,
        }),
      };
    } else if (options.completed) {
      next = { ...next, errors: registerCorrection(next.errors, caseId, at) };
    }

    if (typeof options.itemIndex === 'number') {
      next = this.setAnswer(
        options.itemIndex,
        { kind: 'case', elementsChecked, completed: Boolean(options.completed) },
        next,
      );
    }

    next = {
      ...next,
      lastActivity: {
        at,
        resourceId: caseId,
        objectiveId: resource.learningObjectiveId,
        mode: next.activeSession?.mode ?? null,
        itemIndex: options.itemIndex ?? null,
      },
    };
    this.commit(next);
  };

  toggleChecklistItem = (checklistId: string, itemId: string, itemIndex?: number) => {
    const current = this.state.checklists[checklistId] ?? [];
    const checked = current.includes(itemId)
      ? current.filter((id) => id !== itemId)
      : [...current, itemId];
    let next: ProgressState = {
      ...this.state,
      checklists: { ...this.state.checklists, [checklistId]: checked },
    };
    if (typeof itemIndex === 'number') {
      next = this.setAnswer(itemIndex, { kind: 'checklist', checkedItemIds: checked }, next);
    }
    this.commit(next);
  };

  recordMockResult = (result: ProgressState['mocks'][number]) => {
    this.commit(
      { ...this.state, mocks: [...this.state.mocks, result].slice(-20) },
      { immediate: true },
    );
  };

  resetAll = () => {
    const fresh = resetProgress();
    this.state = fresh;
    saveProgressNow(fresh);
    for (const listener of this.listeners) listener();
  };

  /** Solo para pruebas: reemplaza el estado sin tocar almacenamiento. */
  __setStateForTests = (state: ProgressState) => {
    this.state = state;
    for (const listener of this.listeners) listener();
  };
}

export function createTestStore(overrides: Partial<ProgressState> = {}): ProgressStore {
  const base = createEmptyProgress(new Date('2026-09-20T09:00:00.000Z').toISOString(), CONTENT_VERSION);
  return new ProgressStore({ ...base, ...overrides });
}
