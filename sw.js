const CACHE_NAME = 'presupuesto-personal-v2';

// Solo cacheamos el HTML y el manifest, NO los datos
const ARCHIVOS_CACHE = [
    './index.html',
    './manifest.json'
];

// Instalación
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ARCHIVOS_CACHE))
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

// Fetch: siempre intenta la red primero
// Solo usa caché si no hay conexión
self.addEventListener('fetch', e => {
    // Las llamadas a Firebase siempre van por red, nunca por caché
    if (e.request.url.includes('firebase') ||
        e.request.url.includes('firebaseio') ||
        e.request.url.includes('googleapis')) {
        e.respondWith(fetch(e.request));
        return;
    }

    // Para el resto: red primero, caché como respaldo
    e.respondWith(
        fetch(e.request)
            .then(respuesta => {
                const copia = respuesta.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(e.request, copia));
                return respuesta;
            })
            .catch(() => caches.match(e.request))
    );
});
