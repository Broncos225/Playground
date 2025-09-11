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

async function guardarCeldas() {
    var passw = document.getElementById('pass').value;
    var contraseñaEncontrada = false;
    var usuario = "";

    for (let agente in agentes) {
        if (agentes[agente].contraseña == passw) {
            contraseñaEncontrada = true;
            usuario = agente;
            break;
        }
    }

    if (contraseñaEncontrada) {
        const celdas = document.querySelectorAll('#Table td');
        const mesSeleccionado = document.getElementById('Mes').selectedIndex + 1;
        const añoSeleccionado = document.getElementById('Año').value;

        // Crear un mapa de valores actuales desde Firebase en una sola consulta
        const valoresActuales = new Map();
        const promesasFirebase = [];

        // Agrupar consultas por agente para reducir el número de consultas
        const agentesCeldas = new Map();

        for (const celda of celdas) {
            const idCelda = celda.cellIndex + 1;
            const nombreFila = celda.parentNode.cells[0].textContent.trim();
            const clave = `${nombreFila}_${idCelda}`;

            if (!agentesCeldas.has(nombreFila)) {
                agentesCeldas.set(nombreFila, []);
            }
            agentesCeldas.get(nombreFila).push({
                celda: idCelda,
                clave: clave,
                elemento: celda
            });
        }

        // Hacer consultas por agente (menos consultas que celda por celda)
        for (const [nombreFila, celdasAgente] of agentesCeldas) {
            const promesa = db.ref(`celdas/${nombreFila}`).once('value').then(snapshot => {
                const datosAgente = snapshot.val() || {};

                celdasAgente.forEach(({ celda, clave, elemento }) => {
                    const valorFirebase = datosAgente[celda]?.[añoSeleccionado]?.[mesSeleccionado]?.texto || '';
                    valoresActuales.set(clave, valorFirebase);
                });
            });

            promesasFirebase.push(promesa);
        }

        // Esperar a que todas las consultas terminen
        await Promise.all(promesasFirebase);

        // --- Lógica de corrección ---
        const cambiosParaGuardarEnFirebase = [];
        const cambiosParaGuardarEnHistorial = [];

        for (const celda of celdas) {
            const nuevoValor = celda.textContent.trim();
            const idCelda = celda.cellIndex + 1;
            const nombreFila = celda.parentNode.cells[0].textContent.trim();
            const clave = `${nombreFila}_${idCelda}`;
            const valorAnterior = valoresActuales.get(clave);

            // Regla #1: Si no existe en Firebase y está vacía en la interfaz -> Guardar en Firebase pero NO en historial
            // La condición `valorAnterior === ''` significa que no existe en Firebase.
            // La condición `nuevoValor === ''` significa que está vacía en la interfaz.
            if (valorAnterior === '' && nuevoValor === '') {
                cambiosParaGuardarEnFirebase.push({
                    agente: nombreFila,
                    celda: idCelda,
                    año: añoSeleccionado,
                    mes: mesSeleccionado,
                    nuevoValor: nuevoValor
                });
            }
            // Regla #2: Si no existe en Firebase y tiene contenido -> Guardar en Firebase Y en historial
            // La condición `valorAnterior === ''` significa que no existe en Firebase.
            // La condición `nuevoValor !== ''` significa que tiene contenido.
            else if (valorAnterior === '' && nuevoValor !== '') {
                cambiosParaGuardarEnFirebase.push({
                    agente: nombreFila,
                    celda: idCelda,
                    año: añoSeleccionado,
                    mes: mesSeleccionado,
                    nuevoValor: nuevoValor
                });
                cambiosParaGuardarEnHistorial.push({
                    agente: nombreFila,
                    celda: idCelda,
                    año: añoSeleccionado,
                    mes: mesSeleccionado,
                    nuevoValor: nuevoValor,
                    valorAnterior: valorAnterior
                });
            }
            // Regla #3: Si existe en Firebase y se vacía -> Guardar en Firebase pero NO en historial
            // La condición `valorAnterior !== ''` significa que ya existe en Firebase.
            // La condición `nuevoValor === ''` significa que se vació.
            else if (valorAnterior !== '' && nuevoValor === '') {
                cambiosParaGuardarEnFirebase.push({
                    agente: nombreFila,
                    celda: idCelda,
                    año: añoSeleccionado,
                    mes: mesSeleccionado,
                    nuevoValor: nuevoValor
                });
            }
            // Regla #4: Si existe en Firebase y cambia a otro contenido -> Guardar en Firebase Y en historial
            // La condición `valorAnterior !== ''` significa que existe en Firebase.
            // La condición `nuevoValor !== '' && valorAnterior !== nuevoValor` significa que cambió a otro contenido.
            else if (valorAnterior !== '' && nuevoValor !== '' && valorAnterior !== nuevoValor) {
                cambiosParaGuardarEnFirebase.push({
                    agente: nombreFila,
                    celda: idCelda,
                    año: añoSeleccionado,
                    mes: mesSeleccionado,
                    nuevoValor: nuevoValor
                });
                cambiosParaGuardarEnHistorial.push({
                    agente: nombreFila,
                    celda: idCelda,
                    año: añoSeleccionado,
                    mes: mesSeleccionado,
                    nuevoValor: nuevoValor,
                    valorAnterior: valorAnterior
                });
            }
        }
        
        // Ejecutar las promesas de guardado
        const promesasGuardado = [];

        if (cambiosParaGuardarEnFirebase.length > 0) {
            const firebasePromises = cambiosParaGuardarEnFirebase.map(cambio =>
                db.ref(`celdas/${cambio.agente}/${cambio.celda}/${cambio.año}/${cambio.mes}`).set({
                    texto: cambio.nuevoValor,
                })
            );
            promesasGuardado.push(...firebasePromises);
        }

        if (cambiosParaGuardarEnHistorial.length > 0) {
            const timestamp = new Date().toISOString();
            const historialRef = db.ref('Historial').push();
            const historialPromise = historialRef.set({
                timestamp: timestamp,
                usuario: usuario,
                cambios: cambiosParaGuardarEnHistorial
            });
            promesasGuardado.push(historialPromise);
        }

        if (promesasGuardado.length > 0) {
            await Promise.all(promesasGuardado);
            alert("Datos guardados");
            location.reload();
        } else {
            alert("No se detectaron cambios para guardar");
        }
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
    var contadores = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0};
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
    Diego_Alejandro_Úsuga_Yepes: {
        nombre: "Diego Alejandro Úsuga Yepes",
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

    otroDiv.style.paddingBottom = checkScrollbar(tabla) ? '16px' : '1px';
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
        celda.style.color = "var(--color-texto)";
        if (festivos[mes].includes(i)) {
            if (dia == "Dia" + i) {
            celda.style.backgroundColor = "orange";
            celda.style.color = "red";
            } else {
            celda.style.backgroundColor = "red";
            celda.style.color = "var(--color-texto)";
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

    // Función para verificar si una semana contiene festivos
    function semanaContieneFestivo(week, mes) {
        let tieneFestivo = false;

        // Verificar si la semana está en un solo mes
        if (week.startMonth === week.endMonth) {
            const festivosDelMes = festivos[monthNames[week.startMonth - 1]];
            // Verificar cada día de la semana
            for (let dia = week.start; dia <= week.end; dia++) {
                if (festivosDelMes && festivosDelMes.includes(dia)) {
                    tieneFestivo = true;
                    break;
                }
            }
        } else {
            // La semana abarca dos meses
            // Verificar días del primer mes
            const festivosDelPrimerMes = festivos[monthNames[week.startMonth - 1]];
            const diasEnPrimerMes = new Date(2024, week.startMonth, 0).getDate(); // días del mes

            for (let dia = week.start; dia <= diasEnPrimerMes; dia++) {
                if (festivosDelPrimerMes && festivosDelPrimerMes.includes(dia)) {
                    tieneFestivo = true;
                    break;
                }
            }

            // Verificar días del segundo mes si no se encontró festivo
            if (!tieneFestivo) {
                const festivosDelSegundoMes = festivos[monthNames[week.endMonth - 1]];
                for (let dia = 1; dia <= week.end; dia++) {
                    if (festivosDelSegundoMes && festivosDelSegundoMes.includes(dia)) {
                        tieneFestivo = true;
                        break;
                    }
                }
            }
        }

        return tieneFestivo;
    }

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

        // Usar la nueva función para verificar si hay festivos en la semana
        if (semanaContieneFestivo(week, mes)) {
            weekHeader.style.backgroundColor = 'red';
        }

        weekHeader.textContent = weekText;
        headerRow.appendChild(weekHeader);
    });

    targetTable.appendChild(headerRow);

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

            if (totalSemana === 44) {
                cell.style.backgroundColor = '#a6fda6ff'; // verde
                cell.style.fontWeight = 'bold';
            } else if (totalSemana === 0) {
                cell.style.backgroundColor = '#ffb3b9ff'; // rojo
                cell.style.fontWeight = 'normal';
            } else if (totalSemana > 0 && totalSemana < 44) {
                cell.style.backgroundColor = '#ffd9a6'; // naranja suave
                cell.style.fontWeight = 'normal';
            } else if (totalSemana > 44) {
                cell.style.backgroundColor = '#fffda6'; // amarillo suave
                cell.style.fontWeight = 'bold';
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
        }
    });
}

// Función para crear el menú de selección de turnos
function crearMenuTurnos() {
    // Obtener el div donde se mostrará la lista
    const listaTurnos = document.getElementById('ListaTurnos');

    if (!listaTurnos) {
        console.error('No se encontró el div #ListaTurnos');
        return;
    }

    // Limpiar contenido existente
    listaTurnos.innerHTML = '';

    // Aplicar estilos de cuadrícula al contenedor
    listaTurnos.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 10px 0;
    `;

    // Crear botón vacío con fondo BLANCO y texto VISIBLE
    const btnVacio = document.createElement('button');
    btnVacio.textContent = 'Vacío';
    btnVacio.style.cssText = `
        border: 1px solid #ddd;
        border-radius: 4px;
        background-color: white !important;
        color: black;
        cursor: pointer;
        font-size: 11px;
        transition: all 0.2s;
        font-weight: bold;
        text-align: center;
        width: 40px;
        height: 25px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    // Guardar los colores como atributos (para el botón, no para las celdas)
    btnVacio.dataset.colorOriginal = 'white';
    btnVacio.dataset.colorTextoOriginal = 'black';
    btnVacio.style.width = 'fit-content';
    btnVacio.style.height = 'fit-content';

    btnVacio.addEventListener('mouseenter', () => {
        if (turnoSeleccionado !== 'vacio') {
            btnVacio.style.opacity = '0.8';
            btnVacio.style.transform = 'scale(1.02)';
        }
    });

    btnVacio.addEventListener('mouseleave', () => {
        if (turnoSeleccionado !== 'vacio') {
            btnVacio.style.opacity = '1';
            btnVacio.style.transform = 'scale(1)';
        }
    });

    btnVacio.addEventListener('click', () => {
        // Deseleccionar turno anterior
        const botones = listaTurnos.querySelectorAll('button:not(#cerrarPincel)');
        botones.forEach(btn => {
            if (btn !== btnVacio) {
                btn.style.backgroundColor = btn.dataset.colorOriginal;
                btn.style.color = btn.dataset.colorTextoOriginal;
                btn.style.border = '1px solid #ddd';
                btn.style.transform = 'scale(1)';
            }
        });

        // Seleccionar botón vacío
        turnoSeleccionado = 'vacio';
        btnVacio.style.border = '3px solid #999';
        btnVacio.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
        btnVacio.style.transform = 'scale(1.05)';

        // Cambiar cursor a modo pincel
        document.body.style.cursor = 'crosshair';
    });

    listaTurnos.appendChild(btnVacio);

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
        const colorFondo = "#" + datosTurno.ColorF;
        const colorTexto = "#" + datosTurno.ColorT;

        // Remover la celda temporal
        document.body.removeChild(tempCell);

        btnTurno.style.cssText = `
            border: 1px solid #ddd;
            border-radius: 4px;
            background-color: ${colorFondo || '#f8f9fa'} !important;
            color: ${colorTexto || 'black'};
            cursor: pointer;
            font-size: 11px;
            transition: all 0.2s;
            font-weight: bold;
            text-align: center;
            width: fit-content;
            height: fit-content;
            display: flex;
            align-items: center;
            justify-content: center;
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
            const botones = listaTurnos.querySelectorAll('button:not(#cerrarPincel)');
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

        listaTurnos.appendChild(btnTurno);
    });

    // Botón para cerrar el modo pincel
    const btnCerrar = document.createElement('button');
    btnCerrar.id = 'cerrarPincel';
    btnCerrar.textContent = '❌ Cerrar pincel';
    btnCerrar.style.cssText = `
        grid-column: 1 / -1;
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
    listaTurnos.appendChild(btnCerrar);
}

// Función para manejar el click en las celdas editables
function manejarClickCelda(event) {
    if (!modoPincel || !turnoSeleccionado) return;

    const celda = event.target;

    // Verificar que sea una celda editable
    if (celda.tagName === 'TD' && celda.contentEditable === 'true') {

        if (turnoSeleccionado === 'vacio') {
            // Para el turno "vacío": limpiar texto y hacer fondo transparente
            celda.textContent = '';
            celda.style.backgroundColor = 'white';
            celda.style.color = '';
        } else {
            // Para turnos normales: poner el turno y aplicar color
            celda.textContent = turnoSeleccionado;
            colorCelda(celda);
        }
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

    // Limpiar el contenido del div ListaTurnos
    const listaTurnos = document.getElementById('ListaTurnos');
    if (listaTurnos) {
        listaTurnos.innerHTML = '';
        // Opcional: restablecer estilos del contenedor
        listaTurnos.style.cssText = '';
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

// Función para guardar en el historial (solo los cambios reales)
async function guardarEnHistorial(cambios, usuario) {
    const timestamp = new Date().toISOString();
    const historialRef = db.ref('Historial').push();

    // Filtrar solo los cambios que tienen un valor diferente al anterior
    const cambiosReales = await filtrarCambiosReales(cambios);

    if (cambiosReales.length === 0) {
        return null; // No hay cambios reales, no guardar en historial
    }

    await historialRef.set({
        timestamp: timestamp,
        usuario: usuario,
        cambios: cambiosReales
    });

    return historialRef.key;
}

// Función para filtrar solo los cambios reales
async function filtrarCambiosReales(cambios) {
    // Esta función ya no se usa con la optimización, pero se mantiene por compatibilidad
    return cambios;
}
// Función para cargar y mostrar el historial
async function cargarHistorial() {
    const historialContent = document.getElementById('historialContent');
    historialContent.innerHTML = '<p>Cargando historial...</p>';

    try {
        const snapshot = await db.ref('Historial').orderByChild('timestamp').once('value');

        if (!snapshot.exists()) {
            historialContent.innerHTML = '<p>No hay registros en el historial.</p>';
            return;
        }

        // Convertir a array y ordenar por timestamp descendente (más recientes primero)
        registrosHistorial = [];
        snapshot.forEach(childSnapshot => {
            const registro = childSnapshot.val();
            registro.id = childSnapshot.key;
            registrosHistorial.push(registro);
        });

        registrosHistorial.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        paginaActual = 1;
        mostrarPagina();
        crearControlesPaginacion();
    } catch (error) {
        console.error("Error al cargar historial:", error);
        historialContent.innerHTML = '<p>Error al cargar el historial.</p>';
    }
}

// Variables globales para la paginación
let registrosHistorial = [];
let paginaActual = 1;
const registrosPorPagina = 10;


function mostrarPagina() {
    const historialContent = document.getElementById('historialContent');
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const registrosPagina = registrosHistorial.slice(inicio, fin);

    if (registrosPagina.length === 0) {
        historialContent.innerHTML = '<p>No hay registros para mostrar.</p>';
        return;
    }

    let html = '<div class="historial-container">';

    registrosPagina.forEach(registro => {
        const fecha = new Date(registro.timestamp).toLocaleString();
        const usuarioLimpio = registro.usuario.replace(/_/g, ' ');
        const cantidadCambios = registro.cambios.length;

        html += `
            <div class="historial-item">
                <div class="historial-header" style="cursor: pointer; background: var(--color-fondo);" onclick="window.toggleCambios('${registro.id}')">
                    <span><strong>Usuario:</strong> ${usuarioLimpio} | <strong>Fecha:</strong> ${fecha}</span>
                    <span class="cambios-count">${cantidadCambios} cambio${cantidadCambios !== 1 ? 's' : ''}</span>
                    <span class="toggle-icon" id="icon-${registro.id}">▼</span>
                </div>
                <div class="historial-cambios" id="cambios-${registro.id}" style="display: none; background: var(--color-fondo);">
        `;

        registro.cambios.forEach(cambio => {
            const dia = cambio.celda - 1;
            html += `
                <div class="cambio-item" style="background: var(--color-fondo); border: 1px solid var(--color-texto);">
                    <strong>Agente:</strong> ${cambio.agente} | 
                    <strong>Día:</strong> ${dia} | 
                    <strong>Mes:</strong> ${cambio.mes} | 
                    <strong>Año:</strong> ${cambio.año}<br>
                    <span class="valor-anterior">Anterior: ${cambio.valorAnterior || '(vacío)'}</span> → 
                    <span class="valor-nuevo">Nuevo: ${cambio.nuevoValor}</span>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    html += '</div>';
    historialContent.innerHTML = html;
}
// Agregar al final del código, después de definir las funciones:
window.toggleCambios = toggleCambios;
window.cambiarPagina = cambiarPagina;
function toggleCambios(registroId) {
    const cambiosDiv = document.getElementById(`cambios-${registroId}`);
    const icon = document.getElementById(`icon-${registroId}`);

    if (cambiosDiv.style.display === 'none') {
        cambiosDiv.style.display = 'block';
        icon.textContent = '▲';
    } else {
        cambiosDiv.style.display = 'none';
        icon.textContent = '▼';
    }
}

function crearControlesPaginacion() {
    const totalPaginas = Math.ceil(registrosHistorial.length / registrosPorPagina);
    const historialContent = document.getElementById('historialContent');

    if (totalPaginas <= 1) return;

    let paginacionHtml = '<div class="paginacion">';

    // Botón anterior
    if (paginaActual > 1) {
        paginacionHtml += `<button onclick="cambiarPagina(${paginaActual - 1})">‹ Anterior</button>`;
    }

    // Números de página
    for (let i = 1; i <= totalPaginas; i++) {
        const activo = i === paginaActual ? ' class="activo"' : '';
        paginacionHtml += `<button${activo} onclick="cambiarPagina(${i})">${i}</button>`;
    }

    // Botón siguiente
    if (paginaActual < totalPaginas) {
        paginacionHtml += `<button onclick="cambiarPagina(${paginaActual + 1})">Siguiente ›</button>`;
    }

    paginacionHtml += `</div>`;
    paginacionHtml += `<div class="info-paginacion">Página ${paginaActual} de ${totalPaginas} (${registrosHistorial.length} registros total)</div>`;

    historialContent.innerHTML += paginacionHtml;
}

function cambiarPagina(nuevaPagina) {
    paginaActual = nuevaPagina;
    mostrarPagina();
    crearControlesPaginacion();
}

// Agregar estilos CSS al documento
const estilosHistorial = `
<style>
.historial-container {
    max-height: 400px;
    overflow-y: auto;
}

.historial-item {
    border: 1px solid #ddd;
    margin-bottom: 8px;
    border-radius: 4px;
}

.historial-header {
    background-color: #f8f9fa;
    padding: 10px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
}

.historial-header:hover {
    background-color: #e9ecef;
}

.cambios-count {
    background-color: #007bff;
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
}

.toggle-icon {
    font-weight: bold;
    color: #007bff;
}

.historial-cambios {
    padding: 10px;
    background-color: #fff;
}

.cambio-item {
    padding: 6px;
    margin-bottom: 6px;
    background-color: #f8f9fa;
    border-radius: 3px;
    font-size: 13px;
    line-height: 1.4;
}

.valor-anterior {
    color: #dc3545;
}

.valor-nuevo {
    color: #28a745;
    font-weight: bold;
}

.paginacion {
    display: flex;
    justify-content: center;
    gap: 5px;
    margin: 15px 0;
}

.paginacion button {
    padding: 8px 12px;
    border: 1px solid var(--color-texto);
    background: var(--color-fondo);
    color: var(--color-texto);
    cursor: pointer;
    border-radius: 3px;
}

.paginacion button:hover {
    background: var(--color-texto);
    color: var(--color-fondo);
}

.paginacion button.activo {
    background: var(--color-secundario);
    color: var(--color-texto);
    border-color: var(--color-texto);
}

.info-paginacion {
    text-align: center;
    color: #666;
    font-size: 12px;
    margin-top: 10px;
}
</style>
`;
// Corrección para el cierre del modal
document.addEventListener('DOMContentLoaded', function () {
    // Función para cerrar modal
    function cerrarModalHistorial() {
        document.getElementById('modalHistorial').style.display = 'none';
    }

    // Event listeners para cerrar el modal
    const closeButton = document.querySelector('#modalHistorial .close');
    if (closeButton) {
        closeButton.removeEventListener('click', cerrarModalHistorial); // Remover listener anterior si existe
        closeButton.addEventListener('click', cerrarModalHistorial);
    }

    // Botón para abrir modal
    document.getElementById('btnHistorial').addEventListener('click', function () {
        document.getElementById('modalHistorial').style.display = 'block';
        cargarHistorial();
    });

    // Cerrar al hacer click fuera del modal
    window.addEventListener('click', function (event) {
        const modal = document.getElementById('modalHistorial');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Agregar los estilos al head si no existen
if (!document.querySelector('#estilos-historial')) {
    const style = document.createElement('style');
    style.id = 'estilos-historial';
    style.innerHTML = estilosHistorial;
    document.head.appendChild(style);
}