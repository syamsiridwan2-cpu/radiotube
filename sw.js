/**
 * SERVICE WORKER - v3.0.0
 * Network-first, never caches HTML/JS/CSS
 */

const CACHE_NAME = 'radiotube-static-v3';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.keys().then((names) => Promise.all(names.map((n) => caches.delete(n))))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((names) => Promise.all(names.map((n) => caches.delete(n))))
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    const url = new URL(event.request.url);

    // API - always network
    if (url.hostname.includes('radio-browser.info')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // HTML/JS/CSS/JSON - ALWAYS network, never cache
    const ext = url.pathname.split('.').pop().toLowerCase();
    if (['html', 'js', 'css', 'json'].includes(ext) || url.pathname.endsWith('/')) {
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
        return;
    }

    // Images - network first, fallback to cache
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
                }
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
