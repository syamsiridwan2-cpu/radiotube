/**
 * SERVICE WORKER - v4.0.0
 * Pre-cache + network-first, offline fallback for API & static
 */

const CACHE_NAME = 'radiostream-v4';
const OFFLINE_URL = './index.html';
const PRECACHE_URLS = [
    './',
    './index.html',
    './manifest.json',
    './css/variables.css',
    './css/base.css',
    './css/header.css',
    './css/sidebar.css',
    './css/content.css',
    './css/player.css',
    './css/animations.css',
    './css/responsive.css',
    './js/app.js',
    './sw.js',
    './icons/icon-192.svg',
    './icons/icon-512.svg'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => {})
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((names) => Promise.all(
            names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
        ))
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    const url = new URL(event.request.url);

    if (!url.protocol.startsWith('http')) return;

    // API: network-first, cache fallback
    if (url.hostname.includes('radio-browser.info')) {
        event.respondWith(networkFirstWithCache(event.request));
        return;
    }

    // Static assets & navigation: network-first
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response && response.status === 200 && response.type === 'basic') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
                }
                return response;
            })
            .catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match(OFFLINE_URL);
                }
                return caches.match(event.request).then((cached) => cached || new Response('', { status: 408, statusText: 'Request Timeout' }));
            })
    );
});

async function networkFirstWithCache(request) {
    try {
        const response = await fetch(request);
        if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, clone));
        }
        return response;
    } catch (err) {
        const cached = await caches.match(request);
        if (cached) return cached;
        return new Response(JSON.stringify([]), {
            status: 200,
            statusText: 'OK',
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
