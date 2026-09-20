/**
 * Verificacion de trazabilidad de contenido (contrato §17).
 *
 * 1. Comprueba que las cuatro fuentes de `docs/sources/` conservan el SHA-256 declarado
 *    en el manifiesto del contrato §2. Si un hash cambia, el corpus derivado debe revisarse.
 * 2. Comprueba que cada fragmento declarado en `src/content/sources/excerpts.*.json` existe
 *    realmente en su fuente, aplicando la regla de normalizacion documentada.
 * 3. Calcula el SHA-256 del fragmento normalizado (`sourceExcerptHash`) y lo escribe en
 *    `src/content/sources/excerpt-hashes.json` con `--write`, o lo compara sin `--write`.
 *
 * REGLA DE NORMALIZACION DOCUMENTADA (canonicalize):
 *   a. Normalizacion Unicode NFC y eliminacion de CR.
 *   b. Por linea: se elimina el prefijo de cita (`>`), de encabezado (`#`), de lista
 *      (`-`, `*`, `+`) y de lista numerada (`1.`).
 *   c. Se eliminan los marcadores de enfasis y codigo: `**`, `*`, `__`, `_`, `` ` ``.
 *   d. Las comillas tipograficas se unifican a comillas rectas: « » “ ” -> " ; ‘ ’ -> '.
 *   e. Toda secuencia de espacios en blanco se colapsa a un unico espacio y se recortan extremos.
 * El hash es SHA-256 hexadecimal minuscula del texto resultante.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WRITE = process.argv.includes('--write');

/** Manifiesto del contrato §2: id -> { archivo, sha256 } */
export const SOURCE_MANIFEST = {
  PENAL_MD: {
    file: 'docs/sources/Valentina_Repaso_Derecho_Penal_Entrevista.md',
    sha256: 'C690C38F956724FE1B7605CECFB1962207BB02814E347C3BE16921B6B7A5DB37',
  },
  ENTREVISTA_MD: {
    file: 'docs/sources/Valentina_Preparacion_Entrevista_Derecho_Penal.md',
    sha256: '4FB9EC5E0D57806EACA22789A4F40AE039E42CF78BB80B2A43054D19E466B535',
  },
  UX_PDF: {
    file: 'docs/sources/UX.pdf',
    sha256: 'F3120F9E2C6788318DDCC12DA0FA409A9D48C844B73C450E2FE2134C8762F30D',
  },
  UI_PDF: {
    file: 'docs/sources/UI.pdf',
    sha256: '3E1D2B662EE25010C7F71A124ABDA965A884022342FF522D834FC83C5892FF2C',
  },
};

const EXCERPT_FILES = {
  PENAL_MD: 'src/content/sources/excerpts.penal.json',
  ENTREVISTA_MD: 'src/content/sources/excerpts.entrevista.json',
};

const HASHES_FILE = 'src/content/sources/excerpt-hashes.json';

export function canonicalize(text) {
  return text
    .normalize('NFC')
    .replace(/\r/g, '')
    .split('\n')
    .map((line) =>
      line
        .replace(/^\s{0,3}(?:>\s?)+/, '')
        .replace(/^\s{0,3}#{1,6}\s+/, '')
        .replace(/^\s{0,3}[-*+]\s+/, '')
        .replace(/^\s{0,3}\d+\.\s+/, ''),
    )
    .join('\n')
    .replace(/\*\*|__/g, '')
    .replace(/[*_`]/g, '')
    .replace(/[“”«»]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function excerptHash(text) {
  return createHash('sha256').update(canonicalize(text), 'utf8').digest('hex');
}

function fileHash(path) {
  return createHash('sha256').update(readFileSync(join(ROOT, path))).digest('hex').toUpperCase();
}

function main() {
  const errors = [];
  const computed = {};

  for (const [id, entry] of Object.entries(SOURCE_MANIFEST)) {
    const actual = fileHash(entry.file);
    if (actual !== entry.sha256) {
      errors.push(
        `[fuente] ${id}: SHA-256 no coincide con el manifiesto del contrato §2.\n` +
          `  esperado: ${entry.sha256}\n  obtenido: ${actual}`,
      );
    }
  }

  let total = 0;
  for (const [sourceId, excerptPath] of Object.entries(EXCERPT_FILES)) {
    const sourceText = canonicalize(readFileSync(join(ROOT, SOURCE_MANIFEST[sourceId].file), 'utf8'));
    const excerpts = JSON.parse(readFileSync(join(ROOT, excerptPath), 'utf8'));
    for (const [anchor, value] of Object.entries(excerpts)) {
      total += 1;
      if (!value || typeof value.text !== 'string' || typeof value.section !== 'string') {
        errors.push(`[fragmento] ${anchor}: faltan campos 'section' o 'text'.`);
        continue;
      }
      if (value.text.trim().length < 12) {
        errors.push(`[fragmento] ${anchor}: fragmento demasiado corto para ser trazable.`);
      }
      const canonical = canonicalize(value.text);
      if (!sourceText.includes(canonical)) {
        errors.push(
          `[fragmento] ${anchor}: no aparece literalmente en ${SOURCE_MANIFEST[sourceId].file}.\n` +
            `  buscado: ${canonical.slice(0, 160)}${canonical.length > 160 ? '…' : ''}`,
        );
        continue;
      }
      computed[anchor] = { sourceId, hash: excerptHash(value.text) };
    }
  }

  if (errors.length > 0) {
    console.error(`FALLO de trazabilidad (${errors.length} problema(s)):\n`);
    for (const e of errors) console.error(' - ' + e);
    process.exit(1);
  }

  const ordered = {};
  for (const key of Object.keys(computed).sort()) ordered[key] = computed[key];

  if (WRITE) {
    writeFileSync(join(ROOT, HASHES_FILE), JSON.stringify(ordered, null, 2) + '\n', 'utf8');
    console.log(`OK: ${total} fragmentos verificados. Hashes escritos en ${HASHES_FILE}.`);
    return;
  }

  let stored;
  try {
    stored = JSON.parse(readFileSync(join(ROOT, HASHES_FILE), 'utf8'));
  } catch {
    console.error(`FALLO: no existe ${HASHES_FILE}. Ejecuta: npm run content:hash`);
    process.exit(1);
  }
  const mismatches = [];
  for (const [anchor, value] of Object.entries(ordered)) {
    if (!stored[anchor]) mismatches.push(`${anchor}: ausente en ${HASHES_FILE}`);
    else if (stored[anchor].hash !== value.hash) mismatches.push(`${anchor}: hash desactualizado`);
  }
  for (const anchor of Object.keys(stored)) {
    if (!ordered[anchor]) mismatches.push(`${anchor}: sobra en ${HASHES_FILE} (fragmento eliminado)`);
  }
  if (mismatches.length > 0) {
    console.error('FALLO: hashes de fragmento desincronizados:\n');
    for (const m of mismatches) console.error(' - ' + m);
    process.exit(1);
  }
  console.log(`OK: ${total} fragmentos verificados contra las fuentes y contra ${HASHES_FILE}.`);
}

if (process.argv[1] && process.argv[1].endsWith('verify-excerpts.mjs')) main();
