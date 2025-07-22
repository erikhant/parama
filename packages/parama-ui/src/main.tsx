import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

if (process.env.NODE_ENV !== 'production') {
  import('./styles/dev.css');
} else {
  import('./styles/prod.css');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
