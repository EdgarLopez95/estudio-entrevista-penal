import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/state/StoreProvider';
import { buildLinearSession } from '@/domain/sessionBuilder';
import {
  IconInterview,
  IconScales,
  IconStar,
  IconLayers,
  IconSparkles,
  IconArrowRight,
} from '@/components/icons';

export function FlowSelectorScreen({ mode }: { mode: 'study' | 'practice' }) {
  const store = useStore();
  const navigate = useNavigate();
  const [track, setTrack] = useState<'interview' | 'penal' | null>(null);

  const modeLabel = mode === 'study' ? 'Estudiar' : 'Practicar';

  function chooseLevel(level: 1 | 2 | 3) {
    if (!track) return;
    const built = buildLinearSession({ mode, track, level });
    store.startSession(built, { presentationMode: mode, label: built.label });
    navigate('/sesion');
  }

  if (!track) {
    return (
      <div className="stack-6" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <nav aria-label="Miga de pan">
          <p className="caption" style={{ color: 'var(--text-secondary)', fontWeight: 'var(--weight-medium)' }}>
            Inicio › {modeLabel}
          </p>
        </nav>

        <div className="stack-2">
          <h1>¿Qué quieres preparar?</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {mode === 'study'
              ? 'Revisa el contenido antes de responder.'
              : 'Intenta responder sin ver la ayuda previa.'}
          </p>
        </div>

        <div className="choice-cards">
          <button
            type="button"
            className="choice-card choice-card--primary"
            onClick={() => setTrack('interview')}
          >
            <div className="choice-card__row">
              <div className="choice-card__icon-box">
                <IconInterview size={24} />
              </div>
              <div className="choice-card__body">
                <div className="choice-card__header">
                  <span className="choice-card__title">ENTREVISTA</span>
                </div>
                <span className="choice-card__desc">
                  Preguntas sobre tu experiencia, motivación y situaciones difíciles.
                </span>
              </div>
              <div className="choice-card__arrow" aria-hidden="true">
                <IconArrowRight size={20} />
              </div>
            </div>
          </button>

          <button
            type="button"
            className="choice-card"
            onClick={() => setTrack('penal')}
          >
            <div className="choice-card__row">
              <div className="choice-card__icon-box">
                <IconScales size={24} />
              </div>
              <div className="choice-card__body">
                <div className="choice-card__header">
                  <span className="choice-card__title">DERECHO PENAL</span>
                </div>
                <span className="choice-card__desc">
                  Conceptos y preguntas técnicas del Código Penal y Código de Procedimiento Penal.
                </span>
              </div>
              <div className="choice-card__arrow" aria-hidden="true">
                <IconArrowRight size={20} />
              </div>
            </div>
          </button>
        </div>

        <div style={{ marginTop: 'var(--space-2)' }}>
          <Link to="/" className="btn btn--tertiary">
            ← Volver a Inicio
          </Link>
        </div>
      </div>
    );
  }

  const trackLabel = track === 'interview' ? 'Entrevista' : 'Penal';

  return (
    <div className="stack-6" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <nav aria-label="Miga de pan">
        <p className="caption" style={{ color: 'var(--text-secondary)', fontWeight: 'var(--weight-medium)' }}>
          Inicio › {modeLabel} › {trackLabel}
        </p>
      </nav>

      <div className="stack-2">
        <h1>Elige el nivel</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Selecciona la profundidad con la que quieres empezar.
        </p>
      </div>

      <div className="choice-cards">
        <button
          type="button"
          className="choice-card choice-card--primary"
          onClick={() => chooseLevel(1)}
        >
          <div className="choice-card__row">
            <div className="choice-card__icon-box">
              <IconStar size={24} />
            </div>
            <div className="choice-card__body">
              <div className="choice-card__header">
                <span className="choice-card__title">NIVEL 1 · ESENCIAL</span>
                <span className="choice-card__badge">Recomendado</span>
              </div>
              <span className="choice-card__desc">
                Lo que deberías dominar primero para esta entrevista.
              </span>
            </div>
            <div className="choice-card__arrow" aria-hidden="true">
              <IconArrowRight size={20} />
            </div>
          </div>
        </button>

        <button
          type="button"
          className="choice-card"
          onClick={() => chooseLevel(2)}
        >
          <div className="choice-card__row">
            <div className="choice-card__icon-box">
              <IconLayers size={24} />
            </div>
            <div className="choice-card__body">
              <div className="choice-card__header">
                <span className="choice-card__title">NIVEL 2 · AMPLIACIÓN</span>
              </div>
              <span className="choice-card__desc">
                Temas importantes para profundizar si ya manejas lo esencial.
              </span>
            </div>
            <div className="choice-card__arrow" aria-hidden="true">
              <IconArrowRight size={20} />
            </div>
          </div>
        </button>

        <button
          type="button"
          className="choice-card"
          onClick={() => chooseLevel(3)}
        >
          <div className="choice-card__row">
            <div className="choice-card__icon-box">
              <IconSparkles size={24} />
            </div>
            <div className="choice-card__body">
              <div className="choice-card__header">
                <span className="choice-card__title">NIVEL 3 · PROFUNDIZACIÓN</span>
              </div>
              <span className="choice-card__desc">
                Contenido adicional para una entrevista más técnica o si tienes más tiempo.
              </span>
            </div>
            <div className="choice-card__arrow" aria-hidden="true">
              <IconArrowRight size={20} />
            </div>
          </div>
        </button>
      </div>

      <div style={{ marginTop: 'var(--space-2)' }}>
        <button type="button" className="btn btn--tertiary" onClick={() => setTrack(null)}>
          ← Elegir otra área
        </button>
      </div>
    </div>
  );
}
