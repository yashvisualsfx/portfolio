import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { registerBootTasks } from './animations/loader-registry';
import './styles/index.css';

// Boot tasks are registered before the first render so the preloader reports
// real work from frame one rather than starting from an empty registry.
registerBootTasks();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
