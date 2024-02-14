self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("PlaygroundCache").then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/Calculadora.html",
        "/Escalamientos.html",
        "/Horarios.html",
        "/styles.css",
        "/scriptCalculadora.js",
        "/scriptEscalamientos.js",
        "/scriptHorarios.js",
        "/icono.png",
        "/package.json",
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});