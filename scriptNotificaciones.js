// scriptNotificaciones.js
import { db, auth } from './FirebaseWrapper.js';

let fcmToken = null;
let messaging = null;
const asesorActual = localStorage.getItem('nombreAsesorActual');

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    if (!asesorActual) {
        console.error('No hay asesor logueado');
        return;
    }

    inicializarNotificaciones();
    cargarConfiguracionGuardada();
    configurarEventListeners();
});

// ============================================
// CONFIGURAR FIREBASE MESSAGING
// ============================================
async function inicializarNotificaciones() {
    try {
        // Verificar si el navegador soporta Service Workers
        if (!('serviceWorker' in navigator)) {
            throw new Error('Service Workers no soportados');
        }

        // Registrar Service Worker
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service Worker registrado:', registration);

        // Importar Firebase Messaging (v9+)
        const { getMessaging, getToken, onMessage } = await import(
            'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js'
        );
        
        messaging = getMessaging();

        // Verificar estado de permisos
        const permission = Notification.permission;
        actualizarEstadoPermisos(permission);

        // Escuchar mensajes en primer plano
        onMessage(messaging, (payload) => {
            console.log('Mensaje recibido:', payload);
            mostrarNotificacionLocal(payload);
        });

    } catch (error) {
        console.error('Error inicializando notificaciones:', error);
        mostrarError('No se pudo inicializar el sistema de notificaciones');
    }
}

// ============================================
// SOLICITAR PERMISO Y OBTENER TOKEN
// ============================================
async function activarNotificaciones() {
    try {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            const { getToken } = await import(
                'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js'
            );
            
            // IMPORTANTE: Usa tu clave pública VAPID de Firebase Console
            fcmToken = await getToken(messaging, {
                vapidKey: 'BKLBdv9xF6vC-vrL38XSXpRksKDnr9mqrUwDqY6YHKP1FjNlCX_3rvFxf68c6YPi6DolngP_iEkV0RQggiscOvY', // ← Reemplaza esto
                serviceWorkerRegistration: await navigator.serviceWorker.ready
            });

            console.log('✅ Token FCM obtenido:', fcmToken);

            // Guardar token en Firebase
            await guardarTokenEnFirebase(fcmToken);
            
            actualizarEstadoPermisos('granted');
            mostrarExito('¡Notificaciones activadas correctamente!');
        } else {
            actualizarEstadoPermisos('denied');
            mostrarError('Permisos denegados');
        }
    } catch (error) {
        console.error('❌ Error al activar notificaciones:', error);
        mostrarError('Error al activar notificaciones: ' + error.message);
    }
}

// ============================================
// RESTO DEL CÓDIGO IGUAL...
// (copiar las demás funciones de la versión anterior)
// ============================================

async function desactivarNotificaciones() {
    try {
        await db.ref(`Preferencias/${asesorActual}/Notificaciones`).remove();
        fcmToken = null;
        mostrarOpciones(false);
        actualizarEstadoPermisos('default');
        document.getElementById('notificarTurnoManana').checked = false;
        document.getElementById('notificarAlmuerzo').checked = false;
        mostrarExito('Notificaciones desactivadas');
    } catch (error) {
        console.error('Error al desactivar:', error);
        mostrarError('Error al desactivar notificaciones');
    }
}

async function guardarTokenEnFirebase(token) {
    const configuracion = {
        fcmToken: token,
        notificarTurnoManana: document.getElementById('notificarTurnoManana').checked,
        notificarAlmuerzo: document.getElementById('notificarAlmuerzo').checked,
        horaNotificacion: document.getElementById('horaNotificacion').value,
        fechaActivacion: new Date().toISOString(),
        activo: true
    };

    try {
        await db.ref(`Preferencias/${asesorActual}/Notificaciones`).set(configuracion);
        console.log('Configuración guardada en Firebase');
    } catch (error) {
        console.error('Error guardando en Firebase:', error);
        throw error;
    }
}

async function guardarConfiguracion() {
    if (!fcmToken) {
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

        await db.ref(`Preferencias/${asesorActual}/Notificaciones`).update(configuracion);
        mostrarExito('Configuración actualizada');
    } catch (error) {
        console.error('Error al guardar configuración:', error);
        mostrarError('Error al guardar');
    }
}

async function cargarConfiguracionGuardada() {
    try {
        const snapshot = await db.ref(`Preferencias/${asesorActual}/Notificaciones`).once('value');
        const config = snapshot.val();

        if (config && config.activo) {
            fcmToken = config.fcmToken;
            document.getElementById('notificarTurnoManana').checked = config.notificarTurnoManana || false;
            document.getElementById('notificarAlmuerzo').checked = config.notificarAlmuerzo || false;
            document.getElementById('horaNotificacion').value = config.horaNotificacion || '07:00';
            actualizarEstadoPermisos('granted');
        }
    } catch (error) {
        console.error('Error cargando configuración:', error);
    }
}

function actualizarEstadoPermisos(permission) {
    const estadoDiv = document.getElementById('estadoPermisos');
    const mensajeSpan = document.getElementById('mensajePermiso');
    const btnActivar = document.getElementById('btnActivarNotificaciones');

    switch (permission) {
        case 'granted':
            estadoDiv.style.background = 'rgba(46, 204, 113, 0.1)';
            mensajeSpan.innerHTML = '<i class="fas fa-check-circle"></i> Notificaciones activadas';
            btnActivar.innerHTML = '<i class="fas fa-bell"></i> Desactivar Notificaciones';
            btnActivar.style.background = '#e74c3c';
            mostrarOpciones(true);
            break;
        case 'denied':
            estadoDiv.style.background = 'rgba(231, 76, 60, 0.1)';
            mensajeSpan.innerHTML = '<i class="fas fa-times-circle"></i> Notificaciones bloqueadas en el navegador';
            btnActivar.disabled = true;
            btnActivar.style.opacity = '0.5';
            break;
        default:
            estadoDiv.style.background = 'rgba(52, 152, 219, 0.1)';
            mensajeSpan.innerHTML = '<i class="fas fa-info-circle"></i> Haz clic para activar';
            btnActivar.innerHTML = '<i class="fas fa-bell"></i> Activar Notificaciones';
    }
}

function mostrarOpciones(mostrar) {
    const opciones = document.getElementById('opcionesNotificaciones');
    if (mostrar) {
        opciones.style.display = 'block';
        setTimeout(() => opciones.style.opacity = '1', 10);
    } else {
        opciones.style.opacity = '0';
        setTimeout(() => opciones.style.display = 'none', 300);
    }
}

function mostrarNotificacionLocal(payload) {
    const { title, body, icon } = payload.notification || {};
    
    if (Notification.permission === 'granted' && title) {
        new Notification(title, {
            body: body || '',
            icon: icon || '/Icono.png',
            badge: '/Icono.png'
        });
    }
}

function configurarEventListeners() {
    const btnActivar = document.getElementById('btnActivarNotificaciones');
    
    btnActivar.addEventListener('click', async () => {
        if (fcmToken) {
            await desactivarNotificaciones();
        } else {
            await activarNotificaciones();
        }
    });

    document.getElementById('notificarTurnoManana').addEventListener('change', guardarConfiguracion);
    document.getElementById('notificarAlmuerzo').addEventListener('change', guardarConfiguracion);
    document.getElementById('horaNotificacion').addEventListener('change', guardarConfiguracion);
}

function mostrarExito(mensaje) {
    if (typeof mostrarNotificacion === 'function') {
        mostrarNotificacion(mensaje, 'exito');
    } else {
        alert(mensaje);
    }
}

function mostrarError(mensaje) {
    if (typeof mostrarNotificacion === 'function') {
        mostrarNotificacion(mensaje, 'error');
    } else {
        alert(mensaje);
    }
}