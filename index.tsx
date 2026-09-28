import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './i18n/config.ts';
import { registerSW } from "./src/registerSW";

registerSW();

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
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
      .then(() => console.log("Service Worker registrado"))
      .catch((err) => console.log("Erro SW:", err));
  });
}