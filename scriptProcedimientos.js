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
Quill.register(Size, true); // Registrar la lista blanca

// Inicializar Quill
// Inicializar Quill
const quill = new Quill('#descripcion-texto', {
    theme: 'snow',
    readOnly: true, // Inicialmente en modo solo lectura
    modules: {
        toolbar: {
            container: [
                ['bold', 'italic', 'underline'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                [{ align: [] }],
                ['blockquote'],
                ['link'],
                ['image'], // El botón de imagen
                ['code-block'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'size': ['12px', '14px', '16px', '18px', '20px'] }], // Tamaños personalizados
                ['clean']
            ],
            // Handlers se define dentro del toolbar
            handlers: {
                'image': function () {
                    const url = prompt('Introduce la URL de la imagen');
                    if (url) {
                        const range = this.quill.getSelection();
                        this.quill.insertEmbed(range.index, 'image', url, 'user');
                    }
                }
            }
        }
    }
});
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

    let currentKey = null;
    const asesorActual = localStorage.getItem("nombreAsesorActual");

    // Ajustar el height del contenedor basado en el valor del localStorage
    if (asesorActual === "Andrés_Felipe_Yepes_Tascón") {
        itemsContainer.style.height = '400px';
        agregarItemBtn.style.display = 'inline';
        eliminarItemBtn.style.display = 'inline';
        editarBtn.style.display = 'inline'; // Mostrar el botón de editar
    } else {
        itemsContainer.style.height = '435px';
        agregarItemBtn.style.display = 'none';
        eliminarItemBtn.style.display = 'none';
        editarBtn.style.display = 'none'; // Ocultar el botón de editar
    }

    itemsRef.on('value', (snapshot) => {
        itemsContainer.innerHTML = '';
        enlacesContainer.innerHTML = '';

        const data = snapshot.val();

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

                    // Set the current key for editing
                    currentKey = key;

                    // Enable/Disable edit and save buttons
                    editarBtn.style.display = asesorActual === "Andrés_Felipe_Yepes_Tascón" ? 'inline' : 'none';
                    guardarBtn.style.display = 'none';
                });

                itemsContainer.appendChild(itemDiv);
            }
        }
    });

    // Ocultar opciones de Quill al cargar la página
    quillToolbar.style.display = 'none'; // Ocultar la barra de herramientas de Quill
    quill.enable(false); // Deshabilitar Quill

    // Edit button click handler
    editarBtn.addEventListener('click', () => {
        if (asesorActual === "Andrés_Felipe_Yepes_Tascón") {
            quillToolbar.style.display = 'block'; // Mostrar la barra de herramientas de Quill
            quill.enable(true); // Habilitar edición
            editarBtn.style.display = 'none'; // Ocultar botón de editar
            guardarBtn.style.display = 'inline'; // Mostrar botón de guardar
        }
    });

    // Save button click handler
    guardarBtn.addEventListener('click', () => {
        if (currentKey) {
            const updatedDescription = quill.root.innerHTML;
            itemsRef.child(currentKey).update({ descripcion: updatedDescription })
                .then(() => {
                    alert("Descripción actualizada correctamente");
                    quill.enable(false); // Deshabilitar edición
                    quillToolbar.style.display = 'none'; // Ocultar la barra de herramientas de Quill
                    guardarBtn.style.display = 'none'; // Ocultar botón de guardar
                    editarBtn.style.display = asesorActual === "Andrés_Felipe_Yepes_Tascón" ? 'inline' : 'none'; // Ajustar visibilidad del botón de editar
                })
                .catch(error => {
                    console.error("Error al actualizar la descripción:", error);
                });
        }
    });

    // Agregar item button click handler
    agregarItemBtn.addEventListener('click', () => {
        let itemNombre = '';
        let itemExiste = true;

        const checkItemExists = (itemNombreTrimmed) => {
            return itemsRef.child(itemNombreTrimmed).once('value').then(snapshot => snapshot.exists());
        };

        const promptForItemName = () => {
            itemNombre = prompt("Introduce el nombre del nuevo ítem:");

            if (itemNombre && itemNombre.trim()) {
                const itemNombreTrimmed = itemNombre.trim();

                checkItemExists(itemNombreTrimmed).then(exists => {
                    if (exists) {
                        alert("Ya existe un ítem con ese nombre. Por favor, elige otro.");
                        promptForItemName(); // Re-pedir el nombre
                    } else {
                        // Si no existe, agregar el nuevo ítem
                        itemsRef.child(itemNombreTrimmed).set({
                            descripcion: '',  // Descripción vacía
                            enlaces: {}       // Enlaces vacíos (opcional)
                        }).then(() => {
                            alert("Ítem agregado: " + itemNombreTrimmed);
                        }).catch(error => {
                            console.error("Error al agregar el ítem:", error);
                        });
                    }
                });
            } else {
                alert("Por favor, introduce un nombre válido para el ítem.");
                promptForItemName(); // Re-pedir el nombre si no es válido
            }
        };

        promptForItemName();
    });

    // Eliminar item button click handler
    eliminarItemBtn.addEventListener('click', () => {
        let itemNombre = '';
        let itemExiste = true;

        const checkItemExists = (itemNombreTrimmed) => {
            return itemsRef.child(itemNombreTrimmed).once('value').then(snapshot => snapshot.exists());
        };

        const promptForItemName = () => {
            itemNombre = prompt("Introduce el nombre del ítem que deseas eliminar:");

            if (itemNombre && itemNombre.trim()) {
                const itemNombreTrimmed = itemNombre.trim();

                checkItemExists(itemNombreTrimmed).then(exists => {
                    if (exists) {
                        // Si el ítem existe, eliminarlo
                        itemsRef.child(itemNombreTrimmed).remove().then(() => {
                            alert("Ítem eliminado: " + itemNombreTrimmed);
                        }).catch(error => {
                            console.error("Error al eliminar el ítem:", error);
                        });
                    } else {
                        alert("No se encontró un ítem con ese nombre.");
                        promptForItemName(); // Re-pedir el nombre si no se encuentra el ítem
                    }
                });
            } else {
                alert("Por favor, introduce un nombre válido para el ítem.");
                promptForItemName(); // Re-pedir el nombre si no es válido
            }
        };

        promptForItemName();
    });
};

setupButtons();