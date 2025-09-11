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

const itemsRef = firebase.database().ref('procedimientos');
var Size = Quill.import('attributors/style/size');
Size.whitelist = ['12px', '14px', '16px', '18px', '20px'];
Quill.register(Size, true);

const quill = new Quill('#descripcion-texto', {
    theme: 'snow',
    readOnly: true,
    modules: {
        toolbar: {
            container: [
                ['bold', 'italic', 'underline'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                [{ align: [] }],
                ['blockquote'],
                ['link'],
                ['image'],
                ['code-block'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'size': ['12px', '14px', '16px', '18px', '20px'] }],
                ['clean']
            ],
            handlers: {
                'image': function () {
                    const url = prompt('Introduce la URL de la imagen');
                    if (url) {
                        const range = this.quill.getSelection();
                        this.quill.insertEmbed(range.index, 'image', url, 'user');
                    }
                },
                'link': function () {
                    agregarAtajo();
                }
            }
        }
    }
});

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

    if (asesorActual === "Andrés_Felipe_Yepes_Tascón") {
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

    // Función para resaltar texto
    function resaltarTexto(texto, busqueda) {
        if (!busqueda.trim()) return texto;
        const regex = new RegExp(`(${busqueda.trim()})`, 'gi');
        return texto.replace(regex, '<mark>$1</mark>');
    }

    // Función para mostrar resultados de búsqueda
    function mostrarResultados(data, busqueda) {
        itemsContainer.innerHTML = '';
        enlacesContainer.innerHTML = '';

        if (!busqueda.trim()) {
            // Si no hay búsqueda, mostrar todos los items
            mostrarTodosLosItems(data);
            return;
        }

        const resultados = [];
        const busquedaLower = busqueda.toLowerCase().trim();

        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const itemData = data[key];
                const tituloLower = key.toLowerCase();
                const descripcionTexto = extraerTextoPlano(itemData.descripcion || '');
                const descripcionLower = descripcionTexto.toLowerCase();

                const coincidenciasEnTitulo = tituloLower.includes(busquedaLower);
                const coincidenciasEnDescripcion = descripcionLower.includes(busquedaLower);

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
                const busquedaIndex = textoCompleto.toLowerCase().indexOf(busquedaLower);
                
                if (busquedaIndex !== -1) {
                    const inicio = Math.max(0, busquedaIndex - 30);
                    const fin = Math.min(textoCompleto.length, busquedaIndex + busquedaLower.length + 30);
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
                const allTitles = document.querySelectorAll('.Items h4');
                allTitles.forEach(title => title.classList.remove('selected'));

                itemTitle.classList.add('selected');
                tituloTexto.textContent = resultado.key;
                quill.root.innerHTML = resultado.data.descripcion || "Descripción no disponible";

                enlacesContainer.innerHTML = '';

                for (const descripcion in resultado.data.enlaces) {
                    if (resultado.data.enlaces.hasOwnProperty(descripcion)) {
                        const url = resultado.data.enlaces[descripcion];

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
                currentKey = resultado.key;
                quill.enable(false);
                quillToolbar.style.display = 'none';
                editarBtn.style.display = asesorActual === "Andrés_Felipe_Yepes_Tascón" ? 'inline' : 'none';
                guardarBtn.style.display = 'none';
                agregarEnlaceBtn.style.display = 'none';
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
                    const allTitles = document.querySelectorAll('.Items h4');
                    allTitles.forEach(title => title.classList.remove('selected'));

                    itemTitle.classList.add('selected');
                    tituloTexto.textContent = key;
                    quill.root.innerHTML = itemData.descripcion || "Descripción no disponible";

                    enlacesContainer.innerHTML = '';

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
                    currentKey = key;
                    quill.enable(false);
                    quillToolbar.style.display = 'none';
                    editarBtn.style.display = asesorActual === "Andrés_Felipe_Yepes_Tascón" ? 'inline' : 'none';
                    guardarBtn.style.display = 'none';
                    agregarEnlaceBtn.style.display = 'none';
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

    quillToolbar.style.display = 'none';
    quill.enable(false);

    editarBtn.addEventListener('click', () => {
        if (asesorActual === "Andrés_Felipe_Yepes_Tascón") {
            quillToolbar.style.display = 'block';
            quill.enable(true);
            editarBtn.style.display = 'none';
            guardarBtn.style.display = 'inline';
            agregarEnlaceBtn.style.display = 'inline';

            // Agregar botón "Eliminar" aquí
            mostrarEnlaces(currentKey);
        }
    });

    guardarBtn.addEventListener('click', () => {
        if (currentKey) {
            const updatedDescription = quill.root.innerHTML;
            itemsRef.child(currentKey).update({ descripcion: updatedDescription })
                .then(() => {
                    alert("Descripción actualizada correctamente");
                    quill.enable(false);
                    quillToolbar.style.display = 'none';
                    guardarBtn.style.display = 'none';
                    agregarEnlaceBtn.style.display = 'none';
                    editarBtn.style.display = asesorActual === "Andrés_Felipe_Yepes_Tascón" ? 'inline' : 'none';

                    // Renderizar la lista de enlaces nuevamente
                    const enlacesContainer = document.getElementById('enlaces-container');
                    enlacesContainer.innerHTML = ''; // Limpiar contenedor de enlaces
                    mostrarEnlaces(currentKey); // Volver a renderizar la lista de enlaces
                })
                .catch(error => {
                    console.error("Error al actualizar la descripción:", error);
                });
        }
    });
    agregarEnlaceBtn.addEventListener('click', () => {
        if (quill.isEnabled()) {
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
        enlacesContainer.innerHTML = ''; // Limpiar contenedor de enlaces

        itemsRef.child(key).child('enlaces').once('value', (snapshot) => {
            const enlaces = snapshot.val();
            if (enlaces) {
                for (const descripcion in enlaces) {
                    const url = enlaces[descripcion];

                    const enlaceDiv = document.createElement('div');
                    enlaceDiv.classList.add('enlace-item');
                    enlaceDiv.classList.add('Modulo2'); // Clases CSS adicionales

                    // Crear un contenedor para el texto
                    const enlaceTextoDiv = document.createElement('div');
                    enlaceTextoDiv.textContent = descripcion;
                    enlaceTextoDiv.classList.add('enlace-texto');

                    // Evento para abrir el enlace
                    enlaceTextoDiv.addEventListener('click', () => {
                        if (!quill.isEnabled()) {
                            window.open(url, '_blank');
                        }
                    });

                    // Añadir el texto del enlace al div principal
                    enlaceDiv.appendChild(enlaceTextoDiv);

                    // Agregar el botón de eliminar solo si está en modo de edición
                    if (quill.isEnabled()) {
                        const eliminarEnlaceBtn = document.createElement('button');
                        eliminarEnlaceBtn.textContent = "X";
                        eliminarEnlaceBtn.classList.add('eliminar-enlace-btn'); // Clase CSS para el botón
                        eliminarEnlaceBtn.addEventListener('click', (event) => {
                            event.stopPropagation(); // Evitar que se abra el enlace al hacer clic en eliminar
                            eliminarEnlace(key, descripcion); // Llamar a la función para eliminar el enlace
                        });
                        enlaceDiv.appendChild(eliminarEnlaceBtn);
                    }

                    // Añadir el div completo al contenedor
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
        let itemNombre = '';
        let itemExiste = true;

        const checkItemExists = (itemNombreTrimmed) => {
            return itemsRef.child(itemNombreTrimmed).once('value').then(snapshot => snapshot.exists());
        };

        const promptForItemName = () => {
            itemNombre = prompt("Introduce el nombre del nuevo ítem:");
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
        let itemNombre = '';
        let itemExiste = true;

        const checkItemExists = (itemNombreTrimmed) => {
            return itemsRef.child(itemNombreTrimmed).once('value').then(snapshot => snapshot.exists());
        };

        const promptForItemName = () => {
            itemNombre = prompt("Introduce el nombre del ítem que deseas eliminar:");
            if (itemNombre === null || itemNombre.trim() === "") {
                alert("Acción cancelada.");
                return;
            }
            if (itemNombre && itemNombre.trim()) {
                const itemNombreTrimmed = itemNombre.trim();

                checkItemExists(itemNombreTrimmed).then(exists => {
                    if (exists) {
                        itemsRef.child(itemNombreTrimmed).remove().then(() => {
                            alert("Ítem eliminado: " + itemNombreTrimmed);
                        }).catch(error => {
                            console.error("Error al eliminar el ítem:", error);
                        });
                    } else {
                        alert("No se encontró un ítem con ese nombre.");
                        promptForItemName();
                    }
                });
            } else {
                alert("Por favor, introduce un nombre válido para el ítem.");
                promptForItemName();
            }
        };

        promptForItemName();
    });
};

setupButtons();

function agregarAtajo() {
    const choice = prompt('¿Deseas insertar un ítem o un enlace? (Escribe "item" o "enlace")');

    if (choice === 'item') {
        const itemText = prompt('Introduce el texto del ítem');
        if (itemText) {
            const range = quill.getSelection(); // Obtener la posición seleccionada en el editor
            if (range) {
                // Insertamos el texto como un enlace que no llevará a ningún lugar (href="#")
                const link = '#';
                quill.insertText(range.index, itemText, { 'link': link }); // Insertar el texto con formato de enlace
            } else {
                alert('Selecciona un lugar en el editor para insertar el ítem.');
            }
        }
    } else if (choice === 'enlace') {
        const url = prompt('Introduce la URL del enlace');
        if (url) {
            const range = quill.getSelection(); // Obtener la posición seleccionada en el editor
            if (range) {
                const text = prompt('Introduce el texto del enlace'); // Pedir el texto que será mostrado para el enlace
                if (text) {
                    quill.insertText(range.index, text, 'user'); // Insertar el texto del enlace en la posición seleccionada
                    quill.formatText(range.index, text.length, 'link', url); // Aplicar el formato de enlace al texto
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
document.querySelector('#descripcion-texto').addEventListener('click', function (event) {
    const target = event.target;
    if (target.tagName === 'A' && target.href.endsWith('#')) {
        event.preventDefault(); // Prevenir la redirección de la página
        const itemText = target.textContent; // Obtener el texto del enlace
        cambiarItem(itemText); // Ejecutar la lógica de cambio de ítem
    }
});

function cambiarItem(texto) {
    var listaItems = document.getElementsByClassName('Items');
    for (let i = 0; i < listaItems.length; i++) {
        if (texto === listaItems[i].textContent) {
            listaItems[i].click(); // Simula un clic en el ítem seleccionado
            break;
        }
    }
}