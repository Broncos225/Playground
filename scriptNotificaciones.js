import {
    getDatabase,
    ref as dbRef,
    set,
    update,
    get,
    remove
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';


// 1. Configuración de Firebase (debe ser tu configuración real)
const firebaseConfig = {
    apiKey: "AIzaSyAw5z5-aKicJ78N1UahQ-Lu_u7WP6MNVRE",
    authDomain: "playgroundbdstop.firebaseapp.com",
    databaseURL: "https://playgroundbdstop-default-rtdb.firebaseio.com",
    projectId: "playgroundbdstop",
    storageBucket: "playgroundbdstop.appspot.com",
    messagingSenderId: "808082296806",
    appId: "1:808082296806:web:c1d0dc3c2fc5fbf6c9d027"
};
// 2. Inicializar la aplicación
const app = initializeApp(firebaseConfig);

// 3. Obtener instancias de servicio modulares
const db = getDatabase(app);
const auth = getAuth(app);
let fcmToken = null;
let messaging = null;
const asesorActual = localStorage.getItem('nombreAsesorActual');

// TU VAPID KEY PÚBLICA DE FIREBASE CONSOLE
const VAPID_KEY = 'BKLBdv9xF6vC-vrL38XSXpRksKDnr9mqrUwDqY6YHKP1FjNlCX_3rvFxf68c6YPi6DolngP_iEkV0RQggiscOvY'; // ← REEMPLAZA CON TU CLAVE REAL

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🟢 DOM Cargado');
    console.log('👤 Asesor actual:', asesorActual);

    if (!asesorActual) {
        console.error('❌ No hay asesor logueado');
        mostrarError('Debes iniciar sesión primero');
        return;
    }

    inicializarNotificaciones();
    configurarEventListeners();
});

// ============================================
// CONFIGURAR FIREBASE MESSAGING
// ============================================
async function inicializarNotificaciones() {
    console.log('🟢 Iniciando configuración de notificaciones...');

    try {
        // Verificar soporte de Service Workers
        if (!('serviceWorker' in navigator)) {
            throw new Error('Service Workers no soportados en este navegador');
        }
        console.log('✅ Service Workers soportados');

        // Verificar soporte de notificaciones
        if (!('Notification' in window)) {
            throw new Error('Notificaciones no soportadas en este navegador');
        }
        console.log('✅ Notificaciones soportadas');

        // Registrar Service Worker
        console.log('📝 Registrando Service Worker...');
        const registration = await navigator.serviceWorker.register('Playground/firebase-messaging-sw.js');
        console.log('✅ Service Worker registrado:', registration);

        // Esperar a que esté activo
        await navigator.serviceWorker.ready;
        console.log('✅ Service Worker listo');

        // Importar Firebase Messaging
        console.log('📦 Importando Firebase Messaging...');
        const messagingModule = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js');
        const { getMessaging, getToken, onMessage } = messagingModule;
        console.log('✅ Firebase Messaging importado');

        messaging = getMessaging();
        console.log('✅ Messaging inicializado');

        await cargarConfiguracionGuardada();

        // Verificar estado de permisos
        const permission = Notification.permission;
        console.log('🔔 Permiso actual:', permission);

        // Escuchar mensajes en primer plano
        onMessage(messaging, (payload) => {
            console.log('📬 Mensaje recibido:', payload);
            mostrarNotificacionLocal(payload);
        });

        console.log('✅ Notificaciones inicializadas correctamente');

    } catch (error) {
        console.error('❌ Error inicializando notificaciones:', error);
        console.error('Stack:', error.stack);
        mostrarError('Error al inicializar: ' + error.message);
    }
}

// ============================================
// SOLICITAR PERMISO Y OBTENER TOKEN
// ============================================
async function activarNotificaciones() {
    console.log('🟢 Solicitando permisos de notificación...');

    try {
        // Verificar que messaging esté inicializado
        if (!messaging) {
            throw new Error('Messaging no está inicializado. Recarga la página.');
        }
        console.log('✅ Messaging verificado');

        // Solicitar permiso
        console.log('🔔 Solicitando permiso al usuario...');
        const permission = await Notification.requestPermission();
        console.log('🔔 Permiso obtenido:', permission);

        if (permission !== 'granted') {
            actualizarEstadoPermisos('denied');
            mostrarError('Permisos denegados. Actívalos en la configuración del navegador.');
            return;
        }

        // Importar getToken
        console.log('📦 Importando getToken...');
        const messagingModule = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js');
        const { getToken } = messagingModule;

        // Verificar Service Worker
        const swRegistration = await navigator.serviceWorker.ready;
        console.log('✅ Service Worker ready:', swRegistration);

        // Verificar VAPID Key
        if (VAPID_KEY === 'BKLBdv' || !VAPID_KEY) {
            throw new Error('⚠️ ERROR: Debes configurar tu VAPID_KEY en el código (línea 15)');
        }

        // Obtener token FCM
        console.log('🔑 Obteniendo token FCM con VAPID...');
        fcmToken = await getToken(messaging, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: swRegistration
        });

        if (!fcmToken) {
            throw new Error('No se pudo obtener el token FCM');
        }

        console.log('✅ Token FCM obtenido:', fcmToken.substring(0, 20) + '...');

        // Guardar token en Firebase
        console.log('💾 Guardando configuración en Firebase...');
        await guardarTokenEnFirebase(fcmToken);
        console.log('✅ Configuración guardada');

        actualizarEstadoPermisos('granted');
        mostrarExito('¡Notificaciones activadas correctamente!');

    } catch (error) {
        console.error('❌ Error al activar notificaciones:', error);
        console.error('Tipo de error:', error.name);
        console.error('Mensaje:', error.message);
        console.error('Stack:', error.stack);

        // Mostrar error específico
        let mensajeError = 'Error al activar notificaciones';

        if (error.code === 'messaging/permission-blocked') {
            mensajeError = 'Los permisos están bloqueados. Ve a la configuración del navegador.';
        } else if (error.code === 'messaging/failed-service-worker-registration') {
            mensajeError = 'Error registrando Service Worker. Recarga la página.';
        } else if (error.message.includes('VAPID')) {
            mensajeError = 'Error de configuración VAPID. Verifica la clave en el código.';
        } else {
            mensajeError = error.message;
        }

        mostrarError(mensajeError);
    }
}

// ============================================
// DESACTIVAR NOTIFICACIONES
// ============================================
async function desactivarNotificaciones() {
    console.log('🔴 Desactivando notificaciones...');

    try {
        const referencia = dbRef(db, `Preferencias/${asesorActual}/Notificaciones`);
        await remove(referencia);
        console.log('✅ Configuración eliminada de Firebase');

        fcmToken = null;
        mostrarOpciones(false);
        actualizarEstadoPermisos('default');

        document.getElementById('notificarTurnoManana').checked = false;
        document.getElementById('notificarAlmuerzo').checked = false;

        mostrarExito('Notificaciones desactivadas');
    } catch (error) {
        console.error('❌ Error al desactivar:', error);
        mostrarError('Error al desactivar notificaciones');
    }
}

// ============================================
// GUARDAR TOKEN Y CONFIGURACIÓN EN FIREBASE
// ============================================
async function guardarTokenEnFirebase(token) {
    console.log('💾 Preparando configuración...');

    const configuracion = {
        fcmToken: token,
        notificarTurnoManana: document.getElementById('notificarTurnoManana').checked,
        notificarAlmuerzo: document.getElementById('notificarAlmuerzo').checked,
        horaNotificacion: document.getElementById('horaNotificacion').value,
        fechaActivacion: new Date().toISOString(),
        activo: true
    };

    console.log('📦 Configuración:', configuracion);

    try {
        const referencia = dbRef(db, `Preferencias/${asesorActual}/Notificaciones`);
        await set(referencia, configuracion);
        console.log('✅ Configuración guardada en:', `Preferencias/${asesorActual}/Notificaciones`);
    } catch (error) {
        console.error('❌ Error guardando en Firebase:', error);
        throw error;
    }
}

// ============================================
// GUARDAR CONFIGURACIÓN
// ============================================
async function guardarConfiguracion() {
    console.log('💾 Guardando configuración...');

    if (!fcmToken) {
        console.warn('⚠️ No hay token, primero activa las notificaciones');
        mostrarError('Primero activa las notificaciones');
        return;
    }

    try {
        const configuracion = {
            fcmToken: fcmToken,
            notificarTurnoManana: document.getElementById('notificarTurnoManana').checked,
            notificarAlmuerzo: document.getElementById('notificarAlmuerzo').checked,
            horaNotificacion: document.getElementById('horaNotificacion').value,
            fechaActualizacion: new Date().toISOString(),
            activo: true
        };

        const referencia = dbRef(db, `Preferencias/${asesorActual}/Notificaciones`);
        await update(referencia, configuracion);
        console.log('✅ Configuración actualizada');
        mostrarExito('Configuración actualizada');
    } catch (error) {
        console.error('❌ Error al guardar:', error);
        mostrarError('Error al guardar');
    }
}

// ============================================
// CARGAR CONFIGURACIÓN GUARDADA
// ============================================
// scriptNotificaciones.js (Línea 304, aproximadamente)
// scriptNotificaciones.js (Línea 304, aproximadamente)

async function cargarConfiguracionGuardada() {
    console.log('📂 Cargando configuración guardada...');
    
    try {
        const referencia = dbRef(db, `Preferencias/${asesorActual}/Notificaciones`);
        const snapshot = await get(referencia);
        const config = snapshot.val();
        
        const permission = Notification.permission; // Obtener el permiso del navegador

        if (config && config.activo) {
            // CASO A: Configuración ACTIVA en Firebase
            console.log('✅ Configuración encontrada:', config);
            fcmToken = config.fcmToken;
            // ... (Actualizar checkboxes y hora) ...
            document.getElementById('notificarTurnoManana').checked = config.notificarTurnoManana || false;
            document.getElementById('notificarAlmuerzo').checked = config.notificarAlmuerzo || false;
            document.getElementById('horaNotificacion').value = config.horaNotificacion || '07:00';
            actualizarEstadoPermisos('granted'); // Muestra como ACTIVO
        } else if (permission === 'denied') {
             // CASO C: Navegador Bloqueó el permiso
            console.log('🚫 Permiso de navegador denegado');
            actualizarEstadoPermisos('denied'); // Muestra como BLOQUEADO
        } else {
            // CASO B: Configuración NO ACTIVA en Firebase (pero el permiso puede ser 'granted' o 'default')
            console.log('ℹ️ No hay configuración guardada en Firebase. Estado por defecto.');
            // Restablece fcmToken y fuerza el estado a 'default' (Activar Notificaciones).
            fcmToken = null; 
            actualizarEstadoPermisos('default'); // Muestra como DESACTIVADO / Por activar
        }
    } catch (error) {
        console.error('❌ Error cargando configuración:', error);
        // En caso de error de red o Firebase, también forzar estado por defecto.
        actualizarEstadoPermisos('default'); 
    }
}

// ============================================
// ACTUALIZAR ESTADO DE PERMISOS
// ============================================
function actualizarEstadoPermisos(permission) {
    console.log('🔄 Actualizando UI para permiso:', permission);

    const estadoDiv = document.getElementById('estadoPermisos');
    const mensajeSpan = document.getElementById('mensajePermiso');
    const btnActivar = document.getElementById('btnActivarNotificaciones');

    if (!estadoDiv || !mensajeSpan || !btnActivar) {
        console.error('❌ No se encontraron los elementos del DOM');
        return;
    }

    switch (permission) {
        case 'granted':
            estadoDiv.style.background = 'rgba(46, 204, 113, 0.1)';
            mensajeSpan.innerHTML = '<i class="fas fa-check-circle"></i> Notificaciones activadas';
            btnActivar.innerHTML = '<i class="fas fa-bell-slash"></i> Desactivar Notificaciones';
            btnActivar.style.background = '#e74c3c';
            btnActivar.disabled = false;
            mostrarOpciones(true);
            break;
        case 'denied':
            estadoDiv.style.background = 'rgba(231, 76, 60, 0.1)';
            mensajeSpan.innerHTML = '<i class="fas fa-times-circle"></i> Notificaciones bloqueadas. Actívalas en la configuración del navegador.';
            btnActivar.disabled = true;
            btnActivar.style.opacity = '0.5';
            mostrarOpciones(false);
            break;
        default:
            estadoDiv.style.background = 'rgba(52, 152, 219, 0.1)';
            mensajeSpan.innerHTML = '<i class="fas fa-info-circle"></i> Haz clic en el botón para activar las notificaciones';
            btnActivar.innerHTML = '<i class="fas fa-bell"></i> Activar Notificaciones';
            btnActivar.disabled = false;
            btnActivar.style.background = '';
            mostrarOpciones(false);
    }
}

// ============================================
// MOSTRAR/OCULTAR OPCIONES
// ============================================
function mostrarOpciones(mostrar) {
    const opciones = document.getElementById('opcionesNotificaciones');
    if (!opciones) {
        console.error('❌ No se encontró opcionesNotificaciones');
        return;
    }

    if (mostrar) {
        opciones.style.display = 'block';
        setTimeout(() => opciones.style.opacity = '1', 10);
    } else {
        opciones.style.opacity = '0';
        setTimeout(() => opciones.style.display = 'none', 300);
    }
}

// ============================================
// MOSTRAR NOTIFICACIÓN LOCAL
// ============================================
function mostrarNotificacionLocal(payload) {
    console.log('🔔 Mostrando notificación local:', payload);

    const { title, body, icon } = payload.notification || {};

    if (Notification.permission === 'granted' && title) {
        new Notification(title, {
            body: body || '',
            icon: icon || '/Icono.png',
            badge: '/Icono.png'
        });
    }
}

// ============================================
// EVENT LISTENERS
// ============================================
function configurarEventListeners() {
    console.log('🔗 Configurando event listeners...');

    const btnActivar = document.getElementById('btnActivarNotificaciones');

    if (!btnActivar) {
        console.error('❌ No se encontró btnActivarNotificaciones');
        return;
    }

    btnActivar.addEventListener('click', async () => {
        console.log('🖱️ Click en botón activar. Token actual:', fcmToken ? 'existe' : 'no existe');

        if (fcmToken) {
            await desactivarNotificaciones();
        } else {
            await activarNotificaciones();
        }
    });

    const checkboxes = ['notificarTurnoManana', 'notificarAlmuerzo', 'horaNotificacion'];
    checkboxes.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', () => {
                console.log(`🔄 Cambio en ${id}`);
                guardarConfiguracion();
            });
        }
    });

    console.log('✅ Event listeners configurados');
}

// ============================================
// UTILIDADES DE NOTIFICACIÓN
// ============================================
function mostrarExito(mensaje) {
    console.log('✅', mensaje);
    if (typeof mostrarNotificacion === 'function') {
        mostrarNotificacion(mensaje, 'exito');
    } else {
        alert('✅ ' + mensaje);
    }
}

function mostrarError(mensaje) {
    console.error('❌', mensaje);
    if (typeof mostrarNotificacion === 'function') {
        mostrarNotificacion(mensaje, 'error');
    } else {
        alert('❌ ' + mensaje);
    }
}