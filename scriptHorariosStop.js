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
    var contadores = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
    var letras = ['A', 'B', 'C', 'D', 'E', 'F'];

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
    celdaF.textContent = contF


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
    Yesica_Johana_Cano_Quintero: {
        nombre: "Yesica Johana Cano Quintero",
        letra: "B",
        contraseña: ""
    },
    Johan_Guzman_Alarcon: {
        nombre: "Johan Guzman Alarcon",
        letra: "B",
        contraseña: ""
    },
    Andrés_Felipe_Yepes_Tascón: {
        nombre: "Andrés Felipe Yepes Tascón",
        letra: "D",
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
        celda.style.backgroundColor = "#e69500";
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
        'T3': { inicio: 13 * 60 + 0,  fin: 14 * 60 + 0 },  // 780-840
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