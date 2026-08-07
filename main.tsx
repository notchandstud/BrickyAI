import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ignore benign ResizeObserver notifications from browser layout cycles
const ignoreResizeObserverError = (e: ErrorEvent) => {
  if (
    e.message &&
    typeof e.message === 'string' &&
    (e.message.includes('ResizeObserver loop completed with undelivered notifications') ||
      e.message.includes('ResizeObserver loop limit exceeded'))
  ) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
};
window.addEventListener('error', ignoreResizeObserverError);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
