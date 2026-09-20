import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import '@fontsource-variable/geist/wght.css';
import '@fontsource-variable/geist-mono/wght.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import { App } from './app/App';
import { StoreProvider } from './state/StoreProvider';

const container = document.getElementById('root');
if (!container) throw new Error('No se encontro el nodo raiz');

/**
 * HashRouter: la build funciona abriendo el archivo directamente o desde cualquier
 * servidor estatico local, sin configuracion de rutas (contrato §6).
 */
createRoot(container).render(
  <StrictMode>
    <StoreProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </StoreProvider>
  </StrictMode>,
);

// Registro de Service Worker para capacidades PWA y funcionamiento offline
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

