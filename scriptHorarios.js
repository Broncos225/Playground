// Obtener todas las celdas de la tabla
const celdas = document.querySelectorAll('td');

// Recorrer cada celda
celdas.forEach(celda => {
    // Obtener el texto de la celda
    const texto = celda.textContent.trim();

    // Asignar un color dependiendo del texto
    switch (texto) {
        case 'T1':
        case 'T1R1':
            celda.style.backgroundColor = '#ddebf7';
            break;
        case 'T2':
        case 'T2R1':
            celda.style.backgroundColor = '#ffe699';
            break;
        case 'T3':
        case 'T3R1':
            celda.style.backgroundColor = '#c9c9c9';
            break;
        case 'T4':
        case 'T4R1':
            celda.style.backgroundColor = '#f4b084';
            break;
        case 'T5':
        case 'T5R1':
            celda.style.backgroundColor = '#aad18f';
            break;
        case 'T6':
        case 'T6R1':
            celda.style.backgroundColor = '#00ff00';
            break;
        case 'D':
        case 'DF':
            celda.style.backgroundColor = '#white';
            celda.style.color = 'red';
            break;
        case 'TSA':
            celda.style.backgroundColor = '#ffff00';
            break;
        default:
            break;
    }
});
