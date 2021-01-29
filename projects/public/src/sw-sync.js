// See https://golb.hplar.ch/2018/12/background-sync-ng.html
// https://github.com/ralscha/blog/blob/ad3f7a54ef4de0ffa8ca81c48fc8273453667609/background-sync/clientng/src/sw-sync.js
console.log('Executing sw-sync.js v1...');

console.log('Executing sw-push-notifications.js v1...');

self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;

  console.log(notification);

  if (action === 'confirm') {
    console.log('Confirm was chosen');
    notification.close();
  } else {
    console.log(action);
    event.waitUntil(
      clients.matchAll()
        .then((clis) => {
          console.log('clients', clis);
          const client = clis.find((c) => {
            return c.visibilityState === 'visible';
          });

          console.log('client', client);
          if (client !== undefined) {
            client.navigate(notification.data.url);
            client.focus();
          } else {
            clients.openWindow(notification.data.url);
          }
          notification.close();
        })
    );
  }
});

self.addEventListener('notificationclose', (event) => {
  console.log('Notification was closed', event);
});

self.addEventListener('push', (event) => {
  console.log('Push Notification received', event);

  let data = {title: 'New!', content: 'Error - Default content value!', openUrl: '/'};

  if (event.data) {
    data = JSON.parse(event.data.text());
  }

  const options = {
    body: data.content,
    // icon: '/assets/icons/icon-24x24.png',
    // icon: 'https://family-calendar.nicolasmura.com/assets/icons/icon-24x24.png',
    icon: 'https://family-calendar.nicolasmura.com/assets/icons/icon-96x96.png',
    // badge: 'images/icons/app-icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.openUrl
    }
  };
  console.log('options', options);

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
