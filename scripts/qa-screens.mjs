/**
 * Captura de auditoria visual (contrato §22): cinco tamanos definidos, tema claro y oscuro,
 * y las pantallas principales de P0-A. Requiere `vite preview` en el puerto 4173.
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:4173';
const OUT = 'design/qa';
mkdirSync(OUT, { recursive: true });

const WIDTHS = [360, 390, 768, 1024, 1280, 1440];
const SCREENS = [
  { name: 'home', path: '/#/' },
  { name: 'entrevista', path: '/#/entrevista' },
  { name: 'penal', path: '/#/penal' },
  { name: 'progreso', path: '/#/progreso' },
  { name: 'repaso', path: '/#/repaso-final' },
];

const browser = await chromium.launch();

async function shot(page, file, fullPage = true) {
  await page.screenshot({ path: `${OUT}/${file}.png`, fullPage });
}

// 1. Home en los seis anchos, tema claro.
for (const width of WIDTHS) {
  const context = await browser.newContext({ viewport: { width, height: width < 700 ? 820 : 900 } });
  const page = await context.newPage();
  await page.goto(`${BASE}/#/`);
  await page.waitForTimeout(350);
  await shot(page, `home-${width}`);
  if (width === 390) {
    // Primer viewport movil sin scroll: contexto, recomendacion, CTA, minutos y readiness.
    await shot(page, 'home-390-primer-viewport', false);
  }
  await context.close();
}

// 2. Pantallas principales en desktop y movil.
for (const screen of SCREENS) {
  for (const width of [390, 1280]) {
    const context = await browser.newContext({ viewport: { width, height: width < 700 ? 820 : 900 } });
    const page = await context.newPage();
    await page.goto(`${BASE}${screen.path}`);
    await page.waitForTimeout(300);
    await shot(page, `${screen.name}-${width}`);
    await context.close();
  }
}

// 3. Practica oral: los dos pasos del flujo P0-A.
{
  const context = await browser.newContext({ viewport: { width: 390, height: 820 } });
  const page = await context.newPage();
  await page.goto(`${BASE}/#/`);
  await page.getByRole('button', { name: /Comenzar preparacion|Comenzar preparación/ }).click();
  await page.waitForTimeout(300);
  await shot(page, 'practica-oral-paso1-390');
  await page.getByRole('button', { name: 'He respondido' }).click();
  await page.waitForTimeout(300);
  await shot(page, 'practica-oral-paso2-390');
  await context.close();
}
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${BASE}/#/`);
  await page.getByRole('button', { name: /Comenzar preparacion|Comenzar preparación/ }).click();
  await page.waitForTimeout(300);
  await shot(page, 'practica-oral-paso1-1280');
  await page.getByRole('button', { name: 'He respondido' }).click();
  await page.waitForTimeout(300);
  await shot(page, 'practica-oral-paso2-1280');
  await context.close();
}

// 4. Quiz con feedback.
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${BASE}/#/practica`);
  await page.getByRole('button', { name: /Empezar quiz/ }).click();
  await page.waitForTimeout(250);
  await shot(page, 'quiz-antes-1280');
  await page.getByRole('radio').nth(1).click();
  await page.getByRole('button', { name: 'Comprobar' }).click();
  await page.waitForTimeout(250);
  await shot(page, 'quiz-feedback-1280');
  await context.close();
}

// 5. Tema oscuro (Home y practica oral).
{
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    colorScheme: 'dark',
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/#/`);
  await page.waitForTimeout(350);
  await shot(page, 'home-dark-1280');
  await page.goto(`${BASE}/#/entrevista/prompt/P-INT-003`);
  await page.waitForTimeout(300);
  await shot(page, 'practica-oral-dark-1280');
  await context.close();
}
{
  const context = await browser.newContext({
    viewport: { width: 390, height: 820 },
    colorScheme: 'dark',
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/#/`);
  await page.waitForTimeout(350);
  await shot(page, 'home-dark-390');
  await context.close();
}

// 6. Escala de grises y squint test sobre Home desktop.
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${BASE}/#/`);
  await page.addStyleTag({ content: 'html { filter: grayscale(1) !important; }' });
  await page.waitForTimeout(250);
  await shot(page, 'home-grises-1280');
  await page.addStyleTag({ content: 'html { filter: grayscale(1) blur(3px) !important; }' });
  await page.waitForTimeout(250);
  await shot(page, 'home-squint-1280');
  await context.close();
}

// 7. Foco visible con teclado.
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${BASE}/#/`);
  for (let i = 0; i < 6; i += 1) await page.keyboard.press('Tab');
  await page.waitForTimeout(200);
  await shot(page, 'foco-teclado-1280', false);
  await context.close();
}

await browser.close();
console.log('Capturas escritas en design/qa/');
