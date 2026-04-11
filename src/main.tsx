import { PrimeReactProvider } from 'primereact/api';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import type { Theme } from './services/models.ts';

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