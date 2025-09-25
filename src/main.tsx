import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PrimeReactProvider } from 'primereact/api';
import App from './App.tsx';
import './index.css';

// import 'primereact/resources/themes/lara-dark-cyan/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import type { Theme } from './services/models.ts';

const THEME_KEY = 'expense-tracker-theme';

function setAppTheme(theme: Theme) {
  const appTheme = document.getElementById('app-theme') as HTMLLinkElement;
  if (!appTheme) throw new Error('HTML Link Element not found for id: app-theme');
  appTheme.href = appTheme.href.replace(theme === 'light' ? 'dark' : 'light', theme);
  localStorage.setItem(THEME_KEY, theme);
}

const theme = localStorage.getItem(THEME_KEY);
if (theme) setAppTheme(theme as Theme);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrimeReactProvider value={{ ripple: true }}>
      <App setAppTheme={setAppTheme} />
    </PrimeReactProvider>
  </StrictMode>
);
