self.addEventListener('install', function(event) {
    // Perform install steps
  });
  
  self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
  });
  
  const SHARED_DATA_ENDPOINT = '/token';


  self.addEventListener('fetch', function(event) {
    const {
      request,
      request: {
        url,
        method,
      },
    } = event;
    if  (url.match(SHARED_DATA_ENDPOINT)) {
      if (method === 'POST') {
        request.json().then(body => {
          caches.open(SHARED_DATA_ENDPOINT).then(function(cache) {
            cache.put(SHARED_DATA_ENDPOINT, new Response(JSON.stringify(body)));
          });
        }); 
        return new Response('{}');
      } else {
        event.respondWith(
          caches.open(SHARED_DATA_ENDPOINT).then(function(cache) {
            return cache.match(SHARED_DATA_ENDPOINT).then(function (response) {
              return response || new Response('{}');
            }) || new Response('{}');
          })
        );
      }
    } else {
      return event;
    }
  });