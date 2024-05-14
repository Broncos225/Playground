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
    var modulos = document.querySelectorAll('.Modulo2');

    modulos.forEach(function (modulo) {
        var texto = modulo.textContent.toLowerCase();
        if (texto.includes(busqueda)) {
            modulo.style.display = 'block';
        } else {
            modulo.style.display = 'none';
        }
    });
});

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
        <div style="display: flex; gap: 10px; align-items: center;">
        <h3>Apertura</h3>
        <button onclick="copiarTexto('textoA')" style="height: 40px; ">Copiar</button>
        </div>
        <div id="textoA"><p>Buenas<br>Nombre:<br>CeCo: <br>Teléfono para devolver la llamada:<br><strong>Se indica que esta llamada será grabada y monitoreada para efectos de calidad, en caso de presentarse alguna interrupción durante esta llamada y perdamos comunicación le estaremos contactando nuevamente.</strong><br></p>${textoA}</div>
        `;
    });

    db.ref('Plantillas/' + h2Content + '/Cierre').once('value').then(function (snapshot) {
        textoC = snapshot.val();

        modalCierre.innerHTML = `
        <div style="display: flex; gap: 10px; align-items: center;">
        <h3>Cierre</h3>
        <button onclick="copiarTexto('textoC')" style="height: 40px; ">Copiar</button>
        </div>
        <div id="textoC"><p>Buenas</p>${textoC}</div>
        `;
    });
}




function copiarTexto(id) {
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

