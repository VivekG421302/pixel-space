import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { initPwa } from './pwa.js';
import { installErrorReporting } from './errors.js';

installErrorReporting();

// No StrictMode: the engine attaches global listeners and a render loop exactly once.
createRoot(document.getElementById('root')).render(<App />);

initPwa();
