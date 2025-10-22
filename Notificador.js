
function CuentaAsesor() {
    var nombre = localStorage.getItem('nombreAsesorActual');
    var asesor = document.getElementById("AsesorActual");
    var span = document.createElement("span");

    if (nombre) {
        nombre = nombre.replace(/_/g, ' ');
        asesor.textContent = "Bienvenido/a ";
        span.textContent = nombre;
    } else {
        asesor.textContent = "Bienvenido/a ";
        span.textContent = "Nadie";
    }

    span.style.fontWeight = "lighter";
    asesor.appendChild(span);
}

function seleccionarNombre(nombre) {
    localStorage.setItem('nombreAsesorActual', nombre);
    cerrarModal2();
    CuentaAsesor();

}

// ============================================
// CONFIGURACIÓN DE LA API
// ============================================
const ONESIGNAL_APP_ID = "01d9f2ea-c74b-49d9-ac00-4af599270c3f";
const ONESIGNAL_REST_API_KEY = "os_v2_app_ahm7f2whjne5tlaajl2zsjymh55hzmgechtelu54m5aypydqans3rsuo7my7iybafmfga7edzse2kveg5742aqohoh3c2ajxmolzviq";

// ============================================
// FUNCIÓN PARA ENVIAR NOTIFICACIONES VÍA API
// ============================================
async function enviarNotificacionAPI(titulo, mensaje, playerIds = null, url = null) {
    try {
        const notificationData = {
            app_id: ONESIGNAL_APP_ID,
            headings: { "en": titulo, "es": titulo },
            contents: { "en": mensaje, "es": mensaje },
        };

        if (playerIds && playerIds.length > 0) {
            notificationData.include_player_ids = playerIds;
        } else {
            notificationData.included_segments = ["All"];
        }

        if (url) {
            notificationData.url = url;
        }

        const response = await fetch("https://onesignal.com/api/v1/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${ONESIGNAL_REST_API_KEY}`
            },
            body: JSON.stringify(notificationData)
        });

        const result = await response.json();

        if (result.id) {
            console.log("Notificación enviada exitosamente:", result);
            return result;
        } else {
            console.error("Error en la respuesta:", result);
            return null;
        }
    } catch (error) {
        console.error("Error al enviar notificación:", error);
        return null;
    }
}

// ============================================
// FUNCIONES DE SINCRONIZACIÓN CON FIREBASE
// ============================================
async function sincronizarEstadoNotificaciones() {
    try {
        const asesorActual = localStorage.getItem('nombreAsesorActual');
        if (!asesorActual) {
            console.log("No hay asesor logueado");
            return;
        }

        OneSignalDeferred.push(async function (OneSignal) {
            const isSubscribed = await OneSignal.User.PushSubscription.optedIn;
            const playerId = await OneSignal.User.PushSubscription.id;

            if (typeof firebase !== 'undefined' && firebase.database) {
                const db = firebase.database();
                await db.ref('Preferencias/' + asesorActual + '/Notificaciones/').set({
                    suscrito: isSubscribed,
                    playerId: playerId || null,
                    fechaActualizacion: new Date().toISOString(),
                    navegador: navigator.userAgent
                });
                console.log("Estado de notificaciones guardado en Firebase");
            }
        });
    } catch (error) {
        console.error("Error al sincronizar estado:", error);
    }
}

async function solicitarPermisosNotificacion() {
    try {
        OneSignalDeferred.push(async function (OneSignal) {
            await OneSignal.Slidedown.promptPush();

            setTimeout(async () => {
                await sincronizarEstadoNotificaciones();
                if (typeof actualizarUINotificaciones === 'function') {
                    actualizarUINotificaciones();
                }
            }, 2000);
        });
    } catch (error) {
        console.error("Error al solicitar permisos:", error);
    }
}

async function cargarEstadoNotificaciones() {
    try {
        const asesorActual = localStorage.getItem('nombreAsesorActual');
        if (!asesorActual) {
            return null;
        }

        if (typeof firebase !== 'undefined' && firebase.database) {
            const db = firebase.database();
            const snapshot = await db.ref('Preferencias/' + asesorActual + '/Notificaciones/').once('value');
            return snapshot.val();
        }
        return null;
    } catch (error) {
        console.error("Error al cargar estado desde Firebase:", error);
        return null;
    }
}

async function enviarNotificacionAsesor(nombreAsesor, titulo, mensaje, url = null) {
    try {
        if (typeof firebase !== 'undefined' && firebase.database) {
            const db = firebase.database();
            const snapshot = await db.ref('Preferencias/' + nombreAsesor + '/Notificaciones/').once('value');
            const notifData = snapshot.val();

            if (notifData && notifData.suscrito && notifData.playerId) {
                await enviarNotificacionAPI(titulo, mensaje, [notifData.playerId], url);
                console.log("Notificación enviada a:", nombreAsesor);
                return true;
            } else {
                console.log("Usuario no suscrito o sin Player ID");
                return false;
            }
        }
    } catch (error) {
        console.error("Error al enviar notificación a asesor:", error);
        return false;
    }
}

async function enviarNotificacionTodosAsesores(titulo, mensaje, url = null) {
    try {
        if (typeof firebase !== 'undefined' && firebase.database) {
            const db = firebase.database();
            const snapshot = await db.ref('Preferencias/').once('value');
            const preferencias = snapshot.val();

            const playerIds = [];

            for (const asesor in preferencias) {
                if (preferencias[asesor].Notificaciones?.suscrito &&
                    preferencias[asesor].Notificaciones?.playerId) {
                    playerIds.push(preferencias[asesor].Notificaciones.playerId);
                }
            }

            if (playerIds.length > 0) {
                await enviarNotificacionAPI(titulo, mensaje, playerIds, url);
                console.log(`Notificación enviada a ${playerIds.length} asesores`);
                return true;
            }
        }
    } catch (error) {
        console.error("Error al enviar notificaciones:", error);
        return false;
    }
}