
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
