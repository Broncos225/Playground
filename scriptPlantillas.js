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

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // Usuario autenticado, listar archivos desde Firebase Realtime Database
        db.ref('Plantillas').once('value').then(function (snapshot) {
            var modulosPlantillas = document.getElementById("ModulosPlantillas");
            snapshot.forEach(function (childSnapshot) {
                var fileName = childSnapshot.key;

                var newDiv = document.createElement("div");
                newDiv.className = "Modulo2";

                newDiv.onclick = function () {
                    showModal(fileName);
                };

                var newH2 = document.createElement("h2");
                newH2.textContent = fileName;
                newDiv.appendChild(newH2);

                modulosPlantillas.appendChild(newDiv);
            });

            // Configurar búsqueda después de agregar elementos
            configurarBusqueda();
        }).catch(function (error) {
            console.log("Error al listar los archivos: ", error);
        });
    } else {
        console.log('No user is signed in');
    }
});


function configurarBusqueda() {
    var input = document.getElementById('busqueda');
    var clearButton = document.getElementById('LimpiarP');
    var pdfs = Array.from(document.getElementsByClassName('Modulo2'));

    input.addEventListener('keyup', function () {
        console.log("Keyup event triggered"); // Para depuración
        var filter = input.value.toUpperCase();
        pdfs.forEach(function (pdf) {
            var title = pdf.getElementsByTagName('h2')[0];
            if (title.innerHTML.toUpperCase().indexOf(filter) > -1) {
                pdf.style.display = "";
            } else {
                pdf.style.display = "none";
            }
        });
        verificarResultados();
    });

    clearButton.addEventListener('click', function () {
        console.log("Clear button clicked"); // Para depuración
        input.value = '';
        pdfs.forEach(function (pdf) {
            pdf.style.display = "";
        });
        verificarResultados();
    });
}

function verificarResultados() {
    var pdfs = Array.from(document.getElementsByClassName('Modulo2'));
    var hayResultados = pdfs.some(pdf => pdf.style.display !== 'none');
    document.getElementById('NoResultados').style.display = hayResultados ? 'none' : 'block';
}

// Llamar a la función configurarBusqueda después de cargar los elementos
configurarBusqueda();


function showModal(fileName) {
    var modal = document.getElementById("myModal");
    modal.scrollTop = 0;
    var modalTitulo = document.querySelector("#myModal #modal-content #titulo");
    var modalApertura = document.querySelector("#myModal #modal-content #apertura");
    var modalCierre = document.querySelector("#myModal #modal-content #cierre");

    modalTitulo.innerHTML = `
    <hr>
    <h2 style="text-align: center;">${fileName}</h2>
    <hr>
    `;
    db.ref('Plantillas/' + fileName + '/Apertura').once('value').then(function (snapshot) {
        var textoA = snapshot.val();

        modalApertura.innerHTML = `
        <div style="display: flex; gap: 10px; align-items: center; justify-content: flex-end; flex-wrap: wrap;">
        <h2 style="margin-right: auto;">Apertura</h2>
        <button onclick="copiarTexto('textoA')" style="height: 40px; color: white; background-color: #333;">Copiar texto</button>
        </div>
        <div id="textoA"><p>Buenas<br></p><p>${textoA}</p><p>Saludos.</p></div>
        <hr>`;
    });

    db.ref('Plantillas/' + fileName + '/Cierre').once('value').then(function (snapshot) {
        var textoC = snapshot.val();

        modalCierre.innerHTML = `
        <div style="display: flex; gap: 10px; align-items: center; justify-content: flex-end; flex-wrap: wrap;">
        <h2 style="margin-right: auto;">Cierre</h2>
        <button onclick="copiarTexto('textoC')" style="height: 40px; color: white; background-color: #333;">Copiar texto</button>
        </div>
        <div id="textoC"><p>Buenas</p><p>${textoC}</p><p>Saludos.</p></div>
        `;
    });
    document.body.classList.add('modal-open');
    if (window.innerWidth <= 968) {
        document.querySelector('header').style.display = 'none';
        document.getElementById("myModal").style.top = '0px';
    } else {
        document.querySelector('header').style.display = 'block';
        document.getElementById("myModal").style.top = '50px';
    }
    modal.style.display = "block";
}

function copiarTexto(id) {
    var text = document.getElementById(id).innerHTML; // Cambiado a innerHTML
    text = text.replace(/<br>/g, "\r\n").replace(/<\/p><p>/g, "\r\n").replace(/<p>/g, "").replace(/<\/p>/g, ""); // Añadido para conservar los saltos de línea y eliminar las etiquetas <p></p>
    var textArea = document.createElement("textarea");
    textArea.style.fontFamily = "Nunito, sans-serif"; // Añadido para establecer el tipo de letra a Nunito
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);

    // Muestra la notificación
    var notification = document.getElementById('notification2');
    notification.textContent = 'Texto plano copiado al portapapeles';
    notification.style.opacity = '1';

    // Oculta la notificación después de 1 segundo
    setTimeout(function () {
        notification.style.opacity = '0';
    }, 1000);
}

function closeModal() {
    var modal = document.getElementById("myModal");
    modal.style.display = "none";
    document.body.classList.remove('modal-open');
    document.querySelector('header').style.display = 'block';
}

window.onclick = function (event) {
    var modal = document.getElementById("myModal");
    if (event.target == modal) {
        modal.style.display = "none";
        document.body.classList.remove('modal-open');
        document.querySelector('header').style.display = 'block';
    }
}
