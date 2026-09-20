import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { App } from '@/app/App';
import { StoreProvider } from '@/state/StoreProvider';
import { ProgressStore } from '@/state/store';
import { createEmptyProgress } from '@/domain/progress';
import { CONTENT_VERSION } from '@/domain/types';
import { promptState } from '@/domain/interviewPractice';
import { requireResource } from '@/content';
import { activeErrors } from '@/domain/errors';
import { toLocalDateKey } from '@/domain/time';

function renderApp(initialEntries: string[] = ['/']) {
  const store = new ProgressStore(
    createEmptyProgress(new Date().toISOString(), CONTENT_VERSION),
  );
  const view = render(
    <StoreProvider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="*" element={<App />} />
        </Routes>
      </MemoryRouter>
    </StoreProvider>,
  );
  return { store, view };
}

beforeEach(() => {
  localStorage.clear();
});

describe('P0-A: Home → Háblame de ti → práctica oral → guardar progreso', () => {
  it('Inicio permite escoger un bloque libre sin escoger tiempo', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('button', { name: 'Estudiar' }));
    await user.click(screen.getByRole('button', { name: 'Entrevista' }));
    expect(screen.getByRole('button', { name: 'Esenciales' })).toBeInTheDocument();
  });

  it('elige una vez el modo de una sesión continua de entrevista', async () => {
    const user = userEvent.setup();
    const { store } = renderApp(['/entrevista']);

    expect(screen.getByRole('button', { name: 'Estudiar / Prepararme' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Practicar / Ensayar' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Estudiar / Prepararme' }));

    expect(store.getState().activeSession?.presentationMode).toBe('study');
    expect(screen.getAllByText('1 de 10').length).toBeGreaterThan(0);
  });

  it('al avanzar en sesión vuelve al inicio y ofrece anterior arriba y abajo', async () => {
    const user = userEvent.setup();
    const scrollTo = window.scrollTo;
    const calls: unknown[][] = [];
    window.scrollTo = ((...args: unknown[]) => { calls.push(args); }) as typeof window.scrollTo;
    const { store } = renderApp(['/entrevista']);
    await user.click(screen.getByRole('button', { name: 'Estudiar / Prepararme' }));
    expect(screen.getAllByRole('button', { name: 'Siguiente →' })).toHaveLength(2);
    calls.length = 0;
    await user.click(screen.getAllByRole('button', { name: 'Siguiente →' })[0]);

    expect(store.getState().activeSession?.currentIndex).toBe(1);
    expect(calls.length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: '← Anterior' }).length).toBeGreaterThan(1);
    window.scrollTo = scrollTo;
  });

  it('el primer uso no muestra un dashboard vacío y ofrece comenzar por lo esencial', () => {
    renderApp();
    expect(screen.getByText('Tu preparación comienza por lo esencial')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Háblame de ti' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Comenzar preparación/ })).toBeInTheDocument();
    // No aparece el total del corpus como deuda.
    expect(screen.queryByText(/temas pendientes/i)).toBeNull();
  });

  it('el primer viewport móvil incluye contexto, recomendación, CTA, minutos y Core Readiness', () => {
    renderApp();
    // Contexto y modo en la barra superior.
    expect(screen.getByText(/Modo Primera entrevista/)).toBeInTheDocument();
    // Recomendación dominante con su causa.
    expect(screen.getByRole('heading', { level: 1, name: 'Háblame de ti' })).toBeInTheDocument();
    expect(screen.getByText(/Es la primera pregunta/)).toBeInTheDocument();
    const cta = screen.getByRole('button', { name: /Comenzar preparación/ });
    expect(cta.textContent).toMatch(/\d+ min/);
    expect(screen.getByText('Entrevista', { selector: '.meter__name' })).toBeInTheDocument();
    expect(screen.getByText('Penal', { selector: '.meter__name' })).toBeInTheDocument();
  });

  it('permite prepararse antes de practicar una respuesta y guarda el progreso', async () => {
    const user = userEvent.setup();
    const { store } = renderApp();

    await user.click(screen.getByRole('button', { name: /Comenzar preparación/ }));

    // Primero la persona decide si quiere estudiar o simular la respuesta.
    expect(screen.getByText('La entrevistadora pregunta')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Háblame de ti.' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Prepararme primero' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Practicar ahora' })).toBeInTheDocument();
    expect(screen.queryByText('¿Qué cubrí?')).toBeNull();

    // La guía se puede consultar antes del intento y da paso directo a la práctica.
    await user.click(screen.getByRole('button', { name: 'Prepararme primero' }));
    expect(screen.getByText('Idea que debe quedar')).toBeInTheDocument();
    expect(screen.getByText(/Ver respuesta modelo/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Practicar ahora' }));

    // Tras el intento aparece la autoevaluación y la guía para comparar.
    await user.click(screen.getByRole('button', { name: 'He respondido' }));
    expect(screen.getByText('¿Cómo te salió?')).toBeInTheDocument();
    expect(screen.getByText('¿Qué cubrí?')).toBeInTheDocument();
    expect(screen.getByText(/Ver respuesta modelo/)).toBeInTheDocument();

    // Guardar está deshabilitado hasta autoevaluarse.
    const save = screen.getByRole('button', { name: 'Guardar intento' });
    expect(save).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Bien' }));
    const prompt = requireResource('P-INT-001');
    if (prompt.type !== 'interview-prompt') throw new Error('prompt');
    for (const point of prompt.keyPoints.filter((k) => k.essential).slice(0, 5)) {
      await user.click(screen.getByRole('button', { name: new RegExp(point.text.slice(0, 20)) }));
    }
    await user.click(screen.getByRole('button', { name: 'Guardar intento' }));

    // El progreso queda registrado y persistido.
    const state = store.getState();
    expect(state.interview['P-INT-001']).toHaveLength(1);
    expect(state.interview['P-INT-001'][0].selfRating).toBe('good');
    expect(state.objectives['LO-INT-001'].recalls).toHaveLength(1);
    expect(promptState(state, prompt, false)).toBe('good-not-consolidated');
    expect(localStorage.getItem('estudio.progreso.v1')).toContain('P-INT-001');
  });

  it('una respuesta en blanco crea un error de expresión y la recomendación cambia', async () => {
    const user = userEvent.setup();
    const { store } = renderApp();

    await user.click(screen.getByRole('button', { name: /Comenzar preparación/ }));
    await user.click(screen.getByRole('button', { name: 'Practicar ahora' }));
    await user.click(screen.getByRole('button', { name: 'He respondido' }));
    await user.click(screen.getByRole('button', { name: 'Me quedé en blanco' }));
    await user.click(screen.getByRole('button', { name: 'Guardar intento' }));

    const errors = activeErrors(store.getState());
    expect(errors.some((e) => e.kind === 'interview-expression-gap')).toBe(true);
    expect(errors.some((e) => e.kind === 'interview-content-gap')).toBe(true);
  });
});

describe('selector de tiempo y plan de hoy', () => {
  it('muestra una etiqueta legible para cada actividad del plan', () => {
    renderApp();
    expect(screen.getByText(/Práctica oral · Háblame de ti/)).toBeInTheDocument();
  });

  it('elegir 10 minutos produce una sesión corta que cabe en el tiempo', async () => {
    const user = userEvent.setup();
    const { store } = renderApp();

    await user.click(screen.getByRole('button', { name: '10 min' }));
    expect(store.getState().preferences.lastTimeBudget).toBe(10);

    const planText = screen.getByText(/actividades · ~/);
    expect(planText.textContent).toMatch(/[3-5] actividades/);

    await user.click(screen.getByRole('button', { name: 'Seguir plan recomendado' }));
    const session = store.getState().activeSession;
    expect(session).not.toBeNull();
    expect(session?.items.length).toBeLessThanOrEqual(5);
    expect(session?.scope.timeBudget).toBe(10);
    expect(session?.scope.maxLevel).toBe(1);
  });

  it('20 minutos ofrece un plan más largo que 10', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('button', { name: '10 min' }));
    const ten = screen.getByText(/actividades · ~/).textContent ?? '';
    await user.click(screen.getByRole('button', { name: '20 min' }));
    const twenty = screen.getByText(/actividades · ~/).textContent ?? '';
    const count = (text: string) => Number(text.match(/(\d+) actividades/)?.[1] ?? 0);
    expect(count(twenty)).toBeGreaterThan(count(ten));
  });
});

describe('quiz Penal Nivel 1: feedback, errores y corrección', () => {
  it('no revela la respuesta antes de enviar y conserva la elección después', async () => {
    const user = userEvent.setup();
    const { store } = renderApp(['/practica']);

    await user.click(screen.getByRole('button', { name: /Empezar quiz/ }));

    const options = screen.getAllByRole('radio');
    expect(options.length).toBeGreaterThanOrEqual(3);
    // Antes de enviar no hay marca de corrección.
    expect(screen.queryByText(/Correcta$/)).toBeNull();

    await user.click(options[0]);
    await user.click(screen.getByRole('button', { name: 'Comprobar' }));

    // Después conserva elección y correcta con icono + texto, no solo color.
    expect(screen.getByText(/✓ Correcta/)).toBeInTheDocument();
    const state = store.getState();
    const answered = Object.values(state.questions).flat();
    expect(answered).toHaveLength(1);
  });

  it('una respuesta incorrecta registra el error y aparece en Mis errores', async () => {
    const user = userEvent.setup();
    const { store } = renderApp(['/practica']);

    await user.click(screen.getByRole('button', { name: /Empezar quiz/ }));

    const session = store.getState().activeSession;
    const first = session?.items[0];
    const question = requireResource(first!.resourceId);
    if (question.type !== 'question') throw new Error('se esperaba una pregunta');
    const wrongIndex = question.options.findIndex((o) => o.id !== question.correctOptionId);

    const options = screen.getAllByRole('radio');
    await user.click(options[wrongIndex]);
    await user.click(screen.getByRole('button', { name: 'Comprobar' }));

    expect(screen.getByText('Este concepto necesita repaso')).toBeInTheDocument();
    const errors = activeErrors(store.getState());
    expect(errors).toHaveLength(1);
    expect(errors[0].resourceId).toBe(question.id);
  });
});

describe('continuidad de sesión (contrato §15)', () => {
  it('tras recargar, la sesión activa continúa en la misma posición', async () => {
    const user = userEvent.setup();
    const { store, view } = renderApp(['/practica']);

    await user.click(screen.getByRole('button', { name: /Empezar quiz/ }));
    const options = screen.getAllByRole('radio');
    await user.click(options[0]);
    await user.click(screen.getByRole('button', { name: 'Comprobar' }));
    await user.click(screen.getByRole('button', { name: /Siguiente|Terminar sesión/ }));

    const before = store.getState().activeSession;
    expect(before?.currentIndex).toBe(1);

    // Simula recarga: nuevo store leyendo del almacenamiento local.
    view.unmount();
    const reloaded = new ProgressStore();
    expect(reloaded.getState().activeSession?.sessionId).toBe(before?.sessionId);
    expect(reloaded.getState().activeSession?.currentIndex).toBe(1);

    render(
      <StoreProvider store={reloaded}>
        <MemoryRouter initialEntries={['/sesion']}>
          <Routes>
            <Route path="*" element={<App />} />
          </Routes>
        </MemoryRouter>
      </StoreProvider>,
    );
    expect(screen.getByText(/2 de \d+/)).toBeInTheDocument();
  });

  it('Home ofrece continuar la sesión en una sola acción', async () => {
    const user = userEvent.setup();
    const { store, view } = renderApp(['/practica']);
    await user.click(screen.getByRole('button', { name: /Empezar quiz/ }));
    view.unmount();

    render(
      <StoreProvider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="*" element={<App />} />
          </Routes>
        </MemoryRouter>
      </StoreProvider>,
    );
    expect(screen.getByText('Sesión en curso')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continuar' })).toHaveAttribute('href', '/sesion');
  });
});

describe('Study-Practice Alignment en la interfaz', () => {
  it('con Nivel 1 la ruta no lista objetivos de Nivel 2 ni 3 por defecto', () => {
    renderApp(['/ruta']);
    expect(screen.getByText('Nivel 1 · Imprescindible')).toBeInTheDocument();
    expect(screen.queryByText('Nivel 2 · Muy conveniente')).toBeNull();
    expect(screen.queryByText('Nivel 3 · Profundización')).toBeNull();
  });

  it('la sesión de entrevista solo ofrece prompts de Nivel 1', async () => {
    const user = userEvent.setup();
    const { store } = renderApp(['/entrevista']);
    await user.click(screen.getByRole('button', { name: 'Practicar / Ensayar' }));
    for (const item of store.getState().activeSession?.items ?? []) {
      expect(requireResource(item.resourceId).level).toBe(1);
    }
  });
});

describe('repaso antes de salir y día de entrevista', () => {
  it('el repaso incluye difíciles, STAR, Penal esencial, salario y preguntas al despacho', () => {
    renderApp(['/repaso-final']);
    expect(screen.getByRole('heading', { level: 1, name: 'Repaso antes de salir' })).toBeInTheDocument();
    const plan = document.querySelector('.plan');
    expect(plan).not.toBeNull();
    const text = plan?.textContent ?? '';
    expect(text).toContain('expectativa salarial');
    expect(text).toContain('disponibilidad inmediata');
    expect(screen.getByText('Tus preguntas al despacho')).toBeInTheDocument();
  });

  it('si la entrevista es hoy, Home prioriza recall en lugar de temas nuevos', () => {
    const store = new ProgressStore(createEmptyProgress(new Date().toISOString(), CONTENT_VERSION));
    store.setTargetInterview({ enabled: true, date: toLocalDateKey(new Date()) });
    render(
      <StoreProvider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="*" element={<App />} />
          </Routes>
        </MemoryRouter>
      </StoreProvider>,
    );
    expect(screen.getByText('Hoy conviene reforzar lo que ya preparaste')).toBeInTheDocument();
    expect(screen.getByText('Hoy es tu entrevista')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Abrir repaso antes de salir/ })).toBeInTheDocument();
  });
});

describe('trazabilidad visible y avisos', () => {
  it('cada actividad muestra su fuente de estudio con sección y fragmento', async () => {
    const user = userEvent.setup();
    renderApp(['/entrevista/prompt/P-INT-003']);
    await user.click(screen.getByRole('button', { name: 'Prepararme primero' }));
    const sources = screen.getAllByText(/Fuente de estudio: ENTREVISTA_MD/);
    expect(sources.length).toBeGreaterThan(0);
    const details = sources[0].closest('details');
    expect(details).not.toBeNull();
    expect(within(details as HTMLElement).getByText(/Juzgados Segundo y Tercero/)).toBeInTheDocument();
  });

  it('declara que el progreso de PC y móvil es independiente', () => {
    renderApp();
    expect(screen.getByText(/no hay sincronización/i)).toBeInTheDocument();
  });
});
