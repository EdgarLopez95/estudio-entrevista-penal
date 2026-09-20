# Selector Libre Desde Inicio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir iniciar un bloque libre desde Inicio sin seleccionar duración.

**Architecture:** Home conserva recomendaciones y añade un selector local en tres pasos. La opción elegida llama al constructor de sesión existente o navega a la pantalla de contenido correspondiente; el tiempo no participa en ese flujo.

**Tech Stack:** React, TypeScript, React Testing Library.

---

### Task 1: Selector y prueba

**Files:**
- Modify: `src/features/home/HomeScreen.tsx`
- Modify: `src/test/integration.test.tsx`

- [ ] **Step 1: Escribir RED**

```tsx
renderApp();
await user.click(screen.getByRole('button', { name: 'Estudiar' }));
await user.click(screen.getByRole('button', { name: 'Entrevista' }));
expect(screen.getByRole('button', { name: 'Esenciales' })).toBeInTheDocument();
```

- [ ] **Step 2: Ejecutar RED**

Run: `npm run test -- src/test/integration.test.tsx`

Expected: FAIL porque Inicio no presenta el selector libre.

- [ ] **Step 3: Implementar selector**

Inicio renderiza los pasos actividad, frente y bloque. Entrevista esencial crea
`buildInterviewBlock` con modo study/practice; los demás bloques usan las rutas o constructores
existentes y no solicitan `TimeBudget`.

- [ ] **Step 4: Ejecutar GREEN y publicar**

Run: `npm run test -- src/test/integration.test.tsx && npm run build`

Expected: PASS.
