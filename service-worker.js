
const CACHE_NAME = 'studyhub-v1';
const urlsToCache = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Best-effort offline notification scheduling.
// For guaranteed delivery, a push server or more advanced APIs like Notification Triggers would be needed.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { title, options, delay } = event.data.payload;
    setTimeout(() => {
      self.registration.showNotification(title, options);
    }, delay);
  }
});