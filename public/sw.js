// Heart Sync Service Worker
// To support Push Notifications and PWA "Add to Home Screen" logic

const CACHE_NAME = 'heart-sync-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through strategy for now (can be optimized for offline later)
  event.respondWith(fetch(event.request));
});

// Handle Push Events (if using a push server)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Heart Sync', body: '새로운 소식이 도착했습니다!' };
  const options = {
    body: data.body,
    icon: '/logo_main.png',
    badge: '/logo_main.png',
    data: data.url
  };
  event.waitUntil(self.notificationClick(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
