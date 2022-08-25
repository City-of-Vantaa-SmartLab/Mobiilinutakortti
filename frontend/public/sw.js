self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

const SHARED_DATA_ENDPOINT = '/token';

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.url.match(SHARED_DATA_ENDPOINT)) {
    event.respondWith((async () => {
      const cache = await caches.open(SHARED_DATA_ENDPOINT)
      if (request.method === 'POST') {
        const body = await request.json()
        await cache.put(SHARED_DATA_ENDPOINT, new Response(JSON.stringify(body)));
        return new Response('{}');
      } else {
        const response = await cache.match(SHARED_DATA_ENDPOINT)
        return response || new Response('{}');
      }
    })());
  }
});
