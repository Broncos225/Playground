const firebaseConfig = {
    apiKey: "AIzaSyAw5z5-aKicJ78N1UahQ-Lu_u7WP6MNVRE",
    authDomain: "playgroundbdstop.firebaseapp.com",
    databaseURL: "https://playgroundbdstop-default-rtdb.firebaseio.com",
    projectId: "playgroundbdstop",
    storageBucket: "playgroundbdstop.appspot.com",
    messagingSenderId: "808082296806",
    appId: "1:808082296806:web:c1d0dc3c2fc5fbf6c9d027"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

window.onload = function () {
    diaSemana();
    cargarDatos();
    colorCelda();
    mostrarSolicitudes();
    Festivos();
    cambiarBordeColumna();
    cargarVacaciones();
};

function colorCelda() {
    const celdas = document.querySelectorAll('td');
    celdas.forEach(celda => {
        celda.addEventListener('input', () => {
            actualizarColorCelda(celda);
            guardarCelda(celda);
        });
        actualizarColorCelda(celda);
    });
}

function actualizarColorCelda(celda) {

    celda.style.color = '';
    var colorT1 = '#fcfb8d';
    var colorT2 = '#afed87';
    var colorT3 = '#87beed';
    var colorT4 = '#c5b4fa';
    var colorT5 = '#fcbdc4';
    var colorT6 = '#fc818d';
    var colorT7 = '#FFC85C';
    var colorTSA = '#FFA500';
    var colorAS = '#063970';
    var colorD = '#012353';
    var colorDV = '#88ed47';
    const texto = celda.textContent.trim();
    let color;
    switch (texto) {
        case '':
            color = 'white';
            celda.style.color = 'black';
            break;
        case 'T1':
        case 'T1R1':
            color = colorT1;
            celda.style.color = 'black';
            break;
        case 'T2':
        case 'T2R1':
            color = colorT2;
            celda.style.color = 'black';
            break;
        case 'T3':
        case 'T3R1':
            color = colorT3;
            celda.style.color = 'black';
            break;
        case 'T4':
        case 'T4R1':
            color = colorT4;
            celda.style.color = 'black';
            break;
        case 'T5':
        case 'T5R1':
            color = colorT5;
            celda.style.color = 'black';
            break;
        case 'T6':
        case 'T6R1':
            color = colorT6;
            celda.style.color = 'black';
            break;
        case 'T7':
        case 'T7R1':
            color = colorT7;
            celda.style.color = 'black';
            break;
        case 'D':
        case 'DF':
            if (!celda.classList.contains('titulos')) {
                color = 'white';
                celda.style.color = 'red';
            } else {
                color = colorD;
                celda.style.color = 'red';
            }
            break;
        case 'TSA':
            color = colorTSA;
            celda.style.color = 'black';
            break;
        case 'AS':
        case 'ASR1':
            color = colorAS;
            celda.style.color = 'white';
            break;
        case 'NN':
            color = 'gray';
            celda.style.color = 'gray';
            break;
        case 'R1':
            color = 'white';
            celda.style.color = 'black';
            break;
        case 'IN':
            color = 'red';
            celda.style.color = 'black';
            break;
        case 'DV':
            color = colorDV;
            celda.style.color = 'black';
            break;
        case 'T':
            color = colorT3;
            celda.style.color = 'black';
            break;
        case 'MD':
            color = colorT5;
            celda.style.color = 'black';
            break;
    }
    celda.style.backgroundColor = color;
}

function guardarCeldas() {
    var passw = document.getElementById('pass').value;
    var contraseñaEncontrada = false;

    for (let agente in agentes) {
        if (agentes[agente].contraseña == passw) {
            contraseñaEncontrada = true;
            break;
        }
    }

    if (contraseñaEncontrada) {
        const celdas = document.querySelectorAll('#Table td');
        const mesSeleccionado = document.getElementById('Mes').selectedIndex + 1; // +1 porque los meses están 1-indexados
        const añoSeleccionado = document.getElementById('Año').value;

        celdas.forEach(celda => {
            const texto = celda.textContent.trim();
            const idCelda = celda.cellIndex + 1; // Obtén el índice de la celda (1-indexed)
            const nombreFila = celda.parentNode.cells[0].textContent.trim(); // Obtén el nombre del agente
            db.ref('celdas/' + nombreFila + '/' + idCelda + '/' + añoSeleccionado + '/' + mesSeleccionado).set({
                texto: texto,
            });
        });
        alert("Datos guardados");
        location.reload();
    } else {
        alert("Contraseña incorrecta");
    }
}

function cargarDatos() {
    const mesSeleccionado = document.getElementById('Mes').selectedIndex + 1; // +1 porque los meses están 1-indexados
    const añoSeleccionado = document.getElementById('Año').value;
    const celdas = document.querySelectorAll('#Table td');
    celdas.forEach((celda) => {
        const idCelda = celda.cellIndex + 1;
        const nombreFila = celda.parentNode.cells[0].textContent.trim();
        db.ref('celdas/' + nombreFila + '/' + idCelda + '/' + añoSeleccionado + '/' + mesSeleccionado).once('value')
            .then(snapshot => {
                const data = snapshot.val();
                if (data) {
                    celda.textContent = data.texto;
                    actualizarColorCelda(celda);
                }
                contDescansos();
                contHoras(); // Call the function here
            })
            .catch(error => {
                console.error("Error al cargar datos:", error);
            });
    });

}

document.getElementById('btnGuardar').addEventListener('click', guardarCeldas);
function contDescansos() {
    var contA = 0, contB = 0, contC = 0, contD = 0, contE = 0, contF = 0;

    for (var i = 1; i < 32; i++) {
        var celda = document.getElementById('A' + i);
        if (celda.textContent == 'D') {
            contA += 1;
        }
    }
    for (var i = 1; i < 32; i++) {
        var celda = document.getElementById('B' + i);
        if (celda.textContent == 'D') {
            contB += 1;
        }
    }
    for (var i = 1; i < 32; i++) {
        var celda = document.getElementById('C' + i);
        if (celda.textContent == 'D') {
            contC += 1;
        }
    }
    for (var i = 1; i < 32; i++) {
        var celda = document.getElementById('D' + i);
        if (celda.textContent == 'D') {
            contD += 1;
        }
    }
    for (var i = 1; i < 32; i++) {
        var celda = document.getElementById('E' + i);
        if (celda.textContent == 'D') {
            contE += 1;
        }
    }
    for (var i = 1; i < 32; i++) {
        var celda = document.getElementById('F' + i);
        if (celda.textContent == 'D') {
            contF += 1;
        }
    }
    var celdaA = document.getElementById("1");
    celdaA.textContent = contA;
    var celdaB = document.getElementById("2");
    celdaB.textContent = contB;
    var celdaC = document.getElementById("3");
    celdaC.textContent = contC;
    var celdaD = document.getElementById("4");
    celdaD.textContent = contD;
    var celdaE = document.getElementById("5");
    celdaE.textContent = contE;
    var celdaF = document.getElementById("6");
    celdaF.textContent = contF;
}

document.addEventListener('DOMContentLoaded', (event) => {

    var modal = document.getElementById("myModal");
    var body = document.getElementsByTagName("body")[0];
    var btn = document.getElementById("btnExportar");

    btn.onclick = function () {
        modal.style.display = "block";
        body.style.overflow = "hidden";
    }

    var span = document.getElementsByClassName("close")[0];

    span.onclick = function () {
        modal.style.display = "none";
        body.style.overflow = "auto";
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
            body.style.overflow = "auto";
        }
    }
    var btnExcel = document.getElementById("exportExcel");
    var btnPng = document.getElementById("exportPng");

    btnExcel.onclick = function () {
        exportarExcel();
    }

    btnPng.onclick = function () {
        exportarPNG();
    }

    function cerrarModal() {
        modal.style.display = "none";
        body.style.overflow = "auto";
    }

    function exportarExcel() {
        var table = document.getElementById("Table");
        var wb = XLSX.utils.table_to_book(table);
        var wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });

        function s2ab(s) {
            var buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        }
        saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), "Horarios.xlsx");
        cerrarModal();
    }

    function exportarPNG() {
        var table = document.getElementById("Table");

        html2canvas(table).then(function (canvas) {
            canvas.toBlob(function (blob) {
                saveAs(blob, "Horarios.png");
                cerrarModal();
            });
        });
    }
});


let agentes = {
    Anderson_Cano_Londoño: {
        nombre: "Anderson Cano Londoño",
        letra: "A",
        contraseña: ""
    },
    Miguel_Cadavid_Naranjo: {
        nombre: "Miguel Cadavid Naranjo",
        letra: "B",
        contraseña: ""
    },
    Milton_Alexis_Calle_Londoño: {
        nombre: "Milton Alexis Calle Londoño",
        letra: "C",
        contraseña: ""
    },
    Yesica_Johana_Cano_Quintero: {
        nombre: "Yesica Johana Cano Quintero",
        letra: "D",
        contraseña: ""
    },
    Andrés_Felipe_Vidal_Medina: {
        nombre: "Andrés Felipe Vidal Medina",
        letra: "E",
        contraseña: ""
    },
    Andrés_Felipe_Yepes_Tascón: {
        nombre: "Andrés Felipe Yepes Tascón",
        letra: "F",
        contraseña: ""
    },
    Oscar_Luis_Cabrera_Pacheco: {
        nombre: "Oscar Luis Cabrera Pacheco",
        contraseña: ""
    },
    D: {
        nombre: "Descanso",
        contraseña: "D"
    },
    DF: {
        nombre: "Día de la familia",
        contraseña: "DF"
    },
    AS: {
        nombre: "Apoyo Sura",
        contraseña: "AS"
    }
}

let agentesExcluidos = ["D", "DF", "AS"];
for (let agente in agentes) {
    if (!agentesExcluidos.includes(agente)) {
        if (agentes[agente].contraseña == "") {
            let contraseña = firebase.database().ref('agentes/' + agente);
            contraseña.once('value').then(function (snapshot) {
                agentes[agente].contraseña = snapshot.val();
            }).catch(function (error) {
                console.error("Error obteniendo las contraseñas: ", error);
            });
        }
    }
}

document.getElementById('NuevaSolicitud').style.display = 'none';
document.getElementById('TablaSol').style.display = 'block';
document.getElementById('btnIntercambioTurno').textContent = "Generar una nueva solicitud";
document.getElementById('TablaSol').style.display = 'none';
function intercambiarTurnos() {
    if (document.getElementById('NuevaSolicitud').style.display == 'block') {
        document.getElementById('NuevaSolicitud').style.display = 'none';
        document.getElementById('btnIntercambioTurno').textContent = "Generar una nueva solicitud";
        document.getElementById('TablaSol').style.display = 'none';
    } else {
        document.getElementById('NuevaSolicitud').style.display = 'block';
        document.getElementById('TablaSol').style.display = 'block';
        document.getElementById('btnIntercambioTurno').textContent = "Ocultar formulario de solicitudes";
    }
}
document.getElementById('btnIntercambioTurno').addEventListener('click', intercambiarTurnos);
document.getElementById('btnEnviar').addEventListener('click', function () {
    const select = document.getElementById('Receptor');
    const selectedOption = select.options[select.selectedIndex];
    const group = selectedOption.parentNode.label;
});

function generarSolicitudes() {
    var solicitanteElem = document.getElementById('Solicitante');
    var receptorElem = document.getElementById('Receptor');
    var fechaElem = document.getElementById('DiaSolicitado');

    if (solicitanteElem.value == "" || receptorElem.value == "" || fechaElem.value == "" || solicitanteElem.value == receptorElem.value) {
        alert("Por favor complete todos los campos y revise que no se esté solicitando un cambio de turno con el mismo agente");
        solicitanteElem.value = "";
        receptorElem.value = "";
        fechaElem.value = "";
        return;
    } else {
        const select = document.getElementById('Receptor');
        const selectedOption = select.options[select.selectedIndex];
        const group = selectedOption.parentNode.label;
        if (group == "Agentes") {
            var solicitante = solicitanteElem.value;
            var receptor = receptorElem.value;
            var inputFecha = fechaElem.value;
            var partes = inputFecha.split('-');
            var fecha = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
            var fechaActual = new Date();
            var dia = fecha.getDate();
            if (fecha < fechaActual) {
                alert("La fecha seleccionada no puede ser anterior ni igual a la fecha actual");
                return;
            } else {
                var TurnoSol = agentes[solicitante].letra + dia;
                var TurnoRec = agentes[receptor].letra + dia;
                var celdaSol = document.getElementById(TurnoSol);
                var celdaRec = document.getElementById(TurnoRec);

                var confirmacion = prompt("¿Estás seguro de que quieres enviar la solicitud para el cambio de turno? Ingrese su contraseña para confirmar: " + agentes[solicitante].nombre);
                if (confirmacion == agentes[solicitante].contraseña) {
                    var fecha = new Date();
                    var opcionesFecha = { year: 'numeric', month: 'numeric', day: 'numeric' };
                    var opcionesHora = { hour: '2-digit', minute: '2-digit', hour12: true };
                    var fechaHora = fecha.toLocaleDateString('es-ES', opcionesFecha) + ' ' + fecha.toLocaleTimeString('es-ES', opcionesHora);

                    var inputFecha = document.getElementById('DiaSolicitado').value;
                    var partes = inputFecha.split('-');
                    var fecha2 = new Date(partes[0], partes[1] - 1, partes[2]);
                    let dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                    let nombreDia = dias[fecha2.getDay()];

                    var contadorRef = firebase.database().ref('contador');
                    contadorRef.once('value').then(function (snapshot) {
                        var contadorRegistros = snapshot.val();

                        db.ref('solicitudes/' + contadorRegistros).set({
                            id: contadorRegistros,
                            solicitante: agentes[solicitante].nombre,
                            receptor: agentes[receptor].nombre,
                            diaSolicitado: nombreDia + " " + fecha2.getDate(),
                            turnoSolicitante: celdaSol.textContent,
                            turnoReceptor: celdaRec.textContent,
                            fechaHora: fechaHora.replace(',', ''),
                            estado: "Pendiente",
                            aprobadaPorReceptor: "Sin respuesta", // Nueva propiedad
                            aprobadaPorJefe: "Sin respuesta" // Nueva propiedad
                        }, error => {
                            if (error) {
                                console.error("Error añadiendo el nodo: ", error);
                            } else {
                                console.log("Nodo añadido con éxito");
                                var contadorRef = firebase.database().ref('contador');
                                contadorRef.transaction(function (contadorRegistros) {
                                    // Si contadorRegistros no existe, inicializarlo a 0, de lo contrario incrementarlo en 1
                                    return (contadorRegistros || 0) + 1;
                                }).then(function () {
                                    console.log('Incremento de contador realizado con éxito');
                                }).catch(function (error) {
                                    console.error('Error incrementando contador: ', error);
                                });
                            }
                        });

                    }).catch(function (error) {
                        console.error("Error obteniendo el valor de contador: ", error);
                    });
                    solicitanteElem.value = "";
                    receptorElem.value = "";
                    fechaElem.value = "";
                } else {
                    alert("Solicitud cancelada, revise su contraseña e intente de nuevo");
                    solicitanteElem.value = "";
                    receptorElem.value = "";
                    fechaElem.value = "";
                    return;
                }
            }
        } else {
            var solicitante = solicitanteElem.value;
            var receptor = receptorElem.value;
            var inputFecha = fechaElem.value;
            var partes = inputFecha.split('-');
            var fecha = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
            var fechaActual = new Date();
            var dia = fecha.getDate();
            if (fecha < fechaActual) {
                alert("La fecha seleccionada no puede ser anterior ni igual a la fecha actual");
                return;
            } else {
                var TurnoSol = agentes[solicitante].letra + dia;
                var celdaSol = document.getElementById(TurnoSol);
                var celdaRec = receptor;
                var confirmacion = prompt("¿Estás seguro de que quieres enviar la solicitud para el cambio de turno? Ingrese su contraseña para confirmar: " + agentes[solicitante].nombre);
                if (confirmacion == agentes[solicitante].contraseña) {
                    var fecha = new Date();
                    var opcionesFecha = { year: 'numeric', month: 'numeric', day: 'numeric' };
                    var opcionesHora = { hour: '2-digit', minute: '2-digit', hour12: true };
                    var fechaHora = fecha.toLocaleDateString('es-ES', opcionesFecha) + ' ' + fecha.toLocaleTimeString('es-ES', opcionesHora);

                    var inputFecha = document.getElementById('DiaSolicitado').value;
                    var partes = inputFecha.split('-');
                    var fecha2 = new Date(partes[0], partes[1] - 1, partes[2]);
                    let dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                    let nombreDia = dias[fecha2.getDay()];

                    var contadorRef = firebase.database().ref('contador');
                    contadorRef.once('value').then(function (snapshot) {
                        var contadorRegistros = snapshot.val();

                        db.ref('solicitudes/' + contadorRegistros).set({
                            id: contadorRegistros,
                            solicitante: agentes[solicitante].nombre,
                            receptor: agentes[receptor].nombre,
                            diaSolicitado: nombreDia + " " + fecha2.getDate(),
                            turnoSolicitante: celdaSol.textContent,
                            turnoReceptor: celdaRec,
                            fechaHora: fechaHora.replace(',', ''),
                            estado: "Pendiente",
                            aprobadaPorReceptor: "Sin respuesta",
                            aprobadaPorJefe: "Sin respuesta"
                        }, error => {
                            if (error) {
                                console.error("Error añadiendo el nodo: ", error);
                            } else {
                                console.log("Nodo añadido con éxito");
                                var contadorRef = firebase.database().ref('contador');
                                contadorRef.transaction(function (contadorRegistros) {
                                    return (contadorRegistros || 0) + 1;
                                }).then(function () {
                                    console.log('Incremento de contador realizado con éxito');
                                }).catch(function (error) {
                                    console.error('Error incrementando contador: ', error);
                                });
                            }
                        });

                    }).catch(function (error) {
                        console.error("Error obteniendo el valor de contador: ", error);
                    });
                    solicitanteElem.value = "";
                    receptorElem.value = "";
                    fechaElem.value = "";
                } else {
                    alert("Solicitud cancelada, revise su contraseña e intente de nuevo");
                    solicitanteElem.value = "";
                    receptorElem.value = "";
                    fechaElem.value = "";
                    return;
                }
            }
        }
    }
}

function generarSolicitudes2() {
    var solicitanteElem = document.getElementById('Solicitante');
    var receptorElem = document.getElementById('Receptor');
    var fechaElem = document.getElementById('DiaSolicitado');
    if (solicitanteElem.value == "" || receptorElem.value == "" || fechaElem.value == "" || solicitanteElem.value == receptorElem.value) {
        alert("Por favor complete todos los campos y revise que no se esté solicitando un cambio de turno con el mismo agente");
        solicitanteElem.value = "";
        receptorElem.value = "";
        fechaElem.value = "";
        return;
    } else {
        const selectedOption = receptorElem.options[receptorElem.selectedIndex];
        const group = selectedOption.parentNode.label;
        if (fecha < fechaActual) {
            alert("La fecha seleccionada no puede ser anterior ni igual a la fecha actual");
            return;
        } else {
            if (group == "Agentes") {
            } else {
                var solicitante = solicitanteElem.value;
                var receptor = receptorElem.value;
                var inputFecha = fechaElem.value;
                var partes = inputFecha.split('-');
                var fecha = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
                var fechaActual = new Date();
                var dia = fecha.getDate();

                db.ref('celdas/' + agentes[solicitante].nombre + '/' + (dia + 1) + '/' + fecha.getFullYear() + '/' + (fecha.getMonth() + 1))
                    .once('value')
                    .then((snapshot) => {
                        var TurnoSol = snapshot.val().texto;
                        var TurnoRec = select.value;

                        console.log(TurnoSol);
                        console.log(TurnoRec);
                    });
            }
        }
    }
}

function mostrarSolicitudes() {
    var tabla = document.getElementById("Table2").getElementsByTagName('tbody')[0];
    db.ref('solicitudes').on('value', snapshot => {
        while (tabla.hasChildNodes()) {
            tabla.removeChild(tabla.firstChild);
        }
        var solicitudes = [];
        snapshot.forEach(childSnapshot => {
            solicitudes.push(childSnapshot.val());
        });

        solicitudes.reverse();

        solicitudes.forEach(solicitud => {
            var fila = document.createElement("tr");
            var celdaId = document.createElement("td");
            var celdaSolicitante = document.createElement("td");
            var celdaReceptor = document.createElement("td");
            var celdaDiaSolicitado = document.createElement("td");
            var celdaTurnoSolicitante = document.createElement("td");
            var celdaTurnoReceptor = document.createElement("td");
            var celdaFechaHora = document.createElement("td");
            var celdaEstado = document.createElement("td");
            var celdaAprobadaPorReceptor = document.createElement("td");
            var celdaAprobadaPorJefe = document.createElement("td");
            var celdaBotones = document.createElement("td");

            celdaId.textContent = solicitud.id;
            celdaSolicitante.textContent = solicitud.solicitante;
            celdaReceptor.textContent = solicitud.receptor;
            celdaDiaSolicitado.textContent = solicitud.diaSolicitado;
            celdaTurnoSolicitante.textContent = solicitud.turnoSolicitante;
            celdaTurnoReceptor.textContent = solicitud.turnoReceptor;
            celdaFechaHora.textContent = solicitud.fechaHora;
            celdaEstado.textContent = solicitud.estado;
            if (solicitud.aprobadaPorReceptor === true) {
                celdaAprobadaPorReceptor.textContent = 'Sí';
            } else if (solicitud.aprobadaPorReceptor === false) {
                celdaAprobadaPorReceptor.textContent = 'No';
            } else {
                celdaAprobadaPorReceptor.textContent = "Sin respuesta";
            }

            if (solicitud.aprobadaPorJefe === true) {
                celdaAprobadaPorJefe.textContent = 'Sí';
            } else if (solicitud.aprobadaPorJefe === false) {
                celdaAprobadaPorJefe.textContent = 'No';
            } else {
                celdaAprobadaPorJefe.textContent = "Sin respuesta";
            }

            var fechaActual = new Date().getDate();
            var fecha = new Date(solicitud.diaSolicitado).getDate();

            if (solicitud.aprobadaPorReceptor == true && solicitud.aprobadaPorJefe == true) {
                celdaEstado.textContent = "Aprobado";
            } else if (solicitud.aprobadaPorReceptor == false || solicitud.aprobadaPorJefe == false) {
                celdaEstado.textContent = "Rechazado";
            } else if (fecha <= fechaActual) {
                celdaEstado.textContent = "Expirado";
            }

            var btnAprobar = document.createElement("button");
            btnAprobar.textContent = "Aprobar";
            btnAprobar.addEventListener("click", function () {
                aceptarCambio(solicitud);

            });
            var btnRechazar = document.createElement("button");
            btnRechazar.textContent = "Rechazar";
            btnRechazar.addEventListener("click", function () {
                rechazarCambio(solicitud);
            });

            btnAprobar.style.backgroundColor = "#afed87";
            btnAprobar.style.color = "#315e18";
            btnAprobar.style.width = "100%";
            btnAprobar.style.border = "1px solid #315e18";
            btnAprobar.style.padding = "4px";
            btnRechazar.style.backgroundColor = "#fcbdc4";
            btnRechazar.style.color = "#6e1f1f";
            btnRechazar.style.width = "100%";
            btnRechazar.style.border = "1px solid #6e1f1f";
            btnRechazar.style.marginTop = "7px";
            btnRechazar.style.padding = "4px";

            if (celdaEstado.textContent == "Aprobado" || celdaEstado.textContent == "Rechazado" || celdaEstado.textContent == "Expirado") {
                btnAprobar.disabled = true;
                btnRechazar.disabled = true;
                btnAprobar.style.backgroundColor = "gray";
                btnAprobar.style.color = "lightgray";
                btnAprobar.style.width = "100%";
                btnAprobar.style.border = "1px solid gray";
                btnAprobar.style.padding = "4px";
                btnAprobar.style.cursor = "not-allowed";
                btnRechazar.style.backgroundColor = "gray";
                btnRechazar.style.color = "lightgray";
                btnRechazar.style.width = "100%";
                btnRechazar.style.border = "1px solid gray";
                btnRechazar.style.padding = "4px";
                btnRechazar.style.cursor = "not-allowed";
            }

            celdaBotones.appendChild(btnAprobar);
            celdaBotones.appendChild(btnRechazar);
            fila.appendChild(celdaId);
            fila.appendChild(celdaSolicitante);
            fila.appendChild(celdaReceptor);
            fila.appendChild(celdaDiaSolicitado);
            fila.appendChild(celdaTurnoSolicitante);
            fila.appendChild(celdaTurnoReceptor);
            fila.appendChild(celdaFechaHora);
            fila.appendChild(celdaAprobadaPorReceptor);
            fila.appendChild(celdaAprobadaPorJefe);
            fila.appendChild(celdaEstado);
            fila.appendChild(celdaBotones);

            // Añade la fila al cuerpo de la tabla
            tabla.appendChild(fila);
            switch (celdaEstado.textContent) {
                case "Pendiente":
                    celdaEstado.style.backgroundColor = "yellow";
                    break;
                case "Aprobado":
                    celdaEstado.style.backgroundColor = "green";
                    celdaEstado.style.color = "white";
                    break;
                case "Rechazado":
                    celdaEstado.style.backgroundColor = "red";
                    celdaEstado.style.color = "white";
                    break;
                case "Expirado":
                    celdaEstado.style.backgroundColor = "gray";
                    celdaEstado.style.color = "white";
                    break;
            }
            var celda = document.querySelectorAll('#Table2 td');

            celda.forEach(function (celda) {
                actualizarColorCelda(celda);
            });
        });
    });
}

function aceptarCambio(registro) {
    let valor = prompt("Número de solicitud a aprobar: " + registro.id + " por favor ingrese su contraseña: ");
    switch (registro.receptor) {
        case "Anderson Cano Londoño":
            var receptor = "Anderson_Cano_Londoño";
            break;
        case "Miguel Cadavid Naranjo":
            var receptor = "Miguel_Cadavid_Naranjo";
            break;
        case "Milton Alexis Calle Londoño":
            var receptor = "Milton_Alexis_Calle_Londoño";
            break;
        case "Yesica Johana Cano Quintero":
            var receptor = "Yesica_Johana_Cano_Quintero";
            break;
        case "Andrés Felipe Vidal Medina":
            var receptor = "Andrés_Felipe_Vidal_Medina";
            break;
        case "Andrés Felipe Yepes Tascón":
            var receptor = "Andrés_Felipe_Yepes_Tascón";
            break;
        case "Descanso":
            var receptor = "D";
            break;
        case "Día de la familia":
            var receptor = "DF";
            break;
        case "Apoyo Sura":
            var receptor = "AS";
            break;
    }

    if (valor == agentes.Oscar_Luis_Cabrera_Pacheco.contraseña) {
        db.ref('solicitudes/' + registro.id).update({
            aprobadaPorJefe: true
        }, error => {
            if (error) {
                console.error("Error actualizando el nodo: ", error);
            } else {
                console.log("Nodo actualizado con éxito");
                if (registro.aprobadaPorReceptor == true) {
                    console.log("Cambio de horario aprobado");
                    cambioHorario(registro);

                }
            }
        });
    } else if (valor == agentes[receptor].contraseña) {
        db.ref('solicitudes/' + registro.id).update({
            aprobadaPorReceptor: true
        }, error => {
            if (error) {
                console.error("Error actualizando el nodo: ", error);
            } else {
                console.log("Nodo actualizado con éxito");
                if (registro.aprobadaPorJefe == true) {
                    console.log("Cambio de horario aprobado");
                    cambioHorario(registro);
                }
            }
        });
    } else {
        alert("Contraseña incorrecta");
    }

}

function rechazarCambio(registro) {
    let valor = prompt("Número de solicitud a aprobar: " + registro.id + " por favor ingrese su contraseña: ");
    switch (registro.receptor) {
        case "Anderson Cano Londoño":
            var receptor = "Anderson_Cano_Londoño";
            break;
        case "Miguel Cadavid Naranjo":
            var receptor = "Miguel_Cadavid_Naranjo";
            break;
        case "Milton Alexis Calle Londoño":
            var receptor = "Milton_Alexis_Calle_Londoño";
            break;
        case "Yesica Johana Cano Quintero":
            var receptor = "Yesica_Johana_Cano_Quintero";
            break;
        case "Andrés Felipe Vidal Medina":
            var receptor = "Andrés_Felipe_Vidal_Medina";
            break;
        case "Andrés Felipe Yepes Tascón":
            var receptor = "Andrés_Felipe_Yepes_Tascón";
            break;
        case "Descanso":
            var receptor = "D";
            break;
        case "Día de la familia":
            var receptor = "DF";
            break;
        case "Apoyo Sura":
            var receptor = "AS";
            break;
    }

    if (valor == agentes.Oscar_Luis_Cabrera_Pacheco.contraseña) {
        db.ref('solicitudes/' + registro.id).update({
            aprobadaPorJefe: false
        }, error => {
            if (error) {
                console.error("Error actualizando el nodo: ", error);
            } else {
                console.log("Nodo actualizado con éxito");
            }
        });
    } else if (valor == agentes[receptor].contraseña) {
        db.ref('solicitudes/' + registro.id).update({
            aprobadaPorReceptor: false
        }, error => {
            if (error) {
                console.error("Error actualizando el nodo: ", error);
            } else {
                console.log("Nodo actualizado con éxito");
            }
        });
        return;
    } else {
        alert("Contraseña incorrecta");
    }
}

function cambioHorario(solicitud) {

    var dia = solicitud.diaSolicitado.match(/\d+/)[0];
    dia = parseInt(dia) + 1;
    console.log(dia);
    var refSolicitante = firebase.database().ref('celdas/' + solicitud.solicitante + '/' + dia);
    var refReceptor = firebase.database().ref('celdas/' + solicitud.receptor + '/' + dia);

    console.log(solicitud.turnoReceptor);
    if (solicitud.turnoReceptor !== "D" && solicitud.turnoReceptor !== "DF" && solicitud.turnoReceptor !== "AS") {
        refSolicitante.once('value', function (snapshotSolicitante) {
            var horarioSolicitante = snapshotSolicitante.val();
            console.log(snapshotSolicitante.val());

            refReceptor.once('value', function (snapshotReceptor) {
                var horarioReceptor = snapshotReceptor.val();
                refReceptor.set(horarioSolicitante);
                refSolicitante.set(horarioReceptor);
            });
        });
    } else {
        refSolicitante.set({
            texto: solicitud.turnoReceptor
        });
    }

    setTimeout(function () {
        location.reload();
    }, 1000);

}

const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
var titulo = document.getElementById("titulos");
var selectMes = document.getElementById('Mes');
var selectAño = document.getElementById('Año');

var mesActual = new Date().getMonth();
var currentYear = new Date().getFullYear();

selectMes.selectedIndex = mesActual;
titulo.textContent = nombresMeses[mesActual];
cargarDatos();

for (let i = 0; i < selectAño.options.length; i++) {
    if (+selectAño.options[i].value === currentYear) {
        selectAño.selectedIndex = i;
        break;
    }
}

selectMes.addEventListener('change', function () {
    var mesSeleccionado = selectMes.selectedIndex;
    titulo.textContent = nombresMeses[mesSeleccionado];
    cargarDatos();
    diaSemana();
    Festivos();
    cambiarBordeColumna();
    cargarVacaciones();
});

selectAño.addEventListener('change', function () {
    var mesSeleccionado = selectMes.selectedIndex;
    titulo.textContent = nombresMeses[mesSeleccionado];
    cargarDatos();
    diaSemana();
    Festivos();
    cambiarBordeColumna();
    cargarVacaciones();
});

function diaSemana() {
    var año = document.getElementById('Año').value;
    var mes = document.getElementById('Mes').value;
    var dias = ['D', 'L', 'M', 'M', 'J', 'V', 'S']; // Iniciales de los días de la semana

    var meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    var mesNumero = meses.indexOf(mes);
    var celdas = document.getElementsByClassName('DiaSemana');
    for (var i = 1; i < celdas.length + 1; i++) {
        var fecha = new Date(año, mesNumero, i);
        var dia = fecha.getDay();
        if (celdas[i - 1]) {
            celdas[i - 1].textContent = dias[dia];
        } else {
        }
    }
    colorCelda();
}

function contHoras() {
    var contA = 0, contB = 0, contC = 0, contD = 0, contE = 0, contF = 0;
    var tiposTurno8 = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'AS', 'DF'];
    var tiposTurno7 = ['TSA', 'T1R1', 'T2R1', 'T3R1', 'T4R1', 'T5R1', 'T6R1', 'T7R1', 'ASR1'];
    var tiposTurno0 = ['NN', 'D'];

    for (var i = 1; i < 32; i++) {
        var celda = document.getElementById('A' + i);
        if (tiposTurno8.includes(celda.textContent)) {
            contA += 8;
        } else if (tiposTurno7.includes(celda.textContent)) {
            contA += 7;
        } else if (tiposTurno0.includes(celda.textContent)) {
            contA += 0;
        }
    }
    for (var i = 1; i < 32; i++) {
        var celda = document.getElementById('B' + i);
        if (tiposTurno8.includes(celda.textContent)) {
            contB += 8;
        } else if (tiposTurno7.includes(celda.textContent)) {
            contB += 7;
        } else if (tiposTurno0.includes(celda.textContent)) {
            contB += 0;
        }
    }
    for (var i = 1; i < 32; i++) {
        var celda = document.getElementById('C' + i);
        if (tiposTurno8.includes(celda.textContent)) {
            contC += 8;
        } else if (tiposTurno7.includes(celda.textContent)) {
            contC += 7;
        } else if (tiposTurno0.includes(celda.textContent)) {
            contC += 0;
        }
    }
    for (var i = 1; i < 32; i++) {
        var celda = document.getElementById('D' + i);
        if (tiposTurno8.includes(celda.textContent)) {
            contD += 8;
        } else if (tiposTurno7.includes(celda.textContent)) {
            contD += 7;
        } else if (tiposTurno0.includes(celda.textContent)) {
            contD += 0;
        }
    }
    for (var i = 1; i < 32; i++) {
        var celda = document.getElementById('E' + i);
        if (tiposTurno8.includes(celda.textContent)) {
            contE += 8;
        } else if (tiposTurno7.includes(celda.textContent)) {
            contE += 7;
        } else if (tiposTurno0.includes(celda.textContent)) {
            contE += 0;
        }
    }
    for (var i = 1; i < 32; i++) {
        var celda = document.getElementById('F' + i);
        if (tiposTurno8.includes(celda.textContent)) {
            contF += 8;
        } else if (tiposTurno7.includes(celda.textContent)) {
            contF += 7;
        } else if (tiposTurno0.includes(celda.textContent)) {
            contF += 0;
        }
    }

    var celdaA = document.getElementById("11");
    celdaA.textContent = contA;
    var celdaB = document.getElementById("12");
    celdaB.textContent = contB;
    var celdaC = document.getElementById("13");
    celdaC.textContent = contC;
    var celdaD = document.getElementById("14");
    celdaD.textContent = contD;
    var celdaE = document.getElementById("15");
    celdaE.textContent = contE;
    var celdaF = document.getElementById("16");
    celdaF.textContent = contF;
}

const checkInterval = 200;
function checkScrollbar(el) {
    return el.offsetWidth < el.scrollWidth;
}
function cambiarPaddingSegunScroll() {
    if (window.innerWidth <= 810) {
        return;
    }

    const tabla = document.getElementById('Tabla');
    const otroDiv = document.getElementById('TablaDescansos');

    otroDiv.style.paddingBottom = checkScrollbar(tabla) ? '17px' : '0px';
}

cambiarPaddingSegunScroll();

setInterval(() => {
    cambiarPaddingSegunScroll();
}, checkInterval);

document.getElementById('btnEnviar').addEventListener('click', generarSolicitudes2);


function Importar() {
    let confirmacion = confirm("¿Está seguro de que desea pegar los datos del portapapeles en la tabla?");
    if (!confirmacion) {
        return; // Si el usuario no confirma, termina la función
    }
    navigator.clipboard.readText()
        .then(data => {
            const dataArray = data.split('\n');
            const table = document.getElementById("Table");
            let rows = table.rows;
            let currentRow = 0;
            let currentCell = 0;
            dataArray.forEach(item => {
                let itemArray = item.split('\t'); // Divide cada línea por el carácter de tabulación
                itemArray.forEach(subItem => {
                    while (currentRow < rows.length) {
                        let cell = rows[currentRow].cells[currentCell]; // Obtiene la celda de la fila y columna actual
                        if (!cell.textContent.trim()) { // Si la celda está vacía
                            cell.textContent = subItem; // Agrega el valor en la celda
                            currentCell++;
                            if (currentCell >= rows[currentRow].cells.length) {
                                currentCell = 0;
                                currentRow++;
                            }
                            break;
                        } else {
                            currentCell++;
                            if (currentCell >= rows[currentRow].cells.length) {
                                currentCell = 0;
                                currentRow++;
                            }
                        }
                    }
                    colorCelda()
                });
            });
        })
        .catch(error => {
            console.error('Failed to read clipboard data:', error);
        });
}

document.getElementById("btnImportar").addEventListener("click", Importar);

function limpiarCeldasEditables() {

    let celdasEditables = document.querySelectorAll('[contenteditable="true"]');

    celdasEditables.forEach(function (celda) {
        if (celda.textContent == "NN") {
            celda.textContent = 'NN';
        } else {
            celda.textContent = '';
        }
    });
    colorCelda()
}

document.getElementById('btnLimpiar').addEventListener('click', limpiarCeldasEditables);

function ExportaraTexto() {
    if (document.getElementById("SolExportar").value == "") {
        alert("Por favor seleccione un agente");
        return;
    }
    let confirmacion = confirm("¿Está seguro de que desea copiar los datos de la tabla al portapapeles?");
    if (!confirmacion) {
        return;
    }
    var Letra = agentes[document.getElementById("SolExportar").value].letra;
    let texto = "";
    var meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    var horariosTurnos = {
        "T1": "7:00 - 4:00",
        "T2": "9:00 - 6:00",
        "T3": "09:30 - 6:30",
        "T4": "10:00 - 7:00",
        "T5": "11:00 - 8:00",
        "T6": "12:30 - 9:30",
        "T7": "8:00 - 5:00",
        "TSA": "8:00 - 4:00",
        "T2R1": "10:00 - 6:00",
        "T3R1": "10:30 - 6:30",
        "T4R1": "11:00 - 7:00",
        "T5R1": "12:00 - 8:00",
        "T6R1": "1:30 - 9:30",
        "T7R1": "9:00 - 5:00",
        "NN": "Ninguno",
        "D": "Descanso",
        "AS": "Apoyo Sura 06:30 am - 05:00 pm",
        "ASR1": "Apoyo Sura 06:30 am - 04:00 pm",
        "DF": "Día de la familia",
        "IN": "Incapacidad",
        "DV": "Vacaciones",
        "T": "Tramites",
        "MD": "Medio día",
    }
    agentes[document.getElementById("SolExportar").value].nombre;
    var mes = document.getElementById("Mes").value;
    texto += "Turnos de " + agentes[document.getElementById("SolExportar").value].nombre + " en " + mes + ":" + "\n" + "\n";
    for (let i = 1; i <= 31; i++) {
        var turno = document.getElementById(Letra + i).textContent;
        var horario = horariosTurnos[turno];
        var dia = document.getElementById("Dia" + i).textContent;
        var numeroMes = meses.indexOf(mes);
        var ano = document.getElementById("Año").value;
        var fecha = new Date(ano, numeroMes, dia);
        if (isNaN(fecha.getTime())) {
            alert("Fecha inválida: " + ano + "-" + mes + "-" + dia);
            return;
        }
        var diaSemana = fecha.getDay();

        var diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        diaSemana = diasSemana[diaSemana];

        texto += diaSemana + " " + dia + ": (" + turno + ") " + horario + "\n";
    }
    navigator.clipboard.writeText(texto)
        .then(() => {
            alert("Datos copiados al portapapeles");
        })
        .catch(error => {
            console.error('Falla en la copia en el portapeles', error);
        });
}

document.getElementById("btnExportarTexto").addEventListener("click", ExportaraTexto);

function Festivos() {
    var mes = document.getElementById("Mes").value;
    var ano = document.getElementById("Año").value;
    var festivos2024 = {
        "Enero": [1, 8],
        "Febrero": [],
        "Marzo": [25, 28, 29],
        "Abril": [],
        "Mayo": [1, 13],
        "Junio": [3, 10],
        "Julio": [1, 20],
        "Agosto": [7, 19],
        "Septiembre": [],
        "Octubre": [14],
        "Noviembre": [4, 11],
        "Diciembre": [8]
    }
    const fecha = new Date();
    const dia = "Dia" + fecha.getDate();
    const nombresDeMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const mesActual = nombresDeMeses[fecha.getMonth()];
    for (let i = 1; i <= 31; i++) {
        var celda = document.getElementById("Dia" + i);
        celda.style.backgroundColor = "#012353";
        celda.style.color = "white";
        if (festivos2024[mes].includes(i)) {
            if (dia == "Dia" + i) {
                celda.style.backgroundColor = "orange";
                celda.style.color = "red";
            } else {
                celda.style.backgroundColor = "red";
                celda.style.color = "white";
            }
        } else if (dia == "Dia" + i && mes == mesActual) {
            celda.style.backgroundColor = "orange";
            celda.style.color = "black";
        }
    }
}

var botonIzq = document.getElementById('Izq');
var botonHoy = document.getElementById('Hoy');
var botonDer = document.getElementById('Der');

botonIzq.addEventListener('click', function () {
    if (selectMes.selectedIndex > 0) {
        selectMes.selectedIndex--;
        selectMes.dispatchEvent(new Event('change'));
    }
});

botonHoy.addEventListener('click', function () {
    var fechaActual = new Date();
    var mesActual = fechaActual.getMonth();
    selectMes.selectedIndex = mesActual;
    selectMes.dispatchEvent(new Event('change'));
});

botonDer.addEventListener('click', function () {
    if (selectMes.selectedIndex < selectMes.options.length - 1) {
        selectMes.selectedIndex++;
        selectMes.dispatchEvent(new Event('change'));
    }
});

function eliminarBordes() {
    const todasLasCeldas = document.querySelectorAll('#Table th, #Table td');
    todasLasCeldas.forEach(celda => {
        celda.style.border = 'none';
    });
}

function cambiarBordeColumna() {
    // Eliminar bordes derechos existentes de todas las celdas y encabezados
    const todasLasCeldas = document.querySelectorAll('#Table th, #Table td');
    todasLasCeldas.forEach(celda => {
        celda.style.borderRight = 'none';
    });

    // Verificar si la segunda fila contiene 'D' y en qué columnas
    const segundaFila = document.querySelector('#Table tr:nth-child(2)');
    if (segundaFila) {
        const celdasSegundaFila = segundaFila.querySelectorAll('td');
        celdasSegundaFila.forEach((celda, index) => {
            if (celda.textContent.trim() === 'D') {
                const columnIndex = index + 2;
                const columnCeldas = document.querySelectorAll(`#Table th:nth-child(${columnIndex}), #Table td:nth-child(${columnIndex})`);
                columnCeldas.forEach((celda, idx) => {
                    if (idx === 0 || idx === 1) { // Índices 0 y 1 corresponden a las dos primeras filas (th y primera td)
                        celda.style.borderRight = '1px solid white';
                    } else {
                        celda.style.borderRight = '1px solid #012353';
                    }
                });
            }
        });
    }
}

var selector = document.getElementById('Mes');

// Agrega un evento de cambio al selector
selector.addEventListener('change', function () {
    // Obtén el valor seleccionado
    var valorSeleccionado = this.value;

    // Define los meses para los que quieres ocultar la fila
    var meses = ["Junio", "Julio", "Agosto", "Septiembre"];

    // Obtén todas las filas
    var filas = document.getElementsByTagName('tr');

    // Recorre todas las filas
    for (var i = 0; i < filas.length; i++) {
        // Obtén todas las celdas de la fila
        var celdas = filas[i].getElementsByTagName('td');

        // Recorre todas las celdas
        for (var j = 0; j < celdas.length; j++) {
            // Si el contenido de la celda es "Andrés Felipe Vidal Medina" y el valor seleccionado está en el array de meses, oculta la fila
            if (celdas[j].textContent === "Andrés Felipe Vidal Medina" && meses.includes(valorSeleccionado)) {
                filas[i].style.display = 'none';
                break; // Sal del bucle una vez que encuentres la celda correcta
            } else {
                filas[i].style.display = ''; // Muestra la fila si no coincide con las condiciones
            }
        }
    }

    // Oculta la fila con el ID 5 si el valor seleccionado está en el array de meses
    if (meses.includes(valorSeleccionado)) {
        document.getElementById('5').parentElement.style.display = 'none';
    } else {
        document.getElementById('5').parentElement.style.display = '';
    }
});

let agentesV = {
    Anderson_Cano_Londoño: {
        nombre: "Anderson Cano Londoño",
        fechaIngreso: "2023-11-01",
        contraseña: ""
    },
    Miguel_Cadavid_Naranjo: {
        nombre: "Miguel Cadavid Naranjo",
        fechaIngreso: "2023-04-17",
        contraseña: ""
    },
    Milton_Alexis_Calle_Londoño: {
        nombre: "Milton Alexis Calle Londoño",
        fechaIngreso: "2023-02-02",
        contraseña: ""
    },
    Yesica_Johana_Cano_Quintero: {
        nombre: "Yesica Johana Cano Quintero",
        fechaIngreso: "2023-11-14",
        contraseña: ""
    },
    Andrés_Felipe_Vidal_Medina: {
        nombre: "Andrés Felipe Vidal Medina",
        fechaIngreso: "2023-10-17",
        contraseña: ""
    },
    Andrés_Felipe_Yepes_Tascón: {
        nombre: "Andrés Felipe Yepes Tascón",
        fechaIngreso: "2023-10-17",
        contraseña: ""
    },
}

function CalculoDiasPendientes(agente) {
    var diasVacaciones = 0;
    const [year, month, day] = agentesV[agente].fechaIngreso.split('-');
    const fechaIngreso = new Date(year, month - 1, day);

    // Obtener la fecha actual
    const fechaActual = new Date();

    // Establecer el día a '1' dará el primer día del mes actual
    fechaActual.setDate(1);

    // Restar un día desde el primer día del mes actual te llevará al último día del mes anterior
    fechaActual.setDate(fechaActual.getDate() - 1);

    const diferencia = fechaActual - fechaIngreso;
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    diasVacaciones = Math.floor((dias / 365) * 15);
    return diasVacaciones;
}

async function CalculoDiasAño(agente) {
    const añoSeleccionado = document.getElementById('Año').value;
    const nombreAgente = agentesV[agente].nombre;
    var diasAño = 0;
    var incapacidad = 0;
    var vacaciones = 0;
    var medioDia = 0;
    var tramites = 0;

    let promises = [];
    for (var i = 1; i <= 12; i++) {
        for (var j = 2; j <= 32; j++) {
            let promise = db.ref('celdas/' + nombreAgente + '/' + j + '/' + añoSeleccionado + '/' + i).once('value');
            promises.push(promise);
        }
    }
    let results = await Promise.all(promises);
    results.forEach(snapshot => {
        const data = snapshot.val();
        if (data && (data.texto == 'IN' || data.texto == 'DV')) {
            diasAño += 1;
            if (data.texto == 'IN') {
                incapacidad += 1;
            } else if (data.texto == 'DV') {
                vacaciones += 1;
            }
        } else if (data && data.texto == 'T') {
            tramites += 1;
        } else if (data && data.texto == 'MD') {
            medioDia += 1;
        }
    });
    return { incapacidad, vacaciones, tramites, medioDia, diasAño };
}

async function CalculoDiasMes(agente) {
    const mesSeleccionado = document.getElementById('Mes').selectedIndex + 1; // +1 porque los meses están 1-indexados
    const añoSeleccionado = document.getElementById('Año').value;
    const nombreAgente = agentesV[agente].nombre;

    var diasMes = 0;

    let promises = [];
    for (var j = 2; j <= 32; j++) {
        let promise = db.ref('celdas/' + nombreAgente + '/' + j + '/' + añoSeleccionado + '/' + mesSeleccionado).once('value');
        promises.push(promise);
    }
    let results = await Promise.all(promises);
    results.forEach(snapshot => {
        const data = snapshot.val();
        if (data && (data.texto == 'IN' || data.texto == 'DV')) {
            diasMes += 1;
        }
    });
    return diasMes;
}

async function cargarVacaciones() {
    const agentesArray = Object.keys(agentesV);
    for (let index = 0; index < agentesArray.length; index++) {
        const agente = agentesArray[index];
        const diasPendientes = await CalculoDiasPendientes(agente);
        const diasMes = await CalculoDiasMes(agente);
        const { incapacidad, vacaciones, tramites, medioDia, diasAño } = await CalculoDiasAño(agente);
        const diasNoIncapacidad = diasAño - incapacidad; // Restar los días de incapacidad de los días del año
        document.getElementById("DP" + (index + 1)).textContent = diasPendientes - diasNoIncapacidad; // Restar los días que no son de incapacidad de los días pendientes
        document.getElementById("DenA" + (index + 1)).textContent = diasAño;
        document.getElementById("DenM" + (index + 1)).textContent = diasMes;
        document.getElementById("IN" + (index + 1)).textContent = incapacidad;
        document.getElementById("DV" + (index + 1)).textContent = vacaciones;
        document.getElementById("T" + (index + 1)).textContent = tramites;
        document.getElementById("MD" + (index + 1)).textContent = medioDia;
    }
}


document.getElementById("btnNotificador").addEventListener("click", function () {
    Notificador();
});

function Notificador() {
    var agenteSeleccionado = document.getElementById("SolExportar").value;
    if (agenteSeleccionado == "") {
        alert("Por favor seleccione un agente");
        return;
    }

    var Marcaciones = {
        "T1": ["7:00", "12:00", "13:00", "16:00"],
        "T2": ["9:00", "12:30", "13:30", "18:00"],
        "T3": ["09:30", "13:30", "14:30", "18:30"],
        "T4": ["10:00", "14:30", "15:30", "19:00"],
        "T5": ["11:00", "15:30", "16:30", "20:00"],
        "T6": ["12:30", "16:30", "17:30", "21:09"],
        "TSA": ["8:00", "12:00", "13:00", "16:00"],
        "T2R1": ["10:00", "12:30", "13:30", "18:00"],
        "T3R1": ["10:30", "13:30", "14:30", "18:30"],
        "T4R1": ["11:00", "14:30", "15:30", "19:00"],
        "T5R1": ["12:00", "15:30", "16:30", "20:00"],
        "T6R1": ["13:30", "16:30", "17:30", "21:30"],
    };

    var Letra = agentes[agenteSeleccionado].letra;
    var fecha = new Date();
    var dia = fecha.getDate();
    var celda = document.getElementById(Letra + dia);
    console.log(celda.textContent);

    var descripciones = ["entrada del turno", "salida al almuerzo", "entrada del almuerzo", "salida del turno"];
    var horarios = Marcaciones[celda.textContent.trim()];

    if (!("Notification" in window)) {
        alert("Este navegador no soporta notificaciones de escritorio");
        return;
    } else if (Notification.permission !== "granted") {
        Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
                // Notificación de confirmación
                mostrarNotificacion("Has activado las notificaciones de las marcaciones de Softcontrol");
                programarNotificaciones(horarios, descripciones);
            }
        });
    } else {
        // Notificación de confirmación si los permisos ya están concedidos
        mostrarNotificacion("Has activado las notificaciones de las marcaciones de Softcontrol");
        programarNotificaciones(horarios, descripciones);
    }
}

function programarNotificaciones(horarios, descripciones) {
    var now = new Date();
    horarios.forEach((horario, index) => {
        var [hours, minutes] = horario.split(':');
        var time = new Date();
        time.setHours(hours, minutes, 0, 0);

        if (time > now) {
            var timeout = time - now;
            setTimeout(() => {
                mostrarNotificacion(`Es hora de la ${descripciones[index]}: ${convertirHora12(time)}`);
            }, timeout);
        }
    });
}

function mostrarNotificacion(mensaje) {
    new Notification("Recordatorio de Marcación Softcontrol", {
        body: mensaje,
    });

    // Reproducir sonido de notificación
    var sonido = document.getElementById("notificationSound");
    sonido.play();
}

function convertirHora12(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // La hora '0' debe ser '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}