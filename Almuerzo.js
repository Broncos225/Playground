let app;
try {
    app = firebase.app();
} catch (error) {
    const firebaseConfig = {
        apiKey: "AIzaSyAw5z5-aKicJ78N1UahQ-Lu_u7WP6MNVRE",
        authDomain: "playgroundbdstop.firebaseapp.com",
        databaseURL: "https://playgroundbdstop-default-rtdb.firebaseio.com",
        projectId: "playgroundbdstop",
        storageBucket: "playgroundbdstop.appspot.com",
        messagingSenderId: "808082296806",
        appId: "1:808082296806:web:c1d0dc3c2fc5fbf6c9d027"
    };
    app = firebase.initializeApp(firebaseConfig);
    console.log('Firebase inicializado correctamente');
}

const db = firebase.database();

const cache = {
    celdas: null,
    turnos: {},
    timestamp: null,
    fechaConsulta: null
};

const CACHE_DURACION = 5 * 60 * 1000;

function obtenerFechaActual() {
    const ahora = new Date();
    return `${ahora.getFullYear()}-${ahora.getMonth() + 1}-${ahora.getDate()}`;
}

async function verificarYActualizarCache() {
    const fechaActual = obtenerFechaActual();
    const ahora = Date.now();
    
    if (cache.celdas && 
        cache.fechaConsulta === fechaActual && 
        cache.timestamp && 
        (ahora - cache.timestamp) < CACHE_DURACION) {
        return false;
    }

    const snapshot = await db.ref('celdas').once('value');
    cache.celdas = snapshot.val();
    cache.timestamp = ahora;
    cache.fechaConsulta = fechaActual;
    
    return true;
}

function extraerTurnoBase(turnoCompleto) {
    if (!turnoCompleto) return null;
    const match = turnoCompleto.match(/T[1-6]/);
    return match ? match[0] : null;
}

function obtenerInfoAlmuerzoTurno(turnoCompleto) {
    if (!turnoCompleto) return null;

    const horariosAlmuerzo = {
        'T1': { apertura: '11:00 AM', cierre: '12:00 PM' },
        'T2': { apertura: '11:45 AM', cierre: '12:45 PM' },
        'T3': { apertura: '12:30 PM', cierre: '1:30 PM' },
        'T4': { apertura: '1:15 PM', cierre: '2:15 PM' },
        'T5': { apertura: '2:00 PM', cierre: '3:00 PM' },
        'T6': { apertura: '2:45 PM', cierre: '3:45 PM' },
        'TSA': { apertura: '12:00 PM', cierre: '12:30 PM' }
    };

    if (turnoCompleto === 'TSA') {
        return horariosAlmuerzo['TSA'];
    }

    const match = turnoCompleto.match(/T[1-6]/);
    if (match) {
        const turnoBase = match[0];
        return horariosAlmuerzo[turnoBase] || null;
    }

    return null;
}

async function obtenerTurnosTrabajadoresDelDia() {
    try {
        await verificarYActualizarCache();
        
        const ahora = new Date();
        const añoSeleccionado = ahora.getFullYear();
        const mesSeleccionado = ahora.getMonth() + 1;
        const diaActual = ahora.getDate() + 1;

        const celdasData = cache.celdas;

        if (!celdasData) return [];

        const trabajadoresConTurno = [];

        for (const nombreAsesor in celdasData) {
            const rutaCompleta = celdasData[nombreAsesor]?.[diaActual]?.[añoSeleccionado]?.[mesSeleccionado];

            if (rutaCompleta && rutaCompleta.texto) {
                const turnoBase = extraerTurnoBase(rutaCompleta.texto);
                if (turnoBase) {
                    trabajadoresConTurno.push({
                        nombre: nombreAsesor,
                        turnoCompleto: rutaCompleta.texto,
                        turnoBase: turnoBase,
                        numeroTurno: parseInt(turnoBase.replace('T', ''))
                    });
                }
            }
        }

        trabajadoresConTurno.sort((a, b) => a.numeroTurno - b.numeroTurno);

        return trabajadoresConTurno;
    } catch (error) {
        console.error("Error al obtener turnos de trabajadores:", error);
        return [];
    }
}

function calcularTurnosAlmuerzoInteligente(trabajadoresConTurno) {
    if (trabajadoresConTurno.length === 0) return {};

    const distribucion = {};
    const turnosAlmuerzoDisponibles = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'];
    let indiceAlmuerzo = 0;

    trabajadoresConTurno.forEach(trabajador => {
        if (indiceAlmuerzo < turnosAlmuerzoDisponibles.length) {
            const turnoAlmuerzoAsignado = turnosAlmuerzoDisponibles[indiceAlmuerzo];
            distribucion[trabajador.nombre] = {
                turnoTrabajo: trabajador.turnoBase,
                turnoAlmuerzo: turnoAlmuerzoAsignado,
                turnoCompleto: trabajador.turnoCompleto
            };
            indiceAlmuerzo++;
        }
    });

    return distribucion;
}

function calcularTiempoFaltante(horaObjetivo) {
    const ahora = new Date();
    const [hora, minuto] = horaObjetivo.split(':').map(num => parseInt(num));

    const objetivoHoy = new Date();
    objetivoHoy.setHours(hora, minuto, 0, 0);

    const diferencia = objetivoHoy.getTime() - ahora.getTime();

    if (diferencia <= 0) return null;

    const minutosFaltantes = Math.floor(diferencia / (1000 * 60));
    const horasFaltantes = Math.floor(minutosFaltantes / 60);
    const minutosRestantes = minutosFaltantes % 60;

    if (horasFaltantes > 0) {
        return `${horasFaltantes}h ${minutosRestantes}m`;
    } else {
        return `${minutosRestantes}m`;
    }
}

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

async function obtenerInfoTurnoCompleto(turnoBase) {
    if (!turnoBase) return null;

    if (cache.turnos[turnoBase]) {
        return cache.turnos[turnoBase];
    }

    try {
        const snapshot = await db.ref(`Turnos/${turnoBase}`).once('value');
        const turnoInfo = snapshot.val();

        if (turnoInfo && turnoInfo.Apertura && turnoInfo.Cierre) {
            const resultado = {
                apertura: turnoInfo.Apertura,
                cierre: turnoInfo.Cierre,
                cantidad: turnoInfo.Cantidad || null
            };
            cache.turnos[turnoBase] = resultado;
            return resultado;
        }

        return null;
    } catch (error) {
        console.error("Error al obtener información del turno completo:", error);
        return null;
    }
}

async function obtenerTurnoDiaSiguiente() {
    try {
        var nombreAsesorActual = window.nombreAsesorActual || localStorage.getItem("nombreAsesorActual");
        if (!nombreAsesorActual) {
            throw new Error("No se encontró el nombre del asesor actual");
        }
        nombreAsesorActual = nombreAsesorActual.replace(/_/g, " ");

        await verificarYActualizarCache();

        const mañana = new Date();
        mañana.setDate(mañana.getDate() + 2);

        const añoSeleccionado = mañana.getFullYear();
        const mesSeleccionado = mañana.getMonth() + 1;
        const diaSiguiente = mañana.getDate();

        const turnoData = cache.celdas?.[nombreAsesorActual]?.[diaSiguiente]?.[añoSeleccionado]?.[mesSeleccionado];

        const turnoCompleto = turnoData ? turnoData.texto : null;
        const turnoBase = extraerTurnoBase(turnoCompleto);

        let rango = null;
        let descripcion = null;

        if (turnoCompleto) {
            let infoTurnoCompleto = await obtenerInfoTurnoCompleto(turnoCompleto);

            if (!infoTurnoCompleto && turnoBase) {
                infoTurnoCompleto = await obtenerInfoTurnoCompleto(turnoBase);
            }

            if (infoTurnoCompleto && infoTurnoCompleto.apertura && infoTurnoCompleto.cierre) {
                if (infoTurnoCompleto.apertura === "12:00 AM") {
                    try {
                        const descSnapshot = await db.ref(`Turnos/${turnoCompleto}/Descripcion`).once('value');
                        descripcion = descSnapshot.val();

                        if (!descripcion && turnoBase) {
                            const descSnapshotBase = await db.ref(`Turnos/${turnoBase}/Descripcion`).once('value');
                            descripcion = descSnapshotBase.val();
                        }

                        if (descripcion) {
                            rango = descripcion;
                        } else {
                            rango = turnoCompleto;
                        }
                    } catch (error) {
                        console.log("No se encontró descripción específica, usando turno completo");
                        rango = turnoCompleto;
                    }
                } else {
                    rango = `${infoTurnoCompleto.apertura} - ${infoTurnoCompleto.cierre}`;
                }
            }
        } else if (turnoCompleto) {
            const estadosEspeciales = {
                'D': 'Descanso',
                'DV': 'Descanso/Vacaciones',
                'TSN': 'Trabajo Sin turno',
                'TSA': 'Turno Sala'
            };

            rango = estadosEspeciales[turnoCompleto] || turnoCompleto;
        }

        return {
            turnoCompleto: turnoCompleto,
            turnoBase: turnoBase,
            turnoConsultado: turnoCompleto,
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

async function obtenerTurnoAlmuerzoAsesor() {
    try {
        var nombreAsesorActual = window.nombreAsesorActual || localStorage.getItem("nombreAsesorActual");
        if (!nombreAsesorActual) {
            throw new Error("No se encontró el nombre del asesor actual");
        }
        nombreAsesorActual = nombreAsesorActual.replace(/_/g, " ");

        await verificarYActualizarCache();

        const ahora = new Date();
        const añoSeleccionado = ahora.getFullYear();
        const mesSeleccionado = ahora.getMonth() + 1;
        const diaActual = ahora.getDate() + 1;

        const trabajadoresDelDia = await obtenerTurnosTrabajadoresDelDia();
        const distribucionAlmuerzos = calcularTurnosAlmuerzoInteligente(trabajadoresDelDia);

        const turnoAsignadoData = cache.celdas?.[nombreAsesorActual]?.[diaActual]?.[añoSeleccionado]?.[mesSeleccionado];

        const turnoCompleto = turnoAsignadoData ? turnoAsignadoData.texto : null;
        const turnoBase = extraerTurnoBase(turnoCompleto);

        if (!turnoCompleto) {
            return {
                turnoCompleto: null,
                turnoBase: null,
                rango: 'Sin turno asignado',
                estado: 'sin_asignar',
                asesor: nombreAsesorActual,
                tiempoFaltante: null
            };
        }

        const turnoAlmuerzoAsignado = distribucionAlmuerzos[nombreAsesorActual]?.turnoAlmuerzo;

        let infoAlmuerzo = null;
        let rango = null;
        if (turnoAlmuerzoAsignado) {
            infoAlmuerzo = obtenerInfoAlmuerzoTurno(turnoAlmuerzoAsignado);
            if (infoAlmuerzo) {
                rango = `${infoAlmuerzo.apertura} - ${infoAlmuerzo.cierre}`;
            }
        }

        const estadosEspeciales = {
            'D': 'Descanso',
            'DV': 'Descanso/Vacaciones',
            'TSN': 'Trabajo Sin turno'
        };

        if (!infoAlmuerzo) {
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

        const estadoYTiempo = verificarEstadoTurnoConTiempo(infoAlmuerzo, ahora);

        return {
            turnoCompleto: turnoCompleto,
            turnoBase: turnoBase,
            turnoAlmuerzoAsignado: turnoAlmuerzoAsignado,
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

function verificarEstadoTurnoConTiempo(infoAlmuerzo, ahora) {
    const horaActual = ahora.getHours();
    const minutosActuales = ahora.getMinutes();
    const tiempoActual = horaActual * 60 + minutosActuales;
    const aperturaObj = parseHora12h(infoAlmuerzo.apertura);
    const cierreObj = parseHora12h(infoAlmuerzo.cierre);

    if (!aperturaObj || !cierreObj) {
        console.log("Error al parsear las horas");
        return { estado: 'indefinido', tiempoFaltante: null };
    }

    const inicioMinutos = aperturaObj.horas * 60 + aperturaObj.minutos;
    const finMinutos = cierreObj.horas * 60 + cierreObj.minutos;

    let tiempoFaltante = null;

    if (tiempoActual >= inicioMinutos && tiempoActual <= finMinutos) {
        return { estado: 'activo', tiempoFaltante: null };
    } else if (tiempoActual < inicioMinutos) {
        tiempoFaltante = calcularTiempoFaltante(infoAlmuerzo.apertura);
        return { estado: 'proximo', tiempoFaltante: tiempoFaltante };
    } else {
        return { estado: 'finalizado', tiempoFaltante: null };
    }
}

async function mostrarHorarioAlmuerzo() {
    if (contadorSimpleInterval) {
        clearInterval(contadorSimpleInterval);
        contadorSimpleInterval = null;
    }
    const elemento = document.getElementById('HoraAlmuerzos');

    if (elemento) {
        elemento.innerHTML = `
            <p style="color: #6c757d; margin: 10px 0; font-size: 16px;">Cargando...</p>
        `;
    }

    try {
        const [turnoAsesor, turnoDiaSiguiente] = await Promise.all([
            obtenerTurnoAlmuerzoAsesor(),
            obtenerTurnoDiaSiguiente()
        ]);

        let mensaje = '';
        let className = '';
        let icon = '';
        let turnText = '';
        let rangeText = '';

        if (turnoAsesor.turnoAlmuerzoAsignado) {
            turnText = `<span class="bold-turn">${turnoAsesor.turnoAlmuerzoAsignado}</span>`;
            rangeText = `${turnoAsesor.rango}`;
        }

        let turnoCompletoInfo = '';
        if (turnoAsesor.turnoCompleto && turnoAsesor.turnoCompleto !== turnoAsesor.turnoBase) {
            turnoCompletoInfo = ` - Turno: ${turnoAsesor.turnoCompleto}`;
        } else if (turnoAsesor.turnoBase) {
            turnoCompletoInfo = `  - Turno: ${turnoAsesor.turnoBase}`;
        }

        let tiempoFaltanteInfo = '';
        if (turnoAsesor.tiempoFaltante) {
            tiempoFaltanteInfo = ` - <span style="color: #007bff; font-weight: bold;">Faltan ${turnoAsesor.tiempoFaltante}</span>`;
        }

        switch (turnoAsesor.estado) {
            case 'activo':
                icon = '🍽️';
                mensaje = `${icon} <span style="font-weight: bold;">ALMUERZO AHORA</span> - ${rangeText}${turnoCompletoInfo}`;
                className = 'active';
                break;
            case 'proximo':
                icon = '⏰';
                mensaje = `${icon} Próximo almuerzo: ${rangeText}${turnoCompletoInfo}<span id="contador-tiempo" data-hora-objetivo="${turnoAsesor.infoAlmuerzo ? turnoAsesor.infoAlmuerzo.apertura : ''}"></span>`;
                className = 'proximo';

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
                mensaje = `${icon} Almuerzo ${turnText} finalizado - ${rangeText}${turnoCompletoInfo}`;
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
                className = '';
        }

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

function iniciarActualizacionAutomatica() {
    mostrarHorarioAlmuerzo();
    setInterval(mostrarHorarioAlmuerzo, 1 * 60 * 1000);
}

document.addEventListener('DOMContentLoaded', iniciarActualizacionAutomatica);

function actualizarHorarioAlmuerzo() {
    mostrarHorarioAlmuerzo();
}

let contadorSimpleInterval = null;

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