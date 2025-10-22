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

// ============================================
// MÉTODO ÚNICO: onBackgroundMessage
// ============================================
// Este es el método oficial de Firebase para manejar notificaciones en background
messaging.onBackgroundMessage((payload) => {
    console.log('🔵 [onBackgroundMessage] Mensaje recibido:', payload);
    console.log('🔵 [onBackgroundMessage] Notification:', payload.notification);
    console.log('🔵 [onBackgroundMessage] Data:', payload.data);

    // Extraer título y cuerpo
    const notificationTitle = payload.notification?.title || payload.data?.title || 'Notificación';
    const notificationBody = payload.notification?.body || payload.data?.body || 'Mensaje recibido';

    const notificationOptions = {
        body: notificationBody,
        icon: '/Icono.png',
        badge: '/Icono.png',
        tag: 'notificacion-turno-' + Date.now(),
        requireInteraction: true,
        vibrate: [300, 100, 300],
        silent: false,
        // Datos adicionales que puedes usar en el click
        data: {
            url: payload.data?.url || '/',
            clickAction: payload.data?.click_action || '/',
            ...payload.data
        }
    };

    console.log('🔔 [onBackgroundMessage] Intentando mostrar:', notificationTitle, notificationOptions);

    return self.registration.showNotification(notificationTitle, notificationOptions)
        .then(() => {
            console.log('✅ [onBackgroundMessage] Notificación mostrada correctamente');
        })
        .catch((error) => {
            console.error('❌ [onBackgroundMessage] Error al mostrar:', error);
            console.error('❌ [onBackgroundMessage] Error stack:', error.stack);
        });
});

// ============================================
// MANEJO DE CLICKS EN NOTIFICACIONES
// ============================================
self.addEventListener('notificationclick', function(event) {
    console.log('🖱️ [CLICK] Notificación clickeada:', event.notification.tag);
    console.log('🖱️ [CLICK] Datos:', event.notification.data);

    event.notification.close();

    // Obtener URL de destino (si se envió en el payload)
    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ 
            type: 'window', 
            includeUncontrolled: true 
        })
        .then(function(clientList) {
            // Buscar si ya hay una ventana abierta
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url.indexOf(self.location.origin) >= 0 && 'focus' in client) {
                    console.log('🔍 Enfocando ventana existente');
                    return client.focus();
                }
            }
            // Si no hay ventana abierta, abrir una nueva
            if (clients.openWindow) {
                console.log('🆕 Abriendo nueva ventana:', urlToOpen);
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// ============================================
// MANEJO DE SKIP_WAITING
// ============================================
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('⚡ SKIP_WAITING recibido, activando Service Worker...');
        self.skipWaiting();
    }
});

// ============================================
// CICLO DE VIDA DEL SERVICE WORKER
// ============================================
self.addEventListener('install', function(event) {
    console.log('🔥 Service Worker instalado');
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    console.log('🟢 Service Worker activado');
    event.waitUntil(clients.claim());
});

console.log('✅ Service Worker configurado completamente');