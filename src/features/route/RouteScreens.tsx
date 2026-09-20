import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Badge,
  Card,
  EmptyState,
  LinkButton,
  Notice,
  SectionHeading,
  SourceNote,
} from '@/components/primitives';
import { useProgress } from '@/state/StoreProvider';
import { getObjective } from '@/content/objectives';
import { resourcesForObjective } from '@/content';
import { buildCoverageMatrix } from '@/content/coverage';
import { MASTERY_LABEL } from '@/domain/mastery';
import { objectiveStatuses } from '@/domain/readiness';
import type { Level, Track } from '@/domain/types';

const TRACK_LABEL: Record<Track, string> = {
  interview: 'Entrevista',
  penal: 'Penal',
  'cross-track': 'Cross-track',
};

const LEVEL_LABEL: Record<string, string> = {
  '1': 'Nivel 1 · Imprescindible',
  '2': 'Nivel 2 · Muy conveniente',
  '3': 'Nivel 3 · Profundización',
  reference: 'Referencia · Consulta',
};

export function RouteScreen() {
  const progress = useProgress();
  const [track, setTrack] = useState<Track | 'all'>('all');
  const [level, setLevel] = useState<Level | 'all'>(1);

  const statuses = useMemo(() => objectiveStatuses(progress), [progress]);

  const filtered = statuses.filter((status) => {
    if (track !== 'all' && status.objective.track !== track) return false;
    if (level !== 'all' && status.objective.level !== level) return false;
    return true;
  });

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const status of filtered) {
      const key = String(status.objective.level);
      map.set(key, [...(map.get(key) ?? []), status]);
    }
    for (const [key, list] of map) {
      map.set(
        key,
        [...list].sort(
          (a, b) => a.objective.track.localeCompare(b.objective.track) || a.objective.order - b.objective.order,
        ),
      );
    }
    return map;
  }, [filtered]);

  return (
    <div className="stack-8">
      <header className="stack-3">
        <p className="eyebrow">Corpus disponible</p>
        <h1>Ruta de estudio</h1>
        <p className="reading">
          La ruta recomendada es Nivel 1. El resto está disponible y no es una deuda: aparece aquí
          para cuando quieras profundizar.
        </p>
      </header>

      <div className="stack-3">
        <div className="row">
          <span className="label">Frente</span>
          <div className="segmented" role="group" aria-label="Filtrar por frente">
            {(['all', 'interview', 'penal', 'cross-track'] as const).map((value) => (
              <button
                key={value}
                type="button"
                className="segmented__option"
                aria-pressed={track === value}
                onClick={() => setTrack(value)}
              >
                {value === 'all' ? 'Todos' : TRACK_LABEL[value]}
              </button>
            ))}
          </div>
        </div>
        <div className="row">
          <span className="label">Nivel</span>
          <div className="segmented" role="group" aria-label="Filtrar por nivel">
            {([1, 2, 3, 'reference', 'all'] as const).map((value) => (
              <button
                key={String(value)}
                type="button"
                className="segmented__option"
                aria-pressed={level === value}
                onClick={() => setLevel(value as Level | 'all')}
              >
                {value === 'all'
                  ? 'Todos'
                  : value === 'reference'
                    ? 'Referencia'
                    : `Nivel ${value}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {[...grouped.entries()].map(([levelKey, list]) => (
        <section className="stack-4" key={levelKey}>
          <SectionHeading
            eyebrow={LEVEL_LABEL[levelKey] ?? levelKey}
            title={`${list.length} objetivos`}
          />
          <ul className="item-list">
            {list.map((status) => {
              const tone =
                status.mastery === 'mastered'
                  ? 'success'
                  : status.mastery === 'needs-review'
                    ? 'warning'
                    : 'quiet';
              return (
                <li key={status.objective.id}>
                  <Link className="item-row" to={`/ruta/${status.objective.id}`}>
                    <span>
                      <span className="item-row__title">{status.objective.title}</span>
                      <span className="item-row__meta">
                        {TRACK_LABEL[status.objective.track]} · {status.objective.sourceSummary} ·{' '}
                        {status.objective.estimatedMinutes} min
                      </span>
                    </span>
                    <Badge tone={tone}>{MASTERY_LABEL[status.mastery]}</Badge>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {filtered.length === 0 ? (
        <EmptyState title="No hay objetivos con ese filtro" />
      ) : null}

      <Notice>
        Los objetivos de Nivel 3 y de Referencia no reducen tu preparación esencial ni se usan como
        denominador.
      </Notice>
    </div>
  );
}

export function ObjectiveDetailScreen() {
  const { objectiveId } = useParams();
  const progress = useProgress();
  const objective = objectiveId ? getObjective(objectiveId) : undefined;

  const coverage = useMemo(
    () => buildCoverageMatrix().find((row) => row.objective.id === objectiveId),
    [objectiveId],
  );

  if (!objective || !coverage) {
    return (
      <EmptyState
        title="Ese objetivo no existe"
        action={<LinkButton to="/ruta" variant="primary">Volver a la ruta</LinkButton>}
      />
    );
  }

  const status = objectiveStatuses(progress, [objective])[0];
  const resources = resourcesForObjective(objective.id);

  return (
    <div className="stack-6">
      <Link className="btn btn--tertiary" to="/ruta">
        ← Ruta de estudio
      </Link>

      <header className="stack-3">
        <div className="row">
          <Badge tone="quiet">{TRACK_LABEL[objective.track]}</Badge>
          <Badge tone={objective.level === 1 ? 'critical' : 'quiet'}>
            {LEVEL_LABEL[String(objective.level)]}
          </Badge>
          <Badge tone={status.mastery === 'mastered' ? 'success' : 'quiet'}>
            {MASTERY_LABEL[status.mastery]}
          </Badge>
        </div>
        <h1>{objective.title}</h1>
        <p className="caption mono">
          {objective.id} · {objective.sourceSummary} · {objective.practiceMode} ·{' '}
          {objective.estimatedMinutes} min
        </p>
      </header>

      <Card className="stack-3">
        <p className="eyebrow">Matriz de cobertura</p>
        <ul className="stack-2">
          <li className="caption">Lecciones: {coverage.lessons.length || '—'}</li>
          <li className="caption">Flashcards: {coverage.flashcards.length || '—'}</li>
          <li className="caption">Preguntas: {coverage.questions.length || '—'}</li>
          <li className="caption">Prompts orales: {coverage.prompts.length || '—'}</li>
          <li className="caption">Casos: {coverage.cases.length || '—'}</li>
        </ul>
      </Card>

      <section className="stack-3">
        <SectionHeading eyebrow="Recursos" title="Todo lo que cubre este objetivo" />
        <ul className="item-list">
          {resources.map((resource) => {
            const href =
              resource.type === 'interview-prompt'
                ? `/entrevista/prompt/${resource.id}`
                : resource.type === 'lesson'
                  ? `/penal/leccion/${resource.id}`
                  : resource.type === 'case'
                    ? `/casos/${resource.id}`
                    : resource.type === 'star-story'
                      ? `/entrevista/star/${resource.id}`
                      : null;
            const body = (
              <>
                <span>
                  <span className="item-row__title">
                    {resource.type === 'interview-prompt' ? resource.prompt : resource.title}
                  </span>
                  <span className="item-row__meta">
                    {resource.type} · {resource.estimatedMinutes} min
                  </span>
                </span>
                <Badge tone="quiet">{resource.reviewStatus}</Badge>
              </>
            );
            return (
              <li key={resource.id}>
                {href ? (
                  <Link className="item-row" to={href}>
                    {body}
                  </Link>
                ) : (
                  <div className="item-row">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <SourceNote source={objective.source} />
    </div>
  );
}
