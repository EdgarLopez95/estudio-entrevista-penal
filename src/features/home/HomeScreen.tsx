import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  LinkButton,
  Minutes,
  Notice,
  SectionHeading,
  SegmentedMeter,
} from '@/components/primitives';
import { useProgress, useStore } from '@/state/StoreProvider';
import { alternatives, recommend } from '@/domain/recommendation';
import {
  coreReadinessCrossTrack,
  coreReadinessInterview,
  coreReadinessPenal,
  essentialObjectivesCovered,
  penalEssentialReadiness,
  shouldSuggestLevel2,
  top10Readiness,
} from '@/domain/readiness';
import { buildInterviewBlock, buildSession } from '@/domain/sessionBuilder';
import { TIME_BUDGET_OPTIONS, interviewPhase, minutesSince } from '@/domain/time';
import { getResource } from '@/content';
import { getObjective } from '@/content/objectives';
import type { ResourceType, SessionPresentationMode, TimeBudget } from '@/domain/types';

const ACTIVITY_LABEL: Record<ResourceType, string> = {
  lesson: 'Lección',
  flashcard: 'Flashcard',
  question: 'Pregunta',
  'interview-prompt': 'Práctica oral',
  'star-story': 'Historia STAR',
  case: 'Caso',
  checklist: 'Checklist',
};

export function HomeScreen() {
  const progress = useProgress();
  const store = useStore();
  const navigate = useNavigate();
  const [freeAction, setFreeAction] = useState<SessionPresentationMode | null>(null);
  const [freeTrack, setFreeTrack] = useState<'interview' | 'penal' | null>(null);

  const phase = interviewPhase(progress.targetInterview);
  const recommendation = useMemo(() => recommend(progress), [progress]);
  const otherOptions = useMemo(() => alternatives(progress, 3), [progress]);
  const interview = useMemo(() => coreReadinessInterview(progress), [progress]);
  const penal = useMemo(() => coreReadinessPenal(progress), [progress]);
  const cross = useMemo(() => coreReadinessCrossTrack(progress), [progress]);
  const top10 = useMemo(() => top10Readiness(progress), [progress]);
  const penalEssential = useMemo(() => penalEssentialReadiness(progress), [progress]);
  const covered = useMemo(() => essentialObjectivesCovered(progress), [progress]);
  const suggestLevel2 = useMemo(() => shouldSuggestLevel2(progress), [progress]);

  const timeBudget = progress.preferences.lastTimeBudget;
  const plan = useMemo(
    () => buildSession({ state: progress, mode: 'plan-of-day', timeBudget }),
    [progress, timeBudget],
  );

  const isFirstUse =
    Object.keys(progress.objectives).length === 0 &&
    Object.keys(progress.interview).length === 0 &&
    progress.sessions.length === 0;

  const activeSession =
    progress.activeSession && progress.activeSession.status === 'active'
      ? progress.activeSession
      : null;

  const recommendedObjective = recommendation.objectiveId
    ? getObjective(recommendation.objectiveId)
    : undefined;
  const recommendationTrack = recommendedObjective?.track ?? 'interview';

  function startPlan(budget: TimeBudget) {
    store.setTimeBudget(budget);
  }

  function startRecommendation() {
    if (recommendation.kind === 'exit-review') {
      navigate('/repaso-final');
      return;
    }
    if (recommendation.kind === 'all-covered') {
      navigate('/errores');
      return;
    }
    if (!recommendation.resourceId) {
      navigate('/ruta');
      return;
    }
    const resource = getResource(recommendation.resourceId);
    if (!resource) {
      navigate('/ruta');
      return;
    }
    if (resource.type === 'interview-prompt') {
      navigate(`/entrevista/prompt/${resource.id}`);
      return;
    }
    if (resource.type === 'lesson') {
      navigate(`/penal/leccion/${resource.id}`);
      return;
    }
    if (resource.type === 'flashcard') {
      navigate('/flashcards');
      return;
    }
    if (resource.type === 'question') {
      const built = buildSession({
        state: progress,
        mode: 'current-level',
        timeBudget,
        focusResourceId: resource.id,
      });
      store.startSession(built, { label: 'Repasar este error' });
      navigate('/sesion');
      return;
    }
    navigate('/ruta');
  }

  function startPlanSession() {
    const built = buildSession({ state: progress, mode: 'plan-of-day', timeBudget });
    store.startSession(built);
    navigate('/sesion');
  }

  function startInterviewBlock() {
    if (!freeAction) return;
    store.startSession(buildInterviewBlock(progress), { presentationMode: freeAction });
    navigate('/sesion');
  }

  const blockMinutes = activeSession ? minutesSince(activeSession.startedAt) : 0;

  return (
    <div className="stack-8">
      <section className="enter stack-3" aria-labelledby="sesion-libre">
        <SectionHeading eyebrow="Sesión libre" title="¿Qué quieres hacer ahora?" />
        {!freeAction ? (
          <div className="row">
            <Button variant="primary" onClick={() => setFreeAction('study')}>Estudiar</Button>
            <Button onClick={() => setFreeAction('practice')}>Practicar preguntas</Button>
          </div>
        ) : !freeTrack ? (
          <div className="stack-3"><p className="prompt__hint">¿Qué quieres trabajar?</p><div className="row"><Button variant="primary" onClick={() => setFreeTrack('interview')}>Entrevista</Button><Button onClick={() => setFreeTrack('penal')}>Derecho Penal</Button><Button onClick={() => setFreeAction(null)}>Volver</Button></div></div>
        ) : freeTrack === 'interview' ? (
          <div className="stack-3"><p className="prompt__hint">Elige el bloque de entrevista.</p><div className="row"><Button variant="primary" onClick={startInterviewBlock}>Esenciales</Button><Button onClick={() => navigate('/entrevista/top10')}>Top 10</Button><Button onClick={() => navigate('/entrevista/dificiles')}>Preguntas difíciles</Button><Button onClick={() => navigate('/entrevista')}>Historias STAR</Button></div></div>
        ) : (
          <div className="stack-3"><p className="prompt__hint">Elige el bloque de Derecho Penal.</p><div className="row"><Button variant="primary" onClick={() => navigate('/ruta')}>Conceptos</Button><Button onClick={() => navigate('/practica')}>Quiz</Button><Button onClick={() => navigate('/flashcards')}>Flashcards</Button><Button onClick={() => navigate('/casos')}>Casos</Button><Button onClick={() => navigate('/penal')}>Penal esencial</Button></div></div>
        )}
      </section>
      {/* 1. Qué debes estudiar ahora — bloque dominante */}
      <section className="enter" aria-labelledby="recomendacion">
        <Card track={recommendationTrack} variant="emphasis" className="recommend">
          <div className="stack-2">
            <p className="eyebrow" id="recomendacion">
              {phase === 'today'
                ? 'Hoy conviene reforzar lo que ya preparaste'
                : isFirstUse
                  ? 'Tu preparación comienza por lo esencial'
                  : 'Qué debes estudiar ahora'}
            </p>
            <h1 className="recommend__title">
              {isFirstUse && phase !== 'today' ? 'Háblame de ti' : recommendation.title}
            </h1>
            <p className="recommend__reason">
              {isFirstUse && phase !== 'today'
                ? 'Es la primera pregunta de casi cualquier entrevista y la vas a practicar en voz alta.'
                : recommendation.reason}
            </p>
          </div>
          <div className="recommend__actions">
            <Button variant="primary" onClick={startRecommendation}>
              {recommendation.kind === 'exit-review'
                ? 'Abrir repaso antes de salir'
                : isFirstUse
                  ? 'Comenzar preparación'
                  : 'Empezar ahora'}
              {' · '}
              <Minutes value={recommendation.estimatedMinutes} />
            </Button>
            <Link className="btn btn--tertiary" to="/ruta">
              Elegir otra cosa
            </Link>
          </div>
          {otherOptions.length > 0 ? (
            <details className="disclosure">
              <summary>Otras opciones recomendadas</summary>
              <ul className="item-list" style={{ marginTop: 'var(--space-3)' }}>
                {otherOptions.map((option) => (
                  <li key={`${option.kind}-${option.resourceId}`}>
                    <button
                      type="button"
                      className="item-row"
                      onClick={() => {
                        if (!option.resourceId) return;
                        const resource = getResource(option.resourceId);
                        if (!resource) return;
                        if (resource.type === 'interview-prompt')
                          navigate(`/entrevista/prompt/${resource.id}`);
                        else if (resource.type === 'lesson') navigate(`/penal/leccion/${resource.id}`);
                        else navigate('/practica');
                      }}
                    >
                      <span>
                        <span className="item-row__title">{option.title}</span>
                        <span className="item-row__meta">{option.reason}</span>
                      </span>
                      <span className="mono item-row__meta">{option.estimatedMinutes} min</span>
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </Card>
      </section>

      {activeSession ? (
        <section className="enter enter-2">
          <Card variant="quiet" className="row row--between">
            <div>
              <p className="eyebrow">Sesión en curso</p>
              <p style={{ fontWeight: 'var(--weight-medium)' }}>{activeSession.label}</p>
              <p className="caption">
                {activeSession.currentIndex + 1} de {activeSession.items.length}
                {blockMinutes >= 20
                  ? ' · Has completado un bloque largo. Puedes descansar o continuar.'
                  : ''}
              </p>
            </div>
            <LinkButton to="/sesion" variant="primary">
              Continuar
            </LinkButton>
          </Card>
        </section>
      ) : null}

      {covered ? (
        <section className="enter enter-2">
          <Card variant="quiet" className="stack-3">
            <h2>Ya cubriste los objetivos esenciales de esta sesión</h2>
            <p className="caption">
              No es una certificación profesional: es el estado de tu entrenamiento de hoy.
            </p>
            <div className="row">
              <LinkButton to="/errores">Reforzar errores</LinkButton>
              <LinkButton to="/ruta?nivel=2">Profundizar si tienes tiempo</LinkButton>
              <LinkButton to="/progreso">Terminar por ahora</LinkButton>
            </div>
          </Card>
        </section>
      ) : null}

      {/* 2. Preparación esencial + Plan de hoy */}
      <div className="grid-2--wide-left enter enter-2">
        <section className="stack-4" aria-labelledby="preparacion">
          <SectionHeading eyebrow="Preparación esencial" title="Entrevista y Penal" />
          <Card className="stack-6">
            <SegmentedMeter
              name="Entrevista"
              track="interview"
              statuses={interview.statuses}
              counterLabel={`${interview.mastered + interview.learning}/${interview.total} objetivos con evidencia`}
            />
            <SegmentedMeter
              name="Penal"
              track="penal"
              statuses={penal.statuses}
              counterLabel={`${penal.mastered + penal.learning}/${penal.total} objetivos con evidencia`}
            />
            <SegmentedMeter
              name="Cross-track"
              track="cross-track"
              statuses={cross.statuses}
              counterLabel={`${cross.mastered + cross.learning}/${cross.total} objetivos con evidencia`}
            />
            <div className="stack-2">
              <p className="label">Top 10 — Primera entrevista</p>
              <p className="caption mono">
                {top10.practiced}/{top10.total} practicadas · {top10.good} bien ·{' '}
                {top10.toReinforce} por reforzar
              </p>
              <p className="label" style={{ marginTop: 'var(--space-2)' }}>
                Penal esencial
              </p>
              <p className="caption mono">
                {penalEssential.covered}/{penalEssential.total} objetivos cubiertos ·{' '}
                {penalEssential.mastered} dominados · {penalEssential.needsReview} por repasar
              </p>
            </div>
            <div className="chips">
              <Link className="btn btn--secondary" to="/entrevista/top10">
                Top 10
              </Link>
              <Link className="btn btn--secondary" to="/entrevista/dificiles">
                Preguntas difíciles
              </Link>
              <Link className="btn btn--secondary" to="/penal">
                Penal esencial
              </Link>
            </div>
          </Card>
        </section>

        <section className="stack-4" aria-labelledby="plan">
          <SectionHeading eyebrow="Plan de hoy" title="¿Cuánto tiempo tienes ahora?" />
          <Card className="stack-4">
            <div className="time-select" role="group" aria-label="Tiempo disponible">
              {TIME_BUDGET_OPTIONS.map((option) => (
                <button
                  key={String(option.value)}
                  type="button"
                  className="time-select__option"
                  aria-pressed={timeBudget === option.value}
                  onClick={() => startPlan(option.value)}
                >
                  {option.short}
                </button>
              ))}
            </div>

            {plan.items.length === 0 ? (
              <Notice>
                No hay actividades pendientes para este tiempo. Prueba con otro tiempo o revisa tus
                errores.
              </Notice>
            ) : (
              <ol className="plan">
                {plan.items.map((item, index) => {
                  const resource = getResource(item.resourceId);
                  if (!resource) return null;
                  const objective = getObjective(item.objectiveId);
                  return (
                    <li key={item.resourceId} className="plan__item">
                      <span className="plan__index" aria-hidden="true">
                        {index + 1}
                      </span>
                      <span className="plan__label">
                        <strong>{resource.title}</strong>
                        <span className="item-row__meta">
                          {ACTIVITY_LABEL[resource.type]} · {objective?.title ?? resource.topic}
                          {item.reason === 'review-error' ? ' · repaso de error' : ''}
                          {item.reason === 'review-doubt' ? ' · duda pendiente' : ''}
                        </span>
                      </span>
                      <span className="plan__minutes">{resource.estimatedMinutes} min</span>
                    </li>
                  );
                })}
              </ol>
            )}

            <div className="row row--between">
              <p className="caption mono">
                {plan.items.length} actividades · ~{plan.plannedMinutes} min
              </p>
              <Button variant="primary" onClick={startPlanSession} disabled={plan.items.length === 0}>
                Seguir plan recomendado
              </Button>
            </div>
          </Card>
        </section>
      </div>

      {/* 3. Repaso antes de salir y simulacro */}
      <section className="grid-2 enter enter-3" aria-label="Repaso y simulacro">
        <Card variant="quiet" className="stack-3">
          <div className="stack-2">
            <p className="eyebrow">Antes de la entrevista</p>
            <h2>Repaso antes de salir</h2>
            <p className="caption">
              Preguntas difíciles, dos STAR, Penal esencial, errores recientes, salario,
              disponibilidad y tus preguntas al despacho. Sin temas nuevos.
            </p>
          </div>
          <LinkButton to="/repaso-final" variant="primary">
            Abrir repaso · <Minutes value={10} />
          </LinkButton>
        </Card>

        <Card variant="quiet" className="stack-3">
          <div className="stack-2">
            <p className="eyebrow">Entrenamiento</p>
            <h2>Simulacro</h2>
            <p className="caption">
              Quick usa solo Nivel 1: presentación, motivación, experiencia, una difícil o STAR y
              2-3 de Penal esencial. Es entrenamiento, no una predicción del entrevistador.
            </p>
          </div>
          <div className="row">
            <LinkButton to="/simulacro">Ver simulacros</LinkButton>
          </div>
        </Card>
      </section>

      {/* 4. Otros temas */}
      <section className="stack-3" aria-label="Otros temas">
        <SectionHeading eyebrow="Disponible" title="Otros temas" />
        <div className="row">
          <LinkButton to="/ruta">Ver todos los temas</LinkButton>
          <LinkButton to="/casos">Casos</LinkButton>
          <LinkButton to="/referencia">Referencia</LinkButton>
        </div>
        {suggestLevel2 ? (
          <Notice>
            Ya cubriste gran parte de lo esencial. Si tienes tiempo, puedes profundizar con Nivel 2
            desde Preferencias o desde la Ruta de estudio.
          </Notice>
        ) : (
          <p className="caption">
            Nivel 2 y Nivel 3 no son prioridad ahora: siguen disponibles después de Nivel 1.
          </p>
        )}
        <p className="caption">
          <Badge tone="quiet">Local</Badge> Tu progreso se guarda solo en este navegador. Si abres
          la app en el móvil, ese progreso será independiente: no hay sincronización.
        </p>
      </section>
    </div>
  );
}
