// firebase-messaging-sw.js
console.log('🟢 Service Worker cargado - Timestamp:', new Date().toISOString());

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

// MÉTODO 1: onBackgroundMessage (Firebase moderno)
messaging.onBackgroundMessage((payload) => {
    console.log('🔵 [onBackgroundMessage] Mensaje recibido:', payload);
    console.log('🔵 [onBackgroundMessage] Notification:', payload.notification);
    console.log('🔵 [onBackgroundMessage] Data:', payload.data);

    const notificationTitle = payload.notification?.title || payload.data?.title || 'Sin título';
    const notificationBody = payload.notification?.body || payload.data?.body || 'Sin contenido';
    
    const notificationOptions = {
        body: notificationBody,
        icon: '/Icono.png',
        badge: '/Icono.png',
        tag: 'notificacion-turno-' + Date.now(),
        requireInteraction: false,
        vibrate: [200, 100, 200]
    };

    console.log('🔔 [onBackgroundMessage] Intentando mostrar:', notificationTitle, notificationOptions);
    
    return self.registration.showNotification(notificationTitle, notificationOptions)
        .then(() => {
            console.log('✅ [onBackgroundMessage] Notificación mostrada correctamente');
        })
        .catch((error) => {
            console.error('❌ [onBackgroundMessage] Error al mostrar:', error);
        });
});

// MÉTODO 2: Push Event (Firebase clásico - BACKUP)
self.addEventListener('push', (event) => {
    console.log('🟣 [push event] Push recibido:', event);
    
    if (event.data) {
        try {
            const payload = event.data.json();
            console.log('🟣 [push event] Payload parseado:', payload);
            
            const notificationTitle = payload.notification?.title || 'Notificación';
            const notificationOptions = {
                body: payload.notification?.body || '',
                icon: '/Icono.png',
                badge: '/Icono.png',
                tag: 'push-' + Date.now()
            };

            console.log('🔔 [push event] Mostrando notificación');
            
            event.waitUntil(
                self.registration.showNotification(notificationTitle, notificationOptions)
                    .then(() => console.log('✅ [push event] Notificación mostrada'))
                    .catch(err => console.error('❌ [push event] Error:', err))
            );
        } catch (error) {
            console.error('❌ [push event] Error parseando:', error);
        }
    } else {
        console.log('⚠️ [push event] No hay data en el evento');
    }
});

// Manejar click en la notificación
self.addEventListener('notificationclick', (event) => {
    console.log('🖱️ Click en notificación:', event.notification.tag);
    
    event.notification.close();
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                for (let client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        console.log('🔍 Enfocando ventana existente');
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    console.log('🆕 Abriendo nueva ventana');
                    return clients.openWindow('/');
                }
            })
    );
});

// Log cuando el SW se activa
self.addEventListener('activate', (event) => {
    console.log('🟢 Service Worker activado');
});

// Log cuando el SW se instala
self.addEventListener('install', (event) => {
    console.log('📥 Service Worker instalado');
    self.skipWaiting(); // Activar inmediatamente
});

console.log('✅ Service Worker configurado completamente');