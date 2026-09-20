import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Level, Track } from '@/domain/types';
import type { SourceRef } from '@/content/sources/traceability';
import { SOURCE_MANIFEST } from '@/content/sources/traceability';
import type { ObjectiveStatus } from '@/domain/readiness';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';

export function Button({
  variant = 'secondary',
  block,
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; block?: boolean }) {
  return (
    <button
      type="button"
      className={`btn btn--${variant}${block ? ' btn--block' : ''} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  to,
  variant = 'secondary',
  block,
  children,
}: {
  to: string;
  variant?: ButtonVariant;
  block?: boolean;
  children: ReactNode;
}) {
  return (
    <Link className={`btn btn--${variant}${block ? ' btn--block' : ''}`} to={to}>
      {children}
    </Link>
  );
}

export function IconButton({
  label,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button type="button" className="icon-btn" aria-label={label} title={label} {...rest}>
      {children}
    </button>
  );
}

export function Card({
  children,
  variant,
  track,
  className = '',
  as = 'section',
  ...rest
}: {
  children: ReactNode;
  variant?: 'quiet' | 'emphasis' | 'feedback-success' | 'feedback-error';
  track?: Track;
  className?: string;
  as?: 'section' | 'div' | 'article' | 'li';
  [key: string]: unknown;
}) {
  const Tag = as as 'section';
  const spine = track
    ? ` spine${track === 'interview' ? ' spine--interview' : track === 'cross-track' ? ' spine--cross' : ''}`
    : '';
  return (
    <Tag
      className={`card${variant ? ` card--${variant}` : ''}${spine} ${className}`.trim()}
      {...(rest as Record<string, unknown>)}
    >
      {children}
    </Tag>
  );
}

export function Badge({
  children,
  tone = 'default',
}: {
  children: ReactNode;
  tone?: 'default' | 'critical' | 'success' | 'warning' | 'error' | 'quiet';
}) {
  return <span className={`badge${tone === 'default' ? '' : ` badge--${tone}`}`}>{children}</span>;
}

export function LevelBadge({ level }: { level: Level }) {
  if (level === 1) return <Badge tone="critical">Nivel 1 · Imprescindible</Badge>;
  if (level === 2) return <Badge tone="quiet">Nivel 2 · Si ya manejas lo esencial</Badge>;
  if (level === 3) return <Badge tone="quiet">Nivel 3 · Profundización</Badge>;
  return <Badge tone="quiet">Referencia</Badge>;
}

export function TrackBadge({ track }: { track: Track }) {
  const label = track === 'interview' ? 'Entrevista' : track === 'penal' ? 'Penal' : 'Cross-track';
  return <Badge tone="quiet">{label}</Badge>;
}

export function Minutes({ value }: { value: number }) {
  return (
    <span className="mono" aria-label={`${value} minutos`}>
      {value} min
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <strong>{title}</strong>
      {description ? <p className="caption">{description}</p> : null}
      {action}
    </div>
  );
}

/**
 * Medidor segmentado: un segmento = un LearningObjective. El progreso se ve por metas y no por
 * cantidad de preguntas (contrato §8.5).
 */
export function SegmentedMeter({
  name,
  statuses,
  counterLabel,
  track,
}: {
  name: string;
  statuses: ObjectiveStatus[];
  counterLabel: string;
  track: Track;
}) {
  const describe = statuses.reduce(
    (acc, status) => {
      acc[status.mastery] = (acc[status.mastery] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const summary = `${counterLabel}. ${describe.mastered ?? 0} dominados, ${
    describe.learning ?? 0
  } aprendiendo, ${describe['needs-review'] ?? 0} necesitan repaso, ${
    describe['not-started'] ?? 0
  } sin empezar.`;
  return (
    <div className={`meter${track === 'interview' ? ' meter--interview' : ''}`}>
      <div className="meter__head">
        <span className="meter__name">{name}</span>
        <span className="meter__count">{counterLabel}</span>
      </div>
      <div className="meter__segments" role="img" aria-label={summary}>
        {statuses.map((status) => (
          <span
            key={status.objective.id}
            className="meter__segment"
            data-state={status.mastery}
            title={`${status.objective.title}`}
          />
        ))}
      </div>
    </div>
  );
}

export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const percent = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
    >
      <div className="progress__fill" style={{ width: `${percent}%` }} />
    </div>
  );
}

/** "Fuente de estudio" con título y sección; el fragmento exacto queda a un clic (contrato §17). */
export function SourceNote({ source }: { source: SourceRef }) {
  const manifest = SOURCE_MANIFEST[source.sourceId];
  return (
    <div className="source-note">
      <details>
        <summary>
          Fuente de estudio: {source.sourceId} {source.sourceSection.split('—')[0].trim()}
        </summary>
        <blockquote>{source.sourceExcerpt}</blockquote>
        <p className="caption" style={{ marginTop: 'var(--space-2)' }}>
          {manifest.title} · {manifest.relativePath} · hash {source.sourceExcerptHash.slice(0, 12)}…
        </p>
      </details>
    </div>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return <p className="notice">{children}</p>;
}

export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="row row--between" style={{ alignItems: 'baseline' }}>
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}
