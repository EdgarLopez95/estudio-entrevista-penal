import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  LinkButton,
  Minutes,
  Notice,
  SectionHeading,
} from '@/components/primitives';
import { LessonView } from '@/components/practice';
import { useProgress, useStore } from '@/state/StoreProvider';
import { LESSONS, getResource, lessonForObjective, questionsForObjective } from '@/content';
import { LEARNING_OBJECTIVES } from '@/content/objectives';
import { LEGAL_NOTICE } from '@/content/penal/cases';
import { MASTERY_LABEL } from '@/domain/mastery';
import { objectiveStatuses, penalEssentialReadiness } from '@/domain/readiness';
import { buildSession } from '@/domain/sessionBuilder';

export function PenalHubScreen() {
  const progress = useProgress();
  const store = useStore();
  const navigate = useNavigate();

  const level1 = useMemo(
    () =>
      objectiveStatuses(
        progress,
        LEARNING_OBJECTIVES.filter((o) => o.track === 'penal' && o.level === 1).sort(
          (a, b) => a.order - b.order,
        ),
      ),
    [progress],
  );
  const readiness = useMemo(() => penalEssentialReadiness(progress), [progress]);
  const level2 = useMemo(
    () =>
      objectiveStatuses(
        progress,
        LEARNING_OBJECTIVES.filter((o) => o.track === 'penal' && o.level === 2).sort(
          (a, b) => a.order - b.order,
        ),
      ),
    [progress],
  );

  function startEssential() {
    const built = buildSession({
      state: progress,
      mode: 'penal-essential',
      timeBudget: progress.preferences.lastTimeBudget,
    });
    store.startSession(built);
    navigate('/sesion');
  }

  function startQuiz() {
    const built = buildSession({
      state: progress,
      mode: 'penal-quiz',
      timeBudget: progress.preferences.lastTimeBudget,
    });
    store.startSession(built);
    navigate('/sesion');
  }

  return (
    <div className="stack-8">
      <header className="stack-3">
        <p className="eyebrow">Frente B · obligatorio pero secundario</p>
        <h1>Penal esencial</h1>
        <p className="reading">
          Ruta inicial compacta de los conceptos de Nivel 1: comprender, distinguir y aplicar
          brevemente. Los artículos son apoyo, no una meta de memorización.
        </p>
        <div className="row">
          <Button variant="primary" onClick={startEssential}>
            Repasar Penal · <Minutes value={10} />
          </Button>
          <Button onClick={startQuiz}>Quiz Penal Nivel 1</Button>
        </div>
      </header>

      <Card variant="quiet" className="stack-2">
        <p className="eyebrow">Cobertura por objetivo</p>
        <p className="mono">
          {readiness.covered}/{readiness.total} cubiertos · {readiness.mastered} dominados ·{' '}
          {readiness.needsReview} por repasar · {readiness.notEvaluated} no evaluados
        </p>
      </Card>

      <section className="stack-4">
        <SectionHeading eyebrow="Nivel 1 · imprescindible" title="Conceptos esenciales" />
        <ul className="item-list">
          {level1.map((status) => {
            const lesson = lessonForObjective(status.objective.id);
            const questions = questionsForObjective(status.objective.id).length;
            const tone =
              status.mastery === 'mastered'
                ? 'success'
                : status.mastery === 'needs-review'
                  ? 'warning'
                  : 'quiet';
            return (
              <li key={status.objective.id}>
                <Link
                  className="item-row"
                  to={lesson ? `/penal/leccion/${lesson.id}` : `/ruta/${status.objective.id}`}
                >
                  <span>
                    <span className="item-row__title">{status.objective.title}</span>
                    <span className="item-row__meta">
                      {status.objective.sourceSummary} · {status.objective.estimatedMinutes} min
                      {questions > 0 ? ` · ${questions} preguntas` : ' · práctica oral'}
                    </span>
                  </span>
                  <Badge tone={tone}>{MASTERY_LABEL[status.mastery]}</Badge>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {progress.preferences.includeLevel2 ? (
        <section className="stack-4">
          <SectionHeading eyebrow="Nivel 2 · si ya manejas lo esencial" title="Profundizar" />
          <ul className="item-list">
            {level2.map((status) => {
              const lesson = lessonForObjective(status.objective.id);
              return (
                <li key={status.objective.id}>
                  <Link
                    className="item-row"
                    to={lesson ? `/penal/leccion/${lesson.id}` : `/ruta/${status.objective.id}`}
                  >
                    <span>
                      <span className="item-row__title">{status.objective.title}</span>
                      <span className="item-row__meta">{status.objective.sourceSummary}</span>
                    </span>
                    <Badge tone="quiet">{MASTERY_LABEL[status.mastery]}</Badge>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <Notice>
          Nivel 2 y Nivel 3 de Penal siguen disponibles en la Ruta de estudio. No son prioridad
          ahora.
        </Notice>
      )}

      <Card variant="quiet" className="stack-2">
        <Badge tone="quiet">Aviso</Badge>
        <p className="caption">{LEGAL_NOTICE.sourceExcerpt}</p>
      </Card>
    </div>
  );
}

export function LessonDetailScreen() {
  const { lessonId } = useParams();
  const progress = useProgress();
  const store = useStore();
  const navigate = useNavigate();
  const resource = lessonId ? getResource(lessonId) : undefined;

  if (!resource || resource.type !== 'lesson') {
    return (
      <EmptyState
        title="Esa lección no está disponible"
        action={<LinkButton to="/penal" variant="primary">Volver a Penal</LinkButton>}
      />
    );
  }

  const lesson = resource;
  const sibling = LESSONS.filter((l) => l.level === lesson.level && l.track === lesson.track);
  const index = sibling.findIndex((l) => l.id === lesson.id);

  function studyAndPractice() {
    store.markLessonStudied(lesson.id);
    const built = buildSession({
      state: progress,
      mode: 'current-level',
      timeBudget: progress.preferences.lastTimeBudget,
      allowedObjectiveIds: [lesson.learningObjectiveId],
      focusResourceId: lesson.id,
    });
    if (built.items.length > 1) {
      store.startSession(built, { label: 'Practicar lo que acabas de estudiar' });
      navigate('/sesion');
    } else {
      navigate('/penal');
    }
  }

  return (
    <div className="stack-6">
      <div className="row row--between">
        <Link className="btn btn--tertiary" to="/penal">
          ← Penal esencial
        </Link>
        <span className="caption mono">
          {index >= 0 ? `${index + 1} de ${sibling.length}` : ''}
        </span>
      </div>
      <LessonView lesson={lesson} onStudied={studyAndPractice} />
    </div>
  );
}
