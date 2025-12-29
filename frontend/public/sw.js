self.addEventListener('install', (_event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// The point of this service worker token cache is to allow multiple tabs and apps to share the same authentication token without relying solely on localStorage. This is very much just a mobile device thing to make the tokens persist a bit longer and not automatically cleaned up by the operating system.
// It intercepts all requests to SHARED_DATA_ENDPOINT (a fake URL).
// Use unique enough string here so as not to interfere with other queries. Check the source code for usage.
const SHARED_DATA_ENDPOINT = '/swTokenCache';

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
