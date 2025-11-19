function CuentaAsesor() {
    var nombre = localStorage.getItem('nombreAsesorActual');
    var asesor = document.getElementById("AsesorActual");
    var span = document.createElement("span");

    if (nombre) {
        nombre = nombre.replace(/_/g, ' ');
        asesor.textContent = "Bienvenido/a ";
        span.textContent = nombre;
    } else {
        asesor.textContent = "Bienvenido/a ";
        span.textContent = "Nadie";
    }

    span.style.fontWeight = "lighter";
    asesor.appendChild(span);
}

function seleccionarNombre(nombre) {
    localStorage.setItem('nombreAsesorActual', nombre);
    cerrarModal2();
    CuentaAsesor();
}

function cerrarModal2() {
    var modal2 = document.getElementById("myModal2");
    var body = document.getElementsByTagName("body")[0];
    modal2.style.display = "none";
    body.style.overflow = "auto";
}

var modal2 = document.getElementById("myModal2");
var btnusuario = document.getElementById("usuario");
var body = document.getElementsByTagName("body")[0];

btnusuario.onclick = function () {
    modal2.style.display = "block";
    body.style.overflow = "hidden";
}

var span = document.getElementById("close2");
span.onclick = function () {
    modal2.style.display = "none";
    body.style.overflow = "auto";
}