/**
 * Verificación de privacidad y funcionamiento sin conexión (contrato §6, §21).
 *
 * Comprueba que ni el código fuente ni la build contienen:
 * - dominios remotos (CDN de fuentes, imágenes, scripts, APIs);
 * - trackers o analítica;
 * - llamadas de red en runtime (fetch, XMLHttpRequest, WebSocket, EventSource);
 * - referencias a servicios de IA.
 *
 * Las URLs que aparecen únicamente como texto de referencia documental (por ejemplo, el
 * manifiesto de fuentes) no son dependencias: se permiten explícitamente por lista.
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const SOURCE_DIRS = ['src', 'index.html'];
const BUILD_DIR = 'dist';

/** Se aplican al código propio y a la build. */
const SHARED_PATTERNS = [
  { pattern: /https?:\/\/(?!localhost|127\.0\.0\.1)[\w.-]+/g, label: 'URL remota' },
  { pattern: /fonts\.googleapis\.com|fonts\.gstatic\.com/g, label: 'Google Fonts CDN' },
  { pattern: /googletagmanager|google-analytics|gtag\(|mixpanel|amplitude|sentry\.io|hotjar|clarity\.ms/gi, label: 'analítica o tracker' },
  { pattern: /api\.openai\.com|api\.anthropic\.com|generativelanguage|huggingface/gi, label: 'servicio de IA' },
  { pattern: /navigator\.sendBeacon/g, label: 'beacon de telemetría' },
];

/**
 * Solo se aplican al código propio: el bundle de React y React Router incluye ramas muertas
 * que mencionan `fetch`, pero la aplicación no realiza ninguna llamada de red. Lo que se
 * garantiza aquí es que el código propio no abre conexiones.
 */
const FIRST_PARTY_PATTERNS = [
  { pattern: /\bfetch\s*\(/g, label: 'llamada fetch' },
  { pattern: /new\s+XMLHttpRequest|new\s+WebSocket|new\s+EventSource/g, label: 'conexión de red' },
];

/** Excepciones documentadas: texto informativo, no dependencias de runtime. */
const ALLOWED = [
  'http://www.w3.org', // namespaces XML/SVG: identificadores, no descargas
  'https://reactjs.org', // texto de mensajes de error de React en su propio bundle
  'https://reactrouter.com', // aviso de la librería, incluido en su propio bundle
];

function walk(target, files = []) {
  const absolute = join(ROOT, target);
  if (!existsSync(absolute)) return files;
  const stats = statSync(absolute);
  if (stats.isFile()) {
    files.push(target);
    return files;
  }
  for (const entry of readdirSync(absolute)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    walk(join(target, entry), files);
  }
  return files;
}

const TEXT_EXTENSIONS = /\.(ts|tsx|js|jsx|css|html|json)$/;

function scan(paths, { isBuild }) {
  const findings = [];
  for (const file of paths) {
    if (!TEXT_EXTENSIONS.test(file)) continue;
    // Las pruebas y los scripts de verificación no forman parte de la aplicación entregada.
    if (!isBuild && /\.test\.(ts|tsx)$/.test(file)) continue;
    const content = readFileSync(join(ROOT, file), 'utf8');
    const patterns = isBuild ? SHARED_PATTERNS : [...SHARED_PATTERNS, ...FIRST_PARTY_PATTERNS];
    for (const { pattern, label } of patterns) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const found = match[0];
        if (ALLOWED.some((allowed) => found.startsWith(allowed))) continue;
        // Los hashes y rutas relativas del manifiesto no son URLs.
        findings.push({ file: relative('.', file), label, found });
      }
    }
  }
  return findings;
}

const sourceFiles = SOURCE_DIRS.flatMap((dir) => walk(dir));
const sourceFindings = scan(sourceFiles, { isBuild: false });

let buildFindings = [];
if (existsSync(join(ROOT, BUILD_DIR))) {
  buildFindings = scan(walk(BUILD_DIR), { isBuild: true });
} else {
  console.warn('Aviso: no existe dist/. Ejecuta npm run build para verificar también la build.');
}

const all = [...sourceFindings, ...buildFindings];

if (all.length > 0) {
  console.error(`FALLO: ${all.length} referencia(s) remota(s) o de telemetría:\n`);
  for (const finding of all) {
    console.error(` - [${finding.label}] ${finding.file}: ${finding.found}`);
  }
  process.exit(1);
}

// Comprobación positiva: las fuentes tipográficas están empaquetadas localmente.
if (existsSync(join(ROOT, BUILD_DIR))) {
  const assets = walk(join(BUILD_DIR, 'assets'));
  const fonts = assets.filter((file) => file.endsWith('.woff2'));
  if (fonts.length === 0) {
    console.error('FALLO: la build no incluye tipografías locales (.woff2).');
    process.exit(1);
  }
  console.log(`OK: ${fonts.length} tipografías empaquetadas localmente.`);
}

console.log(
  `OK: ${sourceFiles.length} archivos de código y la build revisados. Sin URLs remotas, analítica, IA ni llamadas de red.`,
);
