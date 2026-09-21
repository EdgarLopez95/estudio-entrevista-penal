import { Link, useNavigate } from 'react-router-dom';
import { useProgress } from '@/state/StoreProvider';
import { LogoBadge } from '@/components/Logo';
import { InstallPrompt } from '@/components/InstallPrompt';
import { IconBook, IconBolt, IconClock, IconArrowRight } from '@/components/icons';

export function HomeScreen() {
  const progress = useProgress();
  const navigate = useNavigate();

  const activeSession =
    progress.activeSession && progress.activeSession.status === 'active'
      ? progress.activeSession
      : null;

  const lastActivity = progress.lastActivity;
  const canResume = Boolean(activeSession || (lastActivity && lastActivity.resourceId));

  const resumeLabel = activeSession
    ? `${activeSession.label} · Ítem ${activeSession.currentIndex + 1}`
    : 'Entrevista esencial · Pregunta 1';

  return (
    <div className="stack-8" style={{ maxWidth: '560px', margin: '0 auto', paddingTop: 'var(--space-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--surface-2)',
            border: '1px solid var(--outline)',
            fontSize: 'var(--text-caption)',
            fontWeight: 'var(--weight-medium)',
            color: 'var(--text-primary)',
          }}
        >
          <IconClock size={16} color="var(--primary)" />
          <span>Tu entrevista es mañana 21 de septiembre a las 2:00 p. m.</span>
        </div>
      </div>

      <div className="stack-3" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <LogoBadge size={84} />
        <p className="eyebrow" style={{ color: 'var(--text-secondary)', letterSpacing: '0.06em', marginTop: 'var(--space-2)' }}>
          Valentina · Abogada Junior en Derecho Penal
        </p>
        <h1 style={{ fontSize: 'var(--text-h2)', letterSpacing: '-0.02em', marginTop: 'var(--space-1)' }}>
          ¿Cómo quieres prepararte?
        </h1>
      </div>

      <div className="choice-cards">
        <Link
          to="/estudiar"
          className="choice-card choice-card--primary"
          style={{ textDecoration: 'none' }}
        >
          <div className="choice-card__row">
            <div className="choice-card__icon-box">
              <IconBook size={24} />
            </div>
            <div className="choice-card__body">
              <div className="choice-card__header">
                <span className="choice-card__title">ESTUDIAR</span>
              </div>
              <span className="choice-card__desc">
                Revisar el contenido antes de responder.
              </span>
            </div>
            <div className="choice-card__arrow" aria-hidden="true">
              <IconArrowRight size={20} />
            </div>
          </div>
        </Link>

        <Link
          to="/practicar"
          className="choice-card"
          style={{ textDecoration: 'none' }}
        >
          <div className="choice-card__row">
            <div className="choice-card__icon-box">
              <IconBolt size={24} />
            </div>
            <div className="choice-card__body">
              <div className="choice-card__header">
                <span className="choice-card__title">PRACTICAR</span>
              </div>
              <span className="choice-card__desc">
                Intentar responder sin ver la ayuda.
              </span>
            </div>
            <div className="choice-card__arrow" aria-hidden="true">
              <IconArrowRight size={20} />
            </div>
          </div>
        </Link>
      </div>

      {canResume ? (
        <div
          className="stack-2 card"
          style={{
            background: 'var(--surface-2)',
            borderColor: 'var(--outline)',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-card)',
          }}
        >
          <p className="caption" style={{ color: 'var(--text-secondary)', fontWeight: 'var(--weight-medium)' }}>
            Continuar donde quedaste
          </p>
          <p style={{ fontSize: 'var(--text-body)', fontWeight: 'var(--weight-medium)' }}>
            {resumeLabel}
          </p>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => navigate('/sesion')}
            style={{ marginTop: 'var(--space-2)' }}
          >
            Continuar
          </button>
        </div>
      ) : null}

      <InstallPrompt />
    </div>
  );
}
