// Copyright (c) 2024 Andrés Felipe Yepes Tascón
// Licensed under the MIT License. See LICENSE file for details.
const firebaseConfig = {
    apiKey: "AIzaSyAw5z5-aKicJ78N1UahQ-Lu_u7WP6MNVRE",
    authDomain: "playgroundbdstop.firebaseapp.com",
    databaseURL: "https://playgroundbdstop-default-rtdb.firebaseio.com",
    projectId: "playgroundbdstop",
    storageBucket: "playgroundbdstop.appspot.com",
    messagingSenderId: "808082296806",
    appId: "1:808082296806:web:c1d0dc3c2fc5fbf6c9d027"
};

firebase.initializeApp(firebaseConfig);

var storage = firebase.storage();
var storageRef = storage.ref();

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // Usuario autenticado, listar archivos
        storageRef.listAll().then(function (result) {
            result.items.forEach(function (imageRef) {
                var fileName = imageRef.name;

                var newDiv = document.createElement("div");
                newDiv.className = "Modulo2";

                newDiv.onclick = function () {
                    imageRef.getDownloadURL().then(function (url) {
                        window.open(url, '_blank');
                    }).catch(function (error) {
                        console.log("Error al obtener la URL de descarga: ", error);
                    });
                };

                var newH2 = document.createElement("h2");
                newH2.textContent = fileName;
                newDiv.appendChild(newH2);

                document.getElementById("Gpdf").appendChild(newDiv);
            });

            // Configurar búsqueda después de agregar elementos
            configurarBusqueda();
        }).catch(function (error) {
            console.log("Error al listar los archivos: ", error);
        });
    } else {
        console.log('No user is signed in');
    }
});

function configurarBusqueda() {
    var input = document.getElementById('busqueda3');
    var clearButton = document.getElementById('Limpiar4');
    var pdfs = Array.from(document.getElementsByClassName('Modulo2'));

    input.addEventListener('keyup', function () {
        console.log("Keyup event triggered"); // Para depuración
        var filter = input.value.toUpperCase();
        pdfs.forEach(function (pdf) {
            var title = pdf.getElementsByTagName('h2')[0];
            if (title.innerHTML.toUpperCase().indexOf(filter) > -1) {
                pdf.style.display = "";
            } else {
                pdf.style.display = "none";
            }
        });
    });

    clearButton.addEventListener('click', function () {
        console.log("Clear button clicked"); // Para depuración
        input.value = '';
        pdfs.forEach(function (pdf) {
            pdf.style.display = "";
        });
    });
}


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
            Object.values(item).some(val => val && normalizar(val.toLowerCase()).includes(consulta))
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
        fetch('MatrizV4.1.csv')
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
                    dynamicTyping: true,
                    delimiter: ';' // Agrega esta línea para especificar el punto y coma como delimitador
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

function minuta() {
    var listaTiendas = document.getElementById('ListaTiendas').value;
    var listaTiendasJuntasComa = document.getElementById('ListaTiendasJuntasComa');
    var listaTiendasJuntasPuntoComa = document.getElementById('ListaTiendasJuntasPuntoComa');
    var formattedStringComa = listaTiendas.split('\n').join(',');
    var formattedStringPuntoComa = listaTiendas.split('\n').join(';');
    listaTiendasJuntasComa.value = formattedStringComa;
    listaTiendasJuntasPuntoComa.value = formattedStringPuntoComa;

    // Contar la cantidad de tiendas
    var cantidadTiendas = formattedStringPuntoComa.split(';').length;
    document.getElementById('texto').innerHTML = "Cantidad: " + cantidadTiendas;
}

document.getElementById('convertir').addEventListener('click', minuta);

document.getElementById('limpiarMinuta').addEventListener('click', function () {
    document.getElementById('ListaTiendas').value = '';
    document.getElementById('ListaTiendasJuntasComa').value = '';
    document.getElementById('ListaTiendasJuntasPuntoComa').value = '';
    document.getElementById('texto').innerText = '';
});

let datosTablaAdministrativas = [];

document.addEventListener("DOMContentLoaded", function () {
    function cargarDatosAdministrativas() {
        fetch('Administrativas.csv')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error HTTP: ' + response.status);
                }
                return response.text();
            })
            .then(data => {
                datosTablaAdministrativas = Papa.parse(data, {
                    header: true,
                    skipEmptyLines: true,
                    dynamicTyping: true
                }).data;
                actualizarTabla(datosTablaAdministrativas, 'Administrativas');
            }).catch(error => console.error('Error al cargar el archivo CSV administrativas.csv:', error));
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

    document.getElementById('busqueda4').addEventListener('input', function () {
        const consulta = normalizar(this.value.toLowerCase());
        const datosFiltrados = datosTablaAdministrativas.filter(item =>
            Object.values(item).some(val =>
                typeof val === 'string' && normalizar(val.toLowerCase()).includes(consulta)
            )
        );
        actualizarTabla(datosFiltrados, 'Administrativas');
    });

    document.getElementById('Limpiar5').addEventListener('click', function () {
        document.getElementById('busqueda4').value = '';
        document.getElementById('Administrativas').scrollLeft = 0;
        document.getElementById('Administrativas').scrollTop = 0;
        actualizarTabla(datosTablaAdministrativas, 'Administrativas');
    });

    cargarDatosAdministrativas();
});


function nombreUsuario() {
    var usuario = firebase.auth().currentUser;
    if (usuario) {
        var usuariocorto = usuario.displayName || usuario.email || usuario.uid;
        if (usuariocorto.includes("@playground.com")) {
            usuariocorto = usuariocorto.replace("@playground.com", "");
        }
        var elementos = document.getElementsByClassName('nombreUsuario');
        for (var i = 0; i < elementos.length; i++) {
            elementos[i].innerHTML = usuariocorto;
        }
    } else {
        console.log("No hay un usuario autenticado.");
    }
}

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        nombreUsuario();
        console.log("Nadie ha iniciado sesión.");
    }
});
document.addEventListener('DOMContentLoaded', function () {
    const modulos = document.querySelectorAll('.Modulo');

    modulos.forEach(modulo => {
        const titulo = modulo.querySelector('h1, h2');
        if (titulo) {
            // Asegúrate de que el contenedor de contenido exista.
            let contenidoDiv = modulo.querySelector('.module-content');
            if (!contenidoDiv) {
                contenidoDiv = document.createElement('div');
                contenidoDiv.className = 'module-content';
                const elementosAMover = [];
                let siguienteElemento = titulo.nextElementSibling;
                while (siguienteElemento) {
                    elementosAMover.push(siguienteElemento);
                    siguienteElemento = siguienteElemento.nextElementSibling;
                }
                elementosAMover.forEach(elemento => {
                    contenidoDiv.appendChild(elemento);
                });
                modulo.appendChild(contenidoDiv);
            }

            // Colapsa los módulos al cargar la página.
            modulo.classList.add('collapsed');

            titulo.addEventListener('click', function () {
                // Encuentra el contenedor de la columna más cercano.
                const columnaPadre = modulo.closest('.columna');
                if (columnaPadre) {
                    // Guarda el estado actual del módulo antes de hacer cambios
                    const estabaColapsado = modulo.classList.contains('collapsed');

                    // Selecciona solo los módulos dentro de esa columna.
                    const modulosEnMismaColumna = columnaPadre.querySelectorAll('.Modulo');

                    // Colapsa TODOS los módulos de la misma columna (incluyendo el actual)
                    modulosEnMismaColumna.forEach(otroModulo => {
                        otroModulo.classList.add('collapsed');
                    });

                    // Si el módulo estaba colapsado, lo abrimos
                    if (estabaColapsado) {
                        modulo.classList.remove('collapsed');
                    }
                    // Si estaba abierto, se queda cerrado (ya se cerró en el forEach anterior)
                }
            });
        }
    });
});

// Sistema de reordenamiento de módulos con modal y drag & drop
// Agregar al final de scriptHerramientas.js

class ModuleOrderManager {
    constructor() {
        this.storageKey = 'moduleOrder';
        this.defaultOrder = {
            columna1: ['M1', 'M2', 'M3', 'M4'],
            columna2: ['M5', 'M6', 'M7', 'M8']
        };
        this.currentOrder = this.loadOrder();
        this.moduleNames = {
            'M1': 'Contactos de las tiendas',
            'M2': 'Matriz de escalamiento',
            'M3': 'Descuentos',
            'M4': 'Conversor de Minuta',
            'M5': 'Enlaces',
            'M6': 'Instructivos',
            'M7': 'Extensiones Administrativas',
            'M8': 'Enlaces de los asesores'
        };

        // Aplicar orden guardado al cargar
        this.applyOrder();
        this.createModal();
    }

    loadOrder() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error al cargar el orden:', error);
        }
        return JSON.parse(JSON.stringify(this.defaultOrder));
    }

    saveOrder() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.currentOrder));
            console.log('Orden guardado exitosamente');
        } catch (error) {
            console.error('Error al guardar el orden:', error);
        }
    }

    applyOrder() {
        const columnas = document.querySelectorAll('.columna');

        ['columna1', 'columna2'].forEach((columnaKey, index) => {
            const columna = columnas[index];
            const order = this.currentOrder[columnaKey];

            order.forEach(moduleId => {
                const module = document.getElementById(moduleId);
                if (module) {
                    columna.appendChild(module);
                }
            });
        });
    }

    resetOrder() {
        this.currentOrder = JSON.parse(JSON.stringify(this.defaultOrder));
        this.applyOrder();
        this.saveOrder();
        this.updateModalLists();
    }

    createModal() {
        const modalHTML = `
            <div id="modalReorder" class="modal" style="display: none;">
                <div class="modal-content" style="width: 80%; max-width: 900px; background-color: var(--color-fondo);">
                    <span class="close" id="closeModalReorder">&times;</span>
                    <h2 style="text-align: center; margin-bottom: 20px;">Organizar Módulos</h2>
                    <div style="display: flex; gap: 20px; justify-content: center; align-items: stretch;">
                        <div style="flex: 1;">
                            <h3 style="text-align: center; background-color: var(--color-primario); color: white; padding: 10px; border-radius: 5px;">Columna Izquierda</h3>
                            <ul id="listColumna1" class="sortable-list"></ul>
                        </div>
                        <div style="flex: 1;">
                            <h3 style="text-align: center; background-color: var(--color-primario); color: white; padding: 10px; border-radius: 5px;">Columna Derecha</h3>
                            <ul id="listColumna2" class="sortable-list"></ul>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                        <button id="btnSaveOrder" style="padding: 10px 20px; background-color: var(--color-primario); color: white; font-weight: bold;">Guardar</button>
                        <button id="btnResetOrder" style="padding: 10px 20px;">Restaurar Original</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.setupModalEvents();
        this.updateModalLists();
    }

    setupModalEvents() {
        const modal = document.getElementById('modalReorder');
        const closeBtn = document.getElementById('closeModalReorder');
        const btnSave = document.getElementById('btnSaveOrder');
        const btnReset = document.getElementById('btnResetOrder');

        closeBtn.onclick = () => {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        };

        window.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        };

        btnSave.onclick = () => {
            this.applyOrder();
            this.saveOrder();
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        };

        btnReset.onclick = () => {
            if (confirm('¿Estás seguro de que quieres restaurar el orden original?')) {
                this.resetOrder();
            }
        };

        // Setup drag and drop
        this.setupDragAndDrop('listColumna1');
        this.setupDragAndDrop('listColumna2');
    }

    setupDragAndDrop(listId) {
        const list = document.getElementById(listId);

        list.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(list, e.clientY);
            const dragging = document.querySelector('.dragging');
            if (afterElement == null) {
                list.appendChild(dragging);
            } else {
                list.insertBefore(dragging, afterElement);
            }
        });

        list.addEventListener('drop', (e) => {
            e.preventDefault();
            this.updateOrderFromLists();
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    updateModalLists() {
        const list1 = document.getElementById('listColumna1');
        const list2 = document.getElementById('listColumna2');

        list1.innerHTML = '';
        list2.innerHTML = '';

        this.currentOrder.columna1.forEach(moduleId => {
            const li = this.createListItem(moduleId);
            list1.appendChild(li);
        });

        this.currentOrder.columna2.forEach(moduleId => {
            const li = this.createListItem(moduleId);
            list2.appendChild(li);
        });
    }

    createListItem(moduleId) {
        const li = document.createElement('li');
        li.draggable = true;
        li.dataset.moduleId = moduleId;
        li.textContent = this.moduleNames[moduleId];
        li.style.cssText = `
            padding: 12px;
            margin: 5px 0;
            background-color: var(--color-secundario);
            border: 1px solid #000;
            border-radius: 5px;
            cursor: move;
            user-select: none;
            list-style: none;
        `;

        li.addEventListener('dragstart', () => {
            li.classList.add('dragging');
            li.style.opacity = '0.5';
        });

        li.addEventListener('dragend', () => {
            li.classList.remove('dragging');
            li.style.opacity = '1';
        });

        return li;
    }

    updateOrderFromLists() {
        const list1 = document.getElementById('listColumna1');
        const list2 = document.getElementById('listColumna2');

        this.currentOrder.columna1 = Array.from(list1.children).map(li => li.dataset.moduleId);
        this.currentOrder.columna2 = Array.from(list2.children).map(li => li.dataset.moduleId);
    }

    openModal() {
        const modal = document.getElementById('modalReorder');
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
        this.updateModalLists();
    }

    createControlInterface() {
        const controlDiv = document.createElement('div');
        controlDiv.style.cssText = `
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            justify-content: flex-end;
        `;

        const btnReorder = document.createElement('button');
        btnReorder.textContent = 'Reordenar Módulos';
        btnReorder.style.cssText = 'padding: 10px 20px; font-weight: bold; border-radius: 5px; border: 1px solid #000; cursor: pointer;';
        btnReorder.onclick = () => this.openModal();

        controlDiv.appendChild(btnReorder);

        const titulo = document.getElementById('Titulo');
        if (titulo && titulo.parentNode) {
            titulo.parentNode.insertBefore(controlDiv, titulo.nextSibling);
        }
    }
}

// Agregar estilos para el modal y las listas
const styles = document.createElement('style');
styles.textContent = `
    .sortable-list {
        min-height: 300px;
        padding: 10px;
        background-color: var(--color-primario);
        border: 2px dashed #ccc;
        border-radius: 5px;
        margin: 0;
    }

    .sortable-list li:hover {
        background-color: #e0e0e0;
    }

    .dragging {
        opacity: 0.5;
    }
`;
document.head.appendChild(styles);

// Inicializar el sistema cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    const orderManager = new ModuleOrderManager();
    orderManager.createControlInterface();

    window.orderManager = orderManager;
});