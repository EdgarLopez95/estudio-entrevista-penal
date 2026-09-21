import { useMemo, useState } from 'react';
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
import { CaseView, ChecklistView } from '@/components/practice';
import { useProgress, useStore } from '@/state/StoreProvider';
import { CASES, CHECKLIST_RESOURCES, getResource, INTERVIEW_PROMPTS, LESSONS } from '@/content';
import { CASE_PRIORITY_ORDER, LEGAL_NOTICE } from '@/content/penal/cases';
import { getObjective } from '@/content/objectives';
import { GAP_LABEL, activeErrors, orderErrors } from '@/domain/errors';
import { buildSession } from '@/domain/sessionBuilder';
import { coreReadinessPenal } from '@/domain/readiness';
import { MOCK_BLUEPRINTS } from '@/domain/blueprints';
import { SOURCE_MANIFEST } from '@/content/sources/traceability';
import { STORAGE_KEY } from '@/storage/repository';
import { TIME_BUDGET_OPTIONS, interviewPhase, phaseLabel } from '@/domain/time';
import { IconTrash, IconCheck, IconAlert, IconClock } from '@/components/icons';
import type { MockProfile } from '@/domain/types';

/* --------------------------------------------------------------- Mis errores */

export function ErrorsScreen() {
  const progress = useProgress();
  const store = useStore();
  const navigate = useNavigate();
  const [includeDeepening, setIncludeDeepening] = useState(false);

  const ordered = useMemo(
    () => orderErrors(activeErrors(progress), { includeDeepening }),
    [progress, includeDeepening],
  );

  function practiceErrors() {
    const built = buildSession({
      state: progress,
      mode: 'errors',
      timeBudget: progress.preferences.lastTimeBudget,
    });
    if (built.items.length === 0) return;
    store.startSession(built);
    navigate('/sesion');
  }

  return (
    <div className="stack-6">
      <header className="stack-3">
        <p className="eyebrow">Corrección sostenida</p>
        <h1>Mis errores</h1>
        <p className="reading">
          Acertar una vez no borra un error: hace falta volver a acertarlo en otro intento. Primero
          aparece lo crítico de Nivel 1.
        </p>
        <div className="row">
          <Button variant="primary" onClick={practiceErrors} disabled={ordered.length === 0}>
            Repasar errores · <Minutes value={10} />
          </Button>
          <Button onClick={() => setIncludeDeepening((value) => !value)}>
            {includeDeepening ? 'Ocultar Nivel 3' : 'Incluir Nivel 3 (profundizar)'}
          </Button>
        </div>
      </header>

      {ordered.length === 0 ? (
        <EmptyState
          title="No hay errores activos"
          description="Cuando falles una pregunta, dudes en una flashcard o una respuesta quede parcial, aparecerá aquí."
        />
      ) : (
        <ul className="item-list">
          {ordered.map((error) => {
            const resource = getResource(error.resourceId);
            const objective = getObjective(error.objectiveId);
            const href =
              resource?.type === 'interview-prompt'
                ? `/entrevista/prompt/${resource.id}`
                : resource?.type === 'lesson'
                  ? `/penal/leccion/${resource.id}`
                  : resource?.type === 'case'
                    ? `/casos/${resource.id}`
                    : null;
            const body = (
              <>
                <span className="item-row__content">
                  <span className="item-row__title">{error.title}</span>
                  <span className="item-row__meta">
                    {GAP_LABEL[error.kind]} · {objective?.title ?? error.topic} · intentos{' '}
                    {error.attempts} · aciertos posteriores {error.laterCorrect}
                  </span>
                  {error.lastResponse ? (
                    <span className="item-row__meta">Tu respuesta: {error.lastResponse}</span>
                  ) : null}
                </span>
                <Badge tone={error.status === 'active' ? 'error' : 'warning'}>
                  {error.status === 'active' ? 'Activo' : 'Mejorando'}
                </Badge>
              </>
            );
            return (
              <li key={error.id}>
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
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ Progreso */

export function ProgressScreen() {
  const progress = useProgress();

  const interviewPromptsLevel1 = useMemo(
    () => INTERVIEW_PROMPTS.filter((p) => p.level === 1),
    [],
  );
  const interviewTotal = interviewPromptsLevel1.length;
  const interviewPracticed = interviewPromptsLevel1.filter(
    (p) => (progress.interview[p.id]?.length ?? 0) > 0,
  ).length;
  const interviewStudied = interviewPromptsLevel1.filter(
    (p) =>
      (progress.interview[p.id]?.length ?? 0) > 0 ||
      Boolean(progress.objectives[p.learningObjectiveId]?.lessonStudiedAt),
  ).length;
  const interviewToReinforce = interviewPromptsLevel1.filter((p) => {
    const attempts = progress.interview[p.id] ?? [];
    if (attempts.length === 0) return false;
    const last = attempts[attempts.length - 1];
    return last.selfRating === 'blank' || last.selfRating === 'partial';
  }).length;

  const penalLessonsLevel1 = useMemo(
    () => LESSONS.filter((l) => l.level === 1),
    [],
  );
  const penalTotal = penalLessonsLevel1.length;
  const penalStatuses = useMemo(
    () => coreReadinessPenal(progress).statuses,
    [progress],
  );
  const penalStudied = penalLessonsLevel1.filter((l) =>
    Boolean(progress.objectives[l.learningObjectiveId]?.lessonStudiedAt),
  ).length;
  const penalMastered = penalStatuses.filter((s) => s.mastery === 'mastered').length;
  const penalNeedsReview = penalStatuses.filter((s) => s.mastery === 'needs-review').length;

  return (
    <div className="stack-6" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="stack-2">
        <h1>Tu progreso</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Avance real en los contenidos esenciales para tu entrevista.
        </p>
      </div>

      <div className="stack-4">
        <Card className="stack-3" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: 'var(--text-h3)', letterSpacing: '-0.01em' }}>
            ENTREVISTA ESENCIAL
          </h2>
          <div className="stack-2" style={{ fontSize: 'var(--text-body)' }}>
            <p>
              <strong>{interviewStudied}</strong> de {interviewTotal} estudiadas
            </p>
            <p>
              <strong>{interviewPracticed}</strong> practicadas
            </p>
            {interviewToReinforce > 0 ? (
              <p style={{ color: 'var(--color-warning, #e67e22)' }}>
                <strong>{interviewToReinforce}</strong> por reforzar
              </p>
            ) : null}
          </div>
        </Card>

        <Card className="stack-3" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: 'var(--text-h3)', letterSpacing: '-0.01em' }}>
            PENAL ESENCIAL
          </h2>
          <div className="stack-2" style={{ fontSize: 'var(--text-body)' }}>
            <p>
              <strong>{penalStudied}</strong> de {penalTotal} estudiados
            </p>
            <p>
              <strong>{penalMastered}</strong> dominados
            </p>
            {penalNeedsReview > 0 ? (
              <p style={{ color: 'var(--color-warning, #e67e22)' }}>
                <strong>{penalNeedsReview}</strong> por repasar
              </p>
            ) : null}
          </div>
        </Card>
      </div>

      {progress.sessions.length > 0 ? (
        <section className="stack-3" style={{ marginTop: 'var(--space-4)' }}>
          <h3 className="eyebrow">Sesiones completadas recientemente</h3>
          <ul className="item-list">
            {[...progress.sessions].reverse().slice(0, 5).map((s) => (
              <li key={s.sessionId} className="item-row">
                <span>
                  <span className="item-row__title">{s.label}</span>
                  <span className="item-row__meta">
                    {s.answeredCount} de {s.itemCount} ítems · {new Date(s.completedAt).toLocaleDateString('es-CO')}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}



/* --------------------------------------------------------------------- Casos */

export function CasesScreen() {
  const progress = useProgress();
  const ordered = useMemo(() => {
    const byId = new Map(CASES.map((c) => [c.id, c]));
    const priority = CASE_PRIORITY_ORDER.map((id) => byId.get(id)).filter(Boolean);
    const rest = CASES.filter((c) => !CASE_PRIORITY_ORDER.includes(c.id));
    return [...priority, ...rest] as typeof CASES;
  }, []);

  const visible = ordered.filter(
    (c) => c.level === 1 || progress.preferences.includeLevel2 || c.level === 2,
  );

  return (
    <div className="stack-6">
      <header className="stack-3">
        <p className="eyebrow">Análisis por elementos</p>
        <h1>Casos</h1>
        <p className="reading">
          Los casos son abiertos: se analizan por elementos y no se marcan correctos ni incorrectos.
          Nunca se finge una sentencia.
        </p>
      </header>

      <Notice>
        En modo Primera entrevista los casos van después de los fundamentos y del frente de
        entrevista: no desplazan Nivel 1.
      </Notice>

      <ul className="item-list">
        {visible.map((caseResource) => (
          <li key={caseResource.id}>
            <Link className="item-row" to={`/casos/${caseResource.id}`}>
              <span>
                <span className="item-row__title">{caseResource.title}</span>
                <span className="item-row__meta">
                  {caseResource.subtopic} · {caseResource.steps.length} pasos ·{' '}
                  {caseResource.estimatedMinutes} min
                </span>
              </span>
              <Badge tone={caseResource.level === 1 ? 'critical' : 'quiet'}>
                {caseResource.level === 1 ? 'Nivel 1' : `Nivel ${caseResource.level}`}
              </Badge>
            </Link>
          </li>
        ))}
      </ul>

      <Card variant="quiet" className="stack-2">
        <Badge tone="quiet">Aviso</Badge>
        <p className="caption">{LEGAL_NOTICE.sourceExcerpt}</p>
      </Card>
    </div>
  );
}

export function CaseDetailScreen() {
  const { caseId } = useParams();
  const store = useStore();
  const progress = useProgress();
  const navigate = useNavigate();
  const [checked, setChecked] = useState<Record<string, string[]>>({});
  const resource = caseId ? getResource(caseId) : undefined;

  const hasActiveSession = Boolean(
    progress.activeSession && progress.activeSession.status === 'active'
  );

  function handleBack() {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else if (hasActiveSession) {
      navigate('/sesion');
    } else {
      navigate('/casos');
    }
  }

  if (!resource || resource.type !== 'case') {
    return (
      <EmptyState
        title="Ese caso no está disponible"
        action={<Button variant="primary" onClick={handleBack}>Volver</Button>}
      />
    );
  }

  const expectedTotal = resource.steps.reduce(
    (total, step) => total + (step.elementsToConsider?.length ?? 0),
    0,
  );

  return (
    <div className="stack-6">
      <div>
        <button type="button" className="btn btn--tertiary" onClick={handleBack}>
          ← {hasActiveSession ? 'Volver a la sesión' : 'Volver'}
        </button>
      </div>
      <CaseView
        caseResource={resource}
        checked={checked}
        onToggle={(stepId, elementId) =>
          setChecked((current) => {
            const list = current[stepId] ?? [];
            return {
              ...current,
              [stepId]: list.includes(elementId)
                ? list.filter((id) => id !== elementId)
                : [...list, elementId],
            };
          })
        }
        onComplete={() =>
          store.recordCaseStep(resource.id, checked, { expectedTotal, completed: true })
        }
      />
      <div style={{ marginTop: 'var(--space-4)' }}>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={handleBack}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {hasActiveSession ? 'Volver a la sesión' : 'Volver'}
        </button>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- Simulacro */

export function MockScreen() {
  const progress = useProgress();
  const store = useStore();
  const navigate = useNavigate();

  function start(profile: MockProfile) {
    if (profile === 'full') return;
    const built = buildSession({
      state: progress,
      mode: profile === 'quick' ? 'mock-quick' : 'mock-standard',
      timeBudget: profile === 'quick' ? 10 : 30,
    });
    store.startSession(built, { mockProfile: profile });
    navigate('/sesion');
  }

  return (
    <div className="stack-6">
      <header className="stack-3">
        <p className="eyebrow">Entrenamiento</p>
        <h1>Simulacro</h1>
        <p className="reading">
          Son perfiles de entrenamiento, no una predicción de lo que preguntará el entrevistador. El
          resultado se muestra separado: conocimiento Penal, casos, preparación de entrevista y
          errores prioritarios.
        </p>
      </header>

      <div className="grid-2">
        {(['quick', 'standard'] as MockProfile[]).map((profile) => {
          const blueprint = MOCK_BLUEPRINTS[profile];
          return (
            <Card key={profile} className="stack-3">
              <div className="stack-2">
                <p className="eyebrow">~{blueprint.approximateMinutes} min</p>
                <h2>{blueprint.label}</h2>
                <p className="caption">{blueprint.description}</p>
              </div>
              <Button variant="primary" onClick={() => start(profile)}>
                Empezar {blueprint.label}
              </Button>
            </Card>
          );
        })}
      </div>

      <Card variant="quiet" className="stack-2">
        <h2>{MOCK_BLUEPRINTS.full.label}</h2>
        <p className="caption">{MOCK_BLUEPRINTS.full.description}</p>
        <Badge tone="quiet">Requiere solicitud explícita · no está en P0</Badge>
      </Card>

      {progress.mocks.length > 0 ? (
        <section className="stack-3">
          <SectionHeading eyebrow="Historial" title="Simulacros anteriores" />
          <ul className="item-list">
            {[...progress.mocks].reverse().map((mock) => (
              <li key={mock.id} className="item-row">
                <span>
                  <span className="item-row__title">{MOCK_BLUEPRINTS[mock.profile].label}</span>
                  <span className="item-row__meta">
                    {new Date(mock.at).toLocaleString('es-CO')} · Penal {mock.penal.correct}/
                    {mock.penal.answered} · Entrevista {mock.interview.covered}/
                    {mock.interview.possible}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------ Repaso antes de salir */

export function ExitReviewScreen() {
  const progress = useProgress();
  const store = useStore();
  const navigate = useNavigate();

  const built = useMemo(
    () => buildSession({ state: progress, mode: 'exit-review', timeBudget: 20 }),
    [progress],
  );

  function start() {
    store.startSession(built);
    navigate('/sesion');
  }

  return (
    <div className="stack-6">
      <header className="stack-3">
        <p className="eyebrow">Antes de salir</p>
        <h1>Repaso antes de salir</h1>
        <p className="reading">
          Preguntas personales difíciles, dos STAR, Penal esencial, tus errores críticos recientes,
          salario, disponibilidad y las preguntas que harás al despacho. Sin temas nuevos, sin Nivel
          3 y sin casos extensos.
        </p>
        <Button variant="primary" onClick={start}>
          Empezar repaso · {built.items.length} actividades
        </Button>
      </header>

      <ol className="plan">
        {built.items
          .filter((item) => getResource(item.resourceId)?.type !== 'checklist')
          .map((item, index) => {
            const resource = getResource(item.resourceId);
            if (!resource) return null;
            return (
              <li key={item.resourceId} className="plan__item">
                <span className="plan__index" aria-hidden="true">
                  {index + 1}
                </span>
                <span className="plan__label">
                  <strong>
                    {resource.type === 'interview-prompt' ? resource.prompt : resource.title}
                  </strong>
                  <span className="item-row__meta">{resource.topic}</span>
                </span>
                <span className="plan__minutes">{resource.estimatedMinutes} min</span>
              </li>
            );
          })}
      </ol>
      <p className="caption">
        Al final del repaso aparecen las listas rápidas: lo que no conviene decir, frases para ganar
        un segundo y tus preguntas al despacho.
      </p>

      <section className="stack-3">
        <SectionHeading eyebrow="Recordatorios" title="Listas rápidas" />
        {CHECKLIST_RESOURCES.filter((c) => c.level !== 'reference').map((checklist) => (
          <Card key={checklist.id} variant="quiet">
            <ChecklistView
              checklist={checklist}
              checkedItemIds={progress.checklists[checklist.id] ?? []}
              onToggle={(itemId) => store.toggleChecklistItem(checklist.id, itemId)}
            />
          </Card>
        ))}
      </section>
    </div>
  );
}

/* --------------------------------------------------------------- Referencia */

export function ReferenceScreen() {
  const progress = useProgress();
  const store = useStore();
  const reference = CHECKLIST_RESOURCES.filter((c) => c.level === 'reference');

  return (
    <div className="stack-6">
      <header className="stack-3">
        <p className="eyebrow">Consulta</p>
        <h1>Referencia</h1>
        <p className="reading">
          Artículos exactos y normas centrales. No integra el plan activo ni los indicadores
          principales: está aquí para consultar cuando lo necesites.
        </p>
      </header>

      {reference.map((checklist) => (
        <Card key={checklist.id}>
          <ChecklistView
            checklist={checklist}
            checkedItemIds={progress.checklists[checklist.id] ?? []}
            onToggle={(itemId) => store.toggleChecklistItem(checklist.id, itemId)}
          />
        </Card>
      ))}

      <section className="stack-3">
        <SectionHeading eyebrow="Trazabilidad" title="Fuentes del corpus" />
        <ul className="item-list">
          {Object.values(SOURCE_MANIFEST).map((source) => (
            <li key={source.id} className="item-row">
              <span>
                <span className="item-row__title">{source.title}</span>
                <span className="item-row__meta">
                  {source.id} · {source.relativePath} · gobierna: {source.governs}
                </span>
                <span className="item-row__meta mono">SHA-256 {source.sha256.slice(0, 16)}…</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <Card variant="quiet" className="stack-2">
        <Badge tone="quiet">Aviso</Badge>
        <p className="caption">{LEGAL_NOTICE.sourceExcerpt}</p>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------- Preferencias */

export function PreferencesScreen() {
  const progress = useProgress();
  const store = useStore();
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const phase = interviewPhase(progress.targetInterview);

  return (
    <div className="stack-8">
      <header className="stack-3">
        <p className="eyebrow">Control</p>
        <h1>Preferencias</h1>
      </header>

      <section className="stack-4">
        <SectionHeading eyebrow="Apariencia" title="Tema" />
        <div className="segmented" role="group" aria-label="Tema de la interfaz">
          {(['system', 'light', 'dark'] as const).map((value) => (
            <button
              key={value}
              type="button"
              className="segmented__option"
              aria-pressed={progress.preferences.theme === value}
              onClick={() => store.setTheme(value)}
            >
              {value === 'system' ? 'Del sistema' : value === 'light' ? 'Claro' : 'Oscuro'}
            </button>
          ))}
        </div>
      </section>

      <section className="stack-4">
        <SectionHeading eyebrow="Entrevista" title="Fecha objetivo" />
        <Card className="stack-4">
          <div className="switch-row">
            <input
              id="target-enabled"
              type="checkbox"
              checked={progress.targetInterview.enabled}
              onChange={(event) => store.setTargetInterview({ enabled: event.target.checked })}
            />
            <label htmlFor="target-enabled">
              <strong>Tengo una fecha de entrevista</strong>
              <span className="caption" style={{ display: 'block' }}>
                Solo con la fecha configurada la aplicación puede decir «Mañana es tu entrevista».
                Después de la fecha sigue siendo usable en modo estudio.
              </span>
            </label>
          </div>
          <div className="field">
            <label htmlFor="target-date" className="label">
              Fecha
            </label>
            <input
              id="target-date"
              type="date"
              value={progress.targetInterview.date ?? ''}
              onChange={(event) => store.setTargetInterview({ date: event.target.value || null })}
            />
          </div>
          <div className="field">
            <label htmlFor="target-time" className="label">
              Hora
            </label>
            <input
              id="target-time"
              type="time"
              value={progress.targetInterview.time ?? '14:00'}
              onChange={(event) => store.setTargetInterview({ time: event.target.value || null })}
            />
          </div>
          <div className="field">
            <label htmlFor="target-title" className="label">
              Título
            </label>
            <input
              id="target-title"
              type="text"
              value={progress.targetInterview.title}
              onChange={(event) => store.setTargetInterview({ title: event.target.value })}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <IconClock size={16} color="var(--primary)" />
            <p className="caption" style={{ margin: 0, fontWeight: 'var(--weight-medium)' }}>
              Estado actual: {phaseLabel(phase, progress.targetInterview)}
            </p>
          </div>
        </Card>
      </section>

      <section className="stack-4">
        <SectionHeading eyebrow="Ruta" title="Profundidad y tiempo" />
        <Card className="stack-4">
          <div className="switch-row">
            <input
              id="include-level2"
              type="checkbox"
              checked={progress.preferences.includeLevel2}
              onChange={(event) => store.setIncludeLevel2(event.target.checked)}
            />
            <label htmlFor="include-level2">
              <strong>Incluir Nivel 2 en las sesiones</strong>
              <span className="caption" style={{ display: 'block' }}>
                Profundizar requiere elección explícita. Nivel 1 nunca recibe preguntas ni feedback
                de Nivel 2 o 3.
              </span>
            </label>
          </div>
          <div className="field">
            <span className="label">Tiempo por defecto</span>
            <div className="time-select" role="group" aria-label="Tiempo por defecto">
              {TIME_BUDGET_OPTIONS.map((option) => (
                <button
                  key={String(option.value)}
                  type="button"
                  className="time-select__option"
                  aria-pressed={progress.preferences.lastTimeBudget === option.value}
                  onClick={() => store.setTimeBudget(option.value)}
                >
                  {option.short}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section className="stack-4">
        <SectionHeading eyebrow="Datos" title="Privacidad y almacenamiento" />
        <Card className="stack-4">
          <p className="caption">
            Todo se guarda en el almacenamiento local de este navegador, bajo la clave{' '}
            <span className="mono">{STORAGE_KEY}</span>. No hay cuenta, servidor, analítica, IA ni
            recursos remotos en ejecución. El progreso del PC y el del móvil son independientes y no
            se sincronizan.
          </p>

          {resetDone ? (
            <div
              className="stack-2"
              style={{
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-control)',
                background: 'var(--success-soft, #e6f7ed)',
                border: '1px solid var(--success, #1b873f)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
              }}
            >
              <IconCheck size={20} color="var(--success, #1b873f)" />
              <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--text-primary)', fontWeight: 'var(--weight-medium)' }}>
                Progreso borrado correctamente. Tu app ha vuelto al estado inicial.
              </span>
            </div>
          ) : confirmReset ? (
            <div
              className="stack-3"
              style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-control)',
                background: 'var(--surface-2)',
                border: '1px solid var(--outline-strong)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <IconAlert size={20} color="var(--accent-strong, #b42318)" />
                <strong style={{ fontSize: 'var(--text-body-sm)' }}>¿Confirmas borrar todo tu progreso?</strong>
              </div>
              <p className="caption">
                Esto restablece tus respuestas, estadísticas y sesiones de este navegador. Se conserva una copia automática de seguridad en el navegador por si fue un error.
              </p>
              <div className="row" style={{ gap: 'var(--space-3)' }}>
                <button
                  type="button"
                  className="btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    background: 'var(--accent-strong, #b42318)',
                    color: '#fff',
                    borderColor: 'var(--accent-strong, #b42318)',
                  }}
                  onClick={() => {
                    store.resetAll();
                    setConfirmReset(false);
                    setResetDone(true);
                  }}
                >
                  <IconTrash size={18} />
                  <span>Confirmar: Borrar progreso</span>
                </button>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => setConfirmReset(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div>
              <button
                type="button"
                className="btn btn--secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  color: 'var(--accent-strong, #b42318)',
                  borderColor: 'var(--outline-strong)',
                }}
                onClick={() => {
                  setConfirmReset(true);
                  setResetDone(false);
                }}
              >
                <IconTrash size={18} />
                <span>Borrar progreso</span>
              </button>
            </div>
          )}

          {store.notes.length > 0 ? (
            <ul className="stack-2" style={{ marginTop: 'var(--space-2)' }}>
              {store.notes.map((note) => (
                <li key={note} className="caption">
                  · {note}
                </li>
              ))}
            </ul>
          ) : null}
        </Card>
      </section>
    </div>
  );
}

/* --------------------------------------------------------------------- Más */

export function MoreScreen() {
  return (
    <div className="stack-6">
      <header className="stack-2">
        <h1>Más</h1>
        <p className="caption">Todo lo que no cabe en la barra inferior.</p>
      </header>
      <ul className="item-list">
        {[
          { to: '/ruta', label: 'Ruta de estudio', meta: 'Corpus completo por nivel y frente' },
          { to: '/casos', label: 'Casos', meta: 'Análisis por elementos' },
          { to: '/simulacro', label: 'Simulacro', meta: 'Quick y Standard' },
          { to: '/errores', label: 'Mis errores', meta: 'Corrección sostenida' },
          { to: '/progreso', label: 'Progreso', meta: 'Core Readiness y cobertura' },
          { to: '/repaso-final', label: 'Repaso antes de salir', meta: 'Lo último antes de la entrevista' },
          { to: '/referencia', label: 'Referencia', meta: 'Artículos y fuentes' },
          { to: '/preferencias', label: 'Preferencias', meta: 'Tema, fecha, nivel y datos' },
        ].map((item) => (
          <li key={item.to}>
            <Link className="item-row" to={item.to}>
              <span>
                <span className="item-row__title">{item.label}</span>
                <span className="item-row__meta">{item.meta}</span>
              </span>
              <span aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function NotFoundScreen() {
  return (
    <EmptyState
      title="Esa página no existe"
      description="Vuelve a Inicio para continuar con lo que necesitas estudiar ahora."
      action={<LinkButton to="/" variant="primary">Volver a Inicio</LinkButton>}
    />
  );
}
