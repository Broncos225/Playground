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
    ocultarFilas("Milton Alexis Calle Londoño", ["Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]);
    ocultarFilas("Andrés Felipe Vidal Medina", ["Junio", "Julio"]);
    ocultarFilas("Miguel Cadavid Naranjo", ["Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]);
    ocultarFilas("Daniel Muñoz Vidal", ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"]);
    ocultarFilas("Nuevo 2", ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"]);
    CuentaAsesor();
    diaSemana();
    cargarDatos();
    colorCelda();
    Festivos();
    cambiarBordeColumna();
    cargarVacaciones();
};

console.log("Hola");

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
    Daniel_Munoz_Vidal: {
        nombre: "Daniel Muñoz Vidal",
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
    var valorSeleccionado = document.getElementById('Mes').value;
    var filas = document.getElementsByTagName('tr');
    for (var i = 0; i < filas.length; i++) {
        var celdas = filas[i].getElementsByTagName('td');
        var nombreEncontrado = false;

        for (var j = 0; j < celdas.length; j++) {
            if (celdas[j].textContent === nombre) {
                nombreEncontrado = true;
                break;
            }
        }

        if (nombreEncontrado) {
            if (mesesParam.includes(valorSeleccionado)) {
                filas[i].style.display = 'none';
                document.getElementById(i - 2).parentElement.style.display = 'none';
            } else {
                filas[i].style.display = '';
                document.getElementById(i - 2).parentElement.style.display = '';
            }
        }
    }


}

var selector = document.getElementById('Mes');
selector.addEventListener('change', function () {
    ocultarFilas("Milton Alexis Calle Londoño", ["Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]);
    ocultarFilas("Andrés Felipe Vidal Medina", ["Junio", "Julio"]);
    ocultarFilas("Miguel Cadavid Naranjo", ["Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]);
    ocultarFilas("Daniel Muñoz Vidal", ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"]);
    ocultarFilas("Nuevo 2", ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"]);
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
    var contA = 0, contB = 0, contC = 0, contD = 0, contE = 0, contF = 0, contG = 0, contH = 0;
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
    for (var i = 1; i < 32; i++) {
        var celda = document.getElementById('G' + i);
        if (tiposTurno8.includes(celda.textContent)) {
            contG += 8;
        } else if (tiposTurno7.includes(celda.textContent)) {
            contG += 7;
        } else if (tiposTurno0.includes(celda.textContent)) {
            contG += 0;
        }
    }
    for (var i = 1; i < 32; i++) {
        var celda = document.getElementById('H' + i);
        if (tiposTurno8.includes(celda.textContent)) {
            contH += 8;
        } else if (tiposTurno7.includes(celda.textContent)) {
            contH += 7;
        } else if (tiposTurno0.includes(celda.textContent)) {
            contH += 0;
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
    var celdaG = document.getElementById("17");
    celdaG.textContent = contG;
    var celdaH = document.getElementById("18");
    celdaH.textContent = contH;
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
    Miguel_Cadavid_Naranjo: {
        nombre: "Miguel Cadavid Naranjo",
        fechaIngreso: "2023-04-17",
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
