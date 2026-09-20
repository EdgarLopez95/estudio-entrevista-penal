import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { App } from '@/app/App';
import { StoreProvider } from '@/state/StoreProvider';
import { ProgressStore } from '@/state/store';
import { createEmptyProgress } from '@/domain/progress';
import { CONTENT_VERSION } from '@/domain/types';

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

describe('UX Simplificada: Home ultra simple', () => {
  it('al entrar muestra únicamente ¿Cómo quieres prepararte? y las dos opciones grandes', () => {
    renderApp();
    expect(screen.getByRole('heading', { level: 1, name: '¿Cómo quieres prepararte?' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Revisar el contenido/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Intentar responder/i })).toBeInTheDocument();

    // No muestra dashboard complejo ni porcentajes en Home
    expect(screen.queryByText(/Core Readiness/i)).toBeNull();
    expect(screen.queryByText(/Top 10/i)).toBeNull();
    expect(screen.queryByText(/temas pendientes/i)).toBeNull();
  });
});

describe('Cuatro recorridos requeridos (Sección 26)', () => {
  it('Recorrido A: Inicio → Estudiar → Entrevista → Esencial → avanzar 3 preguntas → salir', async () => {
    const user = userEvent.setup();
    const { store } = renderApp();

    // 1. Inicio -> Estudiar
    await user.click(screen.getByRole('link', { name: /Revisar el contenido/i }));
    expect(screen.getByRole('heading', { name: '¿Qué quieres preparar?' })).toBeInTheDocument();

    // 2. Elegir Entrevista
    await user.click(screen.getByRole('button', { name: /ENTREVISTA/i }));
    expect(screen.getByRole('heading', { name: 'Elige el nivel' })).toBeInTheDocument();

    // 3. Elegir Esencial
    await user.click(screen.getByRole('button', { name: /NIVEL 1 · ESENCIAL/i }));

    // 4. Entra directamente a la sesión sin menús intermedios
    expect(screen.getByText(/1 de 20/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Háblame de ti.' })).toBeInTheDocument();
    expect(screen.getByText('Idea principal')).toBeInTheDocument();

    // Avanzar a pregunta 2
    await user.click(screen.getByRole('button', { name: 'Siguiente →' }));
    expect(screen.getByText(/2 de 20/)).toBeInTheDocument();

    // Avanzar a pregunta 3
    await user.click(screen.getByRole('button', { name: 'Siguiente →' }));
    expect(screen.getByText(/3 de 20/)).toBeInTheDocument();

    // Salir del bloque
    await user.click(screen.getByRole('button', { name: '← Salir del bloque' }));
    expect(screen.getByRole('heading', { name: '¿Qué quieres preparar?' })).toBeInTheDocument();

    // Progreso conservado
    expect(store.getState().activeSession?.currentIndex).toBe(2);
  });

  it('Recorrido B: Inicio → Practicar → Entrevista → Esencial → responder 3 preguntas → salir', async () => {
    const user = userEvent.setup();
    const { store } = renderApp();

    // 1. Inicio -> Practicar
    await user.click(screen.getByRole('link', { name: /Intentar responder/i }));
    expect(screen.getByRole('heading', { name: '¿Qué quieres preparar?' })).toBeInTheDocument();

    // 2. Elegir Entrevista
    await user.click(screen.getByRole('button', { name: /ENTREVISTA/i }));

    // 3. Elegir Esencial
    await user.click(screen.getByRole('button', { name: /NIVEL 1 · ESENCIAL/i }));

    // Pregunta 1
    expect(screen.getByText(/1 de 20/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'YA RESPONDÍ' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'YA RESPONDÍ' }));
    await user.click(screen.getByRole('button', { name: 'Bien' }));
    await user.click(screen.getByRole('button', { name: 'Siguiente pregunta →' }));

    // Pregunta 2
    expect(screen.getByText(/2 de 20/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'YA RESPONDÍ' }));
    await user.click(screen.getByRole('button', { name: 'Bien' }));
    await user.click(screen.getByRole('button', { name: 'Siguiente pregunta →' }));

    // Pregunta 3
    expect(screen.getByText(/3 de 20/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'YA RESPONDÍ' }));
    await user.click(screen.getByRole('button', { name: 'Parcial' }));
    await user.click(screen.getByRole('button', { name: 'Siguiente pregunta →' }));

    // Pregunta 4 alcanzada
    expect(screen.getByText(/4 de 20/)).toBeInTheDocument();

    // Salir del bloque
    await user.click(screen.getByRole('button', { name: '← Salir del bloque' }));
    expect(screen.getByRole('heading', { name: '¿Qué quieres preparar?' })).toBeInTheDocument();

    // Tres intentos registrados
    const state = store.getState();
    expect(Object.keys(state.interview).length).toBe(3);
  });

  it('Recorrido C: Inicio → Estudiar → Penal → Esencial → avanzar 3 conceptos → salir', async () => {
    const user = userEvent.setup();
    renderApp();

    // 1. Inicio -> Estudiar
    await user.click(screen.getByRole('link', { name: /Revisar el contenido/i }));

    // 2. Elegir Penal
    await user.click(screen.getByRole('button', { name: /DERECHO PENAL/i }));

    // 3. Elegir Esencial
    await user.click(screen.getByRole('button', { name: /NIVEL 1 · ESENCIAL/i }));

    // Concepto 1
    expect(screen.getByText(/1 de 16/)).toBeInTheDocument();
    expect(screen.getByText('Idea esencial')).toBeInTheDocument();

    // Avanzar a concepto 2
    await user.click(screen.getByRole('button', { name: 'Siguiente →' }));
    expect(screen.getByText(/2 de 16/)).toBeInTheDocument();

    // Avanzar a concepto 3
    await user.click(screen.getByRole('button', { name: 'Siguiente →' }));
    expect(screen.getByText(/3 de 16/)).toBeInTheDocument();

    // Salir del bloque
    await user.click(screen.getByRole('button', { name: '← Salir del bloque' }));
    expect(screen.getByRole('heading', { name: '¿Qué quieres preparar?' })).toBeInTheDocument();
  });

  it('Recorrido D: Inicio → Practicar → Penal → Esencial → responder quiz → avanzar → salir', async () => {
    const user = userEvent.setup();
    renderApp();

    // 1. Inicio -> Practicar
    await user.click(screen.getByRole('link', { name: /Intentar responder/i }));

    // 2. Elegir Penal
    await user.click(screen.getByRole('button', { name: /DERECHO PENAL/i }));

    // 3. Elegir Esencial
    await user.click(screen.getByRole('button', { name: /NIVEL 1 · ESENCIAL/i }));

    // Pregunta 1
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    const options = screen.getAllByRole('radio');
    expect(options.length).toBeGreaterThanOrEqual(3);

    await user.click(options[0]);
    await user.click(screen.getByRole('button', { name: 'Comprobar' }));

    // Feedback visible y botón siguiente
    expect(screen.getByText(/Correcto|necesita repaso/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Siguiente →' }));

    // Pregunta 2 alcanzada
    expect(screen.getByText(/2 de \d+/)).toBeInTheDocument();

    // Salir del bloque
    await user.click(screen.getByRole('button', { name: '← Salir del bloque' }));
    expect(screen.getByRole('heading', { name: '¿Qué quieres preparar?' })).toBeInTheDocument();
  });
});

describe('Continuidad y Progreso', () => {
  it('Home muestra Continuar donde quedaste si hay una sesión activa', async () => {
    const user = userEvent.setup();
    const { view, store } = renderApp(['/practicar']);

    await user.click(screen.getByRole('button', { name: /ENTREVISTA/i }));
    await user.click(screen.getByRole('button', { name: /NIVEL 1 · ESENCIAL/i }));

    // Salir a inicio reutilizando el store activo
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

    expect(screen.getByText('Continuar donde quedaste')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeInTheDocument();
  });

  it('Progreso muestra ENTREVISTA ESENCIAL y PENAL ESENCIAL en lenguaje humano', () => {
    renderApp(['/progreso']);

    expect(screen.getByRole('heading', { name: 'Tu progreso' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'ENTREVISTA ESENCIAL' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'PENAL ESENCIAL' })).toBeInTheDocument();

    expect(screen.getByText(/estudiadas/)).toBeInTheDocument();
    expect(screen.getByText(/practicadas/)).toBeInTheDocument();
    expect(screen.getByText(/dominados/)).toBeInTheDocument();
  });
});
