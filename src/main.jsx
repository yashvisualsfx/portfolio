import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { addTask, registerBootTasks } from './animations/loader-registry';
import { hasWebGL } from './three/webgl-support';
import './styles/index.css';

// Boot tasks are registered before the first render so the preloader reports
// real work from frame one rather than starting from an empty registry.
registerBootTasks();
// The stage is the heaviest thing the hero waits on, so it is weighted
// accordingly — and only registered where a context can actually be had.
if (hasWebGL()) addTask('webgl', 4);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
