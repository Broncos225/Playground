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
db.goOffline();
db.goOnline();

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

const COLORES_DISPONIBLES = {
    'azul': '#3b82f6',
    'verde': '#10b981',
    'rojo': '#ef4444',
    'morado': '#a855f7',
    'amarillo': '#f59e0b',
    'rosa': '#ec4899',
    'cyan': '#06b6d4',
    'naranja': '#f97316'
};

var timerSwitch = document.getElementById('timerSwitch');
var timerPreference = localStorage.getItem('timerActive');
if (timerPreference === 'true') {
    timerSwitch.checked = true;
}

timerSwitch.addEventListener('change', function () {
    localStorage.setItem('timerActive', this.checked);
});

let plantillasCache = JSON.parse(localStorage.getItem('plantillasCache')) || null;
let favoritosCache = JSON.parse(localStorage.getItem('favoritosCache')) || null;
let coloresCache = JSON.parse(localStorage.getItem('coloresPlantillas')) || {};
let lastUpdate = localStorage.getItem('plantillasLastUpdate') || 0;

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        var loadingScreen = document.getElementById("loadingScreen");
        loadingScreen.style.display = "flex";
        var asesorActual = localStorage.getItem('nombreAsesorActual');

        const now = Date.now();
        const cacheValid = plantillasCache && favoritosCache && (now - lastUpdate < 300000);

        if (cacheValid) {
            renderizarPlantillas(plantillasCache, favoritosCache, asesorActual);
            loadingScreen.style.display = "none";

            verificarCambiosEnSegundoPlano(asesorActual);
        } else {
            cargarPlantillasCompleto(asesorActual, loadingScreen);
        }

        configurarModalCreacion(asesorActual);

        var btnExportarTodas = document.getElementById('exportarTodas');
        if (btnExportarTodas) {
            btnExportarTodas.onclick = exportarPlantillasAExcel;
        }
    }
});

function verificarCambiosEnSegundoPlano(asesorActual) {
    db.ref('Plantillas').on('value', function (snapshot) {
        const nuevasPlantillas = snapshot.val() || {};
        if (JSON.stringify(nuevasPlantillas) !== JSON.stringify(plantillasCache)) {
            plantillasCache = nuevasPlantillas;
            localStorage.setItem('plantillasCache', JSON.stringify(plantillasCache));
            localStorage.setItem('plantillasLastUpdate', Date.now().toString());

            db.ref('Preferencias/' + asesorActual + '/Favoritos').once('value').then(function (favSnapshot) {
                favoritosCache = favSnapshot.val() || {};
                localStorage.setItem('favoritosCache', JSON.stringify(favoritosCache));
                renderizarPlantillas(plantillasCache, favoritosCache, asesorActual);
            });
        }
    });

    db.ref('Preferencias/' + asesorActual + '/Favoritos').on('value', function (snapshot) {
        const nuevosFavoritos = snapshot.val() || {};
        if (JSON.stringify(nuevosFavoritos) !== JSON.stringify(favoritosCache)) {
            favoritosCache = nuevosFavoritos;
            localStorage.setItem('favoritosCache', JSON.stringify(favoritosCache));
            renderizarPlantillas(plantillasCache, favoritosCache, asesorActual);
        }
    });
}

function cargarPlantillasCompleto(asesorActual, loadingScreen) {
    db.ref('Preferencias/' + asesorActual + '/Favoritos').once('value').then(function (favSnapshot) {
        favoritosCache = favSnapshot.val() || {};
        localStorage.setItem('favoritosCache', JSON.stringify(favoritosCache));

        return db.ref('Plantillas').once('value').then(function (snapshot) {
            plantillasCache = snapshot.val() || {};
            localStorage.setItem('plantillasCache', JSON.stringify(plantillasCache));
            localStorage.setItem('plantillasLastUpdate', Date.now().toString());

            renderizarPlantillas(plantillasCache, favoritosCache, asesorActual);
            loadingScreen.style.display = "none";

            verificarCambiosEnSegundoPlano(asesorActual);
        });
    }).catch(function (error) {
        console.log("Error al cargar favoritos o plantillas: ", error);
        loadingScreen.style.display = "none";
    });
}

function renderizarPlantillas(plantillas, favoritos, asesorActual) {
    var modulosPlantillas = document.getElementById("ModulosPlantillas");
    var favoritosPlantillas = document.getElementById("FavoritosPlantillas");

    modulosPlantillas.innerHTML = '';
    favoritosPlantillas.innerHTML = '';

    var plantillasArray = [];
    var plantillasFavoritas = [];

    Object.keys(plantillas).forEach(function (fileName) {
        var moduleData = plantillas[fileName];
        var moduleType = moduleData.Tipo;
        var creador = moduleData.Creador;

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

        var newDiv = document.createElement("div");
        newDiv.className = "Modulo2";
        newDiv.setAttribute("data-type", moduleType);
        newDiv.setAttribute("data-name", fileName);
        newDiv.setAttribute("data-creator", creador || '');

        newDiv.onclick = function (e) {
            if (!e.target.classList.contains('favorite-star') &&
                !e.target.classList.contains('color-picker-btn') &&
                !e.target.classList.contains('options-menu') &&
                !e.target.classList.contains('options-dropdown') &&
                !e.target.classList.contains('option-item')) {
                showModal(fileName);
            }
        };

        var typeSpan = document.createElement("span");
        typeSpan.className = "module-type";
        typeSpan.textContent = typeText;

        if (coloresCache[fileName]) {
            typeSpan.style.backgroundColor = coloresCache[fileName];
        }

        var starSpan = document.createElement("span");
        starSpan.className = "favorite-star";
        starSpan.innerHTML = favoritos[fileName] ? "★" : "☆";
        starSpan.setAttribute("data-name", fileName);
        starSpan.onclick = function (event) {
            event.stopPropagation();
            toggleFavorite(fileName, asesorActual, this);
        };

        var colorButton = document.createElement("span");
        colorButton.className = "color-picker-btn";
        colorButton.innerHTML = "🔘";
        colorButton.title = "Cambiar color";
        colorButton.onclick = function (event) {
            event.stopPropagation();
            mostrarSelectorColor(fileName, typeSpan);
        };

        if (moduleType === '2' && creador === asesorActual) {
            var optionsContainer = document.createElement("div");
            optionsContainer.className = "options-container";

            var optionsButton = document.createElement("span");
            optionsButton.className = "options-menu";
            optionsButton.innerHTML = "⋮";
            optionsButton.title = "Opciones";

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
                            delete plantillasCache[fileName];
                            delete coloresCache[fileName];
                            localStorage.setItem('plantillasCache', JSON.stringify(plantillasCache));
                            localStorage.setItem('coloresPlantillas', JSON.stringify(coloresCache));
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
                hideAllDropdowns();
                var isVisible = dropdown.style.display === "block";
                dropdown.style.display = isVisible ? "none" : "block";
            };

            optionsContainer.appendChild(optionsButton);
            optionsContainer.appendChild(dropdown);
            newDiv.appendChild(optionsContainer);
        }

        if (moduleType === '2' && creador !== asesorActual && creador) {
            var creatorSpan = document.createElement("span");
            creatorSpan.className = "module-creator";
            creatorSpan.textContent = "Por: " + creador.replace(/_/g, ' ');
            newDiv.appendChild(creatorSpan);
        }

        var newH2 = document.createElement("h2");
        newH2.textContent = fileName;

        newDiv.appendChild(colorButton);
        newDiv.appendChild(starSpan);
        newDiv.appendChild(typeSpan);
        newDiv.appendChild(newH2);

        if (favoritos[fileName]) {
            var favDiv = newDiv.cloneNode(true);
            setupDivEventHandlers(favDiv, fileName, asesorActual, moduleType, creador, moduleData);
            plantillasFavoritas.push(favDiv);
        }

        plantillasArray.push(newDiv);
    });

    if (plantillasFavoritas.length === 0) {
        var noFavMessage = document.createElement("p");
        noFavMessage.textContent = "No tienes plantillas favoritas. Marca una plantilla con ★ para añadirla aquí.";
        noFavMessage.className = "no-favorites-message";
        favoritosPlantillas.appendChild(noFavMessage);
    } else {
        favoritosPlantillas.append(...plantillasFavoritas);
    }

    modulosPlantillas.append(...plantillasArray);

    configurarBusqueda();
    configurarFiltro();
}

function configurarModalCreacion(asesorActual) {
    var modal = document.getElementById("createTemplateModal");
    var btn = document.getElementById("openModalButton");

    var colorSelector = document.getElementById('colorPlantilla');
    if (colorSelector && colorSelector.options.length === 0) {
        Object.keys(COLORES_DISPONIBLES).forEach(function (nombreColor) {
            var option = document.createElement('option');
            option.value = COLORES_DISPONIBLES[nombreColor];
            option.textContent = nombreColor.charAt(0).toUpperCase() + nombreColor.slice(1);
            colorSelector.appendChild(option);
        });
    }

    btn.onclick = function () {
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

    var form = document.getElementById('crearPlantillaForm');
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        var nombrePlantilla = document.getElementById('nombrePlantilla').value;
        var apertura = document.getElementById('apertura').value;
        var cierre = document.getElementById('cierre').value;
        var creador = localStorage.getItem('nombreAsesorActual') || 'Desconocido';
        var colorPlantilla = document.getElementById('colorPlantilla').value;
        var isEditing = form.hasAttribute('data-editing');
        var originalName = form.getAttribute('data-original-name');

        var plantillaData = {
            Tipo: '2',
            Apertura: apertura,
            Cierre: cierre,
            Creador: creador
        };

        if (isEditing && originalName && originalName !== nombrePlantilla) {
            db.ref('Plantillas/' + originalName).remove()
                .then(function () {
                    return db.ref('Plantillas/' + nombrePlantilla).set(plantillaData);
                })
                .then(function () {
                    delete plantillasCache[originalName];
                    delete coloresCache[originalName];
                    plantillasCache[nombrePlantilla] = plantillaData;
                    if (colorPlantilla) {
                        coloresCache[nombrePlantilla] = colorPlantilla;
                    }
                    localStorage.setItem('plantillasCache', JSON.stringify(plantillasCache));
                    localStorage.setItem('coloresPlantillas', JSON.stringify(coloresCache));
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
            var targetName = isEditing ? originalName : nombrePlantilla;
            db.ref('Plantillas/' + targetName).set(plantillaData)
                .then(function () {
                    plantillasCache[targetName] = plantillaData;
                    if (colorPlantilla) {
                        coloresCache[targetName] = colorPlantilla;
                    }
                    localStorage.setItem('plantillasCache', JSON.stringify(plantillasCache));
                    localStorage.setItem('coloresPlantillas', JSON.stringify(coloresCache));
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
}

function hideAllDropdowns() {
    var dropdowns = document.querySelectorAll('.options-dropdown');
    dropdowns.forEach(function (dropdown) {
        dropdown.style.display = "none";
    });
}

document.addEventListener('click', function (event) {
    if (!event.target.closest('.options-container')) {
        hideAllDropdowns();
    }
});

function setupDivEventHandlers(div, fileName, asesorActual, moduleType, creador, moduleData) {
    div.onclick = function (e) {
        if (!e.target.classList.contains('favorite-star') &&
            !e.target.classList.contains('color-picker-btn') &&
            !e.target.classList.contains('options-menu') &&
            !e.target.classList.contains('options-dropdown') &&
            !e.target.classList.contains('option-item')) {
            showModal(fileName);
        }
    };

    var colorBtn = div.querySelector('.color-picker-btn');
    if (colorBtn) {
        colorBtn.onclick = function (event) {
            event.stopPropagation();
            var typeSpan = div.querySelector('.module-type');
            mostrarSelectorColor(fileName, typeSpan);
        };
    }

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
                            delete plantillasCache[fileName];
                            delete coloresCache[fileName];
                            localStorage.setItem('plantillasCache', JSON.stringify(plantillasCache));
                            localStorage.setItem('coloresPlantillas', JSON.stringify(coloresCache));
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

function editTemplate(fileName, moduleData) {
    var modal = document.getElementById("createTemplateModal");
    var form = document.getElementById('crearPlantillaForm');

    document.getElementById('nombrePlantilla').value = fileName;
    document.getElementById('apertura').value = moduleData.Apertura || '';
    document.getElementById('cierre').value = moduleData.Cierre || '';

    var colorSelector = document.getElementById('colorPlantilla');
    if (coloresCache[fileName]) {
        colorSelector.value = coloresCache[fileName];
    }

    form.setAttribute('data-editing', 'true');
    form.setAttribute('data-original-name', fileName);

    document.querySelector('#createTemplateModal h2').textContent = 'Editar Plantilla';
    document.querySelector('#crearPlantillaForm button[type="submit"]').textContent = 'Actualizar Plantilla';

    modal.style.display = "block";
}

function toggleFavorite(fileName, asesorActual, starElement) {
    var isFavorite = starElement.innerHTML === "★";
    var favSection = document.getElementById("FavoritosPlantillas");
    var favoritosRef = db.ref('Preferencias/' + asesorActual + '/Favoritos/' + fileName);

    if (isFavorite) {
        favoritosRef.remove()
            .then(function () {
                delete favoritosCache[fileName];
                localStorage.setItem('favoritosCache', JSON.stringify(favoritosCache));

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
        favoritosRef.set(true)
            .then(function () {
                favoritosCache[fileName] = true;
                localStorage.setItem('favoritosCache', JSON.stringify(favoritosCache));

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
                        var moduleType = originalItem.getAttribute('data-type');
                        var creador = originalItem.getAttribute('data-creator');
                        var moduleData = plantillasCache[fileName];
                        setupDivEventHandlers(favItem, fileName, asesorActual, moduleType, creador, moduleData);
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

function mostrarNotificacion(mensaje) {
    var notification = document.getElementById('notification');
    notification.textContent = mensaje;
    notification.style.opacity = '1';
    setTimeout(function () {
        notification.style.opacity = '0';
    }, 2000);
}

function mostrarSelectorColor(fileName, typeSpanOriginal) {
    var existingPicker = document.getElementById('colorPickerModal');
    if (existingPicker) {
        existingPicker.remove();
    }

    var modal = document.createElement('div');
    modal.id = 'colorPickerModal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;';

    var content = document.createElement('div');
    content.style.cssText = 'background: white; padding: 20px; border-radius: 10px; max-width: 300px;';

    var title = document.createElement('h3');
    title.textContent = 'Seleccionar Color';
    title.style.marginTop = '0';
    content.appendChild(title);

    var colorsContainer = document.createElement('div');
    colorsContainer.style.cssText = 'display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 20px 0;';

    Object.keys(COLORES_DISPONIBLES).forEach(function (nombreColor) {
        var colorBtn = document.createElement('button');
        colorBtn.style.cssText = 'width: 50px; height: 50px; border: 2px solid #ddd; border-radius: 5px; cursor: pointer; background: ' + COLORES_DISPONIBLES[nombreColor] + ';';
        colorBtn.title = nombreColor.charAt(0).toUpperCase() + nombreColor.slice(1);

        colorBtn.onclick = function () {
            coloresCache[fileName] = COLORES_DISPONIBLES[nombreColor];
            localStorage.setItem('coloresPlantillas', JSON.stringify(coloresCache));

            var allTypeSpans = document.querySelectorAll('.Modulo2[data-name="' + fileName + '"] .module-type');
            allTypeSpans.forEach(function (span) {
                span.style.backgroundColor = COLORES_DISPONIBLES[nombreColor];
            });

            modal.remove();
            mostrarNotificacion('Color actualizado');
        };

        colorsContainer.appendChild(colorBtn);
    });

    var resetBtn = document.createElement('button');
    resetBtn.textContent = 'Restablecer color';
    resetBtn.style.cssText = 'width: 100%; padding: 10px; margin-top: 10px; cursor: pointer;';
    resetBtn.onclick = function () {
        delete coloresCache[fileName];
        localStorage.setItem('coloresPlantillas', JSON.stringify(coloresCache));

        var allTypeSpans = document.querySelectorAll('.Modulo2[data-name="' + fileName + '"] .module-type');
        allTypeSpans.forEach(function (span) {
            span.style.backgroundColor = '';
        });

        modal.remove();
        mostrarNotificacion('Color restablecido');
    };

    content.appendChild(colorsContainer);
    content.appendChild(resetBtn);
    modal.appendChild(content);

    modal.onclick = function (e) {
        if (e.target === modal) {
            modal.remove();
        }
    };

    document.body.appendChild(modal);
}

function normalizarTexto(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function configurarBusqueda() {
    var input = document.getElementById('busqueda');
    var clearButton = document.getElementById('LimpiarP');
    var pdfs = Array.from(document.getElementsByClassName('Modulo2'));

    input.addEventListener('keyup', function () {
        var busqueda = input.value;
        var busquedaNormalizada = normalizarTexto(busqueda.trim());
        var tipoSeleccionado = document.getElementById('Tipos').value;

        pdfs.forEach(function (pdf) {
            var key = pdf.getElementsByTagName('h2')[0].innerText;
            var tituloNormalizado = normalizarTexto(key);
            var coincidenciasEnTitulo = tituloNormalizado.includes(busquedaNormalizada);

            var type = pdf.getAttribute('data-type');
            var typeMatches = tipoSeleccionado === "0" || type === tipoSeleccionado;

            if (coincidenciasEnTitulo && typeMatches) {
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

    if (plantillasCache && plantillasCache[fileName]) {
        var textoA = plantillasCache[fileName].Apertura;
        modalApertura.innerHTML = `
        <div style="display: flex; gap: 10px; align-items: center; justify-content: flex-end; flex-wrap: wrap;">
            <h2 style="margin-right: auto;">Apertura</h2>
            <button onclick="copiarTexto('textoA')" style="height: 40px;">Copiar texto</button>
        </div>
        <div id="textoA"><p>${saludo}<br></p><p>${textoA}</p><p>Saludos.</p></div>
        <hr>`;

        var textoC = plantillasCache[fileName].Cierre;
        modalCierre.innerHTML = `
        <div style="display: flex; gap: 10px; align-items: center; justify-content: flex-end; flex-wrap: wrap;">
            <h2 style="margin-right: auto;">Cierre</h2>
            <button id="TextoCierre" onclick="copiarTexto('textoC')" style="height: 40px;">Copiar texto</button>
        </div>
        <div id="textoC"><p>${saludo}</p><p>${textoC}</p><p>Saludos.</p></div>
        `;
    }

    document.body.classList.add('modal-open');
    if (window.innerWidth <= 968) {
        document.getElementById("myModal").style.top = '0px';
    } else {
        document.querySelector('header').style.display = 'block';
    }
    modal.style.display = "block";
}

async function copiarTexto(id) {
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
            const ta = document.createElement('textarea');
            ta.style.fontFamily = "Nunito, sans-serif";
            ta.value = text;
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
        }
        const notification = document.getElementById('notification2');
        notification.textContent = '¡Texto Copiado!';
        notification.style.opacity = '1';
        setTimeout(() => { notification.style.opacity = '0'; }, 1000);
    } catch (e) {
        return;
    }

    const timerSwitch = document.getElementById('timerSwitch');
    if (timerSwitch && timerSwitch.checked) {
        setTimeout(() => {
            if (document.hasFocus()) {
                clearClipboard();
            } else {
                window.addEventListener('focus', clearClipboard, { once: true });
            }
        }, 15000);
    }
    if (window.innerWidth <= 370 && id === 'textoC') {
        if (typeof window.closeModal === 'function') window.closeModal();
        else console.error('closeModal no está definida');
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

var loadingScreen = document.createElement("div");
loadingScreen.id = "loadingScreen";
loadingScreen.innerHTML = `
    <div class="spinner"></div>
    <div>Cargando...</div>
`;
document.body.appendChild(loadingScreen);

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

        const diaSemana = hoy.getDay();
        if (diaSemana === 0 || diaSemana === 6) {
            return [];
        }

        const encargadosEspeciales = [];
        const usuariosEspeciales = ["Juan Manuel Cano Benítez"];

        for (const usuario of usuariosEspeciales) {
            try {
                const snapshot = await db.ref(`celdas/${usuario}/${diaActual}/${añoActual}/${mesActual}`).once('value');
                const turnoData = snapshot.val();

                if (turnoData && turnoData.texto && turnoData.texto !== "D") {
                    const esDiaPar = diaActual % 2 === 0;

                    if (usuario === "Juan Manuel Cano Benítez") {
                        if (esDiaPar) {
                            if (minutosActuales >= 8 * 60 && minutosActuales < 13 * 60) {
                                encargadosEspeciales.push(usuario);
                            }
                        } else {
                            if (minutosActuales >= 13 * 60 && minutosActuales < 17 * 60) {
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
            "Diego Alejandro Úsuga Yepes",
            "Santiago Ramirez Guzman"
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
        console.log(`Hora actual: ${Math.floor(minutosActuales / 60)}:${String(minutosActuales % 60).padStart(2, '0')}`);

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
    setInterval(actualizarDivEncargado, 60000);
    console.log('Sistema de encargado iniciado - Se actualiza cada minuto');
}

inicializarSistemaEncargado();

function limpiarHTML(texto) {
    if (!texto) return '';
    return texto.replace(/<[^>]*>/g, '');
}

async function exportarPlantillasAExcel() {
    try {
        const loadingScreen = document.getElementById("loadingScreen");
        if (loadingScreen) {
            loadingScreen.style.display = "flex";
            loadingScreen.querySelector('div:last-child').textContent = 'Exportando plantillas...';
        }

        const plantillas = plantillasCache || {};

        if (!plantillas || Object.keys(plantillas).length === 0) {
            mostrarNotificacion("No hay plantillas para exportar");
            if (loadingScreen) loadingScreen.style.display = "none";
            return;
        }

        const datosExcel = [];
        datosExcel.push(['Nombre', 'Apertura', 'Cierre', 'Tipo', 'Creador']);

        Object.keys(plantillas).forEach(nombrePlantilla => {
            const plantilla = plantillas[nombrePlantilla];

            let tipoTexto;
            switch (plantilla.Tipo) {
                case '1':
                    tipoTexto = 'Predeterminada';
                    break;
                case '2':
                    tipoTexto = 'Personalizada';
                    break;
                default:
                    tipoTexto = 'Desconocido';
                    break;
            }

            datosExcel.push([
                nombrePlantilla,
                limpiarHTML(plantilla.Apertura || ''),
                limpiarHTML(plantilla.Cierre || ''),
                tipoTexto,
                plantilla.Creador ? plantilla.Creador.replace(/_/g, ' ') : 'No especificado'
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(datosExcel);

        const colWidths = [
            { wch: 30 },
            { wch: 50 },
            { wch: 50 },
            { wch: 15 },
            { wch: 25 }
        ];
        ws['!cols'] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Plantillas");

        const ahora = new Date();
        const fecha = ahora.toISOString().split('T')[0];
        const hora = ahora.toTimeString().split(' ')[0].replace(/:/g, '-');
        const nombreArchivo = `Plantillas_${fecha}_${hora}.xlsx`;

        XLSX.writeFile(wb, nombreArchivo);

        mostrarNotificacion(`Archivo exportado: ${nombreArchivo}`);

    } catch (error) {
        console.error('Error al exportar plantillas:', error);
        mostrarNotificacion('Error al exportar las plantillas');
    } finally {
        const loadingScreen = document.getElementById("loadingScreen");
        if (loadingScreen) {
            loadingScreen.style.display = "none";
            loadingScreen.querySelector('div:last-child').textContent = 'Cargando...';
        }
    }
}