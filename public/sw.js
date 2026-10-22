const VERSION = "v1";
const STATIC_CACHE = `static-${VERSION}`;
const DYNAMIC_CACHE = `dynamic-${VERSION}`;

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/img/logo.png"
];

// 🔹 INSTALAÇÃO
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// 🔹 ATIVAÇÃO (limpa cache antigo)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (!key.includes(VERSION)) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// 🔹 FETCH (CACHE INTELIGENTE)
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // HTML → network first (sempre atualizado)
  if (req.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req).then(res => res || caches.match("/offline.html")))
    );
    return;
  }

  // CSS/JS → cache first
  if (
    req.url.includes(".css") ||
    req.url.includes(".js")
  ) {
    event.respondWith(
      caches.match(req).then((res) => {
        return (
          res ||
          fetch(req).then((fetchRes) => {
            return caches.open(STATIC_CACHE).then((cache) => {
              cache.put(req, fetchRes.clone());
              return fetchRes;
            });
          })
        );
      })
    );
    return;
  }

  // Imagens → stale while revalidate
  if (req.destination === "image") {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(req, networkRes.clone());
            });
          }
          return networkRes;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Default
  event.respondWith(fetch(req).catch(() => caches.match(req)));
});