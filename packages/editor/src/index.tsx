import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { FormEditor } from './index';
import Example from './Example';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FormEditor />
  </StrictMode>
);
