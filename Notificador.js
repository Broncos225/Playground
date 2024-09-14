let agentesN = {
    Anderson_Cano_Londoño: {
        nombre: "Anderson Cano Londoño",
        usuario: "anderson.cano",
        letra: "A",
        contraseña: ""
    },
    Santiago_Pérez_Martinez: {
        nombre: "Santiago Pérez Martínez",
        usuario: "santiago.perez",
        letra: "C",
        contraseña: ""
    },
    Yesica_Johana_Cano_Quintero: {
        nombre: "Yesica Johana Cano Quintero",
        usuario: "yesica.cano",
        letra: "D",
        contraseña: ""
    },
    Andrés_Felipe_Vidal_Medina: {
        nombre: "Andrés Felipe Vidal Medina",
        usuario: "andres.vidal",
        letra: "E",
        contraseña: ""
    },
    Andrés_Felipe_Yepes_Tascón: {
        nombre: "Andrés Felipe Yepes Tascón",
        usuario: "andres.yepes",
        letra: "F",
        contraseña: ""
    },
    Maira_Mosquera_Blandon: {
        nombre: "Maira Mosquera Blandon",
        usuario: "maira.mosquera",
        letra: "G",
        contraseña: ""
    },
    Yeison_Torres_Ochoa: {
        nombre: "Yeison Torres Ochoa",
        usuario: "yeison.torres",
        letra: "H",
        contraseña: ""
    },
    
};

document.addEventListener("DOMContentLoaded", function () {
    enableNotifications();
    setInterval(checkForDateChange, 60000); // Comprueba cada minuto si la fecha ha cambiado
});

function Notificador() {
    var agenteSeleccionado = localStorage.getItem('nombreAsesorActual');

    if (!(agenteSeleccionado in agentesN)) {
        alert("El agente seleccionado no es válido");
        var notificationSwitch = document.getElementById('notificationSwitch');
        if (notificationSwitch) {
            notificationSwitch.checked = false;
        }
        return;
    }

    var Letra = agentesN[agenteSeleccionado].letra;
    var fecha = new Date();
    var dia = fecha.getDate();
    var mes = fecha.getMonth();
    var año = fecha.getFullYear();
    var celdaId = Letra + dia;

    var tabla = document.getElementById("Table");
    var celda = tabla ? tabla.querySelector(`#${celdaId}`) : null;

    if (!celda) {
        alert(`No se pudo encontrar la celda con ID: ${celdaId} para el agente seleccionado`);
        return;
    }

    var Marcaciones = {
        "T1": ["07:00", "12:00", "13:00", "15:30"],
        "T1U": ["07:00", "12:00", "13:00", "16:30"],

        "T2": ["09:00", "12:30", "13:30", "17:30"],
        "T2N": ["09:00", "12:30", "13:30", "18:00"],

        "T3": ["10:00", "13:00", "14:00", "18:30"],
        "T3N": ["09:30", "13:00", "14:00", "18:30"],

        "T4": ["10:30", "14:30", "15:30", "19:00"],
        "T4N": ["10:00", "14:30", "15:30", "19:00"],

        "T5": ["11:30", "15:30", "16:30", "20:00"],
        "T5N": ["11:00", "15:30", "16:30", "20:00"],

        "T6": ["13:00", "16:30", "17:30", "21:30"],
        "T6N": ["12:30", "16:30", "17:30", "21:30"],
        "T6U": ["15:00", "00:00", "00:00", "21:30"],

        "TSA": ["08:00", "12:00", "12:30", "16:00"],
    };

    var descripciones = ["entrada del turno", "salida al almuerzo", "entrada del almuerzo", "salida del turno"];
    var horarios = Marcaciones[celda.textContent.trim()];

    if (!("Notification" in window)) {
        alert("Este navegador no soporta notificaciones de escritorio");
        return;
    } else if (Notification.permission !== "granted") {
        Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
                localStorage.setItem('notificacionesActivas', JSON.stringify({ horarios, descripciones, celdaContent: celda.textContent.trim(), fecha: { dia, mes, año } }));
                mostrarNotificacion("Has activado las notificaciones de las marcaciones de Softcontrol");
                programarNotificaciones(horarios, descripciones, celda.textContent.trim());
            }
        });
    } else {
        localStorage.setItem('notificacionesActivas', JSON.stringify({ horarios, descripciones, celdaContent: celda.textContent.trim(), fecha: { dia, mes, año } }));
        mostrarNotificacion("Has activado las notificaciones de las marcaciones de Softcontrol");
        programarNotificaciones(horarios, descripciones, celda.textContent.trim());
    }
}

function programarNotificaciones(horarios, descripciones, celdaContent) {
    var now = new Date();
    horarios.forEach((horario, index) => {
        var [hours, minutes] = horario.split(':');
        var time = new Date();
        time.setHours(hours, minutes, 0, 0);

        if (time > now) {
            var timeout = time - now;
            setTimeout(() => {
                mostrarNotificacion(`Es hora de marcar la ${descripciones[index]} del: ${celdaContent} a las ${convertirHora12(time)}`);
                abrirSoftcontrol();
            }, timeout);
        }
    });
}

function mostrarNotificacion(mensaje) {
    var notification = new Notification("Recordatorio de Marcación Softcontrol", {
        body: mensaje,
    });

    cargarSonidoNotificacion();
}

function abrirSoftcontrol() {
    window.open("https://biometricos.arus.com.co/Autogestion/Home");
}

function cargarSonidoNotificacion() {
    var audio = document.getElementById('notificationSound');
    if (audio) {
        audio.play();
    } else {
        console.error("El elemento audio no se ha encontrado");
    }
}

function convertirHora12(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

function enableNotifications() {
    var notificacionesActivas = localStorage.getItem('notificacionesActivas');
    if (notificacionesActivas) {
        var { horarios, descripciones, celdaContent, fecha } = JSON.parse(notificacionesActivas);
        programarNotificaciones(horarios, descripciones, celdaContent);
    }
}

function disableNotifications() {
    localStorage.removeItem('notificacionesActivas');
}

function areNotificationsActive() {
    return localStorage.getItem('notificacionesActivas') !== null;
}

var notificationSwitch = document.getElementById('notificationSwitch');
if (notificationSwitch) {
    notificationSwitch.addEventListener('change', function () {
        if (this.checked) {
            if (localStorage.getItem('nombreAsesorActual')) {
                Notificador();
            } else {
                this.checked = false;
                alert('Por favor, selecciona un asesor antes de activar las notificaciones.');
            }
        } else {
            disableNotifications();
        }
    });
}

if (notificationSwitch) {
    notificationSwitch.checked = areNotificationsActive();
}

function checkForDateChange() {
    var notificacionesActivas = localStorage.getItem('notificacionesActivas');
    if (notificacionesActivas) {
        var { fecha } = JSON.parse(notificacionesActivas);
        var now = new Date();
        if (fecha.dia !== now.getDate() || fecha.mes !== now.getMonth() || fecha.año !== now.getFullYear()) {
            Notificador();
        }
    }
}

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
