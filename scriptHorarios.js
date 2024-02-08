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
    var colorT1 = '#fcfb8d';
    var colorT2 = '#afed87';
    var colorT3 = '#87beed';
    var colorT4 = '#c5b4fa';
    var colorT5 = '#fcbdc4';
    var colorT6 = '#fc818d';
    var colorTSA = '#85a5ff';
    var colorAM = '#80eded';
    var colorD = '#white';


    const texto = celda.textContent.trim();
    let color;
    switch (texto) {
        case 'T1':
        case 'T1R1':
            color = colorT1;
            break;
        case 'T2':
        case 'T2R1':
            color = colorT2;
            break;
        case 'T3':
        case 'T3R1':
            color = colorT3;
            break;
        case 'T4':
        case 'T4R1':
            color = colorT4;
            break;
        case 'T5':
        case 'T5R1':
            color = colorT5;
            break;
        case 'T6':
        case 'T6R1':
            color = colorT6;
            break;
        case 'D':
        case 'DF':
        case 'S':
            color = colorD;
            celda.style.color = 'red';
            break;
        case 'TSA':
            color = colorTSA;
            break;
        case 'AM':
            color = colorAM;
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
    var contA = 0, contB = 0, contC = 0, contD = 0, contE = 0, contF = 0;

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
    for (var i = 1; i < 30; i++) {
        var celda = document.getElementById('E' + i);
        if (celda.textContent == 'D') {
            contE += 1;
        }
    }
    for (var i = 1; i < 30; i++) {
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
    Anderson_Cano_Londoño: {
        nombre: "Anderson Cano Londoño",
        correo: "anderson.cano@arus.com.co",
        letra: "A"
    },
    Miguel_Cadavid_Naranjo: {
        nombre: "Miguel Cadavid Naranjo",
        correo: "miguel.cadavid@arus.com.co",
        letra: "B"
    },
    Milton_Alexis_Calle_Londoño: {
        nombre: "Milton Alexis Calle Londoño",
        correo: "milton.calle@arus.com.co",
        letra: "C"
    },
    Yesica_Johana_Cano_Quintero: {
        nombre: "Yesica Johana Cano Quintero",
        correo: "yesica.cano@arus.com.co",
        letra: "D"
    },
    Andrés_Felipe_Vidal_Medina: {
        nombre: "Andrés Felipe Vidal Medina",
        correo: "andres.vidal@arus.com.co",
        letra: "E"
    },
    Andrés_Felipe_Yepes_Tascón: {
        nombre: "Andrés Felipe Yepes Tascón",
        correo: "andres.yepes@arus.com.co",
        letra: "F"
    },
    Oscar_Luis_Cabrera_Pacheco: {
        nombre: "Oscar Luis Cabrera Pacheco",
        correo: "oscar.cabrera@arus.com.co"
    }
}

var contadorRegistros = 0;

function generarSolicitudes() {
    if (document.getElementById('Solicitante').value == "" || document.getElementById('Receptor').value == "" || document.getElementById('DiaSolicitado').value == "") {
        alert("Por favor complete todos los campos");
        return;
    } else {
        var solicitante = document.getElementById('Solicitante').value;
        var receptor = document.getElementById('Receptor').value;
        var inputFecha = document.getElementById('DiaSolicitado').value;
        var partes = inputFecha.split('-');
        var fecha = new Date(partes[0], partes[1] - 1, partes[2]);
        var dia = fecha.getDate();
        var TurnoSol = agentes[solicitante].letra + dia;
        var TurnoRec = agentes[receptor].letra + dia;
        var celdaSol = document.getElementById(TurnoSol);
        var celdaRec = document.getElementById(TurnoRec);

        var confirmacion = confirm("¿Estás seguro de que quieres enviar la solicitud para el cambio de turno?");
        if (confirmacion == true) {
            var fecha = new Date();
            var opcionesFecha = { year: 'numeric', month: 'numeric', day: 'numeric' };
            var opcionesHora = { hour: '2-digit', minute: '2-digit', hour12: true };
            var fechaHora = fecha.toLocaleDateString('es-ES', opcionesFecha) + ' ' + fecha.toLocaleTimeString('es-ES', opcionesHora);

            contadorRegistros++;

            db.ref('solicitudes').push({
                id: contadorRegistros,
                solicitante: agentes[solicitante].nombre,
                receptor: agentes[receptor].nombre,
                turnoSolicitante: celdaSol.textContent,
                turnoReceptor: celdaRec.textContent,
                fechaHora: fechaHora.replace(',', ''),
                estado: "Pendiente"
            }, error => {
                if (error) {
                    console.error("Error añadiendo el nodo: ", error);
                } else {
                    console.log("Nodo añadido con éxito");
                }
            });

        } else {
            return;
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
            var celdaTurnoSolicitante = document.createElement("td");
            var celdaTurnoReceptor = document.createElement("td");
            var celdaFechaHora = document.createElement("td");
            var celdaEstado = document.createElement("td");

            // Añade los datos a las celdas
            celdaId.textContent = solicitud.id;
            celdaSolicitante.textContent = solicitud.solicitante;
            celdaReceptor.textContent = solicitud.receptor;
            celdaTurnoSolicitante.textContent = solicitud.turnoSolicitante;
            celdaTurnoReceptor.textContent = solicitud.turnoReceptor;
            celdaFechaHora.textContent = solicitud.fechaHora;
            celdaEstado.textContent = solicitud.estado;

            // Añade las celdas a la fila
            fila.appendChild(celdaId);
            fila.appendChild(celdaSolicitante);
            fila.appendChild(celdaReceptor);
            fila.appendChild(celdaTurnoSolicitante);
            fila.appendChild(celdaTurnoReceptor);
            fila.appendChild(celdaFechaHora);
            fila.appendChild(celdaEstado);

            // Añade la fila al cuerpo de la tabla
            tabla.appendChild(fila);
            switch (celdaEstado.textContent) {
                case "Pendiente":
                    celdaEstado.style.backgroundColor = "yellow";
                    break;
                case "Aprobado":
                    celdaEstado.style.backgroundColor = "green";
                    break;
                case "Rechazado":
                    celdaEstado.style.backgroundColor = "red";
                    break;
            }
            var celda = document.querySelectorAll('#Table2 td');

            celda.forEach(function (celda) {
                actualizarColorCelda(celda);
            });
        });
    });

}


document.getElementById('btnEnviar').addEventListener('click', generarSolicitudes);
