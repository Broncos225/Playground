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
db = firebase.database();

document.getElementById('busqueda').addEventListener('input', function (e) {
    var busqueda = e.target.value.toLowerCase();
    busqueda = quitarTildes(busqueda);
    var modulos = document.querySelectorAll('.Modulo2');

    modulos.forEach(function (modulo) {
        var texto = modulo.textContent.toLowerCase();
        texto = quitarTildes(texto); 
        if (texto.includes(busqueda)) {
            modulo.style.display = 'block';
        } else {
            modulo.style.display = 'none';
        }
    });
});

function quitarTildes(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}


document.getElementById('Limpiar').addEventListener('click', function () {
    var busqueda = document.getElementById('busqueda');
    busqueda.value = '';
    var event = new Event('input', {
        bubbles: true,
        cancelable: true,
    });
    busqueda.dispatchEvent(event);
});

var db = firebase.database();

function showModal(event) {
    var modal = document.getElementById("myModal");
    modal.scrollTop = 0; // Add this line
    var modalTitulo = document.querySelector("#modal-content #titulo");
    var modalApertura = document.querySelector("#modal-content #apertura");
    var modalCierre = document.querySelector("#modal-content #cierre");
    modal.style.display = "block";

    var h2Content = event.currentTarget.querySelector('h2').innerText;

    var textoA;
    var textoC;

    modalTitulo.innerHTML = `
    <hr>
    <h2 style="text-align: center;">${h2Content}</h2>
    <hr>
    `;
    db.ref('Plantillas/' + h2Content + '/Apertura').once('value').then(function (snapshot) {
        textoA = snapshot.val();

        modalApertura.innerHTML = `
        <div style="display: flex; gap: 10px; align-items: center; justify-content: flex-end; flex-wrap: wrap;">
        <h2 style="margin-right: auto;">Apertura</h2>
        <button onclick="copiarTexto('textoA')" style="height: 40px; color: white; background-color: #333;">Copiar texto</button>
        </div>
        <div id="textoA"><p>Buenas<br></p>${textoA}<p>Saludos.</p></div>
        <hr>`;
    });

    db.ref('Plantillas/' + h2Content + '/Cierre').once('value').then(function (snapshot) {
        textoC = snapshot.val();

        modalCierre.innerHTML = `
        <div style="display: flex; gap: 10px; align-items: center; justify-content: flex-end; flex-wrap: wrap;">
        <h2 style="margin-right: auto;">Cierre</h2>
        <button onclick="copiarTexto('textoC')" style="height: 40px; color: white; background-color: #333;">Copiar texto</button>
        </div>
        <div id="textoC"><p>Buenas</p>${textoC}<p>Saludos.</p></div>
        `;
    });
}




function copiarAranda(id) {
    var text = document.getElementById(id).innerHTML;
    var styledText = `<span style="font-family: Nunito, sans-serif;">${text}</span>`;
    function listener(e) {
        e.clipboardData.setData("text/html", styledText);
        e.clipboardData.setData("text/plain", text);
        e.preventDefault();
    }
    document.addEventListener("copy", listener);
    document.execCommand("copy");
    document.removeEventListener("copy", listener);

    // Muestra la notificación
    var notification = document.getElementById('notification');
    notification.textContent = 'Texto para Aranda copiado al portapapeles';
    notification.style.opacity = '1';

    // Oculta la notificación después de 1 segundo
    setTimeout(function () {
        notification.style.opacity = '0';
    }, 1000);
}

function copiarTexto(id) {
    var text = document.getElementById(id).innerText;
    var textArea = document.createElement("textarea");
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
}

window.onclick = function (event) {
    var modal = document.getElementById("myModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

