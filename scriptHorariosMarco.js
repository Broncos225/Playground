const firebaseConfig = {
    apiKey: "AIzaSyC_cUBDeHGQAP87PXMMd0qC0A_vc5NXN3A",
    authDomain: "playgroundbdmarco.firebaseapp.com",
    databaseURL: "https://playgroundbdmarco-default-rtdb.firebaseio.com",
    projectId: "playgroundbdmarco",
    storageBucket: "playgroundbdmarco.appspot.com",
    messagingSenderId: "1049257816560",
    appId: "1:1049257816560:web:ad60c19e86f38477baad35"
  };


firebase.initializeApp(firebaseConfig);
const db = firebase.database();

window.onload = function () {
    colorCelda();
    cargarDatos();
    resaltarDiaActual();
    mostrarSolicitudes();
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
    var colorT1 = '#dce6f1';
    var colorT2 = '#ccc0da';
    var colorT3 = '#c4d79b';
    var colorT4 = '#da9694';
    var colorD = '#';


    const texto = celda.textContent.trim();
    let color;
    switch (texto) {
        case '1':
            color = colorT1;
            break;
        case '2':
            color = colorT2;
            break;
        case '3':
            color = colorT3;
            break;
        case '4':
            color = colorT4;
            break;
        case 'D':
        case 'DF':
        case 'S':
            color = colorD;
            celda.style.color = 'red';
            break;

    }
    celda.style.backgroundColor = color;
}

function guardarCeldas() {
    var passw = document.getElementById('pass').value;
    if (passw == "5522") {
        const celdas = document.querySelectorAll('#Table td');
        celdas.forEach(celda => {
            const texto = celda.textContent.trim();
            const idCelda = celda.cellIndex + 1; // Obtén el índice de la celda (1-indexed)
            const nombreFila = celda.parentNode.cells[0].textContent.trim(); // Obtén el nombre del agente

            db.ref('celdas/' + nombreFila + '/' + idCelda).set({
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
    const celdas = document.querySelectorAll('td');

    celdas.forEach((celda) => {
        const idCelda = celda.cellIndex + 1;
        const nombreFila = celda.parentNode.cells[0].textContent.trim();

        db.ref('celdas/' + nombreFila + '/' + idCelda).once('value')
            .then(snapshot => {
                const data = snapshot.val();
                if (data) {
                    celda.textContent = data.texto;
                    actualizarColorCelda(celda);
                }
                contDescansos(); // Call the function here
            })
            .catch(error => {
                console.error("Error al cargar datos:", error);
            });
    });
}

document.getElementById('btnGuardar').addEventListener('click', guardarCeldas);

function contDescansos() {
    var contA = 0, contB = 0, contC = 0, contD = 0;

    for (var i = 1; i < 30; i++) {
        var celda = document.getElementById('A' + i);
        if (celda.textContent == 'D') {
            contA += 1;
        }
    }
    for (var i = 1; i < 30; i++) {
        var celda = document.getElementById('B' + i);
        if (celda.textContent == 'D') {
            contB += 1;
        }
    }
    for (var i = 1; i < 30; i++) {
        var celda = document.getElementById('C' + i);
        if (celda.textContent == 'D') {
            contC += 1;
        }
    }
    for (var i = 1; i < 30; i++) {
        var celda = document.getElementById('D' + i);
        if (celda.textContent == 'D') {
            contD += 1;
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
}

function resaltarDiaActual() {
    var a = new Date();
    var dia = a.getDate();
    var celda = document.getElementById("Dias");
    celda.cells[dia].style.backgroundColor = "orange";
    celda.cells[dia].style.color = "black";
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
}

document.getElementById('btnExportar').addEventListener('click', exportarExcel);

let agentes = {
    Victor_Moreno: {
        nombre: "Victor Moreno",
        letra: "A",
        contraseña: ""
    },
    Karelis_Cataño	: {
        nombre: "Karelis Cataño",
        letra: "B",
        contraseña: ""
    },
    Katerin_Velez: {
        nombre: "Katerin Velez",
        letra: "C",
        contraseña: ""
    },
    Samuel_Ruiz: {
        nombre: "Samuel Ruiz",
        contraseña: ""
    },
    Andrea_Buitrago: {
        nombre: "Andrea Buitrago",
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
}

let agentesExcluidos = ["D", "DF"];

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
function intercambiarTurnos() {
    if (document.getElementById('NuevaSolicitud').style.display == 'block') {
        document.getElementById('NuevaSolicitud').style.display = 'none';
        document.getElementById('btnIntercambioTurno').textContent = "Generar una nueva solicitud";
    } else {
        document.getElementById('NuevaSolicitud').style.display = 'block';
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
            var fecha = new Date(partes[0], partes[1] - 1, partes[2]);
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
            var fecha = new Date(partes[0], partes[1] - 1, partes[2]);
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
        }
    }
}

function mostrarSolicitudes() {
    // Obtén una referencia al cuerpo de la tabla en tu HTML
    var tabla = document.getElementById("Table2").getElementsByTagName('tbody')[0];
    // Escucha los cambios en los datos
    db.ref('solicitudes').on('value', snapshot => {
        // Limpia el cuerpo de la tabla
        while (tabla.hasChildNodes()) {
            tabla.removeChild(tabla.firstChild);
        }
        // Almacena todas las solicitudes en un array
        var solicitudes = [];
        snapshot.forEach(childSnapshot => {
            solicitudes.push(childSnapshot.val());
        });

        // Invierte el array
        solicitudes.reverse();

        // Añade los datos a la tabla
        solicitudes.forEach(solicitud => {
            // Crea una nueva fila y celdas
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

            // Añade los datos a las celdas
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
        case "Victor Moreno":
            var receptor = "Victor_Moreno";
            break;
        case "Karelis Cataño":
            var receptor = "Karelis_Cataño";
            break;
        case "Katerin Velez":
            var receptor = "Katerin_Velez";
            break;
        case "Samuel Ruiz":
            var receptor = "Samuel_Ruiz";
            break;
        case "Descanso":
            var receptor = "D";
            break;
        case "Día de la familia":
            var receptor = "DF";
            break;
    }

    if (valor == agentes.Andrea_Buitrago.contraseña) {
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
        case "Victor Moreno":
            var receptor = "Victor_Moreno";
            break;
        case "Karelis Cataño":
            var receptor = "Karelis_Cataño";
            break;
        case "Katerin Velez":
            var receptor = "Katerin_Velez";
            break;
        case "Samuel Ruiz":
            var receptor = "Samuel_Ruiz";
            break;
        case "Descanso":
            var receptor = "D";
            break;
        case "Día de la familia":
            var receptor = "DF";
            break;
    }

    if (valor == agentes.Andrea_Buitrago.contraseña) {
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
    var refSolicitante = firebase.database().ref('celdas/' + solicitud.solicitante + '/' + dia);
    var refReceptor = firebase.database().ref('celdas/' + solicitud.receptor + '/' + dia);

    console.log(solicitud.turnoReceptor);
    if (solicitud.turnoReceptor !== "D" && solicitud.turnoReceptor !== "DF") {
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

document.getElementById('btnEnviar').addEventListener('click', generarSolicitudes);