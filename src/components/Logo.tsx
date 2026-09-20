interface LogoProps {
  size?: number;
  className?: string;
  showSubtitle?: boolean;
}

/**
 * Emblema compacto (balanza estilizada con acabado dorado) para barras de navegación,
 * sidebar y cabeceras.
 */
export function LogoMark({ size = 32, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Logo Estudio"
      role="img"
    >
      <defs>
        <linearGradient id="markGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="45%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>

      {/* Escudo / Fondo sutil */}
      <rect x="2" y="2" width="44" height="44" rx="10" fill="#0E162B" stroke="url(#markGold)" strokeWidth="1.5" />

      {/* Remate superior */}
      <circle cx="24" cy="12" r="2" fill="url(#markGold)" />

      {/* Barra transversal arqueada */}
      <path
        d="M 12 17 C 16 15 20 14.5 24 14.5 C 28 14.5 32 15 36 17"
        stroke="url(#markGold)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Platillo Izquierdo */}
      <line x1="13" y1="17.5" x2="9" y2="25" stroke="url(#markGold)" strokeWidth="1.2" />
      <line x1="13" y1="17.5" x2="17" y2="25" stroke="url(#markGold)" strokeWidth="1.2" />
      <path d="M 8 25 C 8 27.5 18 27.5 18 25 Z" fill="url(#markGold)" fillOpacity="0.4" stroke="url(#markGold)" strokeWidth="1.5" />

      {/* Platillo Derecho */}
      <line x1="35" y1="17.5" x2="31" y2="25" stroke="url(#markGold)" strokeWidth="1.2" />
      <line x1="35" y1="17.5" x2="39" y2="25" stroke="url(#markGold)" strokeWidth="1.2" />
      <path d="M 30 25 C 30 27.5 40 27.5 40 25 Z" fill="url(#markGold)" fillOpacity="0.4" stroke="url(#markGold)" strokeWidth="1.5" />

      {/* Columna central */}
      <line x1="24" y1="15" x2="24" y2="33" stroke="url(#markGold)" strokeWidth="2.2" strokeLinecap="round" />

      {/* Base / Pedestal con monograma V estilizado */}
      <path d="M 18 36 L 24 33 L 30 36 Z" fill="url(#markGold)" />
      <rect x="16" y="36" width="16" height="2" rx="1" fill="url(#markGold)" />
    </svg>
  );
}

/**
 * Gran Emblema Heráldico Jurídico para la pantalla de bienvenida.
 * Aporta identidad institucional, elegancia y motivación a Valentina.
 */
export function LogoBadge({ size = 96, className = '' }: LogoProps) {
  return (
    <div
      className={`logo-badge ${className}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Emblema Valentina · Derecho Penal"
      >
        <defs>
          <radialGradient id="badgeBg" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="70%" stopColor="#0E162B" />
            <stop offset="100%" stopColor="#070B16" />
          </radialGradient>

          <linearGradient id="badgeGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="35%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>

          <linearGradient id="softGold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#F59E0B" stopOpacity="1" />
            <stop offset="100%" stopColor="#FDE68A" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Círculo Principal con sombra y gradiente */}
        <circle cx="60" cy="60" r="56" fill="url(#badgeBg)" stroke="url(#badgeGold)" strokeWidth="2.5" />
        <circle cx="60" cy="60" r="51" fill="none" stroke="url(#badgeGold)" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />

        {/* Estrellas de excelencia */}
        <g fill="url(#badgeGold)">
          <polygon points="60,16 61.5,19 65,19 62,21 63,24 60,22 57,24 58,21 55,19 58.5,19" transform="scale(0.8) translate(15, 3)" />
        </g>

        {/* Balanza de la justicia penal */}
        {/* Remate superior */}
        <path d="M 60 27 L 62 31 L 58 31 Z" fill="url(#badgeGold)" />
        <circle cx="60" cy="34" r="3" fill="#0E162B" stroke="url(#badgeGold)" strokeWidth="1.5" />

        {/* Brazo horizontal con arco sutil */}
        <path
          d="M 32 38 C 42 35 50 34 60 34 C 70 34 78 35 88 38"
          stroke="url(#badgeGold)"
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* Platillo Izquierdo */}
        <line x1="33" y1="39" x2="25" y2="54" stroke="url(#badgeGold)" strokeWidth="1.2" opacity="0.9" />
        <line x1="33" y1="39" x2="33" y2="54" stroke="url(#badgeGold)" strokeWidth="1.2" opacity="0.9" />
        <line x1="33" y1="39" x2="41" y2="54" stroke="url(#badgeGold)" strokeWidth="1.2" opacity="0.9" />
        <path d="M 23 54 C 23 60 43 60 43 54 Z" fill="url(#badgeGold)" fillOpacity="0.3" stroke="url(#badgeGold)" strokeWidth="1.8" />
        <line x1="22" y1="54" x2="44" y2="54" stroke="url(#badgeGold)" strokeWidth="1.8" />

        {/* Platillo Derecho */}
        <line x1="87" y1="39" x2="79" y2="54" stroke="url(#badgeGold)" strokeWidth="1.2" opacity="0.9" />
        <line x1="87" y1="39" x2="87" y2="54" stroke="url(#badgeGold)" strokeWidth="1.2" opacity="0.9" />
        <line x1="87" y1="39" x2="95" y2="54" stroke="url(#badgeGold)" strokeWidth="1.2" opacity="0.9" />
        <path d="M 77 54 C 77 60 97 60 97 54 Z" fill="url(#badgeGold)" fillOpacity="0.3" stroke="url(#badgeGold)" strokeWidth="1.8" />
        <line x1="76" y1="54" x2="98" y2="54" stroke="url(#badgeGold)" strokeWidth="1.8" />

        {/* Columna / Pilar de la Ley */}
        <line x1="58.5" y1="35" x2="58.5" y2="72" stroke="url(#badgeGold)" strokeWidth="1.2" />
        <line x1="60" y1="35" x2="60" y2="72" stroke="#FDE68A" strokeWidth="2.2" />
        <line x1="61.5" y1="35" x2="61.5" y2="72" stroke="url(#badgeGold)" strokeWidth="1.2" />

        {/* Base del Pilar */}
        <rect x="52" y="72" width="16" height="3" rx="1" fill="url(#badgeGold)" />

        {/* Laurel de mérito rodeando la parte inferior */}
        <g fill="url(#softGold)" opacity="0.95">
          <path d="M 44 78 C 40 76 37 72 37 72 C 37 72 41 73 44 76 Z" />
          <path d="M 39 84 C 35 82 33 78 33 78 C 33 78 37 80 39 82 Z" />
          <path d="M 37 91 C 34 88 33 83 33 83 C 33 83 36 86 38 88 Z" />
          <path d="M 46 92 C 43 94 39 95 39 95 C 39 95 42 92 44 90 Z" />
          <path d="M 52 97 C 49 98 46 98 46 98 C 46 98 48 96 50 94 Z" />

          <path d="M 76 78 C 80 76 83 72 83 72 C 83 72 79 73 76 76 Z" />
          <path d="M 81 84 C 85 82 87 78 87 78 C 87 78 83 80 81 82 Z" />
          <path d="M 83 91 C 86 88 87 83 87 83 C 87 83 84 86 82 88 Z" />
          <path d="M 74 92 C 77 94 81 95 81 95 C 81 95 78 92 76 90 Z" />
          <path d="M 68 97 C 71 98 74 98 74 98 C 74 98 72 96 70 94 Z" />

          {/* Gema / Lazo inferior */}
          <circle cx="60" cy="99" r="2.5" fill="#FDE68A" />
        </g>

        {/* Monograma 'V' sutil en el pedestal */}
        <path
          d="M 56 79 L 60 88 L 64 79"
          stroke="url(#badgeGold)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
