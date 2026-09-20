import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FocusShell } from '@/app/AppShell';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  LinkButton,
  ProgressBar,
  SectionHeading,
} from '@/components/primitives';
import {
  CaseView,
  ChecklistView,
  FlashcardView,
  InterviewPromptView,
  LessonView,
  QuestionView,
} from '@/components/practice';
import { useProgress, useStore } from '@/state/StoreProvider';
import { getResource } from '@/content';
import { getObjective } from '@/content/objectives';
import type { CaseResource, ChecklistResource } from '@/domain/types';

export function SessionScreen() {
  const progress = useProgress();
  const store = useStore();
  const navigate = useNavigate();
  const [confirmExit, setConfirmExit] = useState(false);

  const session = progress.activeSession;

  useEffect(() => {
    if (session?.status !== 'active') return;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [session?.currentIndex, session?.status]);

  if (!session) {
    return (
      <div className="stack-6">
        <EmptyState
          title="No hay una sesión abierta"
          description="Empieza desde Inicio con el plan recomendado o con la actividad sugerida."
          action={<LinkButton to="/" variant="primary">Volver a Inicio</LinkButton>}
        />
      </div>
    );
  }

  const answeredCount = Object.keys(session.answers).length;
  const isCompleted = session.status !== 'active' || session.currentIndex >= session.items.length;

  if (isCompleted) {
    return <SessionResult />;
  }

  const item = session.items[session.currentIndex];
  const resource = item ? getResource(item.resourceId) : undefined;
  const objective = item ? getObjective(item.objectiveId) : undefined;
  const answer = session.answers[session.currentIndex];
  const presentationMode = session.presentationMode ?? 'practice';

  function exit() {
    if (answeredCount > 0 && !confirmExit) {
      setConfirmExit(true);
      return;
    }
    store.abandonSession();
    navigate('/');
  }

  function advance() {
    store.nextItem();
  }

  return (
    <FocusShell
      onExit={exit}
      context={`${session.label} · Modo ${presentationMode === 'study' ? 'estudio' : 'práctica'} · ${objective?.title ?? ''}`}
      progressLabel={`${session.currentIndex + 1} de ${session.items.length}`}
      progressNode={
        <div style={{ paddingBottom: 'var(--space-6)' }}>
          <ProgressBar
            value={session.currentIndex}
            max={session.items.length}
            label={`Progreso de la sesión: ${session.currentIndex + 1} de ${session.items.length}`}
          />
        </div>
      }
    >
      {confirmExit ? (
        <Card variant="quiet" className="stack-3" style={{ marginBottom: 'var(--space-6)' }}>
          <p>
            Si sales ahora, la sesión queda marcada como interrumpida. Tu progreso en las respuestas
            ya guardadas se conserva.
          </p>
          <div className="row">
            <Button variant="primary" onClick={exit}>
              Salir de todos modos
            </Button>
            <Button onClick={() => setConfirmExit(false)}>Seguir practicando</Button>
          </div>
        </Card>
      ) : null}

      {session.scope.activeTrack === 'interview' ? (
        <div className="row" style={{ marginBottom: 'var(--space-4)' }}>
          <Badge tone="quiet">Modo {presentationMode === 'study' ? 'estudio' : 'práctica'}</Badge>
          <Button onClick={() => store.setSessionPresentationMode(presentationMode === 'study' ? 'practice' : 'study')}>
            Cambiar a {presentationMode === 'study' ? 'práctica' : 'estudio'}
          </Button>
          {session.currentIndex > 0 ? <Button onClick={() => store.goToItem(session.currentIndex - 1)}>← Anterior</Button> : null}
          <span className="caption">{session.currentIndex + 1} de {session.items.length}</span>
          {presentationMode === 'study' ? <Button variant="primary" onClick={() => { store.markInterviewStudied(resource?.id ?? '', session.currentIndex); advance(); }}>Siguiente →</Button> : null}
        </div>
      ) : null}

      {!resource ? (
        <EmptyState
          title="Esta actividad no está disponible"
          description="El recurso no está verificado o cambió de versión."
          action={<Button onClick={advance}>Continuar</Button>}
        />
      ) : resource.type === 'question' ? (
        <QuestionView
          question={resource}
          initialChosen={answer?.kind === 'question' ? answer.chosenOptionId : undefined}
          onAnswer={(optionId) =>
            store.answerQuestion(resource.id, optionId, session.currentIndex)
          }
          onContinue={advance}
          continueLabel={
            session.currentIndex === session.items.length - 1 ? 'Terminar sesión' : 'Siguiente'
          }
        />
      ) : resource.type === 'flashcard' ? (
        <FlashcardView
          card={resource}
          onRate={(rating) => {
            store.rateFlashcard(resource.id, rating, session.currentIndex);
            advance();
          }}
        />
      ) : resource.type === 'interview-prompt' ? (
        <InterviewPromptView
          prompt={resource}
          presentationMode={presentationMode}
          onSave={(input) => {
            store.recordInterviewAttempt(resource.id, input, session.currentIndex);
            advance();
          }}
          saveLabel={
            session.currentIndex === session.items.length - 1
              ? 'Guardar y terminar'
              : 'Guardar y continuar'
          }
        />
      ) : resource.type === 'lesson' ? (
        <LessonView
          lesson={resource}
          onStudied={() => {
            store.markLessonStudied(resource.id, session.currentIndex);
            advance();
          }}
          continueLabel="Marcar como estudiada y continuar"
        />
      ) : resource.type === 'case' ? (
        <SessionCase caseResource={resource} itemIndex={session.currentIndex} onDone={advance} />
      ) : resource.type === 'checklist' ? (
        <SessionChecklist
          checklist={resource}
          itemIndex={session.currentIndex}
          onDone={advance}
          isLast={session.currentIndex === session.items.length - 1}
        />
      ) : (
        <EmptyState title="Actividad no soportada" action={<Button onClick={advance}>Continuar</Button>} />
      )}

      {session.scope.activeTrack === 'interview' && presentationMode === 'study' ? (
        <nav className="session-nav" aria-label="Navegación de preguntas">
          <Button onClick={() => store.goToItem(session.currentIndex - 1)} disabled={session.currentIndex === 0}>
            ← Anterior
          </Button>
          <span className="caption">{session.currentIndex + 1} de {session.items.length}</span>
          <Button variant="primary" onClick={() => { store.markInterviewStudied(resource?.id ?? '', session.currentIndex); advance(); }}>
            {session.currentIndex === session.items.length - 1 ? 'Terminar bloque' : 'Siguiente →'}
          </Button>
        </nav>
      ) : null}
    </FocusShell>
  );
}

function SessionCase({
  caseResource,
  itemIndex,
  onDone,
}: {
  caseResource: CaseResource;
  itemIndex: number;
  onDone: () => void;
}) {
  const store = useStore();
  const [checked, setChecked] = useState<Record<string, string[]>>({});
  const expectedTotal = caseResource.steps.reduce(
    (total, step) => total + (step.elementsToConsider?.length ?? 0),
    0,
  );

  return (
    <CaseView
      caseResource={caseResource}
      checked={checked}
      onToggle={(stepId, elementId) =>
        setChecked((current) => {
          const list = current[stepId] ?? [];
          return {
            ...current,
            [stepId]: list.includes(elementId)
              ? list.filter((id) => id !== elementId)
              : [...list, elementId],
          };
        })
      }
      onComplete={() => {
        store.recordCaseStep(caseResource.id, checked, {
          expectedTotal,
          itemIndex,
          completed: true,
        });
        onDone();
      }}
    />
  );
}

function SessionChecklist({
  checklist,
  itemIndex,
  onDone,
  isLast,
}: {
  checklist: ChecklistResource;
  itemIndex: number;
  onDone: () => void;
  isLast: boolean;
}) {
  const store = useStore();
  const progress = useProgress();
  const checkedItemIds = progress.checklists[checklist.id] ?? [];

  return (
    <div className="stack-6">
      <ChecklistView
        checklist={checklist}
        checkedItemIds={checkedItemIds}
        onToggle={(id) => store.toggleChecklistItem(checklist.id, id, itemIndex)}
      />
      <Button variant="primary" onClick={onDone}>
        {isLast ? 'Terminar repaso' : 'Continuar'}
      </Button>
    </div>
  );
}

function SessionResult() {
  const progress = useProgress();
  const store = useStore();
  const navigate = useNavigate();
  const session = progress.activeSession;

  const summary = useMemo(() => {
    if (!session) return null;
    let questions = 0;
    let correct = 0;
    let prompts = 0;
    let good = 0;
    let partial = 0;
    let blank = 0;
    let keyPointsCovered = 0;
    let keyPointsPossible = 0;
    let caseIdentified = 0;
    let caseExpected = 0;

    for (const [index, answer] of Object.entries(session.answers)) {
      const item = session.items[Number(index)];
      const resource = item ? getResource(item.resourceId) : undefined;
      if (!resource) continue;
      if (answer.kind === 'question') {
        questions += 1;
        if (answer.correct) correct += 1;
      }
      if (answer.kind === 'interview' && resource.type === 'interview-prompt') {
        prompts += 1;
        if (answer.selfRating === 'good') good += 1;
        if (answer.selfRating === 'partial') partial += 1;
        if (answer.selfRating === 'blank') blank += 1;
        keyPointsCovered += answer.coveredKeyPointIds.length;
        keyPointsPossible += resource.keyPoints.length;
      }
      if (answer.kind === 'case' && resource.type === 'case') {
        caseIdentified += Object.values(answer.elementsChecked).reduce(
          (total, list) => total + list.length,
          0,
        );
        caseExpected += resource.steps.reduce(
          (total, step) => total + (step.elementsToConsider?.length ?? 0),
          0,
        );
      }
    }

    return {
      questions,
      correct,
      prompts,
      good,
      partial,
      blank,
      keyPointsCovered,
      keyPointsPossible,
      caseIdentified,
      caseExpected,
    };
  }, [session]);

  if (!session || !summary) {
    return (
      <EmptyState
        title="Sesión terminada"
        action={<LinkButton to="/" variant="primary">Volver a Inicio</LinkButton>}
      />
    );
  }

  const isMock = session.mode === 'mock-quick' || session.mode === 'mock-standard';

  return (
    <div className="stack-8">
      <div className="stack-3">
        <p className="eyebrow">{session.label}</p>
        <h1>Resultado de la sesión</h1>
        <p className="caption">
          Los resultados van separados a propósito: el conocimiento objetivo y la preparación de
          entrevista no se mezclan en una sola nota.
        </p>
      </div>

      <div className="result-grid">
        <Card className="stack-3">
          <p className="eyebrow">Conocimiento Penal</p>
          <p className="stat__value">
            {summary.questions > 0
              ? `${Math.round((summary.correct / summary.questions) * 100)}%`
              : '—'}
          </p>
          <p className="stat__label">
            {summary.correct} de {summary.questions} preguntas correctas
          </p>
        </Card>

        <Card className="stack-3">
          <p className="eyebrow">Preparación de entrevista</p>
          <p className="stat__value">
            {summary.keyPointsPossible > 0
              ? `${summary.keyPointsCovered}/${summary.keyPointsPossible}`
              : '—'}
          </p>
          <p className="stat__label">
            puntos clave practicados · {summary.good} bien · {summary.partial} parcial ·{' '}
            {summary.blank} en blanco
          </p>
        </Card>

        {summary.caseExpected > 0 ? (
          <Card className="stack-3">
            <p className="eyebrow">Casos</p>
            <p className="stat__value">
              {summary.caseIdentified}/{summary.caseExpected}
            </p>
            <p className="stat__label">elementos identificados sobre esperados</p>
          </Card>
        ) : null}

        <Card className="stack-3">
          <p className="eyebrow">Errores prioritarios</p>
          <p className="stat__value">
            {progress.errors.filter((e) => e.status !== 'resolved' && e.level === 1).length}
          </p>
          <p className="stat__label">registros activos de Nivel 1</p>
          <LinkButton to="/errores">Ver mis errores</LinkButton>
        </Card>
      </div>

      {isMock ? (
        <Card variant="quiet" className="stack-2">
          <Badge tone="quiet">Indicador de entrenamiento</Badge>
          <p className="caption">
            Un simulacro es un perfil de entrenamiento, no una predicción de lo que preguntará el
            entrevistador, y no certifica competencia profesional.
          </p>
        </Card>
      ) : null}

      <section className="stack-3">
        <SectionHeading eyebrow="Siguiente paso" title="¿Qué quieres hacer ahora?" />
        <div className="row">
          <Button
            variant="primary"
            onClick={() => {
              store.clearSession();
              navigate('/');
            }}
          >
            Volver a Inicio
          </Button>
          <LinkButton to="/errores">Reforzar errores</LinkButton>
          <LinkButton to="/repaso-final">Repaso antes de salir</LinkButton>
        </div>
      </section>
    </div>
  );
}
