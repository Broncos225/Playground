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
    const texto = celda.textContent.trim();
    let color;
    switch (texto) {
        case 'T1':
        case 'T1R1':
            color = '#ddebf7';
            break;
        case 'T2':
        case 'T2R1':
            color = '#ffe699';
            break;
        case 'T3':
        case 'T3R1':
            color = '#c9c9c9';
            break;
        case 'T4':
        case 'T4R1':
            color = '#f4b084';
            break;
        case 'T5':
        case 'T5R1':
            color = '#aad18f';
            break;
        case 'T6':
        case 'T6R1':
            color = '#00ff00';
            break;
        case 'D':
        case 'DF':
            color = '#white';
            celda.style.color = 'red';
            break;
        case 'TSA':
            color = '#ffff00';
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
            })
            .catch(error => {
                console.error("Error al cargar datos:", error);
            });
    });
}

document.getElementById('btnGuardar').addEventListener('click', guardarCeldas);


