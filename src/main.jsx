import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { initPwa } from './pwa.js';

// No StrictMode: the engine attaches global listeners and a render loop exactly once.
createRoot(document.getElementById('root')).render(<App />);

initPwa();
