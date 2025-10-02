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

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();


const originalRef = db.ref.bind(db);
db.ref = function (path) {
    const ref = originalRef(path);

    const originalOnce = ref.once.bind(ref);
    ref.once = function (eventType) {
        window.fbMonitor.logRead(path);
        return originalOnce(eventType);
    };

    const originalOn = ref.on.bind(ref);
    ref.on = function (eventType, callback) {
        window.fbMonitor.logRead(path + ' (listener)');
        return originalOn(eventType, callback);
    };

    const originalSet = ref.set.bind(ref);
    ref.set = function (value) {
        window.fbMonitor.logWrite(path);
        return originalSet(value);
    };

    const originalUpdate = ref.update.bind(ref);
    ref.update = function (value) {
        window.fbMonitor.logWrite(path);
        return originalUpdate(value);
    };

    const originalRemove = ref.remove.bind(ref);
    ref.remove = function () {
        window.fbMonitor.logDelete(path);
        return originalRemove();
    };

    return ref;
};

const usuario = ["Andrés_Felipe_Yepes_Tascón", "Ocaris_David_Arango_Aguilar"];

const itemsRef = firebase.database().ref('procedimientos');

// Configuración de tamaños de fuente
const Size = Quill.import('attributors/style/size');
Size.whitelist = ['12px', '14px', '16px', '18px', '20px'];
Quill.register(Size, true);

// Función para verificar si quill-better-table está disponible y configurarlo
function initializeQuillWithTables() {
    let quillConfig = {
        theme: 'snow',
        readOnly: true,
        modules: {
            toolbar: {
                container: [
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    [{ 'size': ['12px', '14px', '16px', '18px', '20px'] }],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'align': [] }],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
                    [{ 'indent': '-1' }, { 'indent': '+1' }],
                    [{ 'script': 'sub' }, { 'script': 'super' }],
                    ['blockquote', 'code-block'],
                    ['link', 'image'],
                    ['clean']
                ],
                handlers: {
                    image: function () {
                        const url = prompt('Introduce la URL de la imagen');
                        if (url) {
                            const range = this.quill.getSelection();
                            if (range) {
                                this.quill.insertEmbed(range.index, 'image', url, 'user');
                            }
                        }
                    },
                    link: function () {
                        agregarAtajo();
                    }
                }
            }
        }
    };

    // Verificar si quill-better-table está disponible
    if (typeof QuillBetterTable !== 'undefined') {
        try {
            // Registrar el módulo de tablas
            Quill.register('modules/better-table', quillBetterTable);

            // Agregar configuración de tablas
            quillConfig.modules['better-table'] = {
                operationMenu: {
                    items: {
                        unmergeCells: {
                            text: 'Separar celdas'
                        },
                        insertColumnRight: {
                            text: 'Insertar columna a la derecha'
                        },
                        insertColumnLeft: {
                            text: 'Insertar columna a la izquierda'
                        },
                        insertRowUp: {
                            text: 'Insertar fila arriba'
                        },
                        insertRowDown: {
                            text: 'Insertar fila abajo'
                        },
                        mergeCells: {
                            text: 'Combinar celdas'
                        },
                        deleteColumn: {
                            text: 'Eliminar columna'
                        },
                        deleteRow: {
                            text: 'Eliminar fila'
                        },
                        deleteTable: {
                            text: 'Eliminar tabla'
                        }
                    }
                }
            };

            // Agregar botón de insertar tabla a la toolbar
            quillConfig.modules.toolbar.container.splice(-1, 0, ['insertTable']);

            // Agregar handler para insertar tablas
            quillConfig.modules.toolbar.handlers.insertTable = function () {
                const tableModule = this.quill.getModule('better-table');
                if (tableModule) {
                    const rows = prompt('¿Cuántas filas deseas? (por defecto 3)', '3');
                    const cols = prompt('¿Cuántas columnas deseas? (por defecto 3)', '3');

                    const numRows = parseInt(rows) || 3;
                    const numCols = parseInt(cols) || 3;

                    if (numRows > 0 && numCols > 0) {
                        tableModule.insertTable(numRows, numCols);
                    }
                }
            };

            console.log('quill-better-table configurado correctamente');
        } catch (error) {
            console.warn('Error al configurar quill-better-table:', error);
        }
    } else {
        console.warn('quill-better-table no está disponible, continuando sin soporte de tablas');
    }

    return new Quill('#descripcion-texto', quillConfig);
}

// Inicialización de Quill
const quill = initializeQuillWithTables();

// Variable global para almacenar todos los datos
let todosLosDatos = {};

const setupButtons = () => {
    const editarBtn = document.getElementById('editar-btn');
    const guardarBtn = document.getElementById('guardar-btn');
    const tituloTexto = document.getElementById('titulo-texto');
    const descripcionTexto = document.getElementById('descripcion-texto');
    const enlacesContainer = document.getElementById('enlaces-container');
    const quillToolbar = document.querySelector('.ql-toolbar');

    const agregarItemBtn = document.getElementById('agregar-item-btn');
    const eliminarItemBtn = document.getElementById('eliminar-item-btn');
    const itemsContainer = document.getElementById('items-container');
    const agregarEnlaceBtn = document.getElementById('agregar-enlace-btn');
    const busqProcedimientos = document.getElementById('busqProcedimientos');

    let currentKey = null;
    const asesorActual = localStorage.getItem("nombreAsesorActual");

    if (usuario.includes(asesorActual)) {
        itemsContainer.style.height = '400px';
        agregarItemBtn.style.display = 'inline';
        eliminarItemBtn.style.display = 'inline';
        editarBtn.style.display = 'inline';
    } else {
        itemsContainer.style.height = '435px';
        agregarItemBtn.style.display = 'none';
        eliminarItemBtn.style.display = 'none';
        editarBtn.style.display = 'none';
    }

    // Función para extraer texto plano del HTML
    function extraerTextoPlano(html) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || '';
    }

    // Función para normalizar texto (quitar acentos y caracteres especiales)
    function normalizarTexto(texto) {
        return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }

    // Función para resaltar texto
    function resaltarTexto(texto, busqueda) {
        if (!busqueda.trim()) return texto;
        const regex = new RegExp(`(${busqueda.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return texto.replace(regex, '<mark>$1</mark>');
    }

    // Función para manejar clic en un item (común para búsqueda y vista normal)
    function manejarClicItem(key, itemData, itemTitle) {
        tituloTexto.textContent = key;

        // Verificar que quill esté disponible antes de usar
        if (quill && quill.root) {
            quill.root.innerHTML = itemData.descripcion || "Descripción no disponible";
        }

        // Limpiar el campo de búsqueda
        busqProcedimientos.value = '';

        // Mostrar todos los items nuevamente después de un pequeño retraso
        // y mantener la selección
        setTimeout(() => {
            mostrarResultados(todosLosDatos, '');
            // Después de mostrar todos los items, seleccionar el correcto
            setTimeout(() => {
                const allTitles = document.querySelectorAll('.Items h4');
                allTitles.forEach(title => {
                    title.classList.remove('selected');
                    if (title.textContent === key) {
                        title.classList.add('selected');
                    }
                });
            }, 10);
        }, 50);

        enlacesContainer.innerHTML = '';

        if (itemData.enlaces) {
            for (const descripcion in itemData.enlaces) {
                if (itemData.enlaces.hasOwnProperty(descripcion)) {
                    const url = itemData.enlaces[descripcion];

                    const enlaceDiv = document.createElement('div');
                    enlaceDiv.classList.add('enlace-item');
                    enlaceDiv.classList.add('Modulo2');

                    if (url) {
                        enlaceDiv.textContent = descripcion;
                        enlaceDiv.addEventListener('click', () => {
                            window.open(url, '_blank');
                        });
                    } else {
                        enlaceDiv.textContent = "Enlace no disponible";
                    }

                    enlacesContainer.appendChild(enlaceDiv);
                }
            }
        }

        currentKey = key;

        if (quill) {
            quill.enable(false);
        }

        if (quillToolbar) {
            quillToolbar.style.display = 'none';
        }

        editarBtn.style.display = usuario.includes(asesorActual) ? 'inline' : 'none';
        guardarBtn.style.display = 'none';
        agregarEnlaceBtn.style.display = 'none';
    }

    // Función para mostrar resultados de búsqueda
    function mostrarResultados(data, busqueda) {
        itemsContainer.innerHTML = '';

        if (!busqueda.trim()) {
            // Si no hay búsqueda, mostrar todos los items
            mostrarTodosLosItems(data);
            return;
        }

        const resultados = [];
        const busquedaNormalizada = normalizarTexto(busqueda.trim());

        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const itemData = data[key];
                const tituloNormalizado = normalizarTexto(key);
                const descripcionTexto = extraerTextoPlano(itemData.descripcion || '');
                const descripcionNormalizada = normalizarTexto(descripcionTexto);

                const coincidenciasEnTitulo = tituloNormalizado.includes(busquedaNormalizada);
                const coincidenciasEnDescripcion = descripcionNormalizada.includes(busquedaNormalizada);

                if (coincidenciasEnTitulo || coincidenciasEnDescripcion) {
                    resultados.push({
                        key: key,
                        data: itemData,
                        coincidenciasEnTitulo,
                        coincidenciasEnDescripcion,
                        descripcionTexto
                    });
                }
            }
        }

        if (resultados.length === 0) {
            const noResultsDiv = document.createElement('div');
            noResultsDiv.innerHTML = `<p style="text-align: center; color: #666; padding: 20px;">No se encontraron resultados para "${busqueda}"</p>`;
            itemsContainer.appendChild(noResultsDiv);
            return;
        }

        // Mostrar resultados
        resultados.forEach(resultado => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('Items');

            const itemTitle = document.createElement('h4');
            if (resultado.coincidenciasEnTitulo) {
                itemTitle.innerHTML = resaltarTexto(resultado.key, busqueda);
            } else {
                itemTitle.textContent = resultado.key;
            }

            const infoDiv = document.createElement('div');
            infoDiv.style.fontSize = '12px';
            infoDiv.style.color = '#666';
            infoDiv.style.marginTop = '5px';

            const coincidencias = [];
            if (resultado.coincidenciasEnTitulo) {
                coincidencias.push('título');
            }
            if (resultado.coincidenciasEnDescripcion) {
                coincidencias.push('contenido');
            }

            infoDiv.innerHTML = `Encontrado en: ${coincidencias.join(', ')}`;

            // Mostrar preview del contenido si hay coincidencias
            if (resultado.coincidenciasEnDescripcion) {
                const preview = document.createElement('div');
                preview.style.fontSize = '11px';
                preview.style.color = '#888';
                preview.style.marginTop = '3px';
                preview.style.fontStyle = 'italic';

                const textoCompleto = resultado.descripcionTexto;
                const busquedaNormalizadaIndex = normalizarTexto(textoCompleto).indexOf(busquedaNormalizada);

                if (busquedaNormalizadaIndex !== -1) {
                    const inicio = Math.max(0, busquedaNormalizadaIndex - 30);
                    const fin = Math.min(textoCompleto.length, busquedaNormalizadaIndex + busqueda.trim().length + 30);
                    let fragmento = textoCompleto.substring(inicio, fin);

                    if (inicio > 0) fragmento = '...' + fragmento;
                    if (fin < textoCompleto.length) fragmento = fragmento + '...';

                    preview.innerHTML = resaltarTexto(fragmento, busqueda);
                    infoDiv.appendChild(preview);
                }
            }

            itemDiv.appendChild(itemTitle);
            itemDiv.appendChild(infoDiv);

            itemDiv.addEventListener('click', () => {
                manejarClicItem(resultado.key, resultado.data, itemTitle);
            });

            itemsContainer.appendChild(itemDiv);
        });
    }

    // Función para mostrar todos los items (sin búsqueda)
    function mostrarTodosLosItems(data) {
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const itemData = data[key];
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('Items');
                const itemTitle = document.createElement('h4');
                itemTitle.textContent = key;

                itemDiv.appendChild(itemTitle);

                itemDiv.addEventListener('click', () => {
                    manejarClicItem(key, itemData, itemTitle);
                });

                itemsContainer.appendChild(itemDiv);
            }
        }
    }

    // Evento de búsqueda
    busqProcedimientos.addEventListener('input', (e) => {
        const busqueda = e.target.value;
        mostrarResultados(todosLosDatos, busqueda);
    });

    // Listener principal para los datos de Firebase
    itemsRef.on('value', (snapshot) => {
        todosLosDatos = snapshot.val() || {};
        const busquedaActual = busqProcedimientos.value;
        mostrarResultados(todosLosDatos, busquedaActual);
    });

    if (quillToolbar) {
        quillToolbar.style.display = 'none';
    }

    if (quill) {
        quill.enable(false);
    }

    editarBtn.addEventListener('click', () => {
        if (usuario.includes(asesorActual) && quill) {
            if (quillToolbar) {
                quillToolbar.style.display = 'block';
            }
            quill.enable(true);
            editarBtn.style.display = 'none';
            guardarBtn.style.display = 'inline';
            agregarEnlaceBtn.style.display = 'inline';
            mostrarEnlaces(currentKey);
        }
    });

    guardarBtn.addEventListener('click', () => {
        if (currentKey && quill) {
            const updatedDescription = quill.root.innerHTML;
            itemsRef.child(currentKey).update({ descripcion: updatedDescription })
                .then(() => {
                    alert("Descripción actualizada correctamente");
                    quill.enable(false);
                    if (quillToolbar) {
                        quillToolbar.style.display = 'none';
                    }
                    guardarBtn.style.display = 'none';
                    agregarEnlaceBtn.style.display = 'none';
                    editarBtn.style.display = usuario.includes(asesorActual) ? 'inline' : 'none';

                    // Renderizar la lista de enlaces nuevamente
                    const enlacesContainer = document.getElementById('enlaces-container');
                    enlacesContainer.innerHTML = '';
                    mostrarEnlaces(currentKey);
                })
                .catch(error => {
                    console.error("Error al actualizar la descripción:", error);
                });
        }
    });

    agregarEnlaceBtn.addEventListener('click', () => {
        if (quill && quill.isEnabled()) {
            const descripcionEnlace = prompt("Introduce la descripción del enlace:");
            if (descripcionEnlace === null || descripcionEnlace.trim() === "") {
                alert("No se ingresó ningún enlace.");
                return;
            }

            const urlEnlace = prompt("Introduce la URL del enlace:");
            if (urlEnlace === null || urlEnlace.trim() === "") {
                alert("No se ingresó ninguna URL.");
                return;
            }
            const enlacesRef = itemsRef.child(currentKey).child('enlaces');

            enlacesRef.child(descripcionEnlace.trim()).set(urlEnlace.trim())
                .then(() => {
                    alert("Enlace agregado con éxito.");
                    mostrarEnlaces(currentKey);
                })
                .catch(error => {
                    console.error("Error al agregar el enlace:", error);
                });
        } else {
            alert("Debes estar en modo de edición para agregar enlaces.");
        }
    });

    function mostrarEnlaces(key) {
        const enlacesContainer = document.getElementById('enlaces-container');
        enlacesContainer.innerHTML = '';

        itemsRef.child(key).child('enlaces').once('value', (snapshot) => {
            const enlaces = snapshot.val();
            if (enlaces) {
                for (const descripcion in enlaces) {
                    const url = enlaces[descripcion];

                    const enlaceDiv = document.createElement('div');
                    enlaceDiv.classList.add('enlace-item');
                    enlaceDiv.classList.add('Modulo2');

                    // Crear un contenedor para el texto
                    const enlaceTextoDiv = document.createElement('div');
                    enlaceTextoDiv.textContent = descripcion;
                    enlaceTextoDiv.classList.add('enlace-texto');

                    // Evento para abrir el enlace
                    enlaceTextoDiv.addEventListener('click', () => {
                        if (!quill || !quill.isEnabled()) {
                            window.open(url, '_blank');
                        }
                    });

                    enlaceDiv.appendChild(enlaceTextoDiv);

                    // Agregar el botón de eliminar solo si está en modo de edición
                    if (quill && quill.isEnabled()) {
                        const eliminarEnlaceBtn = document.createElement('button');
                        eliminarEnlaceBtn.textContent = "X";
                        eliminarEnlaceBtn.classList.add('eliminar-enlace-btn');
                        eliminarEnlaceBtn.addEventListener('click', (event) => {
                            event.stopPropagation();
                            eliminarEnlace(key, descripcion);
                        });
                        enlaceDiv.appendChild(eliminarEnlaceBtn);
                    }

                    enlacesContainer.appendChild(enlaceDiv);
                }
            }
        });
    }

    function eliminarEnlace(key, descripcion) {
        if (confirm(`¿Estás seguro de que deseas eliminar el enlace "${descripcion}"?`)) {
            const enlaceRef = itemsRef.child(key).child('enlaces').child(descripcion);
            enlaceRef.remove()
                .then(() => {
                    alert(`El enlace "${descripcion}" ha sido eliminado.`);
                    mostrarEnlaces(key);
                })
                .catch(error => {
                    console.error("Error al eliminar el enlace:", error);
                });
        }
    }

    agregarItemBtn.addEventListener('click', () => {
        const checkItemExists = (itemNombreTrimmed) => {
            return itemsRef.child(itemNombreTrimmed).once('value').then(snapshot => snapshot.exists());
        };

        const promptForItemName = () => {
            const itemNombre = prompt("Introduce el nombre del nuevo ítem:");
            if (itemNombre === null || itemNombre.trim() === "") {
                alert("Acción cancelada.");
                return;
            }

            const itemNombreTrimmed = itemNombre.trim();

            checkItemExists(itemNombreTrimmed).then(exists => {
                if (exists) {
                    alert("Ya existe un ítem con ese nombre. Por favor, elige otro.");
                    promptForItemName();
                } else {
                    itemsRef.child(itemNombreTrimmed).set({
                        descripcion: '',
                        enlaces: {}
                    }).then(() => {
                        alert("Ítem agregado: " + itemNombreTrimmed);
                    }).catch(error => {
                        console.error("Error al agregar el ítem:", error);
                    });
                }
            });
        };

        promptForItemName();
    });

    eliminarItemBtn.addEventListener('click', () => {
        const checkItemExists = (itemNombreTrimmed) => {
            return itemsRef.child(itemNombreTrimmed).once('value').then(snapshot => snapshot.exists());
        };

        const promptForItemName = () => {
            const itemNombre = prompt("Introduce el nombre del ítem que deseas eliminar:");
            if (itemNombre === null || itemNombre.trim() === "") {
                alert("Acción cancelada.");
                return;
            }

            const itemNombreTrimmed = itemNombre.trim();

            checkItemExists(itemNombreTrimmed).then(exists => {
                if (exists) {
                    if (confirm(`¿Estás seguro de que deseas eliminar "${itemNombreTrimmed}"?`)) {
                        itemsRef.child(itemNombreTrimmed).remove().then(() => {
                            alert("Ítem eliminado: " + itemNombreTrimmed);
                        }).catch(error => {
                            console.error("Error al eliminar el ítem:", error);
                        });
                    }
                } else {
                    alert("No se encontró un ítem con ese nombre.");
                    promptForItemName();
                }
            });
        };

        promptForItemName();
    });
};

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    setupButtons();
});

function agregarAtajo() {
    const choice = prompt('¿Deseas insertar un ítem o un enlace? (Escribe "item" o "enlace")');

    if (choice === 'item') {
        const itemText = prompt('Introduce el texto del ítem');
        if (itemText && quill) {
            const range = quill.getSelection();
            if (range) {
                const link = '#';
                quill.insertText(range.index, itemText, { 'link': link });
            } else {
                alert('Selecciona un lugar en el editor para insertar el ítem.');
            }
        }
    } else if (choice === 'enlace') {
        const url = prompt('Introduce la URL del enlace');
        if (url && quill) {
            const range = quill.getSelection();
            if (range) {
                const text = prompt('Introduce el texto del enlace');
                if (text) {
                    quill.insertText(range.index, text, 'user');
                    quill.formatText(range.index, text.length, 'link', url);
                } else {
                    alert('No se ingresó ningún texto para el enlace.');
                }
            } else {
                alert('Selecciona un lugar en el editor para insertar el enlace.');
            }
        }
    } else {
        alert('Opción no válida. Por favor, escribe "item" o "enlace".');
    }
}

// Delegación de eventos para todos los enlaces dentro del editor
document.addEventListener('DOMContentLoaded', () => {
    const descripcionTexto = document.querySelector('#descripcion-texto');
    if (descripcionTexto) {
        descripcionTexto.addEventListener('click', function (event) {
            const target = event.target;
            if (target.tagName === 'A' && target.href && target.href.endsWith('#')) {
                event.preventDefault();
                const itemText = target.textContent;
                cambiarItem(itemText);
            }
        });
    }
});

function cambiarItem(texto) {
    const listaItems = document.getElementsByClassName('Items');
    for (let i = 0; i < listaItems.length; i++) {
        if (texto === listaItems[i].textContent) {
            listaItems[i].click();
            break;
        }
    }
}