import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './i18n/config.ts';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Root container not found");
}