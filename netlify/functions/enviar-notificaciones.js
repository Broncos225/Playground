const admin = require('firebase-admin');

// Inicializar Firebase Admin
if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
}

const db = admin.database();

// MAPEO DE TURNOS Y ALMUERZOS
const MAPEO_TURNOS = {
    'T1': 'T1', 'T1N': 'T1', 'T1RS': 'T1',
    'T2': 'T2', 'T2N': 'T2', 'T2RS': 'T2',
    'T3': 'T3', 'T3N': 'T3', 'T3RS': 'T3',
    'T4': 'T4', 'T4N': 'T4', 'T4RE': 'T4',
    'T5': 'T5', 'T5N': 'T5', 'T5RS': 'T5',
    'T6': 'T6', 'T6N': 'T6', 'T6RE': 'T6',
    'TP': 'T2', 'TPR': 'T2',
    'TSAN': 'TSAN'
};

const RANGOS_TURNOS = {
    'T1': '7:00 am a 3:30 pm',
    'T1N': '7:00 am a 4:00 pm',
    'T1RS': '7:00 am a 3:00 pm',
    'T2': '9:00 am a 5:30 pm',
    'T2N': '9:00 am a 6:00 pm',
    'T2RS': '9:00 am a 5:00 pm',
    'T3': '10:00 am a 6:30 pm',
    'T3N': '9:30 am a 6:30 pm',
    'T3RS': '10:00 am a 6:00 pm',
    'T4': '10:30 am a 7:00 pm',
    'T4N': '10:00 am a 7:00 pm',
    'T4RE': '11:00 am a 7:00 pm',
    'T5': '11:30 am a 8:00 pm',
    'T5N': '11:00 am a 8:00 pm',
    'T5RS': '12:00 pm a 8:00 pm',
    'T6': '1:00 pm a 9:30 pm',
    'T6N': '12:30 pm a 9:30 pm',
    'T6RE': '1:30 pm a 9:30 pm',
    'TP': '8:00 am a 6:00 pm',
    'TPR': '8:00 am a 5:00 pm',
    'TSAN': '8:00 am a 4:30 pm'
};

const HORARIOS_ALMUERZO = {
    'T1': '11:00 am - 12:00 pm',
    'T2': '11:45 am - 12:45 pm',
    'T3': '12:30 pm - 1:30 pm',
    'T4': '1:15 pm - 2:15 pm',
    'T5': '2:00 pm - 3:00 pm',
    'T6': '2:45 pm - 3:45 pm'
};

// ============================================
// HANDLER PRINCIPAL
// ============================================
exports.handler = async (event, context) => {
    console.log('🔔 Iniciando envío de notificaciones...');

    try {
        const horaActual = obtenerHoraColombia();
        console.log(`⏰ Hora actual Colombia: ${horaActual}`);

        const usuarios = await obtenerUsuariosConNotificaciones(horaActual);
        console.log(`👥 Usuarios a notificar: ${usuarios.length}`);

        if (usuarios.length === 0) {
            return {
                statusCode: 200,
                body: JSON.stringify({ mensaje: 'No hay usuarios para notificar' })
            };
        }

        const resultados = await Promise.all(
            usuarios.map(usuario => enviarNotificacionPersonalizada(usuario))
        );

        const exitosas = resultados.filter(r => r.exito).length;

        return {
            statusCode: 200,
            body: JSON.stringify({
                mensaje: `Notificaciones enviadas: ${exitosas}/${usuarios.length}`,
                hora: horaActual,
                resultados
            })
        };

    } catch (error) {
        console.error('❌ Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

function obtenerHoraColombia() {
    const ahora = new Date();
    return ahora.toLocaleTimeString('es-CO', {
        timeZone: 'America/Bogota',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

async function obtenerUsuariosConNotificaciones(horaActual) {
    const snapshot = await db.ref('Preferencias').once('value');
    const preferencias = snapshot.val() || {};
    const usuarios = [];

    for (const [nombre, datos] of Object.entries(preferencias)) {
        const notif = datos.Notificaciones;

        if (notif?.activo && notif?.fcmToken && horaCoincide(horaActual, notif.horaNotificacion)) {
            usuarios.push({
                nombre,
                token: notif.fcmToken,
                notificarTurno: notif.notificarTurnoManana || false,
                notificarAlmuerzo: notif.notificarAlmuerzo || false
            });
        }
    }

    return usuarios;
}

function horaCoincide(hora1, hora2) {
    const [h1, m1] = hora1.split(':').map(Number);
    const [h2, m2] = hora2.split(':').map(Number);
    const minutos1 = h1 * 60 + m1;
    const minutos2 = h2 * 60 + m2;
    return Math.abs(minutos1 - minutos2) <= 5;
}

async function enviarNotificacionPersonalizada(usuario) {
    try {
        const manana = new Date();
        manana.setDate(manana.getDate() + 1);

        const año = manana.getFullYear();
        const mes = manana.getMonth() + 1;
        const dia = manana.getDate();
        const idCelda = dia + 1;

        let mensaje = `📅 ${formatearFecha(manana)}\n`;
        let hayInfo = false;

        if (usuario.notificarTurno) {
            const turno = await obtenerTurnoUsuario(usuario.nombre, año, mes, idCelda);

            if (turno) {
                const rango = RANGOS_TURNOS[turno] || turno;
                mensaje += `\n🕐 Turno: ${turno} (${rango})`;
                hayInfo = true;

                if (usuario.notificarAlmuerzo) {
                    const tieneAlmuerzo = await verificarAlmuerzoUsuario(usuario.nombre, turno, dia);
                    const turnoAlmuerzo = MAPEO_TURNOS[turno] || turno;
                    const horarioAlmuerzo = HORARIOS_ALMUERZO[turnoAlmuerzo];

                    if (tieneAlmuerzo && horarioAlmuerzo) {
                        mensaje += `\n🍽️ Almuerzo: SÍ ✓ (${horarioAlmuerzo})`;
                    } else {
                        mensaje += `\n🍽️ Almuerzo: NO ✗`;
                    }
                }
            } else {
                mensaje += `\n📭 No tienes turno asignado`;
                hayInfo = true;
            }
        } else if (usuario.notificarAlmuerzo) {
            const turno = await obtenerTurnoUsuario(usuario.nombre, año, mes, idCelda);
            if (turno) {
                const tieneAlmuerzo = await verificarAlmuerzoUsuario(usuario.nombre, turno, dia);
                const turnoAlmuerzo = MAPEO_TURNOS[turno] || turno;
                const horarioAlmuerzo = HORARIOS_ALMUERZO[turnoAlmuerzo];

                if (tieneAlmuerzo && horarioAlmuerzo) {
                    mensaje += `\n🍽️ Almuerzo: SÍ ✓ (${horarioAlmuerzo})`;
                } else {
                    mensaje += `\n🍽️ Almuerzo: NO ✗`;
                }
                hayInfo = true;
            }
        }

        if (!hayInfo) {
            return { usuario: usuario.nombre, exito: false, motivo: 'Sin datos' };
        }

        // ENVIAR CON FIREBASE ADMIN (método moderno)
        await admin.messaging().send({
            token: usuario.token,
            notification: {
                title: 'Recordatorio del Día',
                body: mensaje.trim()
            },
            webpush: {
                notification: {
                    icon: '/Icono.png',
                    badge: '/Icono.png',
                    tag: 'recordatorio-diario'
                }
            }
        });

        console.log(`✅ Notificación enviada a ${usuario.nombre}`);
        return { usuario: usuario.nombre, exito: true, mensaje };

    } catch (error) {
        console.error(`❌ Error con ${usuario.nombre}:`, error);
        return { usuario: usuario.nombre, exito: false, error: error.message };
    }
}

async function obtenerTurnoUsuario(asesor, año, mes, idCelda) {
    try {
        const snapshot = await db.ref(`celdas/${asesor}/${idCelda}/${año}/${mes}`).once('value');
        const turno = snapshot.val();
        return (typeof turno === 'string' && turno.trim()) ? turno.trim() : null;
    } catch (error) {
        console.error(`Error obteniendo turno:`, error);
        return null;
    }
}

async function verificarAlmuerzoUsuario(asesor, turnoOriginal, dia) {
    try {
        const turnoAlmuerzo = MAPEO_TURNOS[turnoOriginal];
        if (!turnoAlmuerzo) return false;

        const snapshot = await db.ref(`Almuerzos/${turnoAlmuerzo}/${dia}`).once('value');
        const listaAlmuerzos = snapshot.val();

        if (Array.isArray(listaAlmuerzos)) {
            return listaAlmuerzos.includes(asesor);
        }

        if (typeof listaAlmuerzos === 'object' && listaAlmuerzos) {
            return Object.values(listaAlmuerzos).includes(asesor);
        }

        return false;
    } catch (error) {
        console.error(`Error verificando almuerzo:`, error);
        return false;
    }
}

function formatearFecha(fecha) {
    return fecha.toLocaleDateString('es-CO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'America/Bogota'
    });
}

