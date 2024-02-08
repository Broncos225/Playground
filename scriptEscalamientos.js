function cargarArchivoExcel() {
    var inputFile = document.getElementById('excelFileInput');
    var file = inputFile.files[0];

    if (file) {
        var extension = file.name.split('.').pop();

        if (extension === 'xlsx') {
            var lector = new FileReader();

            lector.onload = function (e) {
                var contenidoArchivo = e.target.result;
                procesarArchivoExcel(contenidoArchivo);
            };

            lector.readAsBinaryString(file);
        } else {
            console.error('Por favor, selecciona un archivo Excel con formato .xlsx.');
        }
    } else {
        console.error('Por favor, selecciona un archivo Excel.');
    }
}

function procesarArchivoExcel(contenido) {
    var libroDeTrabajo = XLSX.read(contenido, { type: 'binary' });
    var primeraHojaNombre = libroDeTrabajo.SheetNames[0];
    var hojaDeTrabajo = libroDeTrabajo.Sheets[primeraHojaNombre];

    var datos = XLSX.utils.sheet_to_json(hojaDeTrabajo, { header: 1 });

    // Crear una tabla HTML dinámicamente
    var tabla = document.createElement('table');
    var encabezado = tabla.createTHead();
    var cuerpo = document.createElement('tbody');

    // Agregar encabezados a la tabla
    var encabezadoFila = encabezado.insertRow();
    datos[0].forEach(function (encabezado) {
        var th = document.createElement('th');
        th.appendChild(document.createTextNode(encabezado));
        encabezadoFila.appendChild(th);
    });

    // Agregar filas y celdas de datos a la tabla
    for (var i = 1; i < datos.length; i++) {
        var tr = cuerpo.insertRow();
        datos[i].forEach(function (dato) {
            var td = tr.insertCell();
            td.appendChild(document.createTextNode(dato));
        });
    }

    tabla.appendChild(encabezado);
    tabla.appendChild(cuerpo);
    tabla.id = 'tabla'; // Asignar un ID a la tabla para referencia posterior

    // Agregar la tabla al contenedor en el DOM
    var tablaContainer = document.getElementById('tablaContainer');
    tablaContainer.innerHTML = ''; // Limpiar contenido anterior
    tablaContainer.appendChild(tabla);
    var boton = document.getElementById('miBoton');
    boton.disabled = true;
    boton.style.backgroundColor = '#a3a3a3';
    boton.style.color = '#868686';
    boton.style.cursor = 'not-allowed';
    boton.style.borderColor = '#a3a3a3';
    var botonReiniciar = document.getElementById('miBotonReiniciar');
    botonReiniciar.style.borderColor = '#cb3234';
    botonReiniciar.style.backgroundColor = '#FF0000';
    botonReiniciar.style.color = '#ffffff';

}

function filtrarSelect(campo) {
    // Obtener el valor seleccionado en el select
    var valorSeleccionado = document.getElementById(campo).value;

    // Obtener la tabla
    var tabla = document.getElementById('tabla');

    // Obtener todas las filas de la tabla (excepto la primera que contiene los encabezados)
    var filas = tabla.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

    // Iterar sobre las filas y ocultar/mostrar según el filtro seleccionado
    for (var i = 0; i < filas.length; i++) {
        var celda = filas[i].getElementsByTagName('td')[indexDeCampo(campo)];

        if (valorSeleccionado === '' || celda.innerHTML === valorSeleccionado) {
            filas[i].style.display = '';
        } else {
            filas[i].style.display = 'none';
        }
    }
}

function indexDeCampo(campo) {
    // Mapear el nombre del campo al índice de la columna en la tabla
    switch (campo) {
        case 'Tipo':
            return 0;
        case 'Area':
            return 1;
        case 'CategoriaMadre':
            return 2;
        case 'CategoriaHijo':
            return 3;
        case 'Escalar1':
            return 4;
        case 'Escalar2':
            return 5;
        default:
            return -1; // Campo no encontrado
    }
}


// Llama a esta función para ordenar alfabéticamente las opciones del select con ID 'Area'
function colocarOpciones() {
    var selects = document.querySelectorAll('.select');

    selects.forEach(function (select) {
        // Reinicializar Select2 y establecer el valor
        $(select).val($(select).find('option:first').val()).trigger('change.select2');
    });
}




$(document).ready(function () {
    // Aplica select2 a tu elemento select
    $('select').select2();
});

document.getElementById("excelFileInput").addEventListener("change", function () {
    var fileName = this.files[0].name;
    var fileSelect = this.parentElement;
    fileSelect.dataset.fileName = fileName;
    fileSelect.style.borderColor = '#008f39';
    fileSelect.style.backgroundColor = '#e6f5e0';
    fileSelect.style.borderBlockStyle = 'solid';
    var boton = document.getElementById('miBoton');
    var botonReiniciar = document.getElementById('miBotonReiniciar');
    boton.disabled = false;

    botonReiniciar = '#FF0000';
    boton.style.cursor = 'pointer';
});

