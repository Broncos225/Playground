// Valor específico permitido
const nombreAsesorPermitido = 'Andrés_Felipe_Yepes_Tascón';

// Obtener el valor de nombreAsesorActual desde el localStorage
const nombreAsesorActual = localStorage.getItem('nombreAsesorActual');

// Verificar si el nombreAsesorActual coincide con el valor permitido
if (nombreAsesorActual !== nombreAsesorPermitido) {
    // Redirigir al usuario a otra página o mostrar un mensaje de acceso denegado
    alert('Acceso denegado.');
    window.location.href = 'https://broncos225.github.io/Playground/index.html'; // Cambia esto a la URL de la página de redirección
} else {

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
    // JavaScript para el modal
    // JavaScript para el modal y el formulario
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // Mostrar la pantalla de carga antes de iniciar la consulta
            var loadingScreen = document.getElementById("loadingScreen");
            loadingScreen.style.display = "flex";

            // Usuario autenticado, listar archivos desde Firebase Realtime Database
            db.ref('Plantillas').once('value').then(function (snapshot) {
                var modulosPlantillas = document.getElementById("ModulosPlantillas");
                modulosPlantillas.innerHTML = ''; // Limpiar la lista de módulos antes de agregar nuevos

                var plantillas = []; // Array para almacenar las plantillas y sus tipos
                var asesorActual = localStorage.getItem('nombreAsesorActual'); // Obtener el nombre del asesor actual desde el localStorage

                snapshot.forEach(function (childSnapshot) {
                    var fileName = childSnapshot.key;
                    var moduleData = childSnapshot.val();
                    var moduleType = moduleData.Tipo;
                    var creador = moduleData.Creador;

                    // Convertir el tipo numérico a texto
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
                            typeText = 'Desconocido'; // Para otros valores
                            break;
                    }

                    // Filtrar las plantillas personalizadas
                    if (moduleType === '2' && creador !== asesorActual) {
                        return; // Saltar esta plantilla si es personalizada y el creador no coincide con el asesor actual
                    }

                    var newDiv = document.createElement("div");
                    newDiv.className = "Modulo2";
                    newDiv.setAttribute("data-type", moduleType); // Agregar un atributo de datos para el tipo

                    newDiv.onclick = function () {
                        showModal(fileName);
                    };

                    var typeSpan = document.createElement("span");
                    typeSpan.className = "module-type";
                    typeSpan.textContent = typeText;

                    // Solo agregar el deleteSpan si el módulo es personalizado
                    if (moduleType === '2') {
                        var deleteSpan = document.createElement("span");
                        deleteSpan.className = "delete-module";
                        deleteSpan.textContent = "❌";

                        // Agregar el manejador de eventos para la eliminación
                        deleteSpan.onclick = function (event) {
                            event.stopPropagation(); // Evita que se dispare el evento onclick del div contenedor

                            var confirmacion = confirm("¿Estás seguro de que quieres eliminar esta plantilla?");
                            if (confirmacion) {
                                // Eliminar la plantilla de Firebase
                                db.ref('Plantillas/' + fileName).remove()
                                    .then(function () {
                                        alert("Plantilla eliminada exitosamente.");
                                        location.reload(); // Recargar la página para actualizar la lista de plantillas
                                    })
                                    .catch(function (error) {
                                        console.error("Error al eliminar la plantilla: ", error);
                                    });
                            }
                        };

                        newDiv.appendChild(deleteSpan); // Añadir el botón de eliminación solo si es personalizado
                    }

                    var newH2 = document.createElement("h2");
                    newH2.textContent = fileName;

                    newDiv.appendChild(typeSpan); // Añadir el tipo al principio del div
                    newDiv.appendChild(newH2);

                    plantillas.push(newDiv); // Agregar el div al array
                });

                modulosPlantillas.append(...plantillas); // Añadir todos los divs al contenedor

                // Configurar búsqueda y filtro después de agregar elementos
                configurarBusqueda();
                configurarFiltro();

                // Ocultar la pantalla de carga una vez que la consulta haya terminado
                loadingScreen.style.display = "none";
            }).catch(function (error) {
                console.log("Error al listar los archivos: ", error);

                // Ocultar la pantalla de carga en caso de error
                loadingScreen.style.display = "none";
            });

            // Configuración del modal
            var modal = document.getElementById("createTemplateModal");
            var btn = document.getElementById("openModalButton");

            // Abrir el modal al hacer clic en el botón
            btn.onclick = function () {
                modal.style.display = "block";
            }

            // Cerrar el modal al hacer clic fuera del contenido del modal
            window.onclick = function (event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            }

            // Configurar el formulario para crear plantillas
            var form = document.getElementById('crearPlantillaForm');
            form.addEventListener('submit', function (event) {
                event.preventDefault(); // Evitar el envío del formulario de la manera tradicional

                var nombrePlantilla = document.getElementById('nombrePlantilla').value;
                var apertura = document.getElementById('apertura').value;
                var cierre = document.getElementById('cierre').value;
                var creador = localStorage.getItem('nombreAsesorActual') || 'Desconocido'; // Obtener el nombre del usuario autenticado

                db.ref('Plantillas/' + nombrePlantilla).set({
                    Tipo: '2', // Siempre personalizado
                    Apertura: apertura,
                    Cierre: cierre,
                    Creador: creador
                }).then(function () {
                    alert('Plantilla creada exitosamente.');
                    form.reset();
                    modal.style.display = "none"; // Cerrar el modal después de crear la plantilla
                    location.reload(); // Recargar la página para reflejar los cambios
                }).catch(function (error) {
                    console.error("Error al crear la plantilla: ", error);
                });
            });
        } else {
            console.log('No user is signed in');
        }
    });

    function configurarBusqueda() {
        var input = document.getElementById('busqueda');
        var clearButton = document.getElementById('LimpiarP');
        var pdfs = Array.from(document.getElementsByClassName('Modulo2'));

        input.addEventListener('keyup', function () {
            var filter = input.value.toUpperCase();
            var tipoSeleccionado = document.getElementById('Tipos').value;

            pdfs.forEach(function (pdf) {
                var title = pdf.getElementsByTagName('h2')[0].innerText.toUpperCase(); // Obtén el texto del título en mayúsculas
                var type = pdf.getAttribute('data-type'); // Obtén el tipo de plantilla desde el atributo 'data-type'
                var typeMatches = tipoSeleccionado === "0" || type === tipoSeleccionado;

                // Filtra por título y tipo
                if (title.indexOf(filter) > -1 && typeMatches) {
                    pdf.style.display = ""; // Muestra el div si coincide con la búsqueda y el filtro
                } else {
                    pdf.style.display = "none"; // Oculta el div si no coincide
                }
            });

            verificarResultados();
        });

        clearButton.addEventListener('click', function () {
            input.value = ''; // Limpia el campo de búsqueda
            pdfs.forEach(function (pdf) {
                pdf.style.display = ""; // Muestra todas las plantillas
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

                pdf.style.display = typeMatches ? "" : "none"; // Filtra por tipo de plantilla
            });

            verificarResultados();
        });
    }

    function verificarResultados() {
        var pdfs = Array.from(document.getElementsByClassName('Modulo2'));
        var hayResultados = pdfs.some(pdf => pdf.style.display !== 'none');
        document.getElementById('NoResultados').style.display = hayResultados ? 'none' : 'block';
    }


    function configurarFiltro() {
        var select = document.getElementById('Tipos');
        var pdfs = Array.from(document.getElementsByClassName('Modulo2'));

        select.addEventListener('change', function () {
            console.log("Select changed"); // Para depuración
            var tipoSeleccionado = select.value;
            pdfs.forEach(function (pdf) {
                var typeMatches = tipoSeleccionado == "0" || pdf.getAttribute("data-type") === tipoSeleccionado;
                pdf.style.display = typeMatches ? "" : "none";
            });
            verificarResultados();
        });
    }



    function showModal(fileName) {
        var modal = document.getElementById("myModal");
        modal.scrollTop = 0;
        var modalTitulo = document.querySelector("#myModal #modal-content #titulo");
        var modalApertura = document.querySelector("#myModal #modal-content #apertura");
        var modalCierre = document.querySelector("#myModal #modal-content #cierre");

        // Obtener la hora actual
        var currentHour = new Date().getHours();
        var saludo;

        // Determinar el saludo basado en la hora del día
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
            <button onclick="copiarTexto('textoA')" style="height: 40px; color: black; background-color: #e69500;">Copiar texto</button>
        </div>
        <div id="textoA"><p>${saludo}<br></p><p>${textoA}</p><p>Saludos.</p></div>
        <hr>`;
        });

        db.ref('Plantillas/' + fileName + '/Cierre').once('value').then(function (snapshot) {
            var textoC = snapshot.val();
            modalCierre.innerHTML = `
        <div style="display: flex; gap: 10px; align-items: center; justify-content: flex-end; flex-wrap: wrap;">
            <h2 style="margin-right: auto;">Cierre</h2>
            <button onclick="copiarTexto('textoC')" style="height: 40px; color: black; background-color: #e69500;">Copiar texto</button>
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

    function copiarTexto(id) {
        var text = document.getElementById(id).innerHTML; // Cambiado a innerHTML
        text = text.replace(/<br>/g, "\r\n").replace(/<\/p><p>/g, "\r\n").replace(/<p>/g, "").replace(/<\/p>/g, ""); // Añadido para conservar los saltos de línea y eliminar las etiquetas <p></p>
        var textArea = document.createElement("textarea");
        textArea.style.fontFamily = "Nunito, sans-serif"; // Añadido para establecer el tipo de letra a Nunito
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);

        // Muestra la notificación
        var notification = document.getElementById('notification2');
        notification.textContent = '¡Texto Copiado!';
        notification.style.opacity = '1';

        // Oculta la notificación después de 1 segundo
        setTimeout(function () {
            notification.style.opacity = '0';
        }, 1000);
    }

    function closeModal() {
        var modals = document.querySelectorAll('.modal');
        modals.forEach(function (modal) {
            modal.style.display = "none";
        });
        document.body.classList.remove('modal-open');
        document.querySelector('header').style.display = 'block';
    }

    // Añadir el manejador de eventos para el clic fuera del contenido del modal
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
}