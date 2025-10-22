// firebase-messaging-sw.js
console.log('🟢 Service Worker cargado');

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

console.log('📦 Scripts de Firebase importados');

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAw5z5-aKicJ78N1UahQ-Lu_u7WP6MNVRE",
    authDomain: "playgroundbdstop.firebaseapp.com",
    databaseURL: "https://playgroundbdstop-default-rtdb.firebaseio.com",
    projectId: "playgroundbdstop",
    storageBucket: "playgroundbdstop.appspot.com",
    messagingSenderId: "808082296806",
    appId: "1:808082296806:web:c1d0dc3c2fc5fbf6c9d027"
};

console.log('⚙️ Inicializando Firebase en SW...');
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();
console.log('✅ Messaging inicializado en SW');

// Manejar notificaciones en segundo plano
messaging.onBackgroundMessage((payload) => {
    console.log('📬 Mensaje en segundo plano recibido:', payload);

    // Extraer información del payload
    const notificationTitle = payload.notification?.title || payload.data?.title || 'Notificación';
    const notificationBody = payload.notification?.body || payload.data?.body || '';

    const notificationOptions = {
        body: notificationBody,
        icon: '/Icono.png',
        badge: '/Icono.png',
        tag: 'notificacion-turno',
        requireInteraction: false,
        vibrate: [200, 100, 200],
        data: {
            url: self.location.origin,
            dateOfArrival: Date.now()
        }
    };

    console.log('🔔 Mostrando notificación:', notificationTitle);

    // Mostrar la notificación
    self.registration.showNotification(notificationTitle, notificationOptions)
        .then(() => {
            console.log('✅ Notificación mostrada correctamente');
        })
        .catch((error) => {
            console.error('❌ Error al mostrar notificación:', error);
        });
});

// Manejar click en la notificación
self.addEventListener('notificationclick', (event) => {
    console.log('🖱️ Click en notificación:', event.notification.tag);

    event.notification.close();

    // Abrir o enfocar la ventana de la aplicación
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Si hay una ventana abierta, enfocarla
                for (let client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Si no hay ventana abierta, abrir una nueva
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});

console.log('✅ Service Worker configurado completamente');