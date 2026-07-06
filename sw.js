const CACHE_NAME = 'presupuesto-personal-v1';
const ARCHIVOS_CACHE = [
    './presupuesto_personal.html',
    './manifest.json',
    './logo.png'
];

// Instalación: guarda los archivos en caché
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ARCHIVOS_CACHE);
        })
    );
    self.skipWaiting();
});

// Activación: limpia cachés viejos
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            )
        )
    );
    self.clients.claim();
});

// Fetch: si hay red úsala, si no usa caché
self.addEventListener('fetch', e => {
    e.respondWith(
        fetch(e.request)
            .then(respuesta => {
                // Guarda copia fresca en caché
                const copia = respuesta.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(e.request, copia));
                return respuesta;
            })
            .catch(() => caches.match(e.request))
    );
});
