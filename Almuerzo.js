// Copyright (c) 2024 Andrés Felipe Yepes Tascón
// Licensed under the MIT License. See LICENSE file for details.
let app;
try {
    app = firebase.app(); // Intenta obtener la app existente
    console.log('Firebase ya está inicializado');
} catch (error) {
    // Si no existe, la inicializa
    const firebaseConfig = {
        apiKey: "tu-api-key",
        authDomain: "tu-project.firebaseapp.com",
        databaseURL: "https://tu-project-default-rtdb.firebaseio.com",
        projectId: "tu-project-id",
        storageBucket: "tu-project.appspot.com",
        messagingSenderId: "123456789",
        appId: "tu-app-id"
    };
    app = firebase.initializeApp(firebaseConfig);
    console.log('Firebase inicializado correctamente');
}

// Obtener referencia a la base de datos
const db = firebase.database();

// Función para extraer el turno base de un turno completo (ej: T1N → T1)
function extraerTurnoBase(turnoCompleto) {
    if (!turnoCompleto) return null;

    // Buscar patrones T1, T2, T3, T4, T5, T6 dentro del string
    const match = turnoCompleto.match(/T[1-6]/);
    return match ? match[0] : null;
}

// Función para obtener el turno del día siguiente
async function obtenerTurnoDiaSiguiente() {
    try {
        // Obtener el nombre del asesor actual
        var nombreAsesorActual = localStorage.getItem("nombreAsesorActual");
        if (!nombreAsesorActual) {
            throw new Error("No se encontró el nombre del asesor actual");
        }
        nombreAsesorActual = nombreAsesorActual.replace(/_/g, " ");

        // Obtener fecha del día siguiente
        const mañana = new Date();
        mañana.setDate(mañana.getDate() + 2); // Día siguiente (+2 por el ajuste actual)

        const añoSeleccionado = mañana.getFullYear();
        const mesSeleccionado = mañana.getMonth() + 1;
        const diaSiguiente = mañana.getDate();

        console.log("Consultando turno del día siguiente:");
        console.log("Asesor:", nombreAsesorActual);
        console.log("Día siguiente:", diaSiguiente);
        console.log("Año:", añoSeleccionado);
        console.log("Mes:", mesSeleccionado);

        // Consultar Firebase para obtener el turno del día siguiente
        const promesa = db.ref('celdas/' + nombreAsesorActual + '/' + diaSiguiente + '/' + añoSeleccionado + '/' + mesSeleccionado).once('value');
        const snapshot = await promesa;
        const turnoData = snapshot.val();

        const turnoCompleto = turnoData ? turnoData.texto : null;

        return {
            turnoCompleto: turnoCompleto,
            fecha: diaSiguiente + '/' + mesSeleccionado + '/' + añoSeleccionado
        };

    } catch (error) {
        console.error("Error al obtener turno del día siguiente:", error);
        return {
            turnoCompleto: null,
            fecha: 'Error'
        };
    }
}

// Función para obtener el turno de almuerzo del asesor actual desde Firebase
async function obtenerTurnoAlmuerzoAsesor() {
    try {
        // Obtener el nombre del asesor actual
        var nombreAsesorActual = localStorage.getItem("nombreAsesorActual");
        if (!nombreAsesorActual) {
            throw new Error("No se encontró el nombre del asesor actual");
        }
        nombreAsesorActual = nombreAsesorActual.replace(/_/g, " ");

        // Obtener fecha actual
        const ahora = new Date();
        const añoSeleccionado = ahora.getFullYear();
        const mesSeleccionado = ahora.getMonth() + 1; // 1-12 (junio = 6)
        const diaActual = ahora.getDate() + 1; // Ajuste para el día (obtiene el día siguiente)

        // Debug: mostrar valores en consola
        console.log("Asesor:", nombreAsesorActual);
        console.log("Día:", diaActual);
        console.log("Año:", añoSeleccionado);
        console.log("Mes:", mesSeleccionado);
        console.log("Ruta Firebase:", 'celdas/' + nombreAsesorActual + '/' + diaActual + '/' + añoSeleccionado + '/' + mesSeleccionado);

        // Consultar Firebase para obtener el turno del día actual
        const promesa = db.ref('celdas/' + nombreAsesorActual + '/' + diaActual + '/' + añoSeleccionado + '/' + mesSeleccionado).once('value');
        const snapshot = await promesa;
        const turnoAsignadoData = snapshot.val(); // This will be {texto: 'T2'} or null/undefined

        // Extract the actual turn string from the object
        const turnoCompleto = turnoAsignadoData ? turnoAsignadoData.texto : null;

        // Extraer el turno base (T1, T2, etc.) del turno completo
        const turnoBase = extraerTurnoBase(turnoCompleto);

        console.log("Turno completo obtenido:", turnoCompleto);
        console.log("Turno base extraído:", turnoBase);

        if (!turnoCompleto) { // Si no hay turno asignado
            return {
                turnoCompleto: null,
                turnoBase: null,
                rango: 'Sin turno asignado',
                estado: 'sin_asignar',
                asesor: nombreAsesorActual
            };
        }

        // Mapear los turnos con sus rangos horarios
        const mapaRangos = {
            'T1': '11:30 am - 12:30 pm',
            'T2': '12:15 pm - 1:15 pm',
            'T3': '1:00 pm - 2:00 pm',
            'T4': '1:45 pm - 2:45 pm',
            'T5': '2:30 pm - 3:30 pm',
            'T6': '3:15 pm - 4:15 pm'
        };

        // Mapear estados especiales
        const estadosEspeciales = {
            'D': 'Descanso',
            'DV': 'Descanso/Vacaciones',
            'TSA': 'Trabajo Sábado',
            'TSN': 'Trabajo Sin turno'
        };

        console.log("¿Tiene turno base válido?", turnoBase && mapaRangos[turnoBase]);

        // Si no tiene un turno base válido para almuerzo
        if (!turnoBase || !mapaRangos[turnoBase]) {
            // Verificar si es un estado especial conocido
            const estadoEspecial = estadosEspeciales[turnoCompleto];

            return {
                turnoCompleto: turnoCompleto,
                turnoBase: null,
                rango: estadoEspecial || 'Sin almuerzo',
                estado: 'no_almuerza',
                asesor: nombreAsesorActual
            };
        }

        // Verificar si está en horario de almuerzo actual
        const estado = verificarEstadoTurno(turnoBase, ahora);
        console.log("Estado calculado:", estado);

        return {
            turnoCompleto: turnoCompleto,
            turnoBase: turnoBase,
            rango: mapaRangos[turnoBase],
            estado: estado,
            asesor: nombreAsesorActual
        };

    } catch (error) {
        console.error("Error al obtener turno de almuerzo:", error);
        return {
            turnoCompleto: null,
            turnoBase: null,
            rango: 'Error al cargar',
            estado: 'error',
            asesor: nombreAsesorActual || 'Desconocido'
        };
    }
}

// Función auxiliar para verificar el estado del turno
function verificarEstadoTurno(turno, ahora) {
    const horaActual = ahora.getHours();
    const minutosActuales = ahora.getMinutes();
    const tiempoActual = horaActual * 60 + minutosActuales;

    console.log("Verificando estado del turno:", turno);
    console.log("Hora actual:", horaActual + ":" + minutosActuales);
    console.log("Tiempo actual en minutos:", tiempoActual);

    // Definir los rangos en minutos desde medianoche
    const rangos = {
        'T1': { inicio: 11 * 60 + 30, fin: 12 * 60 + 30 }, // 690-750
        'T2': { inicio: 12 * 60 + 15, fin: 13 * 60 + 15 }, // 735-795
        'T3': { inicio: 13 * 60 + 0, fin: 14 * 60 + 0 },  // 780-840
        'T4': { inicio: 13 * 60 + 45, fin: 14 * 60 + 45 }, // 825-885
        'T5': { inicio: 14 * 60 + 30, fin: 15 * 60 + 30 }, // 870-930
        'T6': { inicio: 15 * 60 + 15, fin: 16 * 60 + 15 }  // 915-975
    };

    const rango = rangos[turno];
    console.log("Rango del turno:", rango);

    if (!rango) {
        console.log("Turno no encontrado en rangos de tiempo");
        return 'indefinido';
    }

    if (tiempoActual >= rango.inicio && tiempoActual <= rango.fin) {
        console.log("Estado: ACTIVO");
        return 'activo';
    } else if (tiempoActual < rango.inicio) {
        console.log("Estado: PRÓXIMO");
        return 'proximo';
    } else {
        console.log("Estado: FINALIZADO");
        return 'finalizado';
    }
}

// Función para mostrar el horario en el elemento HTML
async function mostrarHorarioAlmuerzo() {
    const elemento = document.getElementById('HoraAlmuerzos');

    // Mostrar cargando mientras se obtienen los datos
    if (elemento) {
        elemento.innerHTML = `
            <p style="color: #6c757d; margin: 10px 0; font-size: 16px;">Cargando...</p>
        `;
    }

    try {
        // Obtener tanto el turno de almuerzo como el turno del día siguiente
        const [turnoAsesor, turnoDiaSiguiente] = await Promise.all([
            obtenerTurnoAlmuerzoAsesor(),
            obtenerTurnoDiaSiguiente()
        ]);

        let mensaje = '';
        let className = ''; // This will be the class for the main message container
        let icon = '';      // To hold the emoji/icon
        let turnText = '';  // To hold the 'T1', 'T2' etc.
        let rangeText = ''; // To hold the time range

        if (turnoAsesor.turnoBase) { // Only if a valid lunch turn exists
            turnText = `<span class="bold-turn">${turnoAsesor.turnoBase}</span>`;
            rangeText = `${turnoAsesor.rango}`;
        }

        // Información del turno completo si es diferente al base
        let turnoCompletoInfo = '';
        if (turnoAsesor.turnoCompleto && turnoAsesor.turnoCompleto !== turnoAsesor.turnoBase) {
            turnoCompletoInfo = ` (${turnoAsesor.turnoCompleto})`;
        }

        switch (turnoAsesor.estado) {
            case 'activo':
                icon = '🍽️';
                mensaje = `${icon} <span style="font-weight: bold;">ALMUERZO AHORA</span> - ${turnText}${rangeText}${turnoCompletoInfo}`;
                className = 'active';
                break;
            case 'proximo':
                icon = '⏰';
                mensaje = `${icon} Próximo almuerzo - ${turnText} - ${rangeText}${turnoCompletoInfo}`;
                className = 'proximo';
                break;
            case 'finalizado':
                icon = '✅';
                mensaje = `${icon} Almuerzo finalizado - ${turnText} - ${rangeText}${turnoCompletoInfo}`;
                className = 'finalizado';
                break;
            case 'no_almuerza':
                icon = '📋';
                mensaje = `${icon} Hoy: <span style="font-weight: bold;">${turnoAsesor.rango}</span>`;
                if (turnoAsesor.turnoCompleto) {
                    mensaje += ` (${turnoAsesor.turnoCompleto})`;
                }
                className = 'no-almuerza';
                break;
            case 'sin_asignar':
                icon = '❌';
                mensaje = `${icon} Sin turno asignado para hoy`;
                className = 'sin-asignar';
                break;
            case 'error':
                icon = '⚠️';
                mensaje = `${icon} Error al cargar información`;
                className = 'error';
                break;
            default:
                icon = '❓';
                mensaje = `${icon} Estado desconocido`;
                className = ''; // No specific class, rely on general container styles or a default
        }

        // Información del turno del día siguiente
        let mensajeDiaSiguiente = '';
        if (turnoDiaSiguiente.turnoCompleto) {
            mensajeDiaSiguiente = `
                <div class="tomorrow-turn-info assigned">
                    <strong>📅 Mañana:</strong> <span class="turn-value">${turnoDiaSiguiente.turnoCompleto}</span>
                </div>
            `;
        } else {
            mensajeDiaSiguiente = `
                <div class="tomorrow-turn-info not-assigned">
                    <strong>📅 Mañana:</strong> Sin turno asignado
                </div>
            `;
        }

        if (elemento) {
            elemento.innerHTML = `
                <div class="lunch-info-container ${className}">
                    ${mensaje}
                </div>
                ${mensajeDiaSiguiente}
            `;
        }

        return turnoAsesor;

    } catch (error) {
        console.error("Error al mostrar horario:", error);
        if (elemento) {
            elemento.innerHTML = `
                <h2 style="margin: 0px;">Almuerzo hoy:</h2>
                <p style="color: #dc3545; margin: 5px 0; font-size: 16px;">⚠️ Error al cargar información</p>
            `;
        }
    }
}

// Función para actualizar automáticamente cada 5 minutos (para no saturar Firebase)
function iniciarActualizacionAutomatica() {
    // Mostrar inmediatamente
    mostrarHorarioAlmuerzo();

    // Actualizar cada 5 minutos
    setInterval(mostrarHorarioAlmuerzo, 5 * 60 * 1000);
}

// Llamar la función cuando se cargue la página
document.addEventListener('DOMContentLoaded', iniciarActualizacionAutomatica);

// Función manual para forzar actualización
function actualizarHorarioAlmuerzo() {
    mostrarHorarioAlmuerzo();
}