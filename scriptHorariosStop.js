// Copyright (c) 2024 Andrés Felipe Yepes Tascón
// Licensed under the MIT License. See LICENSE file for details.
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
    ocultarFilas("Nuevo", ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]);
    CuentaAsesor();
    diaSemana();
    cargarDatos();
    Festivos();
    cambiarBordeColumna();
    colorCelda();
};

function colorCelda() {
    const celdas = document.querySelectorAll('table td:not(#Descansos td)');
    celdas.forEach(celda => {
        celda.addEventListener('input', () => {
            actualizarColorCelda(celda);
            guardarCelda(celda);
        });
        actualizarColorCelda(celda);
    });
}


function actualizarColorCelda(celda) {
    const texto = celda.textContent.trim();

    // Verificar si la celda tiene la clase "DiasSemana"
    if (celda.classList.contains('DiaSemana')) {
        return; // No hacer nada si la celda tiene la clase "DiasSemana"
    }

    // Referencia a la base de datos de Firebase
    const dbRef = firebase.database().ref('Turnos/' + texto);

    // Obtener los colores de fondo y texto desde Firebase
    dbRef.once('value').then((snapshot) => {
        const data = snapshot.val();

        if (data) {
            // Asegurarse de que los colores tengan el "#" al inicio
            const colorFondo = data.ColorF ? `#${data.ColorF}` : '#ffffff'; // Color de fondo por defecto si no existe
            const colorTexto = data.ColorT ? `#${data.ColorT}` : '#000000'; // Color de texto por defecto si no existe

            // Aplicar los colores a la celda
            celda.style.backgroundColor = colorFondo;
            celda.style.color = colorTexto;
        } else {
            // Si no hay datos en Firebase, aplicar colores por defecto
            celda.style.backgroundColor = '#ffffff'; // Blanco
            celda.style.color = '#000000'; // Negro
        }
    }).catch((error) => {
        console.error("Error al obtener datos de Firebase:", error);
        // En caso de error, aplicar colores por defecto
        celda.style.backgroundColor = '#ffffff'; // Blanco
        celda.style.color = '#000000'; // Negro
    });
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



// Función para cargar datos y contar horas simultáneamente
function cargarDatos() {
    const mesSeleccionado = document.getElementById('Mes').selectedIndex + 1;
    const añoSeleccionado = document.getElementById('Año').value;
    const celdas = document.querySelectorAll('#Table td');

    // Mostrar indicador de carga
    const cargandoDiv = document.createElement('div');
    cargandoDiv.id = 'cargando';
    cargandoDiv.textContent = 'Cargando datos...';
    cargandoDiv.style.position = 'fixed';
    cargandoDiv.style.top = '50%';
    cargandoDiv.style.left = '50%';
    cargandoDiv.style.transform = 'translate(-50%, -50%)';
    cargandoDiv.style.padding = '10px 20px';
    cargandoDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
    cargandoDiv.style.color = 'white';
    cargandoDiv.style.borderRadius = '5px';
    cargandoDiv.style.zIndex = '9999';
    document.body.appendChild(cargandoDiv);

    // Crear promesas para todas las operaciones de carga
    const promesas = [];

    // Cache para guardar valores de cantidades y evitar consultas repetidas
    const cantidadesCache = {};

    // Comenzar a precargar las cantidades de turnos en paralelo con la carga de celdas
    const precargaTurnos = firebase.database().ref('Turnos').once('value')
        .then(snapshot => {
            const turnos = snapshot.val();
            if (turnos) {
                Object.keys(turnos).forEach(turno => {
                    if (turnos[turno].Cantidad) {
                        cantidadesCache[turno] = parseFloat(turnos[turno].Cantidad);
                    }
                });
            }
            return cantidadesCache;
        })
        .catch(error => {
            console.error("Error al precargar cantidades de turnos:", error);
            return {};
        });

    // Añadir la precarga a las promesas
    promesas.push(precargaTurnos);

    // Cargar datos de celdas
    celdas.forEach((celda) => {
        const idCelda = celda.cellIndex + 1;
        const nombreFila = celda.parentNode.cells[0].textContent.trim();

        const promesa = db.ref('celdas/' + nombreFila + '/' + idCelda + '/' + añoSeleccionado + '/' + mesSeleccionado).once('value')
            .then(snapshot => {
                const data = snapshot.val();
                if (data) {
                    celda.textContent = data.texto;
                    actualizarColorCelda(celda);
                }
            })
            .catch(error => {
                console.error("Error al cargar datos:", error);
            });

        promesas.push(promesa);
    });

    // Cuando todas las promesas se completen, calcular las horas usando el cache
    Promise.all(promesas)
        .then(() => {
            // Calcular contadores usando el cache
            const contadores = calcularHorasConCache(cantidadesCache);
            contDescansos();
            document.body.removeChild(cargandoDiv);
        })
        .catch(error => {
            console.error("Error en la carga de datos:", error);
            document.body.removeChild(cargandoDiv);
        });
}

// Función para calcular horas usando el cache de cantidades
function calcularHorasConCache(cantidadesCache) {
    var contadores = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0 };
    var letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

    // Recorremos cada letra y cada día
    for (const letra of letras) {
        for (let i = 1; i < 32; i++) {
            const celda = document.getElementById(letra + i);

            // Verificamos que la celda exista
            if (!celda) {
                continue;
            }

            const turno = celda.textContent;

            // Si el contenido de la celda no está vacío, consultamos el cache
            if (turno && turno.trim() !== '') {
                const cantidad = cantidadesCache[turno];

                // Si existe un valor en el cache, lo sumamos al contador
                if (cantidad !== undefined && !isNaN(cantidad)) {
                    contadores[letra] += cantidad;
                }
            }
        }
    }

    // Actualizamos las celdas con los totales
    letras.forEach(function (letra, index) {
        const celda = document.getElementById((index + 11).toString());
        if (celda) {
            celda.textContent = contadores[letra];
        }
    });

    return contadores;
}

function iniciarConteoHoras() {
    console.log("Iniciando conteo...");
    contHoras()
}


function contDescansos() {
    var contA = 0, contB = 0, contC = 0, contD = 0, contE = 0, contF = 0, contG = 0;

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
    Karen_Riveros_Vega: {
        nombre: "Karen Riveros Vega",
        contraseña: ""
    },
    Johan_Guzman_Alarcon: {
        nombre: "Johan Guzman Alarcon",
        contraseña: ""
    },
    Andrés_Felipe_Yepes_Tascón: {
        nombre: "Andrés Felipe Yepes Tascón",
        contraseña: ""
    },
    Oscar_Luis_Cabrera_Pacheco: {
        nombre: "Oscar Luis Cabrera Pacheco",
        contraseña: ""
    },
    Yeison_Torres_Ochoa: {
        nombre: "Yeison Torres Ochoa",
        contraseña: ""
    },
    Ocaris_David_Arango_Aguilar: {
        nombre: "Ocaris David Arango Aguilar",
        contraseña: ""
    },
    Maria_Susana_Ospina_Vanegas: {
        nombre: "Maria Susana Ospina Vanegas",
        contraseña: ""
    },
    Juan_Manuel_Cano_Benítez: {
        nombre: "Juan Manuel Cano Benítez",
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
    ocultarFilas("Nuevo", ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]);
});



const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
var titulo = document.getElementById("titulos");
var selectMes = document.getElementById('Mes');
var selectAño = document.getElementById('Año');

var mesActual = new Date().getMonth();
var currentYear = new Date().getFullYear();

selectMes.selectedIndex = mesActual;
titulo.textContent = nombresMeses[mesActual];

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
});

selectAño.addEventListener('change', function () {
    var mesSeleccionado = selectMes.selectedIndex;
    titulo.textContent = nombresMeses[mesSeleccionado];
    cargarDatos();
    diaSemana();
    Festivos();
    cambiarBordeColumna();
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

    otroDiv.style.paddingBottom = checkScrollbar(tabla) ? '15px' : '0px';
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

async function ExportaraTexto() {
    var nombreAsesorActual = localStorage.getItem("nombreAsesorActual");
    if (!nombreAsesorActual) {
        alert("Por favor seleccione un asesor para exportar los datos");
        return;
    }

    // Reemplazar guiones bajos por espacios
    nombreAsesorActual = nombreAsesorActual.replace(/_/g, " ");

    let confirmacion = confirm("¿Está seguro de que desea copiar los datos de la tabla al portapapeles?");
    if (!confirmacion) {
        return;
    }

    let texto = "";
    var meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    var mes = document.getElementById("Mes").value;
    var numeroMes = meses.indexOf(mes);
    var ano = document.getElementById("Año").value;

    texto += "Turnos de " + nombreAsesorActual + " en " + mes + ":" + "\n\n";

    var tabla = document.getElementById("Table");
    var filas = tabla.getElementsByTagName("tr");
    var filaAsesor = null;

    for (var i = 0; i < filas.length; i++) {
        var celdas = filas[i].getElementsByTagName("td");
        if (celdas.length > 0 && celdas[0].textContent === nombreAsesorActual) {
            filaAsesor = filas[i];
            break;
        }
    }

    if (!filaAsesor) {
        alert("No se encontró el asesor en la tabla");
        return;
    }

    var celdasDias = filaAsesor.getElementsByTagName("td");
    var diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

    for (let i = 1; i <= 31; i++) {
        var turno = celdasDias[i].textContent.trim();
        var dia = i;
        var fecha = new Date(ano, numeroMes, dia);

        if (isNaN(fecha.getTime())) {
            alert("Fecha inválida: " + ano + "-" + mes + "-" + dia);
            return;
        }

        var diaSemana = diasSemana[fecha.getDay()];

        try {
            var turnoRef = firebase.database().ref('Turnos/' + turno);
            var snapshot = await turnoRef.once('value');
            var apertura = snapshot.child('Apertura').val();
            var cierre = snapshot.child('Cierre').val();

            // Verificar si apertura o cierre es "12:00 AM"
            if (apertura === "12:00 AM" || cierre === "12:00 AM") {
                var descripcion = snapshot.child('Descripcion').val();
                texto += `${diaSemana} ${dia}: (${turno}) ${descripcion}\n`;
            } else {
                var horario = apertura + " - " + cierre;
                texto += `${diaSemana} ${dia}: (${turno}) ${horario}\n`;
            }

        } catch (error) {
            console.error('Error al consultar la base de datos', error);
        }
    }

    try {
        await navigator.clipboard.writeText(texto);
        alert("Datos copiados al portapapeles");
    } catch (error) {
        console.error('Falla en la copia al portapapeles', error);
    }
}


document.getElementById("btnExportarTexto").addEventListener("click", ExportaraTexto);

function Festivos() {
    const root = document.documentElement;
    const styles = getComputedStyle(root);
    const colorPrimario = styles.getPropertyValue('--color-primario').trim();

    var mes = document.getElementById("Mes").value;
    var ano = document.getElementById("Año").value;
    var festivos = {
        "Enero": [1, 6],
        "Febrero": [],
        "Marzo": [24],
        "Abril": [17, 18],
        "Mayo": [1],
        "Junio": [2, 23, 30],
        "Julio": [20],
        "Agosto": [7, 18],
        "Septiembre": [],
        "Octubre": [13],
        "Noviembre": [3, 17],
        "Diciembre": [8, 25]
    };

    const fecha = new Date();
    const dia = "Dia" + fecha.getDate();
    const nombresDeMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const mesActual = nombresDeMeses[fecha.getMonth()];
    for (let i = 1; i <= 31; i++) {
        var celda = document.getElementById("Dia" + i);
        celda.style.backgroundColor = colorPrimario;
        celda.style.color = "Black";
        if (festivos[mes].includes(i)) {
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

async function exportarIcs() {
    var nombreAsesor = document.getElementById('AsesorActual').textContent;
    var prefijo = "Bienvenido/a ";
    if (nombreAsesor.startsWith(prefijo)) {
        nombreAsesor = nombreAsesor.substring(prefijo.length);
    }

    // Consultar los horarios de los turnos desde Firebase
    var horariosTurnos = {};
    try {
        var turnosRef = firebase.database().ref('Turnos/'); // Referencia a la raíz de los turnos
        const snapshot = await turnosRef.once('value'); // Obtén todos los turnos
        if (snapshot.exists()) {
            const turnosData = snapshot.val(); // Datos de todos los turnos
            for (const turno in turnosData) {
                const apertura = turnosData[turno]?.Apertura; // Hora de apertura
                const cierre = turnosData[turno]?.Cierre; // Hora de cierre
                if (apertura && cierre) {
                    if (apertura === "12:00 AM" && cierre === "12:00 AM") {
                        // Si es un turno de todo el día, usamos la descripción
                        horariosTurnos[turno] = "Todo el día";
                    } else {
                        // Si no, combinamos apertura y cierre
                        horariosTurnos[turno] = `${apertura} - ${cierre}`;
                    }
                } else {
                    console.log(`Datos incompletos para el turno ${turno}`);
                }
            }
        } else {
            console.log("No se encontraron datos de turnos en Firebase.");
            return;
        }
    } catch (error) {
        console.error("Error al consultar los turnos desde Firebase:", error);
        return;
    }

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
                    } else if (horario === "Todo el día") {
                        var fecha = new Date(año, mes, j);
                        var start = new Date(fecha.setHours(0, 0, 0));
                        var end = new Date(fecha.setHours(23, 59, 59));
                        cal.addEvent(`Turno ${turno}`, `Turno ${turno} para ${nombreAsesor} (Todo el día)`, 'Arus', start, end);
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

// Referencia a la base de datos
const turnosRef = firebase.database().ref('Turnos/');


turnosRef.on('value', (snapshot) => {
    const turnos = snapshot.val();
    const table = document.getElementById('turnosTable');

    // Limpiar la tabla antes de agregar nuevos datos
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    const turnosArray = Object.entries(turnos); // Convertir objeto en array de pares clave-valor

    for (let i = 0; i < turnosArray.length; i += 2) {
        const row = table.insertRow(-1);

        for (let j = 0; j < 2; j++) { // Iterar para crear dos columnas de datos
            if (i + j < turnosArray.length) {
                const [turno, datos] = turnosArray[i + j];
                const cell1 = row.insertCell(-1);
                const cell2 = row.insertCell(-1);

                // Aplicar contenido y estilos a cell1
                cell1.textContent = turno;
                cell1.style.width = '1%';
                cell1.style.fontWeight = 'bold';
                cell1.style.backgroundColor = 'rgb(81, 92, 251)';
                cell1.style.color = 'rgb(255, 255, 255)';
                cell1.style.padding = '5px';
                cell1.style.textAlign = 'center';

                const apertura = datos.Apertura.toLowerCase();
                const cierre = datos.Cierre.toLowerCase();
                const descripcion = datos.Descripcion || '';

                // Aplicar contenido según condición de horario
                cell2.textContent = (apertura === "12:00 am" && cierre === "12:00 am")
                    ? descripcion
                    : `${apertura} a ${cierre}`;

                // Aplicar estilos directamente a cell2
                cell2.style.whiteSpace = 'nowrap';
                cell2.style.overflow = 'hidden';
                cell2.style.textOverflow = 'ellipsis';

                // Aplicar función de color a cell2
                colorCelda(cell2);
            } else {
                // Si hay un número impar de turnos, agregar celdas vacías
                row.insertCell(-1);
                row.insertCell(-1);
            }
        }
    }
});

let cacheTurnos = null;

function getCompleteWeeksInMonth(year, month) {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const firstMonday = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    firstMonday.setDate(firstDay.getDate() - daysToSubtract);
    const lastSunday = new Date(lastDay);
    const lastDayOfWeek = lastDay.getDay();
    const daysToAdd = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;
    lastSunday.setDate(lastDay.getDate() + daysToAdd);
    const timeDiff = lastSunday.getTime() - firstMonday.getTime();
    const weeks = Math.ceil(timeDiff / (1000 * 3600 * 24 * 7));
    return weeks;
}

function getCompleteWeekRanges(year, month) {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const firstMonday = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    firstMonday.setDate(firstDay.getDate() - daysToSubtract);
    const lastSunday = new Date(lastDay);
    const lastDayOfWeek = lastDay.getDay();
    const daysToAdd = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;
    lastSunday.setDate(lastDay.getDate() + daysToAdd);
    const weeks = [];
    const currentDate = new Date(firstMonday);
    while (currentDate <= lastSunday) {
        const weekStart = new Date(currentDate);
        const weekEnd = new Date(currentDate);
        weekEnd.setDate(weekEnd.getDate() + 6);
        const startDay = weekStart.getDate();
        const startMonth = weekStart.getMonth() + 1;
        const endDay = weekEnd.getDate();
        const endMonth = weekEnd.getMonth() + 1;
        weeks.push({
            start: startDay,
            end: endDay,
            startMonth: startMonth,
            endMonth: endMonth,
            startDate: new Date(weekStart),
            endDate: new Date(weekEnd)
        });
        currentDate.setDate(currentDate.getDate() + 7);
    }
    return weeks;
}

function getMonthName(monthNumber) {
    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return monthNames[monthNumber - 1];
}

function getShortMonthName(monthNumber) {
    const shortMonthNames = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    return shortMonthNames[monthNumber - 1];
}

function getCurrentMonthYear() {
    const mesSelect = document.getElementById("Mes");
    const anoSelect = document.getElementById("Año");
    if (!mesSelect || !anoSelect) {
        console.error('Selects de mes o año no encontrados');
        return null;
    }
    const mes = mesSelect.selectedIndex + 1;
    const ano = parseInt(anoSelect.options[anoSelect.selectedIndex].text);
    return { mes, ano };
}

function generateWeekColumns() {
    const dateInfo = getCurrentMonthYear();
    if (!dateInfo) return;

    const { mes, ano } = dateInfo;
    if (!mes || !ano) {
        console.log('Por favor selecciona mes y año');
        return;
    }

    const targetTable = document.getElementById('Table3');
    if (!targetTable) {
        console.error('Tabla Table3 no encontrada');
        return;
    }

    const weekRanges = getCompleteWeekRanges(ano, mes);
    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    targetTable.innerHTML = '';

    const headerRow = document.createElement('tr');
    headerRow.className = 'titulos';

    const nameHeader = document.createElement('th');
    nameHeader.textContent = 'Nombre del asesor';
    headerRow.appendChild(nameHeader);

    weekRanges.forEach((week, index) => {
        const weekHeader = document.createElement('th');
        weekHeader.className = 'titulos';
        let weekText = `Semana ${index + 1} (`;

        if (week.startMonth === week.endMonth) {
            if (week.start === week.end) {
                weekText += `${week.start} ${getShortMonthName(week.startMonth)})`;
            } else {
                weekText += `${week.start}-${week.end} ${getShortMonthName(week.startMonth)})`;
            }
        } else {
            weekText += `${week.start} ${getShortMonthName(week.startMonth)} - ${week.end} ${getShortMonthName(week.endMonth)})`;
        }

        weekHeader.textContent = weekText;
        headerRow.appendChild(weekHeader);
    });

    targetTable.appendChild(headerRow);

    console.log(`Generadas ${weekRanges.length} columnas de semanas completas para ${monthNames[mes - 1]} ${ano}`);
    console.log('Rangos de semanas:', weekRanges);

    copyNamesToTable3WithWeeks(weekRanges.length);
}

// Función para obtener solo el día de la fecha
function getDayFromDate(date) {
    return date.getDate().toString();
}

async function consultarTurnosFirebase(nombreFila, fecha, añoSeleccionado, mesSeleccionado) {
    try {
        let dia = getDayFromDate(fecha);
        dia++; // Incrementamos el día para ajustarse al formato de Firebase (día 1 -> 2, etc.)

        const promesa = db.ref('celdas/' + nombreFila + '/' + dia + '/' + añoSeleccionado + '/' + mesSeleccionado).once('value');
        const snapshot = await promesa;

        if (snapshot.exists()) {
            const data = snapshot.val();
            return data; // Retorna los turnos encontrados
        } else {
            return null; // No hay turnos para esta fecha
        }
    } catch (error) {
        console.error(`Error al consultar Firebase para ${nombreFila} en día ${dia}:`, error);
        return null;
    }
}

// Función optimizada para consultar todos los turnos de un empleado de una vez
async function consultarTurnosEmpleadoCompleto(nombreFila, añoSeleccionado, mesSeleccionado) {
    try {
        const promesa = db.ref('celdas/' + nombreFila).once('value');
        const snapshot = await promesa;

        if (snapshot.exists()) {
            const data = snapshot.val();
            const turnosDelMes = {};

            // Filtrar solo los días que pertenecen al año y mes seleccionados
            for (const dia in data) {
                if (data[dia] && data[dia][añoSeleccionado] && data[dia][añoSeleccionado][mesSeleccionado]) {
                    turnosDelMes[dia] = data[dia][añoSeleccionado][mesSeleccionado];
                }
            }

            return turnosDelMes;
        } else {
            return {};
        }
    } catch (error) {
        console.error(`Error al consultar Firebase para ${nombreFila}:`, error);
        return {};
    }
}

// Cache para los datos de turnos
let cacheRTurnos = null;

// Función optimizada para obtener todos los datos de turnos de una vez
async function obtenerTodosLosDatosTurnos() {
    if (cacheTurnos !== null) {
        return cacheTurnos;
    }

    try {
        const turnosRef = db.ref('Turnos');
        const snapshot = await turnosRef.once('value');
        const datosTurnos = snapshot.val();

        if (datosTurnos) {
            // Crear un mapa con los valores de cada turno
            cacheTurnos = {};
            for (const tipoTurno in datosTurnos) {
                if (datosTurnos[tipoTurno]) {
                    cacheTurnos[tipoTurno] = {
                        cantidad: datosTurnos[tipoTurno].Cantidad || datosTurnos[tipoTurno].cantidad || 0,
                        descripcion: datosTurnos[tipoTurno].Descripcion || datosTurnos[tipoTurno].descripcion || ''
                    };
                }
            }
            return cacheTurnos;
        }

        cacheTurnos = {};
        return cacheTurnos;
    } catch (error) {
        console.error('Error al obtener todos los datos de turnos:', error);
        cacheTurnos = {};
        return cacheTurnos;
    }
}

// Función principal optimizada - CORREGIDA
async function calcularValoresPorSemanaFirebase() {
    const dateInfo = getCurrentMonthYear();
    if (!dateInfo) {
        console.error("Error: No se pudo obtener la fecha seleccionada.");
        return;
    }

    const { mes, ano } = dateInfo;
    const añoSeleccionado = ano.toString();
    const mesSeleccionado = mes.toString();

    const targetTable = document.getElementById('Table3');
    if (!targetTable) {
        console.error('Tabla Table3 no encontrada');
        return;
    }

    const weekRanges = getCompleteWeekRanges(ano, mes);
    const rows = targetTable.querySelectorAll('tr');

    // Precargamos todos los datos de turnos una sola vez
    console.log('Cargando datos de turnos...');
    const todosTurnos = await obtenerTodosLosDatosTurnos();
    console.log('Datos de turnos cargados:', Object.keys(todosTurnos).length, 'tipos de turno');

    // Procesar cada fila de empleados
    for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];
        const nameCell = row.cells[0];
        if (!nameCell) continue;

        const nombreFila = nameCell.textContent.trim();
        console.log(`Procesando: ${nombreFila}`);

        // Cache para almacenar datos de turnos de diferentes meses
        const cacheEmpleadoMeses = {};

        // Calcular valores para cada semana
        for (let weekIndex = 0; weekIndex < weekRanges.length; weekIndex++) {
            const week = weekRanges[weekIndex];
            let totalSemana = 0;
            const detallesSemana = [];

            // Procesar cada día de la semana
            for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
                const fechaActual = new Date(week.startDate);
                fechaActual.setDate(fechaActual.getDate() + dayOffset);

                // Obtener mes y año de la fecha actual
                const mesActual = (fechaActual.getMonth() + 1).toString();
                const anoActual = fechaActual.getFullYear().toString();

                // Calcular el día ajustado para Firebase
                let diaFirebase = (fechaActual.getDate() + 1).toString();

                // Crear clave para el cache
                const claveCache = `${mesActual}-${anoActual}`;

                // Cargar datos del mes si no están en cache
                if (!cacheEmpleadoMeses[claveCache]) {
                    console.log(`Cargando datos para ${nombreFila} - ${mesActual}/${anoActual}`);
                    cacheEmpleadoMeses[claveCache] = await consultarTurnosEmpleadoCompleto(nombreFila, anoActual, mesActual);
                }

                const turnosEmpleado = cacheEmpleadoMeses[claveCache];

                // Buscar turnos en los datos ya cargados
                const turnosData = turnosEmpleado[diaFirebase];

                if (turnosData) {
                    let totalDia = 0;
                    let textoTurnos = '';

                    // Extraer el texto de los turnos
                    if (turnosData.texto && typeof turnosData.texto === 'string') {
                        textoTurnos = turnosData.texto;
                    } else if (typeof turnosData === 'string') {
                        textoTurnos = turnosData;
                    }

                    if (textoTurnos) {
                        console.log(`Turnos encontrados para ${nombreFila} el ${fechaActual.toLocaleDateString()}: ${textoTurnos}`);

                        // Dividir los turnos
                        const listaTurnosDia = textoTurnos.trim().split(/\s+/);

                        for (const tipoTurno of listaTurnosDia) {
                            if (tipoTurno.trim() && todosTurnos[tipoTurno]) {
                                const datosTurno = todosTurnos[tipoTurno];

                                if (datosTurno && datosTurno.cantidad) {
                                    const valor = parseFloat(datosTurno.cantidad.toString().replace(/,/g, '.'));
                                    if (!isNaN(valor)) {
                                        totalDia += valor;
                                        console.log(`Sumando ${valor} horas del turno ${tipoTurno} para el ${fechaActual.toLocaleDateString()}`);
                                    }
                                }
                            } else if (tipoTurno.trim()) {
                                console.warn(`No se encontró cantidad para el turno ${tipoTurno}`);
                            }
                        }
                    }

                    if (totalDia > 0) {
                        totalSemana += totalDia;
                        detallesSemana.push({
                            fecha: fechaActual.toLocaleDateString(),
                            valor: totalDia,
                            turnos: turnosData
                        });
                        console.log(`Total del día ${fechaActual.toLocaleDateString()}: ${totalDia} horas`);
                    }
                }
            }

            // Actualizar la celda correspondiente en la tabla
            let cell = row.cells[weekIndex + 1];
            if (!cell) {
                cell = document.createElement('td');
                row.appendChild(cell);
            }

            const valorFormateado = totalSemana.toLocaleString('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

            cell.textContent = valorFormateado;
            cell.style.textAlign = 'right';

            if (totalSemana > 0) {
                cell.style.backgroundColor = '#e8f5e8';
                cell.style.fontWeight = 'bold';
            } else {
                cell.style.backgroundColor = '';
                cell.style.fontWeight = 'normal';
            }

            console.log(`${nombreFila} - Semana ${weekIndex + 1}: ${totalSemana} horas`);
        }
    }

    console.log('Cálculo de valores por semana completado');
}

// Función para limpiar el cache cuando cambies de mes/año
function limpiarCacheTurnos() {
    cacheTurnos = null;
}

// Función auxiliar para obtener los datos del turno desde Firebase
async function obtenerDatosTurno(tipoTurno) {
    try {
        // Consultar en la ruta Turnos/{tipoTurno}/Cantidad
        const turnoRef = db.ref(`Turnos/${tipoTurno}`);
        const snapshot = await turnoRef.once('value');
        const datosTurno = snapshot.val();

        if (datosTurno) {
            return {
                cantidad: datosTurno.Cantidad || datosTurno.cantidad || 0,
                // Puedes agregar más propiedades si las necesitas
                descripcion: datosTurno.Descripcion || datosTurno.descripcion || ''
            };
        }

        return null;
    } catch (error) {
        console.error(`Error al obtener datos del turno ${tipoTurno}:`, error);
        throw error;
    }
}

// Función principal que genera columnas y calcula valores
async function generateWeekColumnsWithFirebaseValues() {
    // Limpiar cache al cambiar de fecha
    limpiarCacheTurnos();

    generateWeekColumns();

    // Esperar un poco para que la tabla se genere completamente
    setTimeout(async () => {
        await calcularValoresPorSemanaFirebase();
    }, 100);
}

function copyNamesToTable3WithWeeks(numberOfWeeks) {
    const sourceTable = document.getElementById('Table');
    const targetTable = document.getElementById('Table3');

    if (!sourceTable || !targetTable) {
        console.error('Una o ambas tablas no se encontraron');
        return;
    }

    const sourceRows = sourceTable.querySelectorAll('tr');

    sourceRows.forEach((row, index) => {
        if (index < 3) return; // Saltar las primeras 3 filas

        const firstCell = row.querySelector('td, th');
        if (firstCell) {
            const newRow = document.createElement('tr');
            const newCell = document.createElement(firstCell.tagName.toLowerCase());
            newCell.textContent = firstCell.textContent;
            newRow.appendChild(newCell);

            // Crear celdas vacías para cada semana
            for (let i = 0; i < numberOfWeeks; i++) {
                const weekCell = document.createElement('td');
                weekCell.textContent = '';
                weekCell.style.textAlign = 'center';
                weekCell.style.minWidth = '60px';
                newRow.appendChild(weekCell);
            }

            targetTable.appendChild(newRow);
        }
    });
}

function copyNamesToTable3() {
    const sourceTable = document.getElementById('Table');
    const targetTable = document.getElementById('Table3');

    if (!sourceTable || !targetTable) {
        console.error('Una o ambas tablas no se encontraron');
        return;
    }

    const sourceRows = sourceTable.querySelectorAll('tr');
    targetTable.innerHTML = '';

    sourceRows.forEach((row, index) => {
        if (index < 3) return;

        const firstCell = row.querySelector('td, th');
        if (firstCell) {
            const newRow = document.createElement('tr');
            const newCell = document.createElement(firstCell.tagName.toLowerCase());
            newCell.textContent = firstCell.textContent;
            newRow.appendChild(newCell);
            targetTable.appendChild(newRow);
        }
    });

    console.log('Nombres copiados exitosamente de Table a Table3');
}

function copyOnlyNamesToTable3() {
    const sourceTable = document.getElementById('Table');
    const targetTable = document.getElementById('Table3');

    if (!sourceTable || !targetTable) {
        console.error('Una o ambas tablas no se encontraron');
        return;
    }

    const dataRows = sourceTable.querySelectorAll('tr');
    targetTable.innerHTML = '';

    dataRows.forEach((row, index) => {
        if (index < 3) return;

        const firstDataCell = row.querySelector('td');
        if (firstDataCell) {
            const newRow = document.createElement('tr');
            const newCell = document.createElement('td');
            newCell.textContent = firstDataCell.textContent;
            newRow.appendChild(newCell);
            targetTable.appendChild(newRow);
        }
    });

    console.log('Solo nombres (sin encabezados) copiados a Table3');
}

function setupNavigationButtons() {
    const izqButton = document.getElementById('Izq');
    const derButton = document.getElementById('Der');
    const hoyButton = document.getElementById('Hoy');
    const mesSelect = document.getElementById('Mes');
    const anoSelect = document.getElementById('Año');
    const tablaSemana = document.getElementById('TablaSemana');

    if (izqButton) {
        izqButton.addEventListener('click', function (e) {
            e.preventDefault();
            consultaAutomaticaActiva = false;
            if (tablaSemana) {
                tablaSemana.style.display = 'none';
            }
            let mesActual = mesSelect.selectedIndex;
            let anoActual = anoSelect.selectedIndex;

            if (mesActual > 0) {
                mesSelect.selectedIndex = mesActual - 1;
            } else {
                mesSelect.selectedIndex = 11;
                if (anoActual > 0) {
                    anoSelect.selectedIndex = anoActual - 1;
                }
            }

            mesSelect.dispatchEvent(new Event('change'));
        });
    }

    if (derButton) {
        derButton.addEventListener('click', function (e) {
            e.preventDefault();
            consultaAutomaticaActiva = false;
            if (tablaSemana) {
                tablaSemana.style.display = 'none';
            }
            let mesActual = mesSelect.selectedIndex;
            let anoActual = anoSelect.selectedIndex;

            if (mesActual < 11) {
                mesSelect.selectedIndex = mesActual + 1;
            } else {
                mesSelect.selectedIndex = 0;
                if (anoActual < anoSelect.options.length - 1) {
                    anoSelect.selectedIndex = anoActual + 1;
                }
            }

            mesSelect.dispatchEvent(new Event('change'));
        });
    }

    if (hoyButton) {
        hoyButton.addEventListener('click', function (e) {
            e.preventDefault();
            consultaAutomaticaActiva = false;
            if (tablaSemana) {
                tablaSemana.style.display = 'none';
            }
            const hoy = new Date();
            const mesActual = hoy.getMonth();
            const anoActual = hoy.getFullYear();

            mesSelect.selectedIndex = mesActual;

            for (let i = 0; i < anoSelect.options.length; i++) {
                if (parseInt(anoSelect.options[i].text) === anoActual) {
                    anoSelect.selectedIndex = i;
                    break;
                }
            }

            mesSelect.dispatchEvent(new Event('change'));
        });
    }
}

// Variable para controlar el estado de la consulta automática
let consultaAutomaticaActiva = false;

document.addEventListener('DOMContentLoaded', function () {
    const mesSelect = document.getElementById('Mes');
    const anoSelect = document.getElementById('Año');
    const consultaButton = document.getElementById('consultaSemana');
    const tablaSemana = document.getElementById('TablaSemana');

    // Ocultar la tabla al cargar
    if (tablaSemana) {
        tablaSemana.style.display = 'none';
    }

    if (mesSelect) {
        mesSelect.addEventListener('change', function () {
            consultaAutomaticaActiva = false;
            if (tablaSemana) {
                tablaSemana.style.display = 'none';
            }
            generateWeekColumns();
        });
    }

    if (anoSelect) {
        anoSelect.addEventListener('change', function () {
            consultaAutomaticaActiva = false;
            if (tablaSemana) {
                tablaSemana.style.display = 'none';
            }
            generateWeekColumns();
        });
    }

    if (consultaButton) {
        consultaButton.addEventListener('click', async function () {
            consultaAutomaticaActiva = true;
            if (tablaSemana) {
                tablaSemana.style.display = 'block';
            }
            await generateWeekColumnsWithFirebaseValues();
        });
    }

    setupNavigationButtons();

    setTimeout(() => {
        if (mesSelect.selectedIndex >= 0 && anoSelect.selectedIndex >= 0) {
            generateWeekColumns();
        }
    }, 100);
});

// Variables globales para el modo pincel
let modoPincel = false;
let turnosDisponibles = [];
let turnoSeleccionado = null;
let menuTurnos = null;

// Función para obtener los turnos con sus datos completos
function obtenerTurnos() {
    turnosRef.on('value', (snapshot) => {
        const turnos = snapshot.val();
        if (turnos) {
            // Guardar los turnos completos para acceder a los colores
            turnosDisponibles = turnos;
            console.log('Turnos disponibles:', Object.keys(turnos));
        }
    });
}

// Función para crear el menú de selección de turnos
function crearMenuTurnos() {
    // Eliminar menú existente si hay uno
    if (menuTurnos) {
        menuTurnos.remove();
    }

    menuTurnos = document.createElement('div');
    menuTurnos.id = 'menuTurnos';
    menuTurnos.style.cssText = `
        position: fixed;
        top: 50px;
        left: 20px;
        background: white;
        border: 2px solid #515cfb;
        border-radius: 8px;
        padding: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        max-height: 300px;
        overflow-y: auto;
        min-width: 200px;
    `;

    // Título del menú
    const titulo = document.createElement('h4');
    titulo.textContent = 'Selecciona un turno:';
    titulo.style.cssText = `
        margin: 0 0 10px 0;
        color: #515cfb;
        font-size: 14px;
    `;
    menuTurnos.appendChild(titulo);

    // Crear botones para cada turno
    Object.entries(turnosDisponibles).forEach(([turnoId, datosTurno]) => {
        const btnTurno = document.createElement('button');
        btnTurno.textContent = turnoId;

        // Crear una celda temporal para obtener el color
        const tempCell = document.createElement('td');
        tempCell.textContent = turnoId; // Importante: agregar el texto del turno
        tempCell.style.cssText = 'position: absolute; left: -9999px; top: -9999px; visibility: hidden;';
        document.body.appendChild(tempCell);

        // Aplicar la función colorCelda para obtener el color
        colorCelda(tempCell);
        console.log(datosTurno);
        const colorFondo = "#" + datosTurno.ColorF;

        const colorTexto = "#" + datosTurno.ColorT;

        // Remover la celda temporal
        document.body.removeChild(tempCell);
        btnTurno.style.cssText = `
            display: block;
            width: 100%;
            margin: 5px 0;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background-color: ${colorFondo || '#f8f9fa'} !important;
            color: ${colorTexto || 'black'};
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
            font-weight: bold;
        `;

        // Guardar los colores originales como atributos
        btnTurno.dataset.colorOriginal = colorFondo || '#f8f9fa';
        btnTurno.dataset.colorTextoOriginal = colorTexto || 'black';

        btnTurno.addEventListener('mouseenter', () => {
            if (turnoSeleccionado !== turnoId) {
                btnTurno.style.opacity = '0.8';
                btnTurno.style.transform = 'scale(1.02)';
            }
        });

        btnTurno.addEventListener('mouseleave', () => {
            if (turnoSeleccionado !== turnoId) {
                btnTurno.style.opacity = '1';
                btnTurno.style.transform = 'scale(1)';
            }
        });

        btnTurno.addEventListener('click', () => {
            // Deseleccionar turno anterior
            const botones = menuTurnos.querySelectorAll('button:not(#cerrarPincel)');
            botones.forEach(btn => {
                if (btn !== btnTurno) {
                    btn.style.backgroundColor = btn.dataset.colorOriginal;
                    btn.style.color = btn.dataset.colorTextoOriginal;
                    btn.style.border = '1px solid #ddd';
                    btn.style.transform = 'scale(1)';
                }
            });

            // Seleccionar nuevo turno
            turnoSeleccionado = turnoId;
            btnTurno.style.border = '3px solid #fff';
            btnTurno.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
            btnTurno.style.transform = 'scale(1.05)';

            // Cambiar cursor a modo pincel
            document.body.style.cursor = 'crosshair';
        });

        menuTurnos.appendChild(btnTurno);
    });

    // Botón para cerrar el modo pincel
    const btnCerrar = document.createElement('button');
    btnCerrar.id = 'cerrarPincel';
    btnCerrar.textContent = '❌ Cerrar pincel';
    btnCerrar.style.cssText = `
        display: block;
        width: 100%;
        margin-top: 15px;
        padding: 8px;
        border: 1px solid #dc3545;
        border-radius: 4px;
        background: #dc3545;
        color: white;
        cursor: pointer;
        font-size: 12px;
        font-weight: bold;
    `;

    btnCerrar.addEventListener('click', desactivarPincel);
    menuTurnos.appendChild(btnCerrar);

    document.body.appendChild(menuTurnos);
}

// Función para manejar el click en las celdas editables
function manejarClickCelda(event) {
    if (!modoPincel || !turnoSeleccionado) return;

    const celda = event.target;

    // Verificar que sea una celda editable
    if (celda.tagName === 'TD' && celda.contentEditable === 'true') {
        // Pintar la celda con el turno seleccionado
        celda.textContent = turnoSeleccionado;

        // Aplicar el color correspondiente al turno
        colorCelda(celda);

    }
}

// Función para activar el modo pincel
function pincelTurnos() {
    if (Object.keys(turnosDisponibles).length === 0) {
        alert('No hay turnos disponibles. Espera a que se carguen los datos.');
        return;
    }

    modoPincel = true;

    // Crear y mostrar el menú de turnos
    crearMenuTurnos();

    // Agregar event listener para clicks en celdas
    document.addEventListener('click', manejarClickCelda);

    // Cambiar el estilo del botón
    const btnPincel = document.getElementById('btnPincelTurnos');
    if (btnPincel) {
        btnPincel.style.backgroundColor = '#28a745';
        btnPincel.style.color = 'white';
        btnPincel.textContent = '🎨 Modo pincel activo';
    }

    console.log('Modo pincel activado');
}

// Función para desactivar el modo pincel
function desactivarPincel() {
    modoPincel = false;
    turnoSeleccionado = null;

    // Eliminar menú
    if (menuTurnos) {
        menuTurnos.remove();
        menuTurnos = null;
    }

    // Remover event listener
    document.removeEventListener('click', manejarClickCelda);

    // Restaurar cursor
    document.body.style.cursor = 'default';

    // Restaurar botón
    const btnPincel = document.getElementById('btnPincelTurnos');
    if (btnPincel) {
        btnPincel.style.backgroundColor = '';
        btnPincel.style.color = '';
        btnPincel.textContent = 'Pincel de turnos';
    }

    console.log('Modo pincel desactivado');
}

// Event listener para el botón pincel
document.getElementById('btnPincelTurnos').addEventListener('click', () => {
    if (!modoPincel) {
        pincelTurnos();
    } else {
        desactivarPincel();
    }
});

// Inicializar: obtener turnos al cargar
obtenerTurnos();

// Opcional: desactivar pincel con tecla Escape
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modoPincel) {
        desactivarPincel();
    }
});