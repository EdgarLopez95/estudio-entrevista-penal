import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type {
  CaseResource,
  ChecklistResource,
  Flashcard,
  InterviewPrompt,
  Lesson,
  Question,
  SelfRating,
  StarStory,
} from '@/domain/types';
import { Badge, Button, Card, LevelBadge, Minutes, SourceNote, TrackBadge } from './primitives';
import { SELF_RATING_LABEL } from '@/domain/interviewPractice';
import { RATING_LABEL } from '@/domain/flashcardScheduler';
import { starStory } from '@/content';

/* ------------------------------------------------------------------ Question */

export function QuestionView({
  question,
  initialChosen,
  onAnswer,
  onContinue,
  continueLabel = 'Continuar',
}: {
  question: Question;
  initialChosen?: string;
  onAnswer: (optionId: string) => void;
  onContinue?: () => void;
  continueLabel?: string;
}) {
  const [selected, setSelected] = useState<string | null>(initialChosen ?? null);
  const [submitted, setSubmitted] = useState(Boolean(initialChosen));

  useEffect(() => {
    setSelected(initialChosen ?? null);
    setSubmitted(Boolean(initialChosen));
  }, [question.id, initialChosen]);

  const correct = submitted && selected === question.correctOptionId;

  function submit() {
    if (!selected || submitted) return;
    setSubmitted(true);
    onAnswer(selected);
  }

  return (
    <div className="stack-6">
      <div className="stack-3">
        <div className="row">
          <LevelBadge level={question.level} />
          <Badge tone="quiet">{question.topic}</Badge>
        </div>
        <h2 className="prompt">{question.question}</h2>
      </div>

      <div
        className="stack-2"
        role="radiogroup"
        aria-label="Opciones de respuesta"
      >
        {question.options.map((option, index) => {
          let state = 'idle';
          if (!submitted && selected === option.id) state = 'selected';
          if (submitted && option.id === question.correctOptionId) state = 'submitted-correct';
          if (submitted && selected === option.id && !correct) state = 'submitted-incorrect';
          const isChosen = selected === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isChosen}
              className="option"
              data-state={state}
              disabled={submitted}
              onClick={() => setSelected(option.id)}
            >
              <span className="option__marker" aria-hidden="true">
                {String.fromCharCode(97 + index)})
              </span>
              <span>{option.text}</span>
              {submitted && option.id === question.correctOptionId ? (
                <span className="option__state">✓ Correcta</span>
              ) : null}
              {submitted && isChosen && !correct ? (
                <span className="option__state">✕ Tu respuesta</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {!submitted ? (
        <Button variant="primary" onClick={submit} disabled={!selected}>
          Comprobar
        </Button>
      ) : (
        <div className="stack-4">
          <div className={`feedback ${correct ? 'feedback--correct' : 'feedback--incorrect'}`}>
            <p className="feedback__title">
              <span aria-hidden="true">{correct ? '✓' : '✕'}</span>
              {correct ? 'Correcto' : 'Este concepto necesita repaso'}
            </p>
            <p style={{ marginTop: 'var(--space-2)' }}>{question.explanation}</p>
            {!correct && selected && question.wrongAnswerExplanations[selected] ? (
              <p className="caption" style={{ marginTop: 'var(--space-2)' }}>
                {question.wrongAnswerExplanations[selected]}
              </p>
            ) : null}
          </div>

          {question.deeperDetail ? (
            <details className="disclosure">
              <summary>Ver más detalle</summary>
              <p style={{ marginTop: 'var(--space-2)' }}>{question.deeperDetail}</p>
            </details>
          ) : null}

          <SourceNote source={question} />
          {onContinue ? (
            <Button variant="primary" onClick={onContinue}>
              {continueLabel}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- Flashcard */

export function FlashcardView({
  card,
  onRate,
}: {
  card: Flashcard;
  onRate: (rating: 'unknown' | 'doubt' | 'known') => void;
}) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
  }, [card.id]);

  return (
    <div className="stack-6">
      <Card className="flashcard" track={card.track}>
        <p className="eyebrow">{card.topic}</p>
        <p className="flashcard__front">{card.front}</p>
        {revealed ? <p className="flashcard__back">{card.back}</p> : null}
      </Card>

      {!revealed ? (
        <Button variant="primary" onClick={() => setRevealed(true)} block>
          Mostrar respuesta
        </Button>
      ) : (
        <div className="self-rating">
          <Button onClick={() => onRate('unknown')}>{RATING_LABEL.unknown}</Button>
          <Button onClick={() => onRate('doubt')}>{RATING_LABEL.doubt}</Button>
          <Button variant="primary" onClick={() => onRate('known')}>
            {RATING_LABEL.known}
          </Button>
        </div>
      )}
      <SourceNote source={card} />
    </div>
  );
}

/* ---------------------------------------------------------- Interview prompt */

function InterviewGuidance({
  prompt,
  stories,
  onUseModel,
}: {
  prompt: InterviewPrompt;
  stories: StarStory[];
  onUseModel: () => void;
}) {
  return (
    <div className="stack-6">
      <div className="stack-3">
        <h3>Idea que debe quedar</h3>
        <p>{prompt.ideaThatMustLand}</p>
      </div>

      <div className="stack-3">
        <h3>Puntos que puedes incluir</h3>
        <ul className="stack-2">
          {prompt.keyPoints.map((point) => (
            <li key={point.id}>
              · {point.text}
              {point.essential ? '' : ' (opcional)'}
            </li>
          ))}
        </ul>
      </div>

      {prompt.avoid.length > 0 ? (
        <div className="stack-2">
          <h3>Evita</h3>
          <ul className="stack-2">
            {prompt.avoid.map((item) => (
              <li key={item} className="caption">
                · {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {stories.length > 0 ? (
        <div className="stack-2">
          <h3>Historias que te sirven</h3>
          <ul className="item-list">
            {stories.map((story) => (
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
        </div>
      ) : null}

      <details className="disclosure" onToggle={onUseModel}>
        <summary>Ver respuesta modelo (apoyo, no un guion)</summary>
        <div className="stack-3 reading" style={{ marginTop: 'var(--space-3)' }}>
          {prompt.recommendedAnswer.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
          <p className="caption">
            Es modelo de contenido: aprende la idea central y dilo con tus palabras.
          </p>
        </div>
      </details>

      {prompt.followUps.length > 0 ? (
        <div className="stack-2">
          <h3>Posible follow-up</h3>
          {prompt.followUps.map((followUp) => (
            <Card key={followUp.id} variant="quiet" className="stack-2">
              <p style={{ fontWeight: 'var(--weight-medium)' }}>{followUp.prompt}</p>
              <p className="caption">{followUp.ideaThatMustLand}</p>
              <SourceNote source={followUp.source} />
            </Card>
          ))}
        </div>
      ) : null}

      <SourceNote source={prompt} />
    </div>
  );
}

export function InterviewPromptView({
  prompt,
  onSave,
  saveLabel = 'Guardar y continuar',
  presentationMode,
  onStudy,
}: {
  prompt: InterviewPrompt;
  onSave: (input: {
    selfRating: SelfRating;
    coveredKeyPointIds: string[];
    usedModelAnswer: boolean;
  }) => void;
  saveLabel?: string;
  presentationMode?: 'study' | 'practice';
  onStudy?: () => void;
}) {
  const [step, setStep] = useState<'choose' | 'prepare' | 'ask' | 'rate'>('choose');
  const [rating, setRating] = useState<SelfRating | null>(null);
  const [covered, setCovered] = useState<string[]>([]);
  const [usedModel, setUsedModel] = useState(false);

  useEffect(() => {
    setStep(presentationMode === 'study' ? 'prepare' : presentationMode === 'practice' ? 'ask' : 'choose');
    setRating(null);
    setCovered([]);
    setUsedModel(false);
  }, [prompt.id, presentationMode]);

  const stories = useMemo(
    () => prompt.relatedStarStoryIds.map((id) => starStory(id)).filter(Boolean) as StarStory[],
    [prompt.relatedStarStoryIds],
  );

  function toggle(id: string) {
    setCovered((current) =>
      current.includes(id) ? current.filter((k) => k !== id) : [...current, id],
    );
  }

  return (
    <div className="stack-6">
      <div className="stack-3">
        <div className="row">
          <TrackBadge track={prompt.track} />
          <LevelBadge level={prompt.level} />
          <Badge tone="quiet">
            <Minutes value={prompt.estimatedMinutes} />
          </Badge>
        </div>
        <p className="eyebrow">La entrevistadora pregunta</p>
        <h2 className="prompt">{prompt.prompt}</h2>
        {prompt.structure ? (
          <ul className="stack-2" style={{ marginTop: 'var(--space-2)' }}>
            {prompt.structure.map((part) => (
              <li key={part.label} className="row" style={{ gap: 'var(--space-3)' }}>
                <span className="badge badge--quiet">{part.label}</span>
                <span className="caption">{part.hint}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {step === 'choose' ? (
        <div className="stack-4">
          <p className="prompt__hint">
            Elige si quieres estudiar primero la respuesta o ensayarla ahora.
          </p>
          <div className="row">
            <Button variant="primary" onClick={() => setStep('prepare')}>
              Prepararme primero
            </Button>
            <Button onClick={() => setStep('ask')}>Practicar ahora</Button>
          </div>
        </div>
      ) : null}

      {step === 'prepare' ? (
        <div className="stack-6">
          <InterviewGuidance
            prompt={prompt}
            stories={stories}
            onUseModel={() => setUsedModel(true)}
          />
          <div className="row">
            {presentationMode === 'study' && onStudy ? (
              <Button variant="primary" onClick={onStudy}>Siguiente →</Button>
            ) : (
              <><Button variant="primary" onClick={() => setStep('ask')}>Practicar ahora</Button><Button onClick={() => setStep('choose')}>Volver a elegir</Button></>
            )}
          </div>
        </div>
      ) : null}

      {step === 'ask' ? (
        <div className="stack-4">
          <p className="prompt__hint">
            Respóndelo en voz alta, con tus propias palabras. Cuando termines, continúa: la guía se
            abre después del intento.
          </p>
          <Button variant="primary" onClick={() => setStep('rate')}>
            He respondido
          </Button>
        </div>
      ) : null}

      {step === 'rate' ? (
        <div className="stack-6">
          <fieldset className="stack-3" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="label">¿Cómo te salió?</legend>
            <div className="self-rating">
              {(['blank', 'partial', 'good'] as SelfRating[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`btn ${rating === value ? 'btn--primary' : 'btn--secondary'}`}
                  aria-pressed={rating === value}
                  onClick={() => setRating(value)}
                >
                  {SELF_RATING_LABEL[value]}
                </button>
              ))}
            </div>
            <p className="caption">
              Esto registra tu preparación y la cobertura de los puntos clave. No califica tu
              personalidad ni tu forma de hablar.
            </p>
          </fieldset>

          <div className="stack-3">
            <h3>¿Qué cubrí?</h3>
            <div className="keypoints">
              {prompt.keyPoints.map((point) => (
                <button
                  key={point.id}
                  type="button"
                  className="keypoint"
                  aria-pressed={covered.includes(point.id)}
                  onClick={() => toggle(point.id)}
                >
                  <span className="keypoint__box" aria-hidden="true">
                    {covered.includes(point.id) ? '[x]' : '[ ]'}
                  </span>
                  <span>
                    {point.text}
                    {point.essential ? '' : ' (opcional)'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <InterviewGuidance
            prompt={prompt}
            stories={stories}
            onUseModel={() => setUsedModel(true)}
          />

          <Button
            variant="primary"
            disabled={!rating}
            onClick={() =>
              rating &&
              onSave({ selfRating: rating, coveredKeyPointIds: covered, usedModelAnswer: usedModel })
            }
          >
            {saveLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------- Lesson */

export function LessonView({
  lesson,
  onStudied,
  continueLabel = 'Practicar lo que acabo de estudiar',
}: {
  lesson: Lesson;
  onStudied: () => void;
  continueLabel?: string;
}) {
  return (
    <div className="stack-6">
      <div className="stack-3">
        <div className="row">
          <TrackBadge track={lesson.track} />
          <LevelBadge level={lesson.level} />
          <Badge tone="quiet">
            <Minutes value={lesson.estimatedMinutes} />
          </Badge>
        </div>
        <h2>{lesson.title}</h2>
      </div>

      <Card variant="quiet" track={lesson.track} className="stack-2">
        <p className="eyebrow">Idea esencial</p>
        <p style={{ fontSize: 'var(--text-h3)', lineHeight: 'var(--leading-snug)' }}>
          {lesson.essentialIdea}
        </p>
      </Card>

      <div className="stack-3 reading">
        {lesson.explanation.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <div className="stack-2">
        <h3>Qué recordar</h3>
        <ul className="stack-2">
          {lesson.whatToRemember.map((item) => (
            <li key={item} className="row" style={{ gap: 'var(--space-2)', alignItems: 'baseline' }}>
              <span aria-hidden="true" className="caption">
                ·
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {lesson.difference ? (
        <Card variant="quiet" className="stack-2">
          <p className="eyebrow">No confundir</p>
          <p>
            <strong>{lesson.difference.a}</strong> vs. <strong>{lesson.difference.b}</strong>
          </p>
          <p className="caption">{lesson.difference.distinction}</p>
        </Card>
      ) : null}

      {lesson.sourceExample ? (
        <div className="stack-2">
          <h3>Ejemplo de la fuente</h3>
          <p className="reading">{lesson.sourceExample}</p>
        </div>
      ) : null}

      <SourceNote source={lesson} />

      <Button variant="primary" onClick={onStudied}>
        {continueLabel}
      </Button>
    </div>
  );
}

/* ---------------------------------------------------------------------- Case */

export function CaseView({
  caseResource,
  checked,
  onToggle,
  onComplete,
}: {
  caseResource: CaseResource;
  checked: Record<string, string[]>;
  onToggle: (stepId: string, elementId: string) => void;
  onComplete?: () => void;
}) {
  return (
    <div className="stack-6">
      <div className="stack-3">
        <div className="row">
          <LevelBadge level={caseResource.level} />
          <Badge tone="quiet">Caso abierto</Badge>
        </div>
        <h2>{caseResource.title}</h2>
        <Card variant="quiet" className="stack-2">
          <p className="eyebrow">Hechos</p>
          <p>{caseResource.facts}</p>
        </Card>
      </div>

      <div className="step-list">
        {caseResource.steps.map((step) => (
          <div key={step.id} className="step stack-3">
            <p className="step__label">{step.label}</p>
            <p>{step.prompt}</p>
            {step.elementsToConsider ? (
              <details className="disclosure">
                <summary>Elementos que debías considerar</summary>
                <div className="keypoints" style={{ marginTop: 'var(--space-3)' }}>
                  {step.elementsToConsider.map((element) => (
                    <button
                      key={element.id}
                      type="button"
                      className="keypoint"
                      aria-pressed={(checked[step.id] ?? []).includes(element.id)}
                      onClick={() => onToggle(step.id, element.id)}
                    >
                      <span className="keypoint__box" aria-hidden="true">
                        {(checked[step.id] ?? []).includes(element.id) ? '[x]' : '[ ]'}
                      </span>
                      <span>{element.text}</span>
                    </button>
                  ))}
                </div>
                <p className="caption" style={{ marginTop: 'var(--space-2)' }}>
                  Este paso es abierto: no se marca correcto ni incorrecto.
                </p>
              </details>
            ) : null}
          </div>
        ))}
      </div>

      <SourceNote source={caseResource} />
      {onComplete ? (
        <Button variant="primary" onClick={onComplete}>
          Terminar caso
        </Button>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------- Checklist */

export function ChecklistView({
  checklist,
  checkedItemIds,
  onToggle,
}: {
  checklist: ChecklistResource;
  checkedItemIds: string[];
  onToggle: (itemId: string) => void;
}) {
  return (
    <div className="stack-4">
      <div className="stack-2">
        <h2>{checklist.title}</h2>
        <p className="prompt__hint">{checklist.intro}</p>
      </div>
      <div className="keypoints">
        {checklist.items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="keypoint"
            aria-pressed={checkedItemIds.includes(item.id)}
            onClick={() => onToggle(item.id)}
          >
            <span className="keypoint__box" aria-hidden="true">
              {checkedItemIds.includes(item.id) ? '[x]' : '[ ]'}
            </span>
            <span>{item.text}</span>
          </button>
        ))}
      </div>
      <SourceNote source={checklist} />
    </div>
  );
}

/* --------------------------------------------------------------- STAR story */

export function StarCard({ story }: { story: StarStory }) {
  return (
    <Card track="interview" className="stack-4">
      <div className="stack-2">
        <p className="eyebrow">{story.subtopic}</p>
        <h3>{story.title}</h3>
      </div>
      <dl className="stack-3">
        <div>
          <dt className="label">Situación</dt>
          <dd>{story.situation}</dd>
        </div>
        {story.task ? (
          <div>
            <dt className="label">Tarea</dt>
            <dd>{story.task}</dd>
          </div>
        ) : null}
        <div>
          <dt className="label">Acción</dt>
          <dd>{story.action}</dd>
        </div>
        <div>
          <dt className="label">Resultado</dt>
          <dd>{story.result}</dd>
        </div>
        {story.learning ? (
          <div>
            <dt className="label">Aprendizaje</dt>
            <dd>{story.learning}</dd>
          </div>
        ) : null}
      </dl>
      <div className="stack-2">
        <p className="label">Esta historia te sirve para…</p>
        <ul className="stack-2">
          {story.usefulFor.map((use) => (
            <li key={use} className="caption">
              · {use}
            </li>
          ))}
        </ul>
      </div>
      <div className="chips">
        {story.competencies.map((competency) => (
          <Badge key={competency} tone="quiet">
            {competency}
          </Badge>
        ))}
      </div>
      <SourceNote source={story} />
    </Card>
  );
}
