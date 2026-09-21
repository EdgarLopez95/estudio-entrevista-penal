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
import { Badge, Button, Card, LevelBadge, SourceNote } from './primitives';
import { SELF_RATING_LABEL } from '@/domain/interviewPractice';
import { RATING_LABEL } from '@/domain/flashcardScheduler';
import { starStory } from '@/content';

/* ------------------------------------------------------------------ Question */

export function QuestionView({
  question,
  initialChosen,
  onAnswer,
  onContinue,
  continueLabel = 'Siguiente',
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
      <div className="stack-2">
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
        <Button variant="primary" onClick={submit} disabled={!selected} block>
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
          </div>

          {(question.deeperDetail || (!correct && selected && question.wrongAnswerExplanations[selected])) ? (
            <details className="disclosure">
              <summary>Ver explicación completa</summary>
              <div className="stack-2" style={{ marginTop: 'var(--space-2)' }}>
                {!correct && selected && question.wrongAnswerExplanations[selected] ? (
                  <p className="caption">{question.wrongAnswerExplanations[selected]}</p>
                ) : null}
                {question.deeperDetail ? <p>{question.deeperDetail}</p> : null}
              </div>
            </details>
          ) : null}

          {onContinue ? (
            <Button variant="primary" onClick={onContinue} block>
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

export function InterviewPromptView({
  prompt,
  onSave,
  saveLabel = 'Siguiente pregunta →',
  presentationMode,
}: {
  prompt: InterviewPrompt;
  onSave: (input: {
    selfRating: SelfRating;
    coveredKeyPointIds: string[];
    usedModelAnswer: boolean;
  }) => void;
  saveLabel?: string;
  presentationMode?: 'study' | 'practice';
}) {
  const [step, setStep] = useState<'prepare' | 'ask' | 'rate'>(
    presentationMode === 'study' ? 'prepare' : 'ask',
  );
  const [rating, setRating] = useState<SelfRating | null>(null);
  const [covered, setCovered] = useState<string[]>([]);
  const [usedModel, setUsedModel] = useState(false);

  useEffect(() => {
    setStep(presentationMode === 'study' ? 'prepare' : 'ask');
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

  if (presentationMode === 'study' || step === 'prepare') {
    return (
      <div className="stack-6">
        <div className="stack-2">
          <h2 className="prompt">{prompt.prompt}</h2>
        </div>

        <div className="stack-2">
          <h3 className="eyebrow">Idea principal</h3>
          <p style={{ fontSize: 'var(--text-body)', fontWeight: 'var(--weight-medium)', lineHeight: 'var(--leading-snug)' }}>
            {prompt.ideaThatMustLand}
          </p>
        </div>

        <div className="stack-2">
          <h3 className="eyebrow">Puntos clave</h3>
          <ul className="stack-2">
            {prompt.keyPoints.map((point) => (
              <li key={point.id}>· {point.text}</li>
            ))}
          </ul>
        </div>

        {prompt.structure && prompt.structure.length > 0 ? (
          <div className="stack-2">
            <h3 className="eyebrow">Cómo organizar la respuesta</h3>
            <ul className="stack-2">
              {prompt.structure.map((part) => (
                <li key={part.label} className="row" style={{ gap: 'var(--space-2)' }}>
                  <strong>{part.label}:</strong> <span>{part.hint}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <details className="disclosure" onToggle={() => setUsedModel(true)}>
          <summary>Ver respuesta completa</summary>
          <div className="stack-3 reading" style={{ marginTop: 'var(--space-3)' }}>
            {prompt.recommendedAnswer.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </details>

        {prompt.avoid.length > 0 ? (
          <details className="disclosure">
            <summary>Qué evitar</summary>
            <ul className="stack-2 avoid-list" style={{ marginTop: 'var(--space-2)' }}>
              {prompt.avoid.map((item) => (
                <li key={item}>
                  <span aria-hidden="true">·</span> {item}
                </li>
              ))}
            </ul>
          </details>
        ) : null}

        {stories.length > 0 ? (
          <details className="disclosure">
            <summary>Historias que te sirven (STAR)</summary>
            <ul className="item-list" style={{ marginTop: 'var(--space-2)' }}>
              {stories.map((story) => (
                <li key={story.id}>
                  <Link className="item-row" to={`/entrevista/star/${story.id}`}>
                    <span className="item-row__content">
                      <span className="item-row__title">{story.title}</span>
                      <span className="item-row__meta">{story.competencies.join(' · ')}</span>
                    </span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </div>
    );
  }

  return (
    <div className="stack-6">
      <div className="stack-2">
        <h2 className="prompt">{prompt.prompt}</h2>
      </div>

      {step === 'ask' ? (
        <div className="stack-5">
          <p className="prompt__hint" style={{ fontSize: 'var(--text-body)', color: 'var(--text-secondary)' }}>
            Inspírate y responde en voz alta antes de continuar.
          </p>
          <Button variant="primary" onClick={() => setStep('rate')} block>
            YA RESPONDÍ
          </Button>
        </div>
      ) : (
        <div className="stack-6">
          <div className="stack-3">
            <h3 className="eyebrow">Puntos que debería haber mencionado</h3>
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
                    {covered.includes(point.id) ? '☑' : '☐'}
                  </span>
                  <span>{point.text}</span>
                </button>
              ))}
            </div>
          </div>

          <fieldset className="stack-3" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="eyebrow" style={{ marginBottom: 'var(--space-2)' }}>¿Cómo te salió?</legend>
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
          </fieldset>

          <details className="disclosure" onToggle={() => setUsedModel(true)}>
            <summary>Ver respuesta modelo</summary>
            <div className="stack-3 reading" style={{ marginTop: 'var(--space-3)' }}>
              {prompt.recommendedAnswer.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </details>

          <Button
            variant="primary"
            disabled={!rating}
            block
            onClick={() =>
              rating &&
              onSave({ selfRating: rating, coveredKeyPointIds: covered, usedModelAnswer: usedModel })
            }
          >
            {saveLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------- Lesson */

export function LessonView({
  lesson,
  onStudied,
  continueLabel = 'Entendido, continuar',
}: {
  lesson: Lesson;
  onStudied?: () => void;
  continueLabel?: string;
}) {
  return (
    <div className="stack-6">
      <div className="stack-2">
        <h2>{lesson.title}</h2>
      </div>

      <div className="stack-2">
        <h3 className="eyebrow">Idea esencial</h3>
        <p style={{ fontSize: 'var(--text-h3)', lineHeight: 'var(--leading-snug)', fontWeight: 'var(--weight-medium)' }}>
          {lesson.essentialIdea}
        </p>
      </div>

      <div className="stack-3 reading">
        <h3 className="eyebrow">Explicación breve</h3>
        {lesson.explanation.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {lesson.difference ? (
        <Card variant="quiet" className="stack-2">
          <h3 className="eyebrow">Diferencia visual simple</h3>
          <p>
            <strong>{lesson.difference.a}</strong> vs. <strong>{lesson.difference.b}</strong>
          </p>
          <p className="caption">{lesson.difference.distinction}</p>
        </Card>
      ) : null}

      {lesson.sourceExample ? (
        <div className="stack-2">
          <h3 className="eyebrow">Ejemplo</h3>
          <p className="reading">{lesson.sourceExample}</p>
        </div>
      ) : null}

      {lesson.whatToRemember && lesson.whatToRemember.length > 0 ? (
        <details className="disclosure">
          <summary>Ver más detalle</summary>
          <div className="stack-2" style={{ marginTop: 'var(--space-2)' }}>
            <p className="eyebrow">Qué recordar</p>
            <ul className="stack-2">
              {lesson.whatToRemember.map((item) => (
                <li key={item} className="row" style={{ gap: 'var(--space-2)', alignItems: 'baseline' }}>
                  <span aria-hidden="true" className="caption">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </details>
      ) : null}

      <SourceNote source={lesson} />

      {onStudied ? (
        <Button variant="primary" onClick={onStudied}>
          {continueLabel}
        </Button>
      ) : null}
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
