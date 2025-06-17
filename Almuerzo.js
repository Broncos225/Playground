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

// Función para obtener información del turno (horarios estáticos de almuerzo)
function obtenerInfoAlmuerzoTurno(turnoCompleto) {
    if (!turnoCompleto) return null;

    // Mapear los turnos con sus rangos horarios de almuerzo estáticos
    const horariosAlmuerzo = {
        'T1': { apertura: '11:30 AM', cierre: '12:30 PM' },
        'T2': { apertura: '12:15 PM', cierre: '1:15 PM' },
        'T3': { apertura: '1:00 PM', cierre: '2:00 PM' },
        'T4': { apertura: '1:45 PM', cierre: '2:45 PM' },
        'T5': { apertura: '2:30 PM', cierre: '3:30 PM' },
        'T6': { apertura: '3:15 PM', cierre: '4:15 PM' },
        'TSA': { apertura: '12:00 PM', cierre: '12:30 PM' }
    };

    // Primero buscar si es TSA exacto
    if (turnoCompleto === 'TSA') {
        return horariosAlmuerzo['TSA'];
    }

    // Buscar patrones T1, T2, T3, T4, T5, T6 dentro del string
    const match = turnoCompleto.match(/T[1-6]/);
    if (match) {
        const turnoBase = match[0];
        return horariosAlmuerzo[turnoBase] || null;
    }

    return null;
}

// Función para calcular tiempo faltante
function calcularTiempoFaltante(horaObjetivo) {
    const ahora = new Date();
    const [hora, minuto] = horaObjetivo.split(':').map(num => parseInt(num));

    const objetivoHoy = new Date();
    objetivoHoy.setHours(hora, minuto, 0, 0);

    const diferencia = objetivoHoy.getTime() - ahora.getTime();

    if (diferencia <= 0) return null; // Ya pasó la hora

    const minutosFaltantes = Math.floor(diferencia / (1000 * 60));
    const horasFaltantes = Math.floor(minutosFaltantes / 60);
    const minutosRestantes = minutosFaltantes % 60;

    if (horasFaltantes > 0) {
        return `${horasFaltantes}h ${minutosRestantes}m`;
    } else {
        return `${minutosRestantes}m`;
    }
}

// Función para convertir hora en formato 12h a formato de objeto Date
function parseHora12h(hora12h) {
    const match = hora12h.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return null;

    let [, horas, minutos, periodo] = match;
    horas = parseInt(horas);
    minutos = parseInt(minutos);

    if (periodo.toUpperCase() === 'PM' && horas !== 12) {
        horas += 12;
    } else if (periodo.toUpperCase() === 'AM' && horas === 12) {
        horas = 0;
    }

    return { horas, minutos };
}

// Función para obtener información del turno completo (apertura y cierre del turno laboral)
async function obtenerInfoTurnoCompleto(turnoBase) {
    if (!turnoBase) return null;

    try {
        const snapshot = await db.ref(`Turnos/${turnoBase}`).once('value');
        const turnoInfo = snapshot.val();

        if (turnoInfo && turnoInfo.Apertura && turnoInfo.Cierre) {
            return {
                apertura: turnoInfo.Apertura,
                cierre: turnoInfo.Cierre,
                cantidad: turnoInfo.Cantidad || null
            };
        }

        return null;
    } catch (error) {
        console.error("Error al obtener información del turno completo:", error);
        return null;
    }
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
        const turnoBase = extraerTurnoBase(turnoCompleto);

        // Obtener información del turno completo (apertura y cierre laboral) desde Firebase
        let rango = null;
        if (turnoBase) {
            const infoTurnoCompleto = await obtenerInfoTurnoCompleto(turnoBase);
            if (infoTurnoCompleto) {
                rango = `${infoTurnoCompleto.apertura} - ${infoTurnoCompleto.cierre}`;
            }
        }

        return {
            turnoCompleto: turnoCompleto,
            turnoBase: turnoBase,
            rango: rango,
            fecha: diaSiguiente + '/' + mesSeleccionado + '/' + añoSeleccionado
        };

    } catch (error) {
        console.error("Error al obtener turno del día siguiente:", error);
        return {
            turnoCompleto: null,
            turnoBase: null,
            rango: null,
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
                asesor: nombreAsesorActual,
                tiempoFaltante: null
            };
        }

        // Obtener información del turno de almuerzo (horarios estáticos)
        let infoAlmuerzo = null;
        let rango = null;
        if (turnoCompleto) {
            infoAlmuerzo = obtenerInfoAlmuerzoTurno(turnoCompleto);
            if (infoAlmuerzo) {
                rango = `${infoAlmuerzo.apertura} - ${infoAlmuerzo.cierre}`;
            }
        }

        // Mapear estados especiales
        const estadosEspeciales = {
            'D': 'Descanso',
            'DV': 'Descanso/Vacaciones',
            'TSN': 'Trabajo Sin turno'
        };

        console.log("¿Tiene horario de almuerzo válido?", turnoCompleto, infoAlmuerzo);

        // Si no tiene un horario de almuerzo válido
        if (!infoAlmuerzo) {
            // Verificar si es un estado especial conocido
            const estadoEspecial = estadosEspeciales[turnoCompleto];

            return {
                turnoCompleto: turnoCompleto,
                turnoBase: turnoBase,
                rango: estadoEspecial || 'Sin almuerzo',
                estado: 'no_almuerza',
                asesor: nombreAsesorActual,
                tiempoFaltante: null
            };
        }

        // Verificar si está en horario de almuerzo actual y calcular tiempo faltante
        const estadoYTiempo = verificarEstadoTurnoConTiempo(infoAlmuerzo, ahora);
        console.log("Estado y tiempo calculado:", estadoYTiempo);

        return {
            turnoCompleto: turnoCompleto,
            turnoBase: turnoBase,
            rango: rango,
            estado: estadoYTiempo.estado,
            asesor: nombreAsesorActual,
            tiempoFaltante: estadoYTiempo.tiempoFaltante,
            infoAlmuerzo: infoAlmuerzo
        };

    } catch (error) {
        console.error("Error al obtener turno de almuerzo:", error);
        return {
            turnoCompleto: null,
            turnoBase: null,
            rango: 'Error al cargar',
            estado: 'error',
            asesor: nombreAsesorActual || 'Desconocido',
            tiempoFaltante: null
        };
    }
}

// Función auxiliar para verificar el estado del turno con tiempo faltante
function verificarEstadoTurnoConTiempo(infoAlmuerzo, ahora) {
    const horaActual = ahora.getHours();
    const minutosActuales = ahora.getMinutes();
    const tiempoActual = horaActual * 60 + minutosActuales;

    console.log("Verificando estado del turno con info:", infoAlmuerzo);
    console.log("Hora actual:", horaActual + ":" + minutosActuales);
    console.log("Tiempo actual en minutos:", tiempoActual);

    // Parsear las horas de apertura y cierre
    const aperturaObj = parseHora12h(infoAlmuerzo.apertura);
    const cierreObj = parseHora12h(infoAlmuerzo.cierre);

    if (!aperturaObj || !cierreObj) {
        console.log("Error al parsear las horas");
        return { estado: 'indefinido', tiempoFaltante: null };
    }

    const inicioMinutos = aperturaObj.horas * 60 + aperturaObj.minutos;
    const finMinutos = cierreObj.horas * 60 + cierreObj.minutos;

    console.log("Rango del turno en minutos:", inicioMinutos, "-", finMinutos);

    let tiempoFaltante = null;

    if (tiempoActual >= inicioMinutos && tiempoActual <= finMinutos) {
        console.log("Estado: ACTIVO");
        return { estado: 'activo', tiempoFaltante: null };
    } else if (tiempoActual < inicioMinutos) {
        console.log("Estado: PRÓXIMO");
        tiempoFaltante = calcularTiempoFaltante(infoAlmuerzo.apertura);
        return { estado: 'proximo', tiempoFaltante: tiempoFaltante };
    } else {
        console.log("Estado: FINALIZADO");
        return { estado: 'finalizado', tiempoFaltante: null };
    }
}

// Función para mostrar el horario en el elemento HTML
async function mostrarHorarioAlmuerzo() {
    // Limpiar contador anterior
    if (contadorSimpleInterval) {
        clearInterval(contadorSimpleInterval);
        contadorSimpleInterval = null;
    }
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

        // Información de tiempo faltante
        let tiempoFaltanteInfo = '';
        if (turnoAsesor.tiempoFaltante) {
            tiempoFaltanteInfo = ` - <span style="color: #007bff; font-weight: bold;">Faltan ${turnoAsesor.tiempoFaltante}</span>`;
        }

        switch (turnoAsesor.estado) {
            case 'activo':
                icon = '🍽️';
                mensaje = `${icon} <span style="font-weight: bold;">ALMUERZO AHORA</span> - ${turnText} ${rangeText}${turnoCompletoInfo}`;
                className = 'active';
                break;
            case 'proximo':
                icon = '⏰';
                mensaje = `${icon} Próximo almuerzo - ${turnText} ${rangeText}${turnoCompletoInfo}<span id="contador-tiempo" data-hora-objetivo="${turnoAsesor.infoAlmuerzo ? turnoAsesor.infoAlmuerzo.apertura : ''}"></span>`;
                className = 'proximo';

                // Iniciar contador automático
                if (turnoAsesor.infoAlmuerzo) {
                    setTimeout(() => {
                        if (contadorSimpleInterval) {
                            clearInterval(contadorSimpleInterval);
                        }
                        actualizarContadorTexto();
                        contadorSimpleInterval = setInterval(actualizarContadorTexto, 1000);
                    }, 100);
                }
                break;
            case 'finalizado':
                icon = '✅';
                mensaje = `${icon} Almuerzo finalizado - ${rangeText}${turnoCompletoInfo}`;
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
            let rangoMañana = '';
            if (turnoDiaSiguiente.rango) {
                rangoMañana = ` - ${turnoDiaSiguiente.rango}`;
            }
            mensajeDiaSiguiente = `
                <div class="tomorrow-turn-info assigned">
                    <strong>📅 Mañana:</strong> <span class="turn-value">${turnoDiaSiguiente.turnoCompleto}</span>${rangoMañana}
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

// Función para actualizar automáticamente cada minuto (para mostrar tiempo faltante actualizado)
function iniciarActualizacionAutomatica() {
    // Mostrar inmediatamente
    mostrarHorarioAlmuerzo();

    // Actualizar cada minuto para el tiempo faltante
    setInterval(mostrarHorarioAlmuerzo, 1 * 60 * 1000);
}

// Llamar la función cuando se cargue la página
document.addEventListener('DOMContentLoaded', iniciarActualizacionAutomatica);

// Función manual para forzar actualización
function actualizarHorarioAlmuerzo() {
    mostrarHorarioAlmuerzo();
}

// Variables globales para el contador simple
let contadorSimpleInterval = null;

// Función para calcular tiempo faltante con segundos
function calcularTiempoConSegundos(horaObjetivo) {
    const ahora = new Date();
    const match = horaObjetivo.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return null;

    let [, horas, minutos, periodo] = match;
    horas = parseInt(horas);
    minutos = parseInt(minutos);

    if (periodo.toUpperCase() === 'PM' && horas !== 12) {
        horas += 12;
    } else if (periodo.toUpperCase() === 'AM' && horas === 12) {
        horas = 0;
    }

    const objetivoHoy = new Date();
    objetivoHoy.setHours(horas, minutos, 0, 0);

    const diferencia = objetivoHoy.getTime() - ahora.getTime();

    if (diferencia <= 0) return null;

    const segundosFaltantes = Math.floor(diferencia / 1000);
    const minutosFaltantes = Math.floor(segundosFaltantes / 60);
    const horasFaltantes = Math.floor(minutosFaltantes / 60);

    const segundosRestantes = segundosFaltantes % 60;
    const minutosRestantes = minutosFaltantes % 60;

    if (horasFaltantes > 0) {
        return `${horasFaltantes}h ${minutosRestantes}m ${segundosRestantes}s`;
    } else if (minutosRestantes > 0) {
        return `${minutosRestantes}m ${segundosRestantes}s`;
    } else {
        return `${segundosRestantes}s`;
    }
}

// Función para actualizar solo el contador
function actualizarContadorTexto() {
    const contadorElement = document.getElementById('contador-tiempo');
    if (!contadorElement) return;

    const horaObjetivo = contadorElement.getAttribute('data-hora-objetivo');
    if (!horaObjetivo) return;

    const tiempoRestante = calcularTiempoConSegundos(horaObjetivo);

    if (!tiempoRestante) {
        if (contadorSimpleInterval) {
            clearInterval(contadorSimpleInterval);
            contadorSimpleInterval = null;
        }
        mostrarHorarioAlmuerzo();
        return;
    }

    contadorElement.textContent = ` - Faltan ${tiempoRestante}`;
}