import { expect, test } from '@playwright/test';

/**
 * E2E del contrato §22. Se ejecutan contra la build servida por `vite preview`, es decir,
 * sobre la aplicación real y sin conexión a servicios externos.
 */

const APP = '/#/';

// Cada test usa un contexto de navegador aislado: el almacenamiento local empieza vacío.
// No se limpia en cada navegación para poder verificar la persistencia tras recargar.
test.beforeEach(async ({ page }) => {
  await page.goto(APP);
});

test('primer uso: Home recomienda una sola cosa y empieza por Háblame de ti', async ({ page }) => {
  await expect(page.getByText('Tu preparación comienza por lo esencial')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'Háblame de ti' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Comenzar preparación/ })).toBeVisible();
  // No presenta el corpus como deuda.
  await expect(page.getByText(/temas pendientes/i)).toHaveCount(0);
});

test('flujo vertical P0-A: práctica oral y progreso persistido tras recarga', async ({ page }) => {
  await page.getByRole('button', { name: /Comenzar preparación/ }).click();
  await expect(page.getByText('La entrevistadora pregunta')).toBeVisible();

  // La persona puede estudiar la guía o saltar directo a la simulación.
  await expect(page.getByRole('button', { name: 'Prepararme primero' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Practicar ahora' })).toBeVisible();
  await expect(page.getByText('¿Qué cubrí?')).toHaveCount(0);
  await page.getByRole('button', { name: 'Practicar ahora' }).click();
  await page.getByRole('button', { name: 'He respondido' }).click();
  await expect(page.getByText('¿Cómo te salió?')).toBeVisible();

  await page.getByRole('button', { name: 'Bien' }).click();
  await page.getByRole('button', { name: /Juzgados de Ejecución de Penas/ }).first().click();
  await page.getByRole('button', { name: 'Guardar intento' }).click();

  // Vuelve a Entrevista con el estado actualizado.
  await expect(page.getByRole('heading', { level: 1, name: 'Entrevista' })).toBeVisible();

  await page.reload();
  await page.goto('/#/entrevista');
  await expect(page.getByText('1/10 practicadas', { exact: false })).toBeVisible();
});

test('Nivel 1 no filtra Nivel 2 ni Nivel 3 en el quiz', async ({ page }) => {
  await page.goto('/#/practica');
  await page.getByRole('button', { name: /Empezar quiz/ }).click();

  for (let i = 0; i < 4; i += 1) {
    await expect(page.getByText('Nivel 1 · Imprescindible')).toBeVisible();
    await expect(page.getByText('Nivel 2', { exact: false })).toHaveCount(0);
    await expect(page.getByText('Nivel 3', { exact: false })).toHaveCount(0);
    await page.getByRole('radio').first().click();
    await page.getByRole('button', { name: 'Comprobar' }).click();
    const next = page.getByRole('button', { name: /Siguiente|Terminar sesión/ });
    await next.click();
    if (await page.getByRole('heading', { name: 'Resultado de la sesión' }).isVisible()) break;
  }
});

test('selector de 10 minutos produce pocas actividades de Nivel 1', async ({ page }) => {
  await page.getByRole('button', { name: '10 min' }).click();
  const summary = page.getByText(/actividades · ~/);
  await expect(summary).toContainText(/[3-5] actividades/);

  await page.getByRole('button', { name: 'Seguir plan recomendado' }).click();
  await expect(page.getByText(/1 de [3-5]/)).toBeVisible();
});

test('repaso antes de salir: sin temas nuevos y con preguntas al despacho', async ({ page }) => {
  await page.goto('/#/repaso-final');
  await expect(page.getByRole('heading', { level: 1, name: 'Repaso antes de salir' })).toBeVisible();
  await expect(page.getByText('Tus preguntas al despacho').first()).toBeVisible();
  await expect(page.getByText('¿Cuál es tu expectativa salarial?')).toBeVisible();
  await page.getByRole('button', { name: /Empezar repaso/ }).click();
  await expect(page.getByText(/1 de \d+/)).toBeVisible();
});

test('continuidad: tras recargar, la sesión sigue en la misma posición', async ({ page }) => {
  await page.goto('/#/practica');
  await page.getByRole('button', { name: /Empezar quiz/ }).click();
  await page.getByRole('radio').first().click();
  await page.getByRole('button', { name: 'Comprobar' }).click();
  await page.getByRole('button', { name: /Siguiente|Terminar sesión/ }).click();
  await expect(page.getByText(/2 de \d+/)).toBeVisible();

  await page.reload();
  await expect(page.getByText(/2 de \d+/)).toBeVisible();

  // Y desde Home se puede continuar en una sola acción.
  await page.goto(APP);
  await expect(page.getByText('Sesión en curso')).toBeVisible();
  await page.getByRole('link', { name: 'Continuar' }).click();
  await expect(page.getByText(/2 de \d+/)).toBeVisible();
});

test('error en quiz aparece en Mis errores y se puede repasar', async ({ page }) => {
  await page.goto('/#/practica');
  await page.getByRole('button', { name: /Empezar quiz/ }).click();

  // Elige la última opción hasta encontrar una incorrecta.
  let foundError = false;
  for (let i = 0; i < 5 && !foundError; i += 1) {
    await page.getByRole('radio').last().click();
    await page.getByRole('button', { name: 'Comprobar' }).click();
    if (await page.getByText('Este concepto necesita repaso').isVisible()) foundError = true;
    const next = page.getByRole('button', { name: /Siguiente|Terminar sesión/ });
    if (await next.isVisible()) await next.click();
  }

  await page.goto('/#/errores');
  if (foundError) {
    await expect(page.getByRole('button', { name: /Repasar errores/ })).toBeEnabled();
    await expect(page.getByText('Error de conocimiento').first()).toBeVisible();
  } else {
    await expect(page.getByText('No hay errores activos')).toBeVisible();
  }
});

test('búsqueda ignora tildes y navega al recurso', async ({ page }) => {
  await page.getByRole('button', { name: /Buscar/ }).click();
  await page.getByPlaceholder(/Buscar:/).fill('habeas');
  await expect(page.getByText(/hábeas corpus/i).first()).toBeVisible();
  await page.keyboard.press('Enter');
  // Navega al primer resultado: la búsqueda deja de estar abierta y cambia la ruta.
  await expect(page.getByPlaceholder(/Buscar:/)).toHaveCount(0);
  expect(page.url()).not.toMatch(/#\/$/);
});

test('teclado: se puede llegar al CTA principal y activarlo', async ({ page }) => {
  await page.keyboard.press('Tab'); // salto al contenido
  let reached = false;
  for (let i = 0; i < 25 && !reached; i += 1) {
    await page.keyboard.press('Tab');
    const name = await page.evaluate(() => document.activeElement?.textContent ?? '');
    if (name.includes('Comenzar preparación')) reached = true;
  }
  expect(reached).toBe(true);
  await page.keyboard.press('Enter');
  await expect(page.getByText('La entrevistadora pregunta')).toBeVisible();
});

test('sin scroll horizontal en móvil y desktop', async ({ page }) => {
  for (const size of [
    { width: 360, height: 740 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1280, height: 900 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(size);
    await page.goto(APP);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `overflow en ${size.width}px`).toBeLessThanOrEqual(1);
  }
});

test('tema oscuro se aplica y persiste', async ({ page }) => {
  await page.getByRole('button', { name: /Tema/ }).click();
  await page.getByRole('button', { name: /Tema/ }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
