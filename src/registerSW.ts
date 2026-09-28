export function registerSW() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").then((registration) => {

      // 🔥 Atualização automática
      setInterval(() => {
        registration.update();
      }, 60000);

      registration.onupdatefound = () => {
        const newWorker = registration.installing;

        if (newWorker) {
          newWorker.onstatechange = () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              console.log("Nova versão disponível");

              // força reload automático
              window.location.reload();
            }
          };
        }
      };
    });
  }
}