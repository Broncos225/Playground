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
            color =  colorT4;
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
        const celdas = document.querySelectorAll('td');
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

function contDescansos(){
    var contA = 0, contB = 0, contC = 0, contD = 0, contE = 0, contF = 0;

    for (var i=1; i < 30; i++) {
        var celda = document.getElementById('A' + i);
        if (celda.textContent == 'D') {
            contA += 1;
        }
    }
    for (var i=1; i < 30; i++) {
        var celda = document.getElementById('B' + i);
        if (celda.textContent == 'D') {
            contB += 1;
        }
    }
    for (var i=1; i < 30; i++) {
        var celda = document.getElementById('C' + i);
        if (celda.textContent == 'D') {
            contC += 1;
        }
    }
    for (var i=1; i < 30; i++) {
        var celda = document.getElementById('D' + i);
        if (celda.textContent == 'D') {
            contD += 1;
        }
    }
    for (var i=1; i < 30; i++) {
        var celda = document.getElementById('E' + i);
        if (celda.textContent == 'D') {
            contE += 1;
        }
    }
    for (var i=1; i < 30; i++) {
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