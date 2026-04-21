// Copyright (c) 2024 Andrés Felipe Yepes Tascón
// Licensed under the MIT License. See LICENSE file for details.
window.addEventListener('load', function () {
  const textoElement = document.getElementById('Texto');
  if (textoElement) {
    textoElement.textContent = 'No están funcionando las solicitudes de la página de STOP, por favor no haga solicitudes hasta nuevo aviso. Gracias.';
  }
});

let agentes = {
  Andrés_Felipe_Yepes_Tascón: {
    nombre: "Andrés Yepes",
    cumpleaños: [2, 5]
  },
  Jorge_Andres_Gallego: {
    nombre: "Jorge",
    cumpleaños: [21, 1]
  },
  Yeison_Torres_Ochoa: {
    nombre: "Yeison",
    cumpleaños: [22, 5]
  },
  Johan_Guzman_Alarcon: {
    nombre: "Salchichón",
    cumpleaños: [21, 10]
  },
  Maria_Susana_Ospina_Vanegas: {
    nombre: "Susana",
    cumpleaños: [22, 2]
  },
  Diego_Alejandro_Úsuga_Yepes: {
    nombre: "Diego",
    cumpleaños: [17, 1]
  },
  Santiago_Ramirez_Guzman: {
    nombre: "Santiago",
    cumpleaños: [0, 0]
  }
};


function verificarCumpleaños(agentes) {
  const banner = document.getElementById('banner');
  banner.style.display = 'none';
  const hoy = new Date();
  const dia = hoy.getDate();
  const mes = hoy.getMonth() + 1;
  const emoticonos = ['🎉', '🎂', '🎈', '🎁', '🥳', '🍰', '🧁', '🍾', '🥂', '🍻', '🍹', '🍬', '🍭', '🍫', '🍦', '🍨', '🍧', '🎊', '🎀', '🎆', '🎇', '🎈', '🎉', '🎁', '🎂', '🎊', '🎉'];
  let intervalo;

  for (let agente in agentes) {
    let cumpleaños = agentes[agente].cumpleaños;
    if (cumpleaños && dia === cumpleaños[0] && mes === cumpleaños[1]) {
      banner.style.display = 'block';
      banner.classList.add('aparecer');

      intervalo = setInterval(function () {
        const emoticonoAleatorio = emoticonos[Math.floor(Math.random() * emoticonos.length)];
        banner.textContent = `${emoticonoAleatorio} ¡Feliz cumpleaños ${agentes[agente].nombre}! ${emoticonoAleatorio}`;
      }, 1000); // Cambia el emoticono cada segundo

      break;
    }
  }

  // Si no hay cumpleaños, detén el intervalo
  if (!intervalo) {
    clearInterval(intervalo);
  }
}

verificarCumpleaños(agentes);

