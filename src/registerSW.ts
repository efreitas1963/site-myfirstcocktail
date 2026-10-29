function getCurrentBundleSrc(): string | null {
  const script = document.querySelector('script[type="module"][src*="/assets/"]');
  return script?.getAttribute('src') || null;
}

// Verifica se a Vercel já publicou uma versão nova comparando o bundle
// referenciado no index.html publicado com o que está rodando agora.
// Não depende do sw.js mudar de conteúdo (ele é estático e nunca muda
// sozinho, então o mecanismo de atualização do service worker nunca
// detectava deploys novos em abas já abertas).
async function checkForNewVersion(currentSrc: string | null) {
  if (!currentSrc) return;

  try {
    const res = await fetch('/index.html', { cache: 'no-store' });
    if (!res.ok) return;

    const html = await res.text();
    const match = html.match(/<script[^>]*type="module"[^>]*src="([^"]+)"/);
    const latestSrc = match?.[1];

    if (latestSrc && latestSrc !== currentSrc) {
      console.log('Nova versão do app publicada, atualizando...');
      window.location.reload();
    }
  } catch {
    // Sem rede ou erro temporário: tenta de novo no próximo intervalo
  }
}

export function registerSW() {
  const currentBundleSrc = getCurrentBundleSrc();
  setInterval(() => checkForNewVersion(currentBundleSrc), 60000);

  // Além do polling a cada 60s, verifica assim que a aba volta a ficar visível/em
  // foco. Timers de setInterval podem ficar pausados enquanto a aba está em
  // segundo plano (comum em PWA instalado/mobile), então uma aba reaberta ou
  // trazida de volta ao primeiro plano horas depois de um deploy só pegaria a
  // versão nova no próximo tick do intervalo — isso garante checar na hora.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkForNewVersion(currentBundleSrc);
    }
  });
  window.addEventListener('focus', () => checkForNewVersion(currentBundleSrc));

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
