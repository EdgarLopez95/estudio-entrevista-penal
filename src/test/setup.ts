import '@testing-library/jest-dom/vitest';

/**
 * jsdom no implementa matchMedia. La aplicacion la usa para el tema `system` y para
 * `prefers-reduced-motion`, asi que se provee una implementacion minima en pruebas.
 */
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

/** jsdom expone scrollTo, pero solo informa que no está implementado al invocarlo. */
if (typeof window !== 'undefined') {
  window.scrollTo = () => {};
}
