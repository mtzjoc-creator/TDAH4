import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // <-- Asegúrate de que esta línea exista

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
