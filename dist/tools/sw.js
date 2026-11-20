const cacheName = "oll-tools-v15";
const assets = [
  "index.html", "workout.html", "bmr.html", "workout.js", "bmr.js", "workout.css",
  "install.js", "app.webmanifest", "icon-192.png", "icon-512.png",
  "../favicon.svg", "../logo.png", "../styles.css", "../oll-config.js", "../oll-services.js"
];
const urls = new Set(assets.map((asset) => new URL(asset, self.registration.scope).href));

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(assets.map((asset) => new Request(new URL(asset, self.registration.scope), { cache: "reload" })))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key.startsWith("oll-tools-") && key !== cacheName).map((key) => caches.delete(key))
  )).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  url.search = "";
  if (url.href === self.registration.scope) url.pathname += "index.html";
  if (!urls.has(url.href)) return;
  event.respondWith(fetch(event.request).then((response) => {
    if (response.ok) {
      const copy = response.clone();
      event.waitUntil(caches.open(cacheName).then((cache) => cache.put(url.href, copy)).catch(() => {}));
    }
    return response;
  }).catch(async () => (await caches.match(url.href)) || Response.error()));
});
