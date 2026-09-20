import penalExcerpts from './excerpts.penal.json';
import entrevistaExcerpts from './excerpts.entrevista.json';
import excerptHashes from './excerpt-hashes.json';

export type SourceId = 'PENAL_MD' | 'ENTREVISTA_MD' | 'UX_PDF' | 'UI_PDF';

export interface SourceManifestEntry {
  id: SourceId;
  title: string;
  filename: string;
  relativePath: string;
  kind: 'markdown' | 'pdf';
  sha256: string;
  governs: string;
  limitations: string;
}

/** Manifiesto de fuentes del contrato §2. Los hashes son los declarados y verificados. */
export const SOURCE_MANIFEST: Record<SourceId, SourceManifestEntry> = {
  PENAL_MD: {
    id: 'PENAL_MD',
    title: 'Repaso intensivo de Derecho Penal colombiano para entrevista',
    filename: 'Valentina_Repaso_Derecho_Penal_Entrevista.md',
    relativePath: 'docs/sources/Valentina_Repaso_Derecho_Penal_Entrevista.md',
    kind: 'markdown',
    sha256: 'C690C38F956724FE1B7605CECFB1962207BB02814E347C3BE16921B6B7A5DB37',
    governs: 'Contenido jurídico de estudio',
    limitations: 'Material para entrevista, no concepto jurídico concreto',
  },
  ENTREVISTA_MD: {
    id: 'ENTREVISTA_MD',
    title: 'Preparación de entrevista — Abogada Junior en Derecho Penal',
    filename: 'Valentina_Preparacion_Entrevista_Derecho_Penal.md',
    relativePath: 'docs/sources/Valentina_Preparacion_Entrevista_Derecho_Penal.md',
    kind: 'markdown',
    sha256: '4FB9EC5E0D57806EACA22789A4F40AE039E42CF78BB80B2A43054D19E466B535',
    governs: 'Hechos de Valentina, respuestas personales, STAR, salario y preparación',
    limitations: 'No convertir experiencia transferible en litigio directo',
  },
  UX_PDF: {
    id: 'UX_PDF',
    title: 'Diseño de apps web y móviles con UX excelente',
    filename: 'UX.pdf',
    relativePath: 'docs/sources/UX.pdf',
    kind: 'pdf',
    sha256: 'F3120F9E2C6788318DDCC12DA0FA409A9D48C844B73C450E2FE2134C8762F30D',
    governs: 'Criterios de experiencia y usabilidad',
    limitations: 'No aporta doctrina ni hechos personales',
  },
  UI_PDF: {
    id: 'UI_PDF',
    title: 'De wireframe a UI premium',
    filename: 'UI.pdf',
    relativePath: 'docs/sources/UI.pdf',
    kind: 'pdf',
    sha256: '3E1D2B662EE25010C7F71A124ABDA965A884022342FF522D834FC83C5892FF2C',
    governs: 'Criterios visuales y de design system',
    limitations: 'No aporta doctrina ni hechos personales',
  },
};

export interface SourceRef {
  sourceId: SourceId;
  sourceSection: string;
  sourceAnchor: string;
  sourceExcerptHash: string;
  /** Fragmento exacto de la fuente, guardado para evitar ambigüedad (contrato §17). */
  sourceExcerpt: string;
}

interface RawExcerpt {
  section: string;
  text: string;
}

const RAW: Record<string, { sourceId: SourceId; excerpt: RawExcerpt }> = {};
for (const [anchor, value] of Object.entries(penalExcerpts as Record<string, RawExcerpt>)) {
  RAW[anchor] = { sourceId: 'PENAL_MD', excerpt: value };
}
for (const [anchor, value] of Object.entries(entrevistaExcerpts as Record<string, RawExcerpt>)) {
  RAW[anchor] = { sourceId: 'ENTREVISTA_MD', excerpt: value };
}

const HASHES = excerptHashes as Record<string, { sourceId: string; hash: string }>;

/**
 * Resuelve un anchor de fuente a su referencia completa.
 * Lanza si el anchor no existe o no tiene hash verificado: un recurso sin fuente válida
 * no puede presentarse como conocimiento definitivo (contrato §17).
 */
export function trace(anchor: string): SourceRef {
  const raw = RAW[anchor];
  if (!raw) throw new Error(`Anchor de fuente desconocido: ${anchor}`);
  const hashEntry = HASHES[anchor];
  if (!hashEntry) throw new Error(`Anchor sin hash verificado: ${anchor}. Ejecuta: npm run content:hash`);
  return {
    sourceId: raw.sourceId,
    sourceSection: raw.excerpt.section,
    sourceAnchor: anchor,
    sourceExcerptHash: hashEntry.hash,
    sourceExcerpt: raw.excerpt.text,
  };
}

/** Anchors disponibles, para auditoría y pruebas de contenido. */
export function allAnchors(): string[] {
  return Object.keys(RAW).sort();
}

/** Etiqueta corta de fuente para la UI: "ENTREVISTA_MD §5". */
export function sourceLabel(ref: SourceRef): string {
  const section = ref.sourceSection.split('—')[0].trim();
  return `${ref.sourceId} ${section}`;
}
