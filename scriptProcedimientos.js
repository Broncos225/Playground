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
    const agregarEnlaceBtn = document.getElementById('agregar-enlace-btn');

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