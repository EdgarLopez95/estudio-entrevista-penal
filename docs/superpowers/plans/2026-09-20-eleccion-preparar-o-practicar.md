# Elección Preparar o Practicar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir estudiar la guía de una pregunta de entrevista antes de elegir practicarla.

**Architecture:** `InterviewPromptView` conservará los datos y el guardado actuales, pero añadirá un estado inicial de elección. Ese estado dirige a una vista de guía o a la simulación existente. La guía reutiliza `ideaThatMustLand`, `keyPoints`, `avoid` y `recommendedAnswer` del prompt curado, sin crear contenido nuevo.

**Tech Stack:** React 18, TypeScript, React Testing Library y Vitest.

---

### Task 1: Cubrir la elección inicial con una prueba de integración

**Files:**
- Modify: `src/test/integration.test.tsx`
- Test: `src/test/integration.test.tsx`

- [ ] **Step 1: Escribir una prueba que falle**

```tsx
it('permite elegir prepararse antes de practicar una respuesta de entrevista', async () => {
  const user = userEvent.setup();
  renderApp('/entrevista/prompt/interview-intro');

  expect(screen.getByRole('button', { name: 'Prepararme primero' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Practicar ahora' })).toBeInTheDocument();
  expect(screen.queryByText('Idea que debe quedar')).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Prepararme primero' }));
  expect(screen.getByText('Idea que debe quedar')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Practicar ahora' })).toBeInTheDocument();
});
```

- [ ] **Step 2: Ejecutar la prueba para comprobar RED**

Run: `npm run test -- src/test/integration.test.tsx`

Expected: FAIL porque todavía no existe el botón `Prepararme primero`.

### Task 2: Separar la guía de la simulación dentro de InterviewPromptView

**Files:**
- Modify: `src/components/practice.tsx:177-340`
- Test: `src/test/integration.test.tsx`

- [ ] **Step 1: Añadir un estado de flujo**

```tsx
const [step, setStep] = useState<'choose' | 'prepare' | 'ask' | 'rate'>('choose');

useEffect(() => {
  setStep('choose');
  setRating(null);
  setCovered([]);
  setUsedModel(false);
}, [prompt.id]);
```

- [ ] **Step 2: Renderizar la elección inicial y la guía**

```tsx
{step === 'choose' ? (
  <div className="stack-4">
    <p className="prompt__hint">Elige cómo quieres abordar esta respuesta.</p>
    <div className="row">
      <Button variant="primary" onClick={() => setStep('prepare')}>Prepararme primero</Button>
      <Button onClick={() => setStep('ask')}>Practicar ahora</Button>
    </div>
  </div>
) : null}
```

La rama `prepare` mostrará idea central, puntos clave, qué evitar y la respuesta modelo como
apoyo, seguida del botón `Practicar ahora`. La rama `ask` conservará el texto y botón actuales;
la rama `rate` conservará íntegramente el autoanálisis y `onSave`.

- [ ] **Step 3: Ejecutar la prueba para comprobar GREEN**

Run: `npm run test -- src/test/integration.test.tsx`

Expected: PASS, incluida la nueva prueba.

### Task 3: Validar regresiones y publicar

**Files:**
- Modify: `docs/superpowers/specs/2026-09-20-eleccion-preparar-o-practicar.md`
- Modify: `docs/superpowers/plans/2026-09-20-eleccion-preparar-o-practicar.md`

- [ ] **Step 1: Ejecutar la validación completa**

Run: `npm run verify:all && npm run e2e`

Expected: contenido, contraste, offline, pruebas, build y recorridos móvil/escritorio en verde.

- [ ] **Step 2: Confirmar el plan y la especificación como implementados**

Cambiar las casillas de los pasos completados a `[x]`.

- [ ] **Step 3: Versionar y publicar**

Run:

```powershell
git add src/components/practice.tsx src/test/integration.test.tsx docs/superpowers
git commit -m "Permitir preparar o practicar respuestas de entrevista"
git push
```

Expected: el flujo de GitHub Pages despliega la nueva versión desde `main`.
