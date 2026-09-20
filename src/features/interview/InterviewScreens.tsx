import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  LinkButton,
  Notice,
  SectionHeading,
} from '@/components/primitives';
import { InterviewPromptView, StarCard } from '@/components/practice';
import { useProgress, useStore } from '@/state/StoreProvider';
import { INTERVIEW_PROMPTS, STARS, getResource } from '@/content';
import { HARD_PROMPT_IDS, TOP_10_PROMPT_IDS } from '@/content/collections';
import { PROMPT_STATE_LABEL, promptState } from '@/domain/interviewPractice';
import { hasActiveGap } from '@/domain/errors';
import { buildInterviewBlock, buildSession } from '@/domain/sessionBuilder';
import type { SessionPresentationMode } from '@/domain/types';
import { top10Readiness } from '@/domain/readiness';
import type { InterviewPrompt } from '@/domain/types';
import type { ProgressState } from '@/domain/progress';

function stateOf(progress: ProgressState, prompt: InterviewPrompt) {
  return promptState(progress, prompt, hasActiveGap(progress, prompt.id, 'interview-content-gap'));
}

function PromptList({ prompts, title }: { prompts: InterviewPrompt[]; title: string }) {
  const progress = useProgress();
  return (
    <section className="stack-3" aria-label={title}>
      <ul className="item-list">
        {prompts.map((prompt) => {
          const state = stateOf(progress, prompt);
          const tone =
            state === 'consolidated'
              ? 'success'
              : state === 'blank' || state === 'partial'
                ? 'warning'
                : 'quiet';
          return (
            <li key={prompt.id}>
              <Link className="item-row" to={`/entrevista/prompt/${prompt.id}`}>
                <span>
                  <span className="item-row__title">{prompt.prompt}</span>
                  <span className="item-row__meta">
                    {prompt.topic} · {prompt.estimatedMinutes} min
                  </span>
                </span>
                <Badge tone={tone}>{PROMPT_STATE_LABEL[state]}</Badge>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function InterviewHubScreen() {
  const progress = useProgress();
  const store = useStore();
  const navigate = useNavigate();
  const readiness = useMemo(() => top10Readiness(progress), [progress]);

  const level1 = INTERVIEW_PROMPTS.filter((p) => p.level === 1 && p.track === 'interview');
  const cross = INTERVIEW_PROMPTS.filter((p) => p.level === 1 && p.track === 'cross-track');
  const level2 = INTERVIEW_PROMPTS.filter((p) => p.level === 2);

  const activeInterviewSession = progress.activeSession?.status === 'active' && progress.activeSession.scope.activeTrack === 'interview';

  function startBlock(presentationMode: SessionPresentationMode) {
    const built = buildInterviewBlock(progress);
    store.startSession(built, { presentationMode });
    navigate('/sesion');
  }

  return (
    <div className="stack-8">
      <header className="stack-3">
        <p className="eyebrow">Frente A · prioridad principal</p>
        <h1>Entrevista</h1>
        <p className="reading">
          La práctica es oral: la entrevistadora pregunta, respondes en voz alta y después revisas
          los puntos clave. La respuesta modelo es apoyo, nunca un guion obligatorio.
        </p>
        {activeInterviewSession ? (
          <div className="row"><LinkButton to="/sesion" variant="primary">Continuar sesión</LinkButton><LinkButton to="/entrevista/top10">Top 10</LinkButton><LinkButton to="/entrevista/dificiles">Preguntas difíciles</LinkButton></div>
        ) : (
          <div className="stack-3"><p className="prompt__hint">¿Qué quieres hacer ahora?</p><div className="row"><Button variant="primary" onClick={() => startBlock('study')}>Estudiar / Prepararme</Button><Button onClick={() => startBlock('practice')}>Practicar / Ensayar</Button></div></div>
        )}
      </header>

      <Card variant="quiet" className="stack-2">
        <p className="eyebrow">Cobertura por objetivo</p>
        <p className="mono">
          {readiness.practiced}/{readiness.total} practicadas · {readiness.good} bien ·{' '}
          {readiness.toReinforce} por reforzar · {readiness.unpracticed} sin practicar
        </p>
        <p className="caption">
          Diez preguntas sobre una misma meta siguen siendo evidencia de una sola meta.
        </p>
      </Card>

      <section className="stack-4">
        <SectionHeading eyebrow="Nivel 1 · imprescindible" title="Respuestas esenciales" />
        <PromptList prompts={level1} title="Respuestas esenciales" />
      </section>

      <section className="stack-4">
        <SectionHeading eyebrow="Cross-track" title="Experiencia real y concepto" />
        <PromptList prompts={cross} title="Cross-track" />
      </section>

      <section className="stack-4">
        <SectionHeading eyebrow="Historias STAR" title="Cinco historias reutilizables" />
        <p className="caption">
          Son atajos cognitivos: la misma historia sirve para varias preguntas. No hay que memorizar
          decenas de discursos.
        </p>
        <ul className="item-list">
          {STARS.map((story) => (
            <li key={story.id}>
              <Link className="item-row" to={`/entrevista/star/${story.id}`}>
                <span>
                  <span className="item-row__title">{story.title}</span>
                  <span className="item-row__meta">{story.competencies.join(' · ')}</span>
                </span>
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {progress.preferences.includeLevel2 ? (
        <section className="stack-4">
          <SectionHeading eyebrow="Nivel 2 · si ya manejas lo esencial" title="Profundizar" />
          <PromptList prompts={level2} title="Nivel 2" />
        </section>
      ) : (
        <Notice>
          Nivel 2 de entrevista (conflictos, crítica, decisión difícil, equipo, ética adicional,
          cinco años y preguntas al despacho) sigue disponible. Puedes activarlo en Preferencias
          cuando quieras profundizar.
        </Notice>
      )}
    </div>
  );
}

export function InterviewCollectionScreen({ collection }: { collection: 'top10' | 'dificiles' }) {
  const progress = useProgress();
  const store = useStore();
  const navigate = useNavigate();
  const ids = collection === 'top10' ? TOP_10_PROMPT_IDS : HARD_PROMPT_IDS;
  const prompts = ids
    .map((id) => INTERVIEW_PROMPTS.find((p) => p.id === id))
    .filter((p): p is InterviewPrompt => Boolean(p));

  function start() {
    const built = buildSession({
      state: progress,
      mode: collection === 'top10' ? 'top10' : 'hard-questions',
      timeBudget: progress.preferences.lastTimeBudget,
    });
    store.startSession(built);
    navigate('/sesion');
  }

  return (
    <div className="stack-6">
      <header className="stack-3">
        <p className="eyebrow">Colección</p>
        <h1>{collection === 'top10' ? 'Top 10 — Primera entrevista' : 'Preguntas difíciles'}</h1>
        <p className="reading">
          {collection === 'top10'
            ? 'Las diez preguntas del mini simulacro de alta probabilidad. Si puedes responderlas con tranquilidad, cubres gran parte del riesgo de una entrevista inicial.'
            : 'Preguntas personales que pueden afectar la candidatura. Todas tienen una respuesta preparada y honesta en tus fuentes.'}
        </p>
        <Button variant="primary" onClick={start}>
          Practicar esta colección
        </Button>
      </header>
      <PromptList prompts={prompts} title="Colección" />
    </div>
  );
}

export function PromptDetailScreen() {
  const { promptId } = useParams();
  const progress = useProgress();
  const store = useStore();
  const navigate = useNavigate();
  const resource = promptId ? getResource(promptId) : undefined;

  if (!resource || resource.type !== 'interview-prompt') {
    return (
      <EmptyState
        title="Esa pregunta no está disponible"
        action={<LinkButton to="/entrevista" variant="primary">Volver a Entrevista</LinkButton>}
      />
    );
  }

  const state = stateOf(progress, resource);

  return (
    <div className="stack-6">
      <div className="row row--between">
        <Link className="btn btn--tertiary" to="/entrevista">
          ← Entrevista
        </Link>
        <Badge tone="quiet">{PROMPT_STATE_LABEL[state]}</Badge>
      </div>
      <InterviewPromptView
        prompt={resource}
        saveLabel="Guardar intento"
        onSave={(input) => {
          store.recordInterviewAttempt(resource.id, input);
          navigate('/entrevista');
        }}
      />
    </div>
  );
}

export function StarDetailScreen() {
  const { starId } = useParams();
  const story = STARS.find((s) => s.id === starId);
  if (!story) {
    return (
      <EmptyState
        title="Esa historia no está disponible"
        action={<LinkButton to="/entrevista" variant="primary">Volver a Entrevista</LinkButton>}
      />
    );
  }
  return (
    <div className="stack-6">
      <Link className="btn btn--tertiary" to="/entrevista">
        ← Entrevista
      </Link>
      <StarCard story={story} />
      <Notice>
        Las historias STAR no se memorizan palabra por palabra: se reutilizan. Aprende la idea y
        cuéntala con tus palabras.
      </Notice>
    </div>
  );
}
