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
    cargarVacaciones();
    const selectorMes = document.getElementById('Mes');
    const selectorAño = document.getElementById('Año');

    selectorMes.addEventListener('change', cargarVacaciones);
    selectorAño.addEventListener('change', cargarVacaciones);
    diaSemana();
    cargarDatos();
    colorCelda();
    Festivos();
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
    var colorT5 = '#fc818d';
    const texto = celda.textContent.trim();
    let color;
    switch (texto) {
        case '':
            color = 'white';
            celda.style.color = 'black';
            break;
        case 'I':
            color = colorT1;
            celda.style.color = 'black';
            break;
        case 'DV':
            color = colorT2;
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
        case 'D':
            celda.style.color = 'red';
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
            db.ref('Vacaciones/' + nombreFila + '/' + idCelda + '/' + añoSeleccionado + '/' + mesSeleccionado).set({
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
        db.ref('Vacaciones/' + nombreFila + '/' + idCelda + '/' + añoSeleccionado + '/' + mesSeleccionado).once('value')
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

let celdaDiaActual = null;

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
        fechaIngreso: "2023-11-01"
    },
    Miguel_Cadavid_Naranjo: {
        nombre: "Miguel Cadavid Naranjo",
        fechaIngreso: "2023-04-17"
    },
    Milton_Alexis_Calle_Londoño: {
        nombre: "Milton Alexis Calle Londoño",
        fechaIngreso: "2023-02-02"
    },
    Yesica_Johana_Cano_Quintero: {
        nombre: "Yesica Johana Cano Quintero",
        fechaIngreso: "2023-11-14"
    },
    Andrés_Felipe_Vidal_Medina: {
        nombre: "Andrés Felipe Vidal Medina",
        fechaIngreso: "2023-10-17"
    },
    Andrés_Felipe_Yepes_Tascón: {
        nombre: "Andrés Felipe Yepes Tascón",
        fechaIngreso: "2023-10-17"
    },
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
});

selectAño.addEventListener('change', function () {
    cargarDatos();
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
    if (window.innerWidth <= 768) {
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


function CalculoDiasPendientes(agente) {
    var diasVacaciones = 0;
    const [year, month, day] = agentes[agente].fechaIngreso.split('-');
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
    const nombreAgente = agentes[agente].nombre;
    var diasAño = 0;
    var incapacidad = 0;
    var vacaciones = 0;
    var medioDia = 0;
    var tramites = 0;

    let promises = [];
    for (var i = 1; i <= 12; i++) {
        for (var j = 2; j <= 32; j++) {
            let promise = db.ref('Vacaciones/' + nombreAgente + '/' + j + '/' + añoSeleccionado + '/' + i).once('value');
            promises.push(promise);
        }
    }
    let results = await Promise.all(promises);
    results.forEach(snapshot => {
        const data = snapshot.val();
        if (data && (data.texto == 'D' || data.texto == 'I' || data.texto == 'DV')) {
            diasAño += 1;
            if (data.texto == 'I') {
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
    const nombreAgente = agentes[agente].nombre;

    var diasMes = 0;

    let promises = [];
    for (var j = 2; j <= 32; j++) {
        let promise = db.ref('Vacaciones/' + nombreAgente + '/' + j + '/' + añoSeleccionado + '/' + mesSeleccionado).once('value');
        promises.push(promise);
    }
    let results = await Promise.all(promises);
    results.forEach(snapshot => {
        const data = snapshot.val();
        if (data && (data.texto == 'D' || data.texto == 'I' || data.texto == 'DV')) {
            diasMes += 1;
        }
    });
    return diasMes;
}



async function cargarVacaciones() {
    const agentesArray = Object.keys(agentes);
    for (let index = 0; index < agentesArray.length; index++) {
        const agente = agentesArray[index];
        const diasPendientes = await CalculoDiasPendientes(agente);
        const diasMes = await CalculoDiasMes(agente);
        const { incapacidad, vacaciones, tramites, medioDia, diasAño } = await CalculoDiasAño(agente);
        document.getElementById("DP" + (index + 1)).textContent = diasPendientes - diasAño;
        document.getElementById("DenA" + (index + 1)).textContent = diasAño;
        document.getElementById("DenM" + (index + 1)).textContent = diasMes;
        document.getElementById("I" + (index + 1)).textContent = incapacidad;
        document.getElementById("DV" + (index + 1)).textContent = vacaciones;
        document.getElementById("T" + (index + 1)).textContent = tramites;
        document.getElementById("MD" + (index + 1)).textContent = medioDia;
    }
}

