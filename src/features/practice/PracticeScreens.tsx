import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { useProgress, useStore } from '@/state/StoreProvider';
import { buildSession } from '@/domain/sessionBuilder';
import { FLASHCARDS, QUESTIONS } from '@/content';
import { lastRating } from '@/domain/flashcardScheduler';
import { activeErrors } from '@/domain/errors';
import { penalQuizBlueprint } from '@/domain/blueprints';
import type { SessionMode } from '@/domain/types';

export function PracticeHubScreen() {
  const progress = useProgress();
  const store = useStore();
  const navigate = useNavigate();

  const level1Questions = QUESTIONS.filter((q) => q.level === 1).length;
  const blueprint = useMemo(
    () => penalQuizBlueprint({ questionCount: Math.min(8, level1Questions) }),
    [level1Questions],
  );
  const errors = activeErrors(progress).filter((e) => e.level === 1);
  const doubts = FLASHCARDS.filter((card) => lastRating(progress, card.id) === 'doubt');

  function start(mode: SessionMode, label?: string) {
    const built = buildSession({
      state: progress,
      mode,
      timeBudget: progress.preferences.lastTimeBudget,
    });
    if (built.items.length === 0) return;
    store.startSession(built, label ? { label } : {});
    navigate('/sesion');
  }

  return (
    <div className="stack-8">
      <header className="stack-3">
        <p className="eyebrow">Recuperación activa</p>
        <h1>Práctica</h1>
        <p className="reading">
          Pocas preguntas, feedback útil y repetición de lo que falló. Nunca treinta preguntas
          seguidas.
        </p>
      </header>

      <div className="grid-2">
        <Card className="stack-3">
          <div className="stack-2">
            <p className="eyebrow">Quiz Penal Nivel 1</p>
            <h2>Comprender y distinguir</h2>
            <p className="caption">
              {blueprint.questionCount} preguntas repartidas entre fundamento, distinción y
              aplicación, solo de Nivel 1. Ni las opciones ni el feedback introducen Nivel 2 o 3.
            </p>
          </div>
          <Button variant="primary" onClick={() => start('penal-quiz')}>
            Empezar quiz · <Minutes value={10} />
          </Button>
        </Card>

        <Card className="stack-3">
          <div className="stack-2">
            <p className="eyebrow">Flashcards</p>
            <h2>Recordar definiciones</h2>
            <p className="caption">
              Pregunta, piensa, muestra la respuesta y marca si la sabías. Sin rachas ni premios.
            </p>
          </div>
          <div className="row">
            <LinkButton to="/flashcards" variant="primary">
              Abrir flashcards
            </LinkButton>
            {doubts.length > 0 ? <Badge tone="warning">{doubts.length} dudas</Badge> : null}
          </div>
        </Card>

        <Card className="stack-3">
          <div className="stack-2">
            <p className="eyebrow">Entrevista</p>
            <h2>Preguntas difíciles</h2>
            <p className="caption">
              Las personales que pueden afectar la candidatura: litigio, salida del empleo actual,
              debilidad, salario y contratos temporales.
            </p>
          </div>
          <LinkButton to="/entrevista/dificiles" variant="primary">
            Practicar difíciles
          </LinkButton>
        </Card>

        <Card className="stack-3">
          <div className="stack-2">
            <p className="eyebrow">Repaso mixto</p>
            <h2>Errores, dudas y esencial</h2>
            <p className="caption">
              Mezcla lo que ya estudiaste con tus errores y dudas, siempre dentro del nivel que
              estás trabajando.
            </p>
          </div>
          <div className="row">
            <Button variant="primary" onClick={() => start('mixed-review')}>
              Repaso mixto
            </Button>
            {errors.length > 0 ? <Badge tone="warning">{errors.length} errores</Badge> : null}
          </div>
        </Card>
      </div>

      <Notice>
        El total del banco no es una deuda: el progreso se mide por objetivos cubiertos, no por
        preguntas respondidas.
      </Notice>
    </div>
  );
}

export function FlashcardsScreen() {
  const progress = useProgress();
  const store = useStore();
  const navigate = useNavigate();

  const session = progress.activeSession;
  const alreadyRunning = session?.status === 'active' && session.mode === 'flashcards';

  function start() {
    const built = buildSession({
      state: progress,
      mode: 'flashcards',
      timeBudget: progress.preferences.lastTimeBudget,
    });
    if (built.items.length === 0) return;
    store.startSession(built);
    navigate('/sesion');
  }

  const stats = FLASHCARDS.filter((card) => card.level === 1).reduce(
    (acc, card) => {
      const rating = lastRating(progress, card.id);
      acc[rating] = (acc[rating] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="stack-6">
      <header className="stack-3">
        <p className="eyebrow">Recuperación</p>
        <h1>Flashcards</h1>
        <p className="reading">
          Nivel 1 de Penal: definiciones que conviene poder decir sin mirar. Lo que marcas como «No
          la sabía» vuelve a aparecer.
        </p>
      </header>

      <Card variant="quiet" className="stack-2">
        <p className="mono caption">
          {stats.new ?? 0} nuevas · {stats.doubt ?? 0} con duda · {stats.unknown ?? 0} falladas ·{' '}
          {stats.known ?? 0} sabidas
        </p>
      </Card>

      {alreadyRunning ? (
        <div className="row">
          <LinkButton to="/sesion" variant="primary">
            Continuar tanda
          </LinkButton>
        </div>
      ) : (
        <Button variant="primary" onClick={start}>
          Empezar tanda
        </Button>
      )}

      <section className="stack-3">
        <SectionHeading eyebrow="Tarjetas" title="Todas las de Nivel 1" />
        <ul className="item-list">
          {FLASHCARDS.filter((card) => card.level === 1).map((card) => {
            const rating = lastRating(progress, card.id);
            const tone =
              rating === 'known'
                ? 'success'
                : rating === 'unknown'
                  ? 'error'
                  : rating === 'doubt'
                    ? 'warning'
                    : 'quiet';
            return (
              <li key={card.id} className="item-row">
                <span>
                  <span className="item-row__title">{card.front}</span>
                  <span className="item-row__meta">{card.topic}</span>
                </span>
                <Badge tone={tone}>
                  {rating === 'new'
                    ? 'Sin ver'
                    : rating === 'known'
                      ? 'La sabía'
                      : rating === 'doubt'
                        ? 'Dudé'
                        : 'No la sabía'}
                </Badge>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

export function QuestionDetailScreen() {
  return (
    <EmptyState
      title="Las preguntas se practican dentro de una sesión"
      description="Así el feedback y el repaso mantienen el mismo scope que el estudio."
      action={
        <Link className="btn btn--primary" to="/practica">
          Ir a Práctica
        </Link>
      }
    />
  );
}
