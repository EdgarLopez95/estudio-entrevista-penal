import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Detectar si ya se está ejecutando como app instalada
    const checkStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(checkStandalone);

    // Detectar iOS
    const ua = window.navigator.userAgent;
    const isIosDevice = /iphone|ipad|ipod/i.test(ua);
    setIsIOS(isIosDevice);

    // Escuchar el evento de instalación de Chromium/Android
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (isStandalone || dismissed) {
    return null;
  }

  async function handleInstallClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSGuide(!showIOSGuide);
    }
  }

  // Si no es un prompt activo en Android ni un dispositivo iOS, no mostrar nada intrusivo
  if (!deferredPrompt && !isIOS) {
    return null;
  }

  return (
    <div
      className="install-card card"
      style={{
        marginTop: 'var(--space-4)',
        padding: 'var(--space-3) var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        background: 'var(--color-surface-2)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span
            style={{
              fontSize: '1.25rem',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#0E162B',
              color: '#FDE68A',
              border: '1px solid #D97706',
              flexShrink: 0,
            }}
          >
            ⚖
          </span>
          <div>
            <p style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-body)' }}>
              Instalar en tu celular
            </p>
            <p className="caption" style={{ color: 'var(--text-muted)' }}>
              Úsala a pantalla completa y sin conexión
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleInstallClick}
            style={{ padding: '6px 12px', fontSize: 'var(--text-caption)' }}
          >
            {deferredPrompt ? 'Instalar' : isIOS ? (showIOSGuide ? 'Cerrar' : 'Ver pasos') : 'Instalar'}
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setDismissed(true)}
            aria-label="Descartar aviso de instalación"
            title="Descartar"
            style={{ width: '28px', height: '28px' }}
          >
            ✕
          </button>
        </div>
      </div>

      {showIOSGuide ? (
        <div
          className="stack-2"
          style={{
            marginTop: 'var(--space-2)',
            padding: 'var(--space-3)',
            background: 'var(--color-surface-1)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-caption)',
            borderLeft: '3px solid #D97706',
          }}
        >
          <p style={{ fontWeight: 'var(--weight-medium)' }}>Para instalar en iPhone o iPad:</p>
          <ol style={{ paddingLeft: 'var(--space-4)', margin: 0 }} className="stack-1">
            <li>
              Toca el botón <strong>Compartir</strong> (el ícono de flecha hacia arriba ⎋ en la barra de Safari).
            </li>
            <li>
              Desplázate hacia abajo y pulsa <strong>"Agregar a pantalla de inicio"</strong> ⊞.
            </li>
            <li>
              Toca <strong>"Agregar"</strong> arriba a la derecha. ¡Y listo!
            </li>
          </ol>
        </div>
      ) : null}
    </div>
  );
}
