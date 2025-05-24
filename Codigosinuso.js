// Copyright (c) 2024 Andrés Felipe Yepes Tascón
// Licensed under the MIT License. See LICENSE file for details.
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
        alert("Por favor complete todos los campos y revise que no se esté solicitando un cambio de turno con el mismo asesor");
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
        alert("Por favor complete todos los campos y revise que no se esté solicitando un cambio de turno con el mismo asesor");
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