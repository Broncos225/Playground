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
    ocultarFilas("Andrés Felipe Vidal Medina", ["Junio", "Julio", "Agosto"]);
    ocultarFilas("Juan Pablo Vidal Saldarriaga", ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre"]);
    ocultarFilas("Oculto", ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]);
    ocultarFilas("Santiago Pérez Martinez", ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio"]);
    ocultarFilas("Yeison Torres Ochoa", ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto"]);
    ocultarFilas("Jhonatan Gamboa Mena", ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio","Septiembre", "Octubre", "Noviembre", "Diciembre"]);
    ocultarFilas("Maira Mosquera Blandon", ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Octubre", "Noviembre", "Diciembre"]);
    CuentaAsesor();
    diaSemana();
    cargarDatos();
    colorCelda();
    Festivos();
    cambiarBordeColumna();
    cargarVacaciones();
    contarTurnos();
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
    var colorD = '#e69500';
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
        case 'T1N':
        case 'T1D':
        case 'T1U':
        case 'T1 - T1U':
            color = colorT1;
            celda.style.color = 'black';
            break;
        case 'T2':
        case 'T2R1':
        case 'T2N':
        case 'T2D':
        case 'T2U':
        case 'T2 - T2U':
            color = colorT2;
            celda.style.color = 'black';
            break;
        case 'T3':
        case 'T3R1':
        case 'T3N':
        case 'T3D':
        case 'T3AD':
            color = colorT3;
            celda.style.color = 'black';
            break;
        case 'T4':
        case 'T4R1':
        case 'T4N':
        case 'T4D':
        case 'T4A':
            color = colorT4;
            celda.style.color = 'black';
            break;
        case 'T5':
        case 'T5R1':
        case 'T5N':
        case 'T5D':
            color = colorT5;
            celda.style.color = 'black';
            break;
        case 'T6':
        case 'T6R1':
        case 'T6N':
        case 'T6D':
        case 'T6AD':
        case 'T6U':
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

document.getElementById('form').addEventListener('submit', function (event) {
    event.preventDefault();
    guardarCeldas();
});

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
        document.getElementById('pass').value = "";
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

function contDescansos() {
    var contA = 0, contB = 0, contC = 0, contD = 0, contE = 0, contF = 0, contG = 0, contH = 0;

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
    for (var i = 1; i < 32; i++) {
        var celda = document.getElementById('G' + i);
        if (celda.textContent == 'D') {
            contG += 1;
        }
    }
    for (var i = 1; i < 32; i++) {
        var celda = document.getElementById('H' + i);
        if (celda.textContent == 'D') {
            contH += 1;
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
    var celdaG = document.getElementById("7");
    celdaG.textContent = contG;
    var celdaH = document.getElementById("8");
    celdaH.textContent = contH;
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
    var btnIcs = document.getElementById("exportIcs");

    btnExcel.onclick = function () {
        exportarExcel();
    }

    btnPng.onclick = function () {
        exportarPNG();
    }

    btnIcs.onclick = function () {
        exportarIcs();
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
    Juan_Pablo_Vidal_Saldarriaga: {
        nombre: "Juan Pablo Vidal Saldarriaga",
        contraseña: ""
    },
    Maira_Mosquera_Blandon: {
        nombre: "Maira Mosquera Blandon",
        contraseña: ""
    },
    Santiago_Pérez_Martinez: {
        nombre: "Santiago Pérez Martinez",
        contraseña: ""
    },
    Yeison_Torres_Ochoa: {
        nombre: "Yeison Torres Ochoa",
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

function ocultarFilas(nombre, mesesParam) {
    var valorSeleccionado = document.getElementById('Mes').value.trim().toLowerCase();
    var filas = document.getElementsByTagName('tr');
    nombre = nombre.trim().toLowerCase();

    var ocultarMes = mesesParam.map(mes => mes.toLowerCase()).includes(valorSeleccionado);

    for (var i = 0; i < filas.length; i++) {
        var celdas = filas[i].getElementsByTagName('td');
        var nombreEncontrado = false;

        for (var j = 0; j < celdas.length; j++) {
            if (celdas[j].textContent.trim().toLowerCase() === nombre) {
                nombreEncontrado = true;
                break;
            }
        }

        if (nombreEncontrado) {
            filas[i].style.display = ocultarMes ? 'none' : '';

            var elementoRelacionado = document.getElementById(i - 2);
            if (elementoRelacionado) {
                elementoRelacionado.parentElement.style.display = ocultarMes ? 'none' : '';
            }
        }
    }
}


var selector = document.getElementById('Mes');
selector.addEventListener('change', function () {
    ocultarFilas("Milton Alexis Calle Londoño", ["Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]);
    ocultarFilas("Andrés Felipe Vidal Medina", ["Junio", "Julio", "Agosto"]);
    ocultarFilas("Juan Pablo Vidal Saldarriaga", ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre"]);
    ocultarFilas("Oculto", ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]);
    ocultarFilas("Nuevo 2", ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"]);
    ocultarFilas("Yeison Torres Ochoa", ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto"]);
    ocultarFilas("Santiago Pérez Martinez", ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio"]);
    ocultarFilas("Jhonatan Gamboa Mena", ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio","Septiembre", "Octubre", "Noviembre", "Diciembre"]);
});



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
    var contadores = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0 };
    var tiposTurno7_5 = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'];
    var tiposTurno8 = ['T1N', 'T2N', 'T3N', 'T4N', 'T5N', 'T6N', 'TSA', 'DF'];
    var tiposTurno0 = ['NN', 'D'];
    var tiposTurno8_5 = ['T1U', 'T2U'];
    var tiposTurno6_5 = ['T6U'];
    var letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    letras.forEach(function (letra) {
        for (var i = 1; i < 32; i++) {
            var celda = document.getElementById(letra + i);
            var contenido = celda.textContent;
            if (tiposTurno7_5.includes(contenido)) {
                contadores[letra] += 7.5;
            } else if (tiposTurno8.includes(contenido)) {
                contadores[letra] += 8;
            } else if (tiposTurno8_5.includes(contenido)) {
                contadores[letra] += 8.5;
            } else if (tiposTurno6_5.includes(contenido)) {
                contadores[letra] += 6.5;
            }
        }
    });

    letras.forEach(function (letra, index) {
        var celda = document.getElementById((index + 11).toString());
        celda.textContent = contadores[letra];
    });
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



function Importar() {
    let confirmacion = confirm("¿Está seguro de que desea pegar los datos del portapapeles en la tabla?");
    if (!confirmacion) {
        return;
    }
    navigator.clipboard.readText()
        .then(data => {
            const dataArray = data.split('\n');
            const table = document.getElementById("Table");
            let rows = table.rows;
            let currentRow = 3; // Comienza después de las primeras 3 filas
            let currentCell = 1;

            dataArray.forEach(item => {
                let itemArray = item.split('\t'); // Divide cada línea por el carácter de tabulación
                itemArray.forEach(subItem => {
                    // Asegúrate de no exceder el número de filas disponibles
                    if (currentRow >= rows.length) {
                        console.error('No hay suficientes filas en la tabla para importar todos los datos.');
                        return; // Salir si no hay más filas disponibles
                    }
                    // Verifica si la fila actual está oculta (display: none)
                    if (rows[currentRow].style.display === 'none') {
                        // Si la fila está oculta, pasa a la siguiente fila
                        currentRow++;
                        currentCell = 1; // Reinicia el índice de celdas para la nueva fila
                    }
                    let cell = rows[currentRow].cells[currentCell]; // Obtiene la celda de la fila y columna actual
                    if (!cell.textContent.trim()) { // Si la celda está vacía
                        cell.textContent = subItem; // Agrega el valor en la celda
                        colorCelda(currentRow, currentCell); // Asumiendo que colorCelda ahora toma fila y celda como argumentos
                    }
                    currentCell++;
                    if (currentCell >= rows[currentRow].cells.length) {
                        currentCell = 1;
                        currentRow++;
                    }
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
        celda.textContent = '';
    });
    colorCelda()
}

document.getElementById('btnLimpiar').addEventListener('click', limpiarCeldasEditables);

function ExportaraTexto() {
    var nombreAsesorActual = localStorage.getItem("nombreAsesorActual");
    if (!nombreAsesorActual) {
        alert("Por favor seleccione un asesor para exportar los datos");
        return;
    }

    let confirmacion = confirm("¿Está seguro de que desea copiar los datos de la tabla al portapapeles?");
    if (!confirmacion) {
        return;
    }
    var Letra = agentes[nombreAsesorActual].letra;
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
    agentes[nombreAsesorActual].nombre;
    var mes = document.getElementById("Mes").value;
    texto += "Turnos de " + agentes[nombreAsesorActual].nombre + " en " + mes + ":" + "\n" + "\n";
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
        celda.style.backgroundColor = "#e69500";
        celda.style.color = "Black";
        if (festivos2024[mes].includes(i)) {
            if (dia == "Dia" + i) {
                celda.style.backgroundColor = "orange";
                celda.style.color = "red";
            } else {
                celda.style.backgroundColor = "red";
                celda.style.color = "Black";
            }
        } else if (dia == "Dia" + i && mes == mesActual) {
            celda.style.backgroundColor = "#0051e6";
            celda.style.color = "white";
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
                        celda.style.borderRight = '1px solid Black';
                    } else {
                        celda.style.borderRight = '1px solid #000';
                    }
                });
            }
        });
    }
}



let agentesV = {
    Anderson_Cano_Londoño: {
        nombre: "Anderson Cano Londoño",
        fechaIngreso: "2023-11-01",
    },
    Milton_Alexis_Calle_Londoño: {
        nombre: "Milton Alexis Calle Londoño",
        fechaIngreso: "2023-02-02",
    },
    Yesica_Johana_Cano_Quintero: {
        nombre: "Yesica Johana Cano Quintero",
        fechaIngreso: "2023-11-14",
    },
    Andrés_Felipe_Vidal_Medina: {
        nombre: "Andrés Felipe Vidal Medina",
        fechaIngreso: "2023-10-17",
    },
    Andrés_Felipe_Yepes_Tascón: {
        nombre: "Andrés Felipe Yepes Tascón",
        fechaIngreso: "2023-10-17",
    },
}

function CalculoDiasPendientes(agente) {
    var diasVacaciones = 0;
    const [year, month, day] = agentesV[agente].fechaIngreso.split('-');
    const fechaIngreso = new Date(year, month - 1, day);
    const fechaActual = new Date();

    fechaActual.setDate(1);
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

document.addEventListener('DOMContentLoaded', function () {
    var boton = document.querySelector('#menuButton');
    var botonesHerramientas = document.querySelector('#BotonesHerramientas');
    botonesHerramientas.style.display = 'none'
    boton.addEventListener('click', function () {
        if (botonesHerramientas.style.display === 'none') {
            botonesHerramientas.style.display = 'flex';
        } else {
            botonesHerramientas.style.display = 'none';
        }
    });
});

function exportarIcs() {
    var nombreAsesor = document.getElementById('AsesorActual').textContent;
    var prefijo = "Bienvenido/a ";
    if (nombreAsesor.startsWith(prefijo)) {
        nombreAsesor = nombreAsesor.substring(prefijo.length);
    }

    var horariosTurnos = {
        "T1N": "7:00 AM - 4:00 PM",
        "T2N": "9:00 AM - 6:00 PM",
        "T3N": "09:30 AM - 6:30 PM",
        "T4N": "10:00 AM - 7:00 PM",
        "T5N": "11:00 AM - 8:00 PM",
        "T6N": "12:30 PM - 9:30 PM",
        "TSA": "8:00 AM - 4:00 PM",
        "T1": "7:00 AM - 3:30 PM",
        "T2": "9:00 AM - 5:30 PM",
        "T3": "09:30 AM - 6:00 PM",
        "T4": "10:00 AM - 6:30 PM",
        "T5": "11:00 AM - 7:30 PM",
        "T6": "1:00 PM - 9:30 PM",
        "T2R1": "10:00 AM - 6:00 PM",
        "T3R1": "10:30 AM - 6:30 PM",
        "T4R1": "11:00 AM - 7:00 PM",
        "T5R1": "12:00 PM - 8:00 PM",
        "T6R1": "1:30 PM - 9:30 PM",
        "T7R1": "9:00 AM - 5:00 PM",
        "NN": "Ninguno",
        "D": "Descanso",
        "AS": "Apoyo Sura 06:30 AM - 05:00 PM",
        "ASR1": "Apoyo Sura 06:30 AM - 04:00 PM",
        "DF": "Día de la familia",
        "IN": "Incapacidad",
        "DV": "Vacaciones",
        "T": "Tramites",
        "MD": "Medio día"
    };

    var meses = {
        "enero": 0,
        "febrero": 1,
        "marzo": 2,
        "abril": 3,
        "mayo": 4,
        "junio": 5,
        "julio": 6,
        "agosto": 7,
        "septiembre": 8,
        "octubre": 9,
        "noviembre": 10,
        "diciembre": 11
    };

    var mesTexto = document.getElementById('Mes').value.toLowerCase();
    var mes = meses[mesTexto];
    var año = parseInt(document.getElementById('Año').value);
    var table = document.getElementById('Table');
    var cal = ics();

    if (mes === undefined) {
        console.log(`Mes no válido: ${mesTexto}`);
        return;
    }

    function convertTo24Hour(time) {
        var [time, modifier] = time.split(' ');
        var [hours, minutes] = time.split(':');
        if (hours === '12') {
            hours = '00';
        }
        if (modifier === 'PM') {
            hours = parseInt(hours, 10) + 12;
        }
        return `${hours}:${minutes}`;
    }

    for (var i = 1, row; row = table.rows[i]; i++) {
        var nombre = row.cells[0].innerText;
        if (nombre === nombreAsesor) {
            for (var j = 1, cell; cell = row.cells[j]; j++) {
                var turno = cell.innerText.trim();
                if (turno === "NN") {
                    continue;
                } else if (horariosTurnos[turno]) {
                    var horario = horariosTurnos[turno];
                    if (turno === "D") {
                        var fecha = new Date(año, mes, j);
                        var start = new Date(fecha.setHours(0, 0, 0));
                        var end = new Date(fecha.setHours(23, 59, 59));
                        cal.addEvent('Descanso', `Día de descanso para ${nombreAsesor}`, 'Casa', start, end);
                    } else if (horario.includes(" - ")) {
                        var fecha = new Date(año, mes, j);
                        var [horaInicio, horaFin] = horario.split(" - ");
                        horaInicio = convertTo24Hour(horaInicio);
                        horaFin = convertTo24Hour(horaFin);
                        var [horaInicioH, horaInicioM] = horaInicio.split(':');
                        var [horaFinH, horaFinM] = horaFin.split(':');
                        var start = new Date(fecha.setHours(horaInicioH, horaInicioM));
                        var end = new Date(fecha.setHours(horaFinH, horaFinM));
                        cal.addEvent(`Turno ${turno}`, `Turno ${turno} para ${nombreAsesor}`, 'Arus', start, end);
                    } else {
                        console.log(`Horario no válido para el turno ${turno}: ${horario}`);
                    }
                } else {
                    var fecha = new Date(año, mes, j);
                    var start = new Date(fecha.setHours(0, 0, 0));
                    var end = new Date(fecha.setHours(23, 59, 59));
                    cal.addEvent('Turno diferente', `Turno diferente para ${nombreAsesor}`, 'Arus', start, end);
                }
            }
            break;
        }
    }

    cal.download(`${nombreAsesor}_horarios`);
}


function contarTurnos() {
    const rootRef = db.ref('celdas');
    rootRef.once('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            console.error('No se encontraron datos en la base de datos.');
            return;
        }

        const agentesA = {
            "anderson.cano": { nombre: "Anderson_Cano_Londoño" },
            "yesica.cano": { nombre: "Yesica_Johana_Cano_Quintero" },
            "andres.vidal": { nombre: "Andrés_Felipe_Vidal_Medina" },
            "andres.yepes": { nombre: "Andrés_Felipe_Yepes_Tascón" },
            "maira.mosquera": { nombre: "Maira_Mosquera_Blandon" },
            "yeison.torres": { nombre: "Yeison_Torres_Ochoa" },
            "santiago.perez": { nombre: "Santiago_Pérez_Martinez" }
        };

        const table = document.getElementById('Table1');

        for (let agente in agentesA) {
            const nombre = agentesA[agente].nombre;
            const row = table.insertRow();
            const cell1 = row.insertCell();
            const cell2 = row.insertCell();
            cell1.textContent = agentes[nombre].nombre;
            cell2.textContent = 0;
            cell2.id = `Turnos${nombre}`;
        }


    }, (error) => {
        console.error('Error al leer los datos de la base de datos:', error);
    });
}
