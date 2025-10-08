import { PrimeReactProvider } from 'primereact/api';
import { confirmDialog } from 'primereact/confirmdialog';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import type { Theme } from './services/models.ts';
import App from './App.tsx';
import './index.css';

const THEME_KEY = 'expense-tracker-theme';
if (THEME_KEY in localStorage) setAppTheme(localStorage.getItem(THEME_KEY) as Theme);

function setAppTheme(theme: Theme) {
  const appThemeDark = document.getElementById('app-theme-dark') as HTMLLinkElement || null;
  const appThemeLight = document.getElementById('app-theme-light') as HTMLLinkElement || null;
  if (!appThemeDark || !appThemeLight) throw new Error('Theme Link Elements Not Found!');
  appThemeDark.disabled = theme === 'light';
  appThemeLight.disabled = theme === 'dark';
  localStorage.setItem(THEME_KEY, theme);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrimeReactProvider value={{ ripple: true }}>
      <App setAppTheme={setAppTheme} />
    </PrimeReactProvider>
  </StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./service-worker.js');
      await navigator.serviceWorker.ready;
      console.log('Service Worker Registered!');

      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data === 'UPDATED') {
          confirmDialog({
            header: 'New Update Installed',
            message: 'Reload the app now?',
            icon: 'pi pi-sync',
            closable: false,
            accept: () => window.location.reload()
          });
          return;
        }
        console.log('Message From SW:', event.data);
      });

      const controller = navigator.serviceWorker.controller ?? registration.active;
      controller?.postMessage('CHECK-UPDATE');
    }
    catch (err) { console.error('Service Worker Error:', err); }
  });
}
