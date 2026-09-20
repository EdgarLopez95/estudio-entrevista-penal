# Sesión Continua Estudio o Práctica Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear sesiones de entrevista lineales por nivel cuyo modo de presentación se elige una sola vez.

**Architecture:** `ActiveSession` guardará `presentationMode: 'study' | 'practice'`. Un constructor específico crea el bloque de prompts del nivel activo en su orden curricular. `SessionScreen` será la única vista de recorrido, con navegación sticky y una representación de prompt distinta según el modo. `InterviewHubScreen` actuará como índice y punto de entrada al selector inicial.

**Tech Stack:** React 18, TypeScript, React Router, Vitest, React Testing Library y Playwright.

---

### Task 1: Persistir el modo de presentación y construir el bloque por nivel

**Files:**
- Modify: `src/domain/types.ts`
- Modify: `src/domain/progress.ts`
- Modify: `src/state/store.ts`
- Modify: `src/domain/sessionBuilder.ts`
- Modify: `src/domain/domain.test.ts`

- [ ] **Step 1: Escribir pruebas RED**

```ts
it('crea un bloque de entrevista del nivel activo y conserva el modo de estudio', () => {
  const built = buildInterviewBlock(createEmptyProgress(now, CONTENT_VERSION), 'study');
  expect(built.items).toHaveLength(10);
  expect(built.items.every((item) => item.kind === 'interview')).toBe(true);
  store.startSession(built, { presentationMode: 'study' });
  expect(store.getState().activeSession?.presentationMode).toBe('study');
});
```

- [ ] **Step 2: Ejecutar RED**

Run: `npm run test -- src/domain/domain.test.ts`

Expected: FAIL porque no existen `buildInterviewBlock` ni `presentationMode`.

- [ ] **Step 3: Implementar el modelo mínimo**

```ts
export type SessionPresentationMode = 'study' | 'practice';

export interface ActiveSession {
  // campos existentes
  presentationMode: SessionPresentationMode;
}
```

Añadir `buildInterviewBlock(state)` que filtra `INTERVIEW_PROMPTS` por `track === 'interview'`,
`levelAllowed(prompt.level, maxLevel)` y orden del objetivo; para Nivel 1 usa los diez prompts del
bloque esencial. `startSession` recibe `presentationMode`, lo guarda y las sesiones previas sin el
campo se reconcilian como `practice`.

- [ ] **Step 4: Ejecutar GREEN**

Run: `npm run test -- src/domain/domain.test.ts`

Expected: PASS.

### Task 2: Convertir Entrevista en punto de entrada o índice

**Files:**
- Modify: `src/features/interview/InterviewScreens.tsx`
- Modify: `src/test/integration.test.tsx`

- [ ] **Step 1: Escribir prueba RED del primer acceso**

```tsx
renderApp(['/entrevista']);
expect(screen.getByRole('button', { name: 'Estudiar / Prepararme' })).toBeInTheDocument();
expect(screen.getByRole('button', { name: 'Practicar / Ensayar' })).toBeInTheDocument();
await user.click(screen.getByRole('button', { name: 'Estudiar / Prepararme' }));
expect(store.getState().activeSession?.presentationMode).toBe('study');
expect(screen.getByText('1 de 10')).toBeInTheDocument();
```

- [ ] **Step 2: Ejecutar RED**

Run: `npm run test -- src/test/integration.test.tsx`

Expected: FAIL porque el Hub inicia práctica directamente.

- [ ] **Step 3: Implementar selector y reentrada**

El Hub muestra el selector solo si no existe una sesión activa de entrevista. Cada botón crea
`buildInterviewBlock(progress)` y navega a `/sesion`. Si hay sesión, `Practicar entrevista` lleva
a `/sesion`; al abrir un prompt desde el índice, se reposiciona en ese prompt si pertenece al
bloque y navega a `/sesion`, sin selector.

- [ ] **Step 4: Ejecutar GREEN**

Run: `npm run test -- src/test/integration.test.tsx`

Expected: PASS.

### Task 3: Renderizar estudio y práctica en la sesión continua

**Files:**
- Modify: `src/components/practice.tsx`
- Modify: `src/features/session/SessionScreen.tsx`
- Modify: `src/test/integration.test.tsx`

- [ ] **Step 1: Escribir pruebas RED de ambos modos**

```tsx
expect(screen.getByText('Modo estudio')).toBeInTheDocument();
expect(screen.getByText('Idea que debe quedar')).toBeInTheDocument();
await user.click(screen.getByRole('button', { name: 'Siguiente →' }));
expect(screen.getByText('2 de 10')).toBeInTheDocument();

expect(screen.getByText('Modo práctica')).toBeInTheDocument();
expect(screen.queryByText('Idea que debe quedar')).toBeNull();
await user.click(screen.getByRole('button', { name: 'Ya respondí' }));
expect(screen.getByText('Idea que debe quedar')).toBeInTheDocument();
```

- [ ] **Step 2: Ejecutar RED**

Run: `npm run test -- src/test/integration.test.tsx`

Expected: FAIL porque `InterviewPromptView` aún solicita el modo por recurso.

- [ ] **Step 3: Implementar vistas por modo y registro separado**

`InterviewPromptView` recibe `mode`. En `study` muestra la guía directamente y `onStudy`, que
marca el objetivo como estudiado mediante un nuevo método del store sin crear `InterviewAttempt`.
En `practice` conserva respuesta, evaluación, key points y `recordInterviewAttempt`. Elimina los
botones por recurso `Prepararme primero` y `Practicar ahora`.

- [ ] **Step 4: Añadir navegación de sesión y cambio de modo**

`SessionScreen` muestra `Modo estudio` o `Modo práctica`, un botón secundario para alternarlo y
`store.setSessionPresentationMode`. Inserta controles `← Anterior`, `n de total`, `Siguiente →`
en un contenedor sticky; el siguiente en práctica queda disponible tras guardar la evaluación.

- [ ] **Step 5: Ejecutar GREEN**

Run: `npm run test -- src/test/integration.test.tsx`

Expected: PASS.

### Task 4: Final de bloque, móvil y regresiones

**Files:**
- Modify: `src/features/session/SessionScreen.tsx`
- Modify: `src/styles/components.css`
- Modify: `tests/e2e/estudio.spec.ts`

- [ ] **Step 1: Escribir prueba RED de final de bloque**

```tsx
store.goToItem(9);
await user.click(screen.getByRole('button', { name: 'Marcar estudiada y terminar bloque' }));
expect(screen.getByText('No hay más preguntas de este bloque.')).toBeInTheDocument();
expect(screen.getByRole('link', { name: 'Continuar con Penal esencial' })).toBeInTheDocument();
```

- [ ] **Step 2: Ejecutar RED**

Run: `npm run test -- src/test/integration.test.tsx`

Expected: FAIL porque la sesión muestra el resultado genérico.

- [ ] **Step 3: Implementar cierre y CSS sticky**

Para sesiones de bloque de entrevista, `SessionResult` presenta las tres acciones de cierre. La
barra de recorrido usa `position: sticky; bottom: 0`, fondo opaco, espacio seguro y objetivos de
toque de 48 px en móvil.

- [ ] **Step 4: Ejecutar validación completa y publicar**

Run: `npm run verify:all && npm run e2e`

Expected: todas las verificaciones y los recorridos desktop/móvil pasan.

```powershell
git add src/domain src/state src/features src/components src/styles tests docs/superpowers
git commit -m "Crear sesión continua de estudio o práctica"
git push
```
