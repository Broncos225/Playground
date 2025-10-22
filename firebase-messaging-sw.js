// firebase-messaging-sw.js
console.log('🟢 Service Worker cargado');

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

console.log('📦 Scripts de Firebase importados');

// Tu configuración de Firebase (la misma de FirebaseWrapper.js)
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

    const notificationTitle = payload.notification?.title || 'Notificación';
    const notificationOptions = {
        body: payload.notification?.body || '',
        icon: '/Icono.png',
        badge: '/Icono.png',
        tag: 'notificacion-turno',
        requireInteraction: false
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

console.log('✅ Service Worker configurado completamente');