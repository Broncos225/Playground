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

// MÉTODO PRINCIPAL: Interceptar TODOS los eventos push
self.addEventListener('push', function(event) {
    console.log('🟣 [PUSH EVENT] Recibido:', event);
    
    let notificationTitle = 'Notificación';
    let notificationOptions = {
        body: 'Mensaje recibido',
        icon: '/Icono.png',
        badge: '/Icono.png',
        tag: 'notif-' + Date.now(),
        requireInteraction: true,
        vibrate: [300, 100, 300],
        silent: false
    };
    
    if (event.data) {
        try {
            const payload = event.data.json();
            console.log('🟣 [PUSH EVENT] Payload:', payload);
            
            // Extraer datos del payload
            if (payload.notification) {
                notificationTitle = payload.notification.title || notificationTitle;
                notificationOptions.body = payload.notification.body || notificationOptions.body;
            } else if (payload.data) {
                notificationTitle = payload.data.title || notificationTitle;
                notificationOptions.body = payload.data.body || notificationOptions.body;
            }
        } catch (e) {
            console.error('❌ [PUSH EVENT] Error parseando:', e);
        }
    }
    
    console.log('🔔 [PUSH EVENT] Mostrando:', notificationTitle, notificationOptions);
    
    event.waitUntil(
        self.registration.showNotification(notificationTitle, notificationOptions)
            .then(() => {
                console.log('✅ [PUSH EVENT] Notificación mostrada exitosamente');
                return Promise.resolve();
            })
            .catch((error) => {
                console.error('❌ [PUSH EVENT] Error mostrando notificación:', error);
                console.error('❌ [PUSH EVENT] Error stack:', error.stack);
                throw error;
            })
    );
});

// MÉTODO SECUNDARIO: onBackgroundMessage (por si acaso)
messaging.onBackgroundMessage((payload) => {
    console.log('🔵 [onBackgroundMessage] Recibido:', payload);
    
    const notificationTitle = payload.notification?.title || 'Notificación';
    const notificationOptions = {
        body: payload.notification?.body || '',
        icon: '/Icono.png',
        badge: '/Icono.png',
        tag: 'bg-' + Date.now(),
        requireInteraction: true,
        vibrate: [300, 100, 300]
    };

    console.log('🔔 [onBackgroundMessage] Mostrando:', notificationTitle);
    
    return self.registration.showNotification(notificationTitle, notificationOptions)
        .then(() => {
            console.log('✅ [onBackgroundMessage] Notificación mostrada');
        })
        .catch((error) => {
            console.error('❌ [onBackgroundMessage] Error:', error);
        });
});

// Manejar click en la notificación
self.addEventListener('notificationclick', function(event) {
    console.log('🖱️ [CLICK] Notificación clickeada:', event.notification.tag);
    
    event.notification.close();
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(function(clientList) {
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url.indexOf(self.location.origin) >= 0 && 'focus' in client) {
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

// Logs de ciclo de vida
self.addEventListener('install', function(event) {
    console.log('📥 Service Worker instalado');
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    console.log('🟢 Service Worker activado');
    event.waitUntil(clients.claim());
});

console.log('✅ Service Worker configurado completamente');