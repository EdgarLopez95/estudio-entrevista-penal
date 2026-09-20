import { Link, useNavigate } from 'react-router-dom';
import { useProgress } from '@/state/StoreProvider';
import { interviewPhase } from '@/domain/time';

export function HomeScreen() {
  const progress = useProgress();
  const navigate = useNavigate();

  const phase = interviewPhase(progress.targetInterview);

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
      {phase === 'today' ? (
        <p className="caption" style={{ textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 'var(--weight-medium)' }}>
          Entrevista hoy
        </p>
      ) : phase === 'tomorrow' ? (
        <p className="caption" style={{ textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 'var(--weight-medium)' }}>
          Entrevista mañana
        </p>
      ) : phase === 'week' ? (
        <p className="caption" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          Entrevista próxima
        </p>
      ) : null}

      <div className="stack-2" style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 'var(--text-h2)', letterSpacing: '-0.02em' }}>
          ¿Cómo quieres prepararte?
        </h1>
      </div>

      <div className="choice-cards">
        <Link
          to="/estudiar"
          className="choice-card choice-card--primary"
          style={{ textDecoration: 'none' }}
        >
          <div className="choice-card__header">
            <span className="choice-card__title">ESTUDIAR</span>
          </div>
          <span className="choice-card__desc">
            Revisar el contenido antes de responder.
          </span>
        </Link>

        <Link
          to="/practicar"
          className="choice-card"
          style={{ textDecoration: 'none' }}
        >
          <div className="choice-card__header">
            <span className="choice-card__title">PRACTICAR</span>
          </div>
          <span className="choice-card__desc">
            Intentar responder sin ver la ayuda.
          </span>
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
    </div>
  );
}
