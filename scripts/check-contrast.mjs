/**
 * Verificación de contraste WCAG 2.2 AA (contrato §20) sobre los tokens de color reales
 * de `src/styles/tokens.css`, en tema claro y oscuro.
 *
 * Umbrales: texto normal >= 4.5:1; texto grande y componentes/gráficos >= 3:1.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(join(ROOT, 'src/styles/tokens.css'), 'utf8');

function parseBlock(selector) {
  const index = css.indexOf(selector);
  if (index === -1) throw new Error(`No se encontró el bloque ${selector}`);
  const start = css.indexOf('{', index);
  const end = css.indexOf('}', start);
  const body = css.slice(start + 1, end);
  const tokens = {};
  for (const line of body.split('\n')) {
    const match = /^\s*--([\w-]+):\s*([^;]+);/.exec(line);
    if (match) tokens[match[1]] = match[2].trim();
  }
  return tokens;
}

const light = parseBlock(':root {');
const darkOverrides = parseBlock(":root[data-theme='dark']");
const dark = { ...light, ...darkOverrides };

function toRgb(hex) {
  const value = hex.replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return null;
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

function relativeLuminance([r, g, b]) {
  const channel = (value) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function ratio(foreground, background) {
  const a = relativeLuminance(toRgb(foreground));
  const b = relativeLuminance(toRgb(background));
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Pares reales de la interfaz: [texto, fondo, mínimo, descripción]. */
const PAIRS = [
  ['text-primary', 'background', 4.5, 'Texto principal sobre fondo'],
  ['text-primary', 'surface-1', 4.5, 'Texto principal en card'],
  ['text-primary', 'surface-2', 4.5, 'Texto principal en superficie 2'],
  ['text-secondary', 'background', 4.5, 'Texto secundario sobre fondo'],
  ['text-secondary', 'surface-1', 4.5, 'Texto secundario en card'],
  ['text-secondary', 'surface-2', 4.5, 'Texto secundario en superficie 2'],
  ['text-muted', 'background', 4.5, 'Texto tenue sobre fondo'],
  ['text-muted', 'surface-1', 4.5, 'Texto tenue en card'],
  ['text-muted', 'surface-2', 4.5, 'Caption en superficie 2'],
  ['primary', 'surface-1', 4.5, 'Enlace y acento en card'],
  ['primary', 'background', 4.5, 'Enlace sobre fondo'],
  ['primary', 'surface-2', 4.5, 'Enlace en superficie 2'],
  ['on-primary', 'primary', 4.5, 'Texto del botón primario'],
  ['success', 'surface-1', 4.5, 'Feedback correcto'],
  ['warning', 'surface-1', 4.5, 'Aviso de repaso'],
  ['error', 'surface-1', 4.5, 'Feedback de error'],
  ['success', 'background', 4.5, 'Feedback correcto sobre fondo'],
  ['warning', 'background', 4.5, 'Aviso sobre fondo'],
  ['error', 'background', 4.5, 'Error sobre fondo'],
  ['track-interview', 'surface-1', 3, 'Lomo del frente Entrevista'],
  ['track-penal', 'surface-1', 3, 'Lomo del frente Penal'],
  ['track-cross', 'surface-1', 3, 'Lomo cross-track'],
  ['outline-strong', 'surface-1', 3, 'Borde de control en card'],
  ['outline-strong', 'background', 3, 'Borde de control sobre fondo'],
  ['focus-ring', 'background', 3, 'Anillo de foco sobre fondo'],
  ['focus-ring', 'surface-1', 3, 'Anillo de foco en card'],
  ['primary', 'surface-3', 3, 'Segmento de medidor'],
];

let failures = 0;
const rows = [];

for (const [themeName, tokens] of [
  ['claro', light],
  ['oscuro', dark],
]) {
  for (const [fg, bg, min, description] of PAIRS) {
    const foreground = tokens[fg];
    const background = tokens[bg];
    if (!foreground || !background) {
      console.error(`FALTA token: ${fg} o ${bg} en tema ${themeName}`);
      failures += 1;
      continue;
    }
    if (!toRgb(foreground) || !toRgb(background)) continue;
    const value = ratio(foreground, background);
    const ok = value >= min;
    if (!ok) failures += 1;
    rows.push(
      `${ok ? 'OK  ' : 'FALLA'} ${themeName.padEnd(7)} ${description.padEnd(34)} ${value.toFixed(2)}:1 (min ${min})`,
    );
  }
}

console.log(rows.join('\n'));
if (failures > 0) {
  console.error(`\n${failures} par(es) de color no cumplen WCAG 2.2 AA.`);
  process.exit(1);
}
console.log(`\nOK: ${rows.length} pares verificados en tema claro y oscuro (WCAG 2.2 AA).`);
