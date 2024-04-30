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

// Modulo 2: Contactos de Tiendas

document.addEventListener("DOMContentLoaded", function () {
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

    function normalizar(str) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    document.getElementById('busqueda').addEventListener('input', function () {
        const consulta = normalizar(this.value.toLowerCase());
        const datosFiltrados = datosTabla.filter(item =>
            Object.values(item).some(val => normalizar(val.toLowerCase()).includes(consulta))
        );
        actualizarTabla(datosFiltrados);
    });

    document.getElementById('Limpiar2').addEventListener('click', function () {
        document.getElementById('busqueda').value = '';
        document.getElementById('Contactos').scrollLeft = 0;
        document.getElementById('Contactos').scrollTop = 0;
        actualizarTabla(datosTabla);
    });

    cargarDatos();
});
let datosTablaMatriz = [];

document.addEventListener("DOMContentLoaded", function () {
    function cargarDatosMatriz() {
        fetch('Matriz.csv')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error HTTP: ' + response.status);
                }
                return response.text();
            })
            .then(data => {
                datosTablaMatriz = Papa.parse(data, {
                    header: true,
                    skipEmptyLines: true,
                    dynamicTyping: true
                }).data;
                actualizarTabla(datosTablaMatriz, 'Matriz');
            }).catch(error => console.error('Error al cargar el archivo CSV matriz.csv:', error));
    }

    function actualizarTabla(datos, nombreTabla) {
        let tabla = document.getElementById(nombreTabla);
        while (tabla.rows.length > 1) {
            tabla.deleteRow(1);
        }
        datos.forEach(d => {
            let fila = tabla.insertRow(-1);
            let orden = Object.keys(d); // Orden especificado para las celdas
            orden.forEach(key => {
                let celda = fila.insertCell(-1);
                celda.textContent = d[key];
            });
        });
    }

    function normalizar(str) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    document.getElementById('busqueda2').addEventListener('input', function () {
        const consulta = normalizar(this.value.toLowerCase());
        const datosFiltrados = datosTablaMatriz.filter(item =>
            Object.values(item).some(val =>
                typeof val === 'string' && normalizar(val.toLowerCase()).includes(consulta)
            )
        );
        actualizarTabla(datosFiltrados, 'Matriz');
    });

    document.getElementById('Limpiar3').addEventListener('click', function () {
        document.getElementById('busqueda2').value = '';
        document.getElementById('Matriz').scrollLeft = 0;
        document.getElementById('Matriz').scrollTop = 0;
        actualizarTabla(datosTablaMatriz, 'Matriz');
    });

    cargarDatosMatriz();
});