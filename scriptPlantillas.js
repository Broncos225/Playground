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
const db = firebase.database();

// Add this code snippet inside the `firebase.auth().onAuthStateChanged` block
var timerSwitch = document.getElementById('timerSwitch');

// Cargar la preferencia del temporizador desde el localStorage al cargar la página
var timerPreference = localStorage.getItem('timerActive');
if (timerPreference === 'true') {
    timerSwitch.checked = true;
}

// Guardar la preferencia del temporizador en el localStorage cada vez que cambia
timerSwitch.addEventListener('change', function () {
    localStorage.setItem('timerActive', this.checked);
});

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // Mostrar la pantalla de carga antes de iniciar la consulta
        var loadingScreen = document.getElementById("loadingScreen");
        loadingScreen.style.display = "flex";

        // Obtener el nombre del asesor actual desde el localStorage
        var asesorActual = localStorage.getItem('nombreAsesorActual');

        // Primero, cargar los favoritos del usuario actual usando la ruta correcta
        db.ref('Preferencias/' + asesorActual + '/Favoritos').once('value').then(function (favSnapshot) {
            var favoritos = favSnapshot.val() || {};

            // Luego, cargar todas las plantillas
            return db.ref('Plantillas').once('value').then(function (snapshot) {
                var modulosPlantillas = document.getElementById("ModulosPlantillas");
                var favoritosPlantillas = document.getElementById("FavoritosPlantillas");

                // Limpiar la lista de módulos antes de agregar nuevos
                modulosPlantillas.innerHTML = '';
                favoritosPlantillas.innerHTML = '';

                var plantillas = []; // Array para almacenar las plantillas
                var plantillasFavoritas = []; // Array para almacenar las plantillas favoritas

                snapshot.forEach(function (childSnapshot) {
                    var fileName = childSnapshot.key;
                    var moduleData = childSnapshot.val();
                    var moduleType = moduleData.Tipo;
                    var creador = moduleData.Creador;

                    // Convertir el tipo numérico a texto
                    var typeText;
                    switch (moduleType) {
                        case '1':
                            typeText = 'Predeterminada';
                            break;
                        case '2':
                            typeText = 'Solo personalizada';
                            break;
                        default:
                            typeText = 'Desconocido';
                            break;
                    }

                    // CAMBIO: Ya no filtramos plantillas personalizadas - se muestran todas
                    var newDiv = document.createElement("div");
                    newDiv.className = "Modulo2";
                    newDiv.setAttribute("data-type", moduleType);
                    newDiv.setAttribute("data-name", fileName);
                    newDiv.setAttribute("data-creator", creador || ''); // Añadir creador como atributo

                    newDiv.onclick = function (e) {
                        // Solo mostrar el modal si no se hizo clic en botones de control
                        if (!e.target.classList.contains('favorite-star') &&
                            !e.target.classList.contains('options-menu') &&
                            !e.target.classList.contains('options-dropdown') &&
                            !e.target.classList.contains('option-item')) {
                            showModal(fileName);
                        }
                    };

                    var typeSpan = document.createElement("span");
                    typeSpan.className = "module-type";
                    typeSpan.textContent = typeText;

                    // Crear la estrella para favoritos
                    var starSpan = document.createElement("span");
                    starSpan.className = "favorite-star";
                    starSpan.innerHTML = favoritos[fileName] ? "★" : "☆";
                    starSpan.setAttribute("data-name", fileName);
                    starSpan.onclick = function (event) {
                        event.stopPropagation();
                        toggleFavorite(fileName, asesorActual, this);
                    };

                    // CAMBIO: Solo agregar botón de opciones si el usuario actual es el creador
                    if (moduleType === '2' && creador === asesorActual) {
                        // Crear el botón de opciones
                        var optionsContainer = document.createElement("div");
                        optionsContainer.className = "options-container";

                        var optionsButton = document.createElement("span");
                        optionsButton.className = "options-menu";
                        optionsButton.innerHTML = "⋮";
                        optionsButton.title = "Opciones";

                        // Crear el menú desplegable
                        var dropdown = document.createElement("div");
                        dropdown.className = "options-dropdown";
                        dropdown.style.display = "none";

                        var editOption = document.createElement("div");
                        editOption.className = "option-item";
                        editOption.innerHTML = "✏️ Editar";
                        editOption.onclick = function (event) {
                            event.stopPropagation();
                            hideAllDropdowns();
                            editTemplate(fileName, moduleData);
                        };

                        var deleteOption = document.createElement("div");
                        deleteOption.className = "option-item";
                        deleteOption.innerHTML = "❌ Eliminar";
                        deleteOption.onclick = function (event) {
                            event.stopPropagation();
                            hideAllDropdowns();

                            var confirmacion = confirm("¿Estás seguro de que quieres eliminar esta plantilla?");
                            if (confirmacion) {
                                db.ref('Plantillas/' + fileName).remove()
                                    .then(function () {
                                        if (favoritos[fileName]) {
                                            db.ref('Preferencias/' + asesorActual + '/Favoritos/' + fileName).remove();
                                        }
                                        mostrarNotificacion("Plantilla eliminada exitosamente");
                                        location.reload();
                                    })
                                    .catch(function (error) {
                                        console.error("Error al eliminar la plantilla: ", error);
                                        mostrarNotificacion("Error al eliminar la plantilla");
                                    });
                            }
                        };

                        dropdown.appendChild(editOption);
                        dropdown.appendChild(deleteOption);

                        optionsButton.onclick = function (event) {
                            event.stopPropagation();
                            // Ocultar todos los otros dropdowns
                            hideAllDropdowns();
                            // Mostrar/ocultar este dropdown
                            var isVisible = dropdown.style.display === "block";
                            dropdown.style.display = isVisible ? "none" : "block";
                        };

                        optionsContainer.appendChild(optionsButton);
                        optionsContainer.appendChild(dropdown);
                        newDiv.appendChild(optionsContainer);
                    }

                    // Mostrar el creador para plantillas personalizadas de otros usuarios
                    if (moduleType === '2' && creador !== asesorActual && creador) {
                        var creatorSpan = document.createElement("span");
                        creatorSpan.className = "module-creator";
                        creatorSpan.textContent = "Por: " + creador.replace(/_/g, ' ');
                        newDiv.appendChild(creatorSpan);
                    }

                    var newH2 = document.createElement("h2");
                    newH2.textContent = fileName;

                    newDiv.appendChild(starSpan);
                    newDiv.appendChild(typeSpan);
                    newDiv.appendChild(newH2);

                    // Clonar el div para favoritos si es necesario
                    if (favoritos[fileName]) {
                        var favDiv = newDiv.cloneNode(true);
                        // Actualizar los manejadores de eventos en el clon
                        setupDivEventHandlers(favDiv, fileName, asesorActual, moduleType, creador, moduleData);
                        plantillasFavoritas.push(favDiv);
                    }

                    plantillas.push(newDiv);
                });

                // Si no hay favoritos, mostrar mensaje
                if (plantillasFavoritas.length === 0) {
                    var noFavMessage = document.createElement("p");
                    noFavMessage.textContent = "No tienes plantillas favoritas. Marca una plantilla con ★ para añadirla aquí.";
                    noFavMessage.className = "no-favorites-message";
                    favoritosPlantillas.appendChild(noFavMessage);
                } else {
                    favoritosPlantillas.append(...plantillasFavoritas);
                }

                modulosPlantillas.append(...plantillas);

                configurarBusqueda();
                configurarFiltro();

                loadingScreen.style.display = "none";
            });
        }).catch(function (error) {
            console.log("Error al cargar favoritos o plantillas: ", error);
            loadingScreen.style.display = "none";
        });

        // Configuración del modal de crear plantilla
        var modal = document.getElementById("createTemplateModal");
        var btn = document.getElementById("openModalButton");

        btn.onclick = function () {
            // Limpiar el formulario
            document.getElementById('crearPlantillaForm').reset();
            document.getElementById('crearPlantillaForm').removeAttribute('data-editing');
            document.querySelector('#createTemplateModal h2').textContent = 'Crear Nueva Plantilla';
            document.querySelector('#crearPlantillaForm button[type="submit"]').textContent = 'Crear Plantilla';
            modal.style.display = "block";
        }

        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }

        // Configurar el formulario para crear/editar plantillas
        var form = document.getElementById('crearPlantillaForm');
        form.addEventListener('submit', function (event) {
            event.preventDefault();

            var nombrePlantilla = document.getElementById('nombrePlantilla').value;
            var apertura = document.getElementById('apertura').value;
            var cierre = document.getElementById('cierre').value;
            var creador = localStorage.getItem('nombreAsesorActual') || 'Desconocido';
            var isEditing = form.hasAttribute('data-editing');
            var originalName = form.getAttribute('data-original-name');

            var plantillaData = {
                Tipo: '2',
                Apertura: apertura,
                Cierre: cierre,
                Creador: creador
            };

            if (isEditing && originalName && originalName !== nombrePlantilla) {
                // Si cambió el nombre, eliminar la plantilla anterior y crear una nueva
                db.ref('Plantillas/' + originalName).remove()
                    .then(function () {
                        return db.ref('Plantillas/' + nombrePlantilla).set(plantillaData);
                    })
                    .then(function () {
                        mostrarNotificacion('Plantilla actualizada exitosamente.');
                        form.reset();
                        form.removeAttribute('data-editing');
                        form.removeAttribute('data-original-name');
                        modal.style.display = "none";
                        location.reload();
                    })
                    .catch(function (error) {
                        console.error("Error al actualizar la plantilla: ", error);
                        mostrarNotificacion("Error al actualizar la plantilla");
                    });
            } else {
                // Crear nueva plantilla o actualizar existente sin cambio de nombre
                var targetName = isEditing ? originalName : nombrePlantilla;
                db.ref('Plantillas/' + targetName).set(plantillaData)
                    .then(function () {
                        var mensaje = isEditing ? 'Plantilla actualizada exitosamente.' : 'Plantilla creada exitosamente.';
                        mostrarNotificacion(mensaje);
                        form.reset();
                        form.removeAttribute('data-editing');
                        form.removeAttribute('data-original-name');
                        modal.style.display = "none";
                        location.reload();
                    })
                    .catch(function (error) {
                        console.error("Error al guardar la plantilla: ", error);
                        mostrarNotificacion("Error al guardar la plantilla");
                    });
            }
        });
    } else {
        console.log('No user is signed in');
    }
});

// Función para ocultar todos los dropdowns
function hideAllDropdowns() {
    var dropdowns = document.querySelectorAll('.options-dropdown');
    dropdowns.forEach(function (dropdown) {
        dropdown.style.display = "none";
    });
}

// Cerrar dropdowns al hacer clic fuera
document.addEventListener('click', function (event) {
    if (!event.target.closest('.options-container')) {
        hideAllDropdowns();
    }
});

// Función para configurar manejadores de eventos en divs clonados
function setupDivEventHandlers(div, fileName, asesorActual, moduleType, creador, moduleData) {
    div.onclick = function (e) {
        if (!e.target.classList.contains('favorite-star') &&
            !e.target.classList.contains('options-menu') &&
            !e.target.classList.contains('options-dropdown') &&
            !e.target.classList.contains('option-item')) {
            showModal(fileName);
        }
    };

    var favStar = div.querySelector('.favorite-star');
    if (favStar) {
        favStar.onclick = function (event) {
            event.stopPropagation();
            toggleFavorite(fileName, asesorActual, this);
        };
    }

    var optionsButton = div.querySelector('.options-menu');
    if (optionsButton) {
        var dropdown = div.querySelector('.options-dropdown');
        optionsButton.onclick = function (event) {
            event.stopPropagation();
            hideAllDropdowns();
            var isVisible = dropdown.style.display === "block";
            dropdown.style.display = isVisible ? "none" : "block";
        };

        var editOption = div.querySelector('.option-item:first-child');
        if (editOption) {
            editOption.onclick = function (event) {
                event.stopPropagation();
                hideAllDropdowns();
                editTemplate(fileName, moduleData);
            };
        }

        var deleteOption = div.querySelector('.option-item:last-child');
        if (deleteOption) {
            deleteOption.onclick = function (event) {
                event.stopPropagation();
                hideAllDropdowns();
                var confirmacion = confirm("¿Estás seguro de que quieres eliminar esta plantilla?");
                if (confirmacion) {
                    db.ref('Plantillas/' + fileName).remove()
                        .then(function () {
                            db.ref('Preferencias/' + asesorActual + '/Favoritos/' + fileName).remove();
                            mostrarNotificacion("Plantilla eliminada exitosamente");
                            location.reload();
                        })
                        .catch(function (error) {
                            console.error("Error al eliminar la plantilla: ", error);
                            mostrarNotificacion("Error al eliminar la plantilla");
                        });
                }
            };
        }
    }
}

// Nueva función para editar plantillas
function editTemplate(fileName, moduleData) {
    var modal = document.getElementById("createTemplateModal");
    var form = document.getElementById('crearPlantillaForm');

    // Llenar el formulario con los datos existentes
    document.getElementById('nombrePlantilla').value = fileName;
    document.getElementById('apertura').value = moduleData.Apertura || '';
    document.getElementById('cierre').value = moduleData.Cierre || '';

    // Marcar el formulario como modo edición
    form.setAttribute('data-editing', 'true');
    form.setAttribute('data-original-name', fileName);

    // Cambiar el texto del modal y botón
    document.querySelector('#createTemplateModal h2').textContent = 'Editar Plantilla';
    document.querySelector('#crearPlantillaForm button[type="submit"]').textContent = 'Actualizar Plantilla';

    modal.style.display = "block";
}

// Función para alternar el estado de favorito
function toggleFavorite(fileName, asesorActual, starElement) {
    var isFavorite = starElement.innerHTML === "★";
    var favSection = document.getElementById("FavoritosPlantillas");
    var favoritosRef = db.ref('Preferencias/' + asesorActual + '/Favoritos/' + fileName);

    if (isFavorite) {
        // ELIMINAR DE FAVORITOS
        favoritosRef.remove()
            .then(function () {
                var allStars = document.querySelectorAll('.favorite-star[data-name="' + fileName + '"]');
                allStars.forEach(function (star) {
                    star.innerHTML = "☆";
                });

                var favItem = favSection.querySelector('.Modulo2[data-name="' + fileName + '"]');
                if (favItem) {
                    favItem.remove();
                }

                if (favSection.querySelectorAll('.Modulo2').length === 0 &&
                    !favSection.querySelector('.no-favorites-message')) {
                    var noFavMessage = document.createElement("p");
                    noFavMessage.textContent = "No tienes plantillas favoritas. Marca una plantilla con ★ para añadirla aquí.";
                    noFavMessage.className = "no-favorites-message";
                    favSection.appendChild(noFavMessage);
                }

                var audio = document.getElementById('notificationSound');
                if (audio) {
                    audio.play().catch(e => console.log("Error al reproducir sonido:", e));
                }

                mostrarNotificacion("Eliminado de favoritos");
            })
            .catch(function (error) {
                console.error("Error al quitar de favoritos: ", error);
                mostrarNotificacion("Error al quitar de favoritos");
            });
    } else {
        // AÑADIR A FAVORITOS
        favoritosRef.set(true)
            .then(function () {
                var allStars = document.querySelectorAll('.favorite-star[data-name="' + fileName + '"]');
                allStars.forEach(function (star) {
                    star.innerHTML = "★";
                });

                var noFavMessage = favSection.querySelector(".no-favorites-message");
                if (noFavMessage) {
                    noFavMessage.remove();
                }

                var existingFavItem = favSection.querySelector('.Modulo2[data-name="' + fileName + '"]');
                if (!existingFavItem) {
                    var originalItem = document.querySelector('.Modulo2[data-name="' + fileName + '"]');
                    if (originalItem) {
                        var favItem = originalItem.cloneNode(true);

                        // Obtener datos del módulo original
                        var moduleType = originalItem.getAttribute('data-type');
                        var creador = originalItem.getAttribute('data-creator');
                        var asesorActual = localStorage.getItem('nombreAsesorActual');

                        // Configurar manejadores de eventos
                        db.ref('Plantillas/' + fileName).once('value').then(function (snapshot) {
                            var moduleData = snapshot.val();
                            setupDivEventHandlers(favItem, fileName, asesorActual, moduleType, creador, moduleData);
                        });

                        favSection.appendChild(favItem);
                    }
                }

                var audio = document.getElementById('notificationSound');
                if (audio) {
                    audio.play().catch(e => console.log("Error al reproducir sonido:", e));
                }

                mostrarNotificacion("Añadido a favoritos");
            })
            .catch(function (error) {
                console.error("Error al añadir a favoritos: ", error);
                mostrarNotificacion("Error al añadir a favoritos");
            });
    }
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje) {
    var notification = document.getElementById('notification');
    notification.textContent = mensaje;
    notification.style.opacity = '1';

    setTimeout(function () {
        notification.style.opacity = '0';
    }, 2000);
}

function configurarBusqueda() {
    var input = document.getElementById('busqueda');
    var clearButton = document.getElementById('LimpiarP');
    var pdfs = Array.from(document.getElementsByClassName('Modulo2'));

    input.addEventListener('keyup', function () {
        var filter = input.value.toUpperCase();
        var tipoSeleccionado = document.getElementById('Tipos').value;

        pdfs.forEach(function (pdf) {
            var title = pdf.getElementsByTagName('h2')[0].innerText.toUpperCase();
            var type = pdf.getAttribute('data-type');
            var typeMatches = tipoSeleccionado === "0" || type === tipoSeleccionado;

            if (title.indexOf(filter) > -1 && typeMatches) {
                pdf.style.display = "";
            } else {
                pdf.style.display = "none";
            }
        });

        verificarResultados();
    });

    clearButton.addEventListener('click', function () {
        input.value = '';
        pdfs.forEach(function (pdf) {
            pdf.style.display = "";
        });
        verificarResultados();
    });
}

function configurarFiltro() {
    var select = document.getElementById('Tipos');
    var pdfs = Array.from(document.getElementsByClassName('Modulo2'));

    select.addEventListener('change', function () {
        var tipoSeleccionado = select.value;

        pdfs.forEach(function (pdf) {
            var type = pdf.getAttribute('data-type');
            var typeMatches = tipoSeleccionado === "0" || type === tipoSeleccionado;

            pdf.style.display = typeMatches ? "" : "none";
        });

        verificarResultados();
    });
}

function verificarResultados() {
    var pdfs = Array.from(document.getElementsByClassName('Modulo2'));
    var hayResultados = pdfs.some(pdf => pdf.style.display !== 'none');
    document.getElementById('NoResultados').style.display = hayResultados ? 'none' : 'block';
}

function showModal(fileName) {
    const root = document.documentElement;
    const styles = getComputedStyle(root);
    const colorPrimario = styles.getPropertyValue('--color-primario').trim();
    var modal = document.getElementById("myModal");
    modal.scrollTop = 0;
    var modalTitulo = document.querySelector("#myModal #modal-content #titulo");
    var modalApertura = document.querySelector("#myModal #modal-content #apertura");
    var modalCierre = document.querySelector("#myModal #modal-content #cierre");

    var currentHour = new Date().getHours();
    var saludo;

    if (currentHour < 12) {
        saludo = "Buenos días";
    } else if (currentHour < 18) {
        saludo = "Buenas tardes";
    } else {
        saludo = "Buenas noches";
    }

    modalTitulo.innerHTML = `
    <hr>
    <h2 style="text-align: center;">${fileName}</h2>
    <hr>
    `;

    db.ref('Plantillas/' + fileName + '/Apertura').once('value').then(function (snapshot) {
        var textoA = snapshot.val();
        modalApertura.innerHTML = `
        <div style="display: flex; gap: 10px; align-items: center; justify-content: flex-end; flex-wrap: wrap;">
            <h2 style="margin-right: auto;">Apertura</h2>
            <button onclick="copiarTexto('textoA')" style="height: 40px; color: var(--color-texto); background-color: var(--color-primario)">Copiar texto</button>
        </div>
        <div id="textoA"><p>${saludo}<br></p><p>${textoA}</p><p>Saludos.</p></div>
        <hr>`;
    });

    db.ref('Plantillas/' + fileName + '/Cierre').once('value').then(function (snapshot) {
        var textoC = snapshot.val();
        modalCierre.innerHTML = `
        <div style="display: flex; gap: 10px; align-items: center; justify-content: flex-end; flex-wrap: wrap;">
            <h2 style="margin-right: auto;">Cierre</h2>
            <button onclick="copiarTexto('textoC')" style="height: 40px; color: var(--color-texto); background-color: var(--color-primario);">Copiar texto</button>
        </div>
        <div id="textoC"><p>${saludo}</p><p>${textoC}</p><p>Saludos.</p></div>
        `;
    });

    document.body.classList.add('modal-open');
    if (window.innerWidth <= 968) {
        document.getElementById("myModal").style.top = '0px';
    } else {
        document.querySelector('header').style.display = 'block';
    }
    modal.style.display = "block";
}


// This is the main function that copies the text and sets the timer.
async function copiarTexto(id) {
    // Construir texto plano desde el HTML
    let text = document.getElementById(id).innerHTML;
    text = text
        .replace(/<br>/g, "\r\n")
        .replace(/<\/p><p>/g, "\r\n")
        .replace(/<p>/g, "")
        .replace(/<\/p>/g, "");

    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        } else {
            // Fallback para entornos no seguros
            const ta = document.createElement('textarea');
            ta.style.fontFamily = "Nunito, sans-serif";
            ta.value = text;
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
        }
        // Notificación de copiado
        const notification = document.getElementById('notification2');
        notification.textContent = '¡Texto Copiado!';
        notification.style.opacity = '1';
        setTimeout(() => { notification.style.opacity = '0'; }, 1000);
    } catch (e) {
        return;
    }

    // Temporizador de borrado si el switch está activo
    const timerSwitch = document.getElementById('timerSwitch');
    if (timerSwitch && timerSwitch.checked) {
        setTimeout(() => {
            // Si la pestaña no tiene foco, espera a que vuelva y entonces borra
            if (document.hasFocus()) {
                clearClipboard();
            } else {
                window.addEventListener('focus', clearClipboard, { once: true });
            }
        }, 15000);
    }
}


function closeModal() {
    var modals = document.querySelectorAll('.modal');
    modals.forEach(function (modal) {
        modal.style.display = "none";
    });
    document.body.classList.remove('modal-open');
    document.querySelector('header').style.display = 'block';
}

window.addEventListener('click', function (event) {
    var modals = document.querySelectorAll('.modal');
    modals.forEach(function (modal) {
        if (event.target == modal) {
            modal.style.display = "none";
            document.body.classList.remove('modal-open');
            document.querySelector('header').style.display = 'block';
        }
    });
});

// Agregar los estilos CSS al documento
var style = document.createElement('style');
style.innerHTML = `
    #loadingScreen {
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        background: rgba(51, 51, 51, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        z-index: 9999;
        color: #fff;
        font-family: 'Nunito', sans-serif;
    }

    .spinner {
        border: 8px solid rgba(255, 255, 255, 0.3);
        border-top: 8px solid #fff;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        animation: spin 1s linear infinite;
        margin-bottom: 10px;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    .options-container {
        position: absolute;
        top: 5px;
        right: 30px;
        z-index: 10;
    }

    .options-menu {
        cursor: pointer;
        font-size: 18px;
        font-weight: bold;
        padding: 4px 8px;
        border-radius: 3px;
        background-color: var(--color-secundario);
        user-select: none;
    }

    .options-menu:hover {
        background-color: rgba(255, 255, 255, 1);
    }

    .options-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        min-width: 120px;
        z-index: 1000;
    }

    .option-item {
        padding: 8px 12px;
        cursor: pointer;
        font-size: 14px;
        border-bottom: 1px solid #eee;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .option-item:last-child {
        border-bottom: none;
    }

    .option-item:hover {
        background-color: #f5f5f5;
    }

    .module-creator {
        position: absolute;
        bottom: 5px;
        left: 5px;
        font-size: 10px;
        padding: 2px 4px;
        border-radius: 3px;
    }
`;
document.head.appendChild(style);

// Agregar el elemento de pantalla de carga al HTML
var loadingScreen = document.createElement("div");
loadingScreen.id = "loadingScreen";
loadingScreen.innerHTML = `
    <div class="spinner"></div>
    <div>Cargando...</div>
`;
document.body.appendChild(loadingScreen);

// let ultimoEncargadoNotificado = localStorage.getItem('ultimoEncargadoNotificado');
// let ultimaNotificacion = parseInt(localStorage.getItem('ultimaNotificacion')) || 0;
// const INTERVALO_NOTIFICACION = 1800 * 1000; // 30 minutos

// // Función para solicitar permisos de notificación
// function solicitarPermisosNotificacion() {
//     if (!("Notification" in window)) {
//         console.log("Este navegador no soporta notificaciones de escritorio.");
//         return;
//     }

//     if (Notification.permission !== "granted") {
//         Notification.requestPermission();
//     }
// }

// // Llama a la función al cargar la página para pedir el permiso
// solicitarPermisosNotificacion();

// // Función para mostrar la notificación con sonido
// function mostrarNotificacion(nombreEncargado) {
//     if (Notification.permission === "granted") {
//         const opciones = {
//             body: '¡Es tu turno de revisar los aplicativos, VIP, Correo, Spool!',
//             icon: 'icono.png', 
//         };

//         const notificacion = new Notification(`⚠️ Hola, ${nombreEncargado}`, opciones);

//         // Reproducir sonido de notificación
//         const audio = new Audio('notification.mp3'); 
//         audio.play().catch(error => {
//             console.error("Error al reproducir el sonido:", error);
//         });

//         // Actualizar estado de notificación y guardarlo en localStorage
//         ultimaNotificacion = Date.now();
//         ultimoEncargadoNotificado = nombreEncargado;
        
//         localStorage.setItem('ultimaNotificacion', ultimaNotificacion.toString());
//         localStorage.setItem('ultimoEncargadoNotificado', ultimoEncargadoNotificado);
        
//         console.log(`Notificación enviada a ${nombreEncargado} a las ${new Date().toLocaleTimeString()}`);
//     }
// }

// // Función para verificar si debe notificar
// function debeNotificar(nombreEncargado) {
//     const ahora = Date.now();
    
//     // Si cambió el encargado, permitir notificación inmediata
//     if (nombreEncargado !== ultimoEncargadoNotificado) {
//         console.log(`Cambio de encargado detectado: ${ultimoEncargadoNotificado} -> ${nombreEncargado}`);
//         return true;
//     }
    
//     // Si es el mismo encargado, verificar si han pasado los segundos configurados
//     if (ahora - ultimaNotificacion >= INTERVALO_NOTIFICACION) {
//         console.log(`Han pasado ${INTERVALO_NOTIFICACION/1000} segundos desde la última notificación`);
//         return true;
//     }
    
//     return false;
// }

// // Función principal para verificar y notificar
// async function revisarYNotificar() {
//     if (Notification.permission !== "granted") {
//         console.log("Permisos de notificación no otorgados.");
//         return;
//     }
    
//     const nombreUsuarioStorage = localStorage.getItem('nombreAsesorActual');
//     const nombreUsuarioActual = nombreUsuarioStorage ? nombreUsuarioStorage.replace(/_/g, ' ') : null;
//     const encargadoActual = await obtenerEncargadoActual();

//     // Si no hay encargado actual, resetear estado
//     if (!encargadoActual) {
//         if (ultimoEncargadoNotificado !== null) {
//             console.log("No hay encargado actual, reseteando estado");
//             ultimoEncargadoNotificado = null;
//             ultimaNotificacion = 0;
            
//             // Limpiar localStorage
//             localStorage.removeItem('ultimoEncargadoNotificado');
//             localStorage.removeItem('ultimaNotificacion');
//         }
//         return;
//     }

//     // Si el usuario actual coincide con el encargado y debe notificar
//     if (nombreUsuarioActual === encargadoActual.nombre && timerPreference === true) {
//         const divEncargado = document.getElementById('Encargado');
//         if (divEncargado) {
//             const root = document.documentElement;
//             const colorPrimario = getComputedStyle(root).getPropertyValue('--color-primario').trim();
//             divEncargado.style.backgroundColor = colorPrimario;
//             divEncargado.style.padding = '10px';
//             divEncargado.style.borderRadius = '8px';

//             // Calcular contraste: si el fondo es claro, usar negro; si es oscuro, usar blanco
//             function getContrastYIQ(hexcolor) {
//             hexcolor = hexcolor.replace('#', '').trim();
//             if (hexcolor.length === 3) {
//                 hexcolor = hexcolor.split('').map(c => c + c).join('');
//             }
//             const r = parseInt(hexcolor.substr(0,2),16);
//             const g = parseInt(hexcolor.substr(2,2),16);
//             const b = parseInt(hexcolor.substr(4,2),16);
//             const yiq = ((r*299)+(g*587)+(b*114))/1000;
//             return yiq >= 128 ? 'black' : 'white';
//             }

//             // Si es una variable CSS tipo rgb(a), convertir a hex
//             function rgbToHex(rgb) {
//             const result = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
//             if (!result) return rgb;
//             return "#" + ((1 << 24) + (parseInt(result[1]) << 16) + (parseInt(result[2]) << 8) + parseInt(result[3])).toString(16).slice(1);
//             }

//             let colorHex = colorPrimario;
//             if (colorHex.startsWith('rgb')) {
//             colorHex = rgbToHex(colorHex);
//             }
//             divEncargado.style.color = getContrastYIQ(colorHex);
//         }
//         if (debeNotificar(encargadoActual.nombre)) {
//             mostrarNotificacion(encargadoActual.nombre);
//         } else {
//             const tiempoRestante = Math.ceil((INTERVALO_NOTIFICACION - (Date.now() - ultimaNotificacion)) / 1000);
//             console.log(`Próxima notificación en ${tiempoRestante} segundos`);
//         }
//     }
// }

// // Función para obtener el tiempo restante hasta la próxima notificación
// function tiempoHastaProximaNotificacion() {
//     if (ultimaNotificacion === 0) return 0;
//     const tiempoTranscurrido = Date.now() - ultimaNotificacion;
//     const tiempoRestante = INTERVALO_NOTIFICACION - tiempoTranscurrido;
//     return Math.max(0, Math.ceil(tiempoRestante / 1000)); // en segundos
// }

// // Función para limpiar estado de notificaciones (útil para debugging)
// function limpiarEstadoNotificaciones() {
//     ultimoEncargadoNotificado = null;
//     ultimaNotificacion = 0;
//     localStorage.removeItem('ultimoEncargadoNotificado');
//     localStorage.removeItem('ultimaNotificacion');
//     console.log("Estado de notificaciones limpiado");
// }

// El resto de tu código se mantiene igual...
function redirectTo(url) {
    window.location.href = url;
}

function convertirHoraAMinutos(hora) {
    const [tiempo, periodo] = hora.split(' ');
    let [horas, minutos] = tiempo.split(':').map(Number);
    
    if (periodo === 'PM' && horas !== 12) {
        horas += 12;
    } else if (periodo === 'AM' && horas === 12) {
        horas = 0;
    }
    
    return horas * 60 + minutos;
}

function obtenerMinutosActuales() {
    const ahora = new Date();
    return ahora.getHours() * 60 + ahora.getMinutes();
}

async function verificarEncargadosEspeciales() {
    try {
        const hoy = new Date();
        const añoActual = hoy.getFullYear();
        const mesActual = hoy.getMonth() + 1;
        const diaActual = hoy.getDate();
        const minutosActuales = obtenerMinutosActuales();

        // No mostrar encargados especiales sábados (6) y domingos (0)
        const diaSemana = hoy.getDay();
        if (diaSemana === 0 || diaSemana === 6) {
            return [];
        }

        const encargadosEspeciales = [];
        const usuariosEspeciales = ["Juan Manuel Cano Benítez", "Karen Riveros Vega"];

        for (const usuario of usuariosEspeciales) {
            try {
                const snapshot = await db.ref(`celdas/${usuario}/${diaActual}/${añoActual}/${mesActual}`).once('value');
                const turnoData = snapshot.val();

                if (turnoData && turnoData.texto && turnoData.texto !== "D") {
                    const esDiaPar = diaActual % 2 === 0;

                    if (usuario === "Juan Manuel Cano Benítez") {
                        if (esDiaPar) {
                            if (minutosActuales >= 8*60 && minutosActuales < 13*60) {
                                encargadosEspeciales.push(usuario);
                            }
                        } else {
                            if (minutosActuales >= 13*60 && minutosActuales < 17*60) {
                                encargadosEspeciales.push(usuario);
                            }
                        }
                    } else if (usuario === "Karen Riveros Vega") {
                        if (esDiaPar) {
                            if (minutosActuales >= 13*60 && minutosActuales < 17*60) {
                                encargadosEspeciales.push(usuario);
                            }
                        } else {
                            if (minutosActuales >= 8*60 && minutosActuales < 13*60) {
                                encargadosEspeciales.push(usuario);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error(`Error consultando turno especial para ${usuario}:`, error);
            }
        }

        return encargadosEspeciales;
    } catch (error) {
        console.error('Error verificando encargados especiales:', error);
        return [];
    }
}

async function obtenerEncargadoActual() {
    try {
        const usuarios = [
            "Andrés Felipe Yepes Tascón",
            "Oscar Luis Cabrera Pacheco", 
            "Yeison Torres Ochoa",
            "Maria Susana Ospina Vanegas",
            "Ocaris David Arango Aguilar",
            "Johan Guzman Alarcon",
            "Diego Alejandro Úsuga Yepes"
        ];

        const hoy = new Date();
        const añoActual = hoy.getFullYear();
        const mesActual = hoy.getMonth() + 1;
        const diaActual = hoy.getDate() + 1;

        const snapshotTurnos = await db.ref('Turnos').once('value');
        const horariosTurnos = snapshotTurnos.val();

        if (!horariosTurnos) {
            console.log('No se pudieron obtener los horarios de turnos');
            return null;
        }

        const usuariosConHorarios = [];

        for (const usuario of usuarios) {
            try {
                const snapshot = await db.ref(`celdas/${usuario}/${diaActual}/${añoActual}/${mesActual}`).once('value');
                const turnoData = snapshot.val();
                
                if (turnoData && turnoData.texto) {
                    const codigoTurno = turnoData.texto;
                    const horarioTurno = horariosTurnos[codigoTurno];
                    
                    if (horarioTurno && horarioTurno.Apertura && horarioTurno.Cierre) {
                        const inicioMinutos = convertirHoraAMinutos(horarioTurno.Apertura);
                        const finMinutos = convertirHoraAMinutos(horarioTurno.Cierre);
                        
                        usuariosConHorarios.push({
                            nombre: usuario,
                            turno: codigoTurno,
                            inicioMinutos: inicioMinutos,
                            finMinutos: finMinutos,
                            horarioTexto: `${horarioTurno.Apertura} - ${horarioTurno.Cierre}`
                        });
                    }
                }
            } catch (error) {
                console.error(`Error consultando turno para ${usuario}:`, error);
            }
        }

        usuariosConHorarios.sort((a, b) => a.inicioMinutos - b.inicioMinutos);



        const minutosActuales = obtenerMinutosActuales();
        console.log(`Hora actual: ${Math.floor(minutosActuales/60)}:${String(minutosActuales%60).padStart(2,'0')}`);

        for (const usuario of usuariosConHorarios) {
            if (minutosActuales >= usuario.inicioMinutos && minutosActuales < usuario.finMinutos) {
                console.log(`Encargado actual: ${usuario.nombre}`);
                return {
                    nombre: usuario.nombre,
                    turno: usuario.turno,
                    horario: usuario.horarioTexto
                };
            }
        }

        console.log('No hay nadie en turno en este momento');
        return null;

    } catch (error) {
        console.error('Error obteniendo encargado actual:', error);
        return null;
    }
}

async function actualizarDivEncargado() {
    const encargadoActual = await obtenerEncargadoActual();
    const encargadosEspeciales = await verificarEncargadosEspeciales();
    const divEncargado = document.getElementById('Encargado');
    
    if (divEncargado) {
        if (encargadoActual) {
            let contenido = `
                <strong>Encargado Actual de VIP, Correo y Spool</strong><br>
                ${encargadoActual.nombre}
            `;
            
            if (encargadosEspeciales.length > 0) {
                contenido += ` y ${encargadosEspeciales.join(', ')}`;
            }
            
            contenido += `<br>
                <medium>Turno ${encargadoActual.turno} (${encargadoActual.horario})</medium>
            `;
            
            divEncargado.innerHTML = contenido;
        } else {
            divEncargado.innerHTML = '<em>No hay encargado en turno actualmente</em>';
        }
    }
}

function inicializarSistemaEncargado() {
    actualizarDivEncargado();
    setInterval(actualizarDivEncargado, 60000); // Actualiza cada minuto
    setInterval(revisarYNotificar, 5000); // Revisa cada 5 segundos para mejor precisión
    
    console.log('Sistema de encargado iniciado - Se actualiza cada minuto');
    console.log(`Sistema de notificaciones iniciado - Notifica cada ${INTERVALO_NOTIFICACION/1000} segundos`);
    
    // Log del estado inicial
    if (ultimaNotificacion > 0) {
        const tiempoRestante = Math.ceil((INTERVALO_NOTIFICACION - (Date.now() - ultimaNotificacion)) / 1000);
        console.log(`Estado recuperado - Último notificado: ${ultimoEncargadoNotificado}, próxima notificación en ${tiempoRestante} segundos`);
    }
}

inicializarSistemaEncargado();