// Copyright (c) 2024 Andrés Felipe Yepes Tascón
// Licensed under the MIT License. See LICENSE file for details.
window.addEventListener('load', function () {
  const textoElement = document.getElementById('Texto');
  if (textoElement) {
    textoElement.textContent = 'No están funcionando las solicitudes de la página de STOP, por favor no haga solicitudes hasta nuevo aviso. Gracias.';
  }
});

let agentes = {
  Yesica_Johana_Cano_Quintero: {
    nombre: "Yesica",
    cumpleaños: [15,11]
  },
  Andrés_Felipe_Yepes_Tascón: {
    nombre: "Andrés Yepes",
    cumpleaños: [2,5]
  },
  Oscar_Luis_Cabrera_Pacheco: {
    nombre: "Oscar",
    cumpleaños: [5,5]
  },
  Ocaris_David_Arango_Aguilar: {
    nombre: "David",
    cumpleaños: [8,3]
  },
  Yeison_Torres_Ochoa: {
    nombre: "Yeison",
    cumpleaños: [12,9]
  },
  Johan_Guzman_Alarcon: {
    nombre: "Johan",
    cumpleaños: [21,10]
  },
  Maria_Susana_Ospina_Vanegas: {
    nombre: "Susana",
    cumpleaños: [22,2]
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

      intervalo = setInterval(function() {
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

