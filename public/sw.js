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

// Handle Push Events
self.addEventListener('push', (event) => {
  let data = {};
  
  try {
    if (event.data) {
      data = event.data.json();
    } else {
      data = { title: 'Heart Sync', body: '새로운 소식이 도착했습니다! ❤️' };
    }
  } catch (e) {
    console.error('Push data parse error:', e);
    data = { title: 'Heart Sync', body: event.data ? event.data.text() : '새로운 소식이 도착했습니다!' };
  }

  const options = {
    body: data.body || '메시지 내용을 확인해보세요.',
    icon: '/logo_main.png',
    badge: '/logo_main.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || 'general-push',
    renotify: true,
    data: { 
      url: data.url || '/',
      tab: data.tab || 'home'
    }
  };

  // event.waitUntil ensures the service worker doesn't terminate before the notification is shown
  event.waitUntil(
    self.registration.showNotification(data.title || 'Heart Sync', options)
      .catch(err => console.error('Notification show error:', err))
  );
});

self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const tab = notification.data.tab || 'home';
  const targetUrl = `/?tab=${tab}`;
  
  notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 1. If a window is already open, focus it and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          // Send message to client to change tab without full reload
          client.postMessage({ type: 'NAVIGATE_TAB', tab: tab });
          return client.focus();
        }
      }
      // 2. If no window open, open new one with tab param
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
