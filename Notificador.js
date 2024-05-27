let agentesN = {
    Anderson_Cano_Londoño: {
        nombre: "Anderson Cano Londoño",
        letra: "A",
        contraseña: ""
    },
    Miguel_Cadavid_Naranjo: {
        nombre: "Miguel Cadavid Naranjo",
        letra: "B",
        contraseña: ""
    },
    Milton_Alexis_Calle_Londoño: {
        nombre: "Milton Alexis Calle Londoño",
        letra: "C",
        contraseña: ""
    },
    Yesica_Johana_Cano_Quintero: {
        nombre: "Yesica Johana Cano Quintero",
        letra: "D",
        contraseña: ""
    },
    Andrés_Felipe_Vidal_Medina: {
        nombre: "Andrés Felipe Vidal Medina",
        letra: "E",
        contraseña: ""
    },
    Andrés_Felipe_Yepes_Tascón: {
        nombre: "Andrés Felipe Yepes Tascón",
        letra: "F",
        contraseña: ""
    }
};

document.addEventListener("DOMContentLoaded", function () {
    enableNotifications();
});



function Notificador() {
    var agenteSeleccionado = localStorage.getItem('nombreAsesorActual');

    if (!(agenteSeleccionado in agentesN)) {
        alert("El agente seleccionado no es válido");
        var notificationSwitch = document.getElementById('notificationSwitch');
        if (notificationSwitch) {
            notificationSwitch.checked = false;
        } return;
    }

    var Letra = agentesN[agenteSeleccionado].letra;
    var fecha = new Date();
    var dia = fecha.getDate();
    var celdaId = Letra + dia;

    var tabla = document.getElementById("Table");
    var celda = tabla ? tabla.querySelector(`#${celdaId}`) : null;

    if (!celda) {
        alert(`No se pudo encontrar la celda con ID: ${celdaId} para el agente seleccionado`);
        return;
    }

    var Marcaciones = {
        "T1": ["07:00", "12:00", "13:00", "16:00"],
        "T2": ["09:00", "12:30", "13:30", "18:00"],
        "T3": ["09:30", "13:30", "14:30", "18:30"],
        "T4": ["10:00", "14:30", "15:30", "19:00"],
        "T5": ["11:00", "15:30", "16:30", "20:00"],
        "T6": ["12:30", "16:30", "17:30", "21:30"],
        "TSA": ["08:00", "12:00", "13:00", "16:00"],
        "T2R1": ["10:00", "12:30", "13:30", "18:00"],
        "T3R1": ["10:30", "13:30", "14:30", "18:30"],
        "T4R1": ["11:00", "14:30", "15:30", "19:00"],
        "T5R1": ["12:00", "15:30", "16:30", "20:00"],
        "T6R1": ["13:30", "16:30", "17:30", "21:30"],
    };

    var descripciones = ["entrada del turno", "salida al almuerzo", "entrada del almuerzo", "salida del turno"];
    var horarios = Marcaciones[celda.textContent.trim()];

    if (!("Notification" in window)) {
        alert("Este navegador no soporta notificaciones de escritorio");
        return;
    } else if (Notification.permission !== "granted") {
        Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
                localStorage.setItem('notificacionesActivas', JSON.stringify({ horarios, descripciones, celdaContent: celda.textContent.trim() }));
                mostrarNotificacion("Has activado las notificaciones de las marcaciones de Softcontrol");
                programarNotificaciones(horarios, descripciones, celda.textContent.trim());
            }
        });
    } else {
        localStorage.setItem('notificacionesActivas', JSON.stringify({ horarios, descripciones, celdaContent: celda.textContent.trim() }));
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

    cargarSonidoNotificacion(); // Cargar el audio cuando se muestra la notificación
}

function abrirSoftcontrol() {
    window.open("https://biometricos.arus.com.co/home");
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
    hours = hours ? hours : 12; // La hora '0' debe ser '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

function enableNotifications() {
    var notificacionesActivas = localStorage.getItem('notificacionesActivas');
    if (notificacionesActivas) {
        var { horarios, descripciones, celdaContent } = JSON.parse(notificacionesActivas);
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
            if (asesorSeleccionado()) {
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

// Establecer el estado inicial del interruptor de notificaciones
var notificationSwitch = document.getElementById('notificationSwitch');
if (notificationSwitch) {
    notificationSwitch.checked = areNotificationsActive();
}
function asesorSeleccionado() {
    // Supongamos que los asesores se seleccionan a través de un elemento select
    var select = document.getElementById('SolExportar');
    select.value = localStorage.getItem('nombreAsesorActual');
    // Si el valor del select es vacío, entonces no se ha seleccionado un asesor
    if (select.value === '') {
        return false;
    } else {
        return true;
    }
}

// Añadir un intervalo para comprobar si el turno ha cambiado cada minuto
setInterval(function () {
    if (areNotificationsActive()) {
        var usuarioActual = localStorage.getItem('nombreAsesorActual'); // Recuperar el valor de nombreAsesorActual del almacenamiento local

        // Verificar si el usuario actual existe
        if (!(usuarioActual in agentesN)) {
            alert('El usuario actual no es válido. Desactivando las notificaciones.');
            document.getElementById('notificationSwitch').checked = false;
            disableNotifications();
            return;
        }

        var Letra = agentesN[usuarioActual].letra;
        var fecha = new Date();
        var dia = fecha.getDate();
        var celdaId = Letra + dia;

        var tabla = document.getElementById("Table");
        var celda = tabla ? tabla.querySelector(`#${celdaId}`) : null;

        if (celda) {
            var notificacionesActivas = JSON.parse(localStorage.getItem('notificacionesActivas'));
            if (notificacionesActivas.celdaContent !== celda.textContent.trim()) {
                // El turno ha cambiado, reprogramar las notificaciones
                Notificador();
            }
        }
    }
}, 30000); // 30000 milisegundos = 0.5 minuto

document.getElementById('usuario').addEventListener('click', function() {
    if (!window.location.href.includes('HorariosStop.html')) {
        var localVariable = localStorage.getItem('nombreAsesorActual'); // obtiene el valor del localStorage
        if (localVariable) { // verifica si la variable existe
            var cleanVariable = localVariable.replace(/_/g, ' '); // reemplaza todos los guiones bajos con espacios
            alert('El asesor seleccionado es: ' + cleanVariable);
        } else {
            alert('No se ha seleccionado un asesor. Por favor, selecciona un asesor antes de activar las notificaciones en la pagina de Horarios.');
        }
    }
});