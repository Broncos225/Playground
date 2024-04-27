// Selecciona los campos de entrada y el elemento de resultado
let valorInput = document.querySelector('input[placeholder="Valor"]');
let porcentajeInput = document.querySelector('input[placeholder="Porcentaje"]');
let resultadoLabel = document.querySelector('#Resultado1');
let resultadoLabel11 = document.querySelector('#Resultado11');
let limpiarButton = document.getElementById('Limpiar');

function formatearNumero(num) {
    let partes = num.toString().split(".");
    partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return partes.join(",");
}

function calcularPorcentaje() {
    let valor = parseFloat(valorInput.value.replace(/\./g, ''));
    let porcentaje = parseFloat(porcentajeInput.value);
    if (!isNaN(valor) && !isNaN(porcentaje)) {
        let resultado = valor * (porcentaje / 100);
        resultado = Math.round(resultado * 100) / 100;
        let resultadoFormateado = formatearNumero(resultado);
        resultadoLabel.innerHTML = `El valor descontado es: <strong>${resultadoFormateado}</strong> pesos.`;
        let total = valor - resultado;
        let totalFormateado = formatearNumero(total);
        resultadoLabel11.innerHTML = `El total a pagar es: <strong>${totalFormateado}</strong> pesos.`;
    } else {
        resultadoLabel.textContent = '';
        resultadoLabel11.textContent = '';
    }
}

valorInput.addEventListener('input', calcularPorcentaje);
porcentajeInput.addEventListener('input', calcularPorcentaje);

limpiarButton.addEventListener('click', function () {
    valorInput.value = '';
    porcentajeInput.value = 0;
    resultadoLabel.textContent = '';
    resultadoLabel11.textContent = '';
});

document.addEventListener("DOMContentLoaded", function() {
    let datosTabla = [];

    function cargarDatos() {
        fetch('Tiendas.csv')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error HTTP: ' + response.status);
                }
                return response.text();
            })
            .then(data => {
                datosTabla = parseCSV(data);
                actualizarTabla(datosTabla);
            }).catch(error => console.error('Error al cargar el archivo CSV:', error));
    }

    function parseCSV(data) {
        let lines = data.split('\n');
        let result = [];
        for (let i = 0; i < lines.length; i++) {
            let row = lines[i].trim();
            if (row) {
                let columns = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
                if (columns) {
                    columns = columns.map(column => column.replace(/^"|"$/g, ''));
                    result.push({
                        CeCo: columns[0],
                        Tienda: columns[1],
                        Celular: columns[4],
                        Zona: columns[3],
                        LiderDeZona: columns[2],
                        Correo: columns[5]
                    });
                }
            }
        }
        return result;
    }

    function actualizarTabla(datos) {
        let tabla = document.getElementById('Contactos');
        while (tabla.rows.length > 1) {
            tabla.deleteRow(1);
        }
        datos.forEach(d => {
            let fila = tabla.insertRow(-1);
            let orden = ['CeCo', 'Tienda', 'Celular', 'Zona', 'LiderDeZona', 'Correo']; // Orden especificado para las celdas
            orden.forEach(key => {
                let celda = fila.insertCell(-1);
                celda.textContent = d[key];
            });
        });
    }

    document.getElementById('busqueda').addEventListener('input', function() {
        const consulta = this.value.toLowerCase();
        const datosFiltrados = datosTabla.filter(item => 
            Object.values(item).some(val => val.toLowerCase().includes(consulta))
        );
        actualizarTabla(datosFiltrados);
    });

    document.getElementById('Limpiar2').addEventListener('click', function() {
        document.getElementById('busqueda').value = '';
        actualizarTabla(datosTabla);
    });

    cargarDatos();
});

