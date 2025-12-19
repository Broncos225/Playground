class PreferenciasColores {
    constructor() {
        this.nombreUsuario = this.obtenerNombreUsuario();
        this.configuracionDefecto = {
            primario: '#e69500',
            secundario: '#e69500',
            colorFondo: '#FFFFFF',
            colorTexto: '#000000ff',
            colorTextoFondoPrimario: null,
            fuente: 'Nunito, sans-serif',
            imagenFondo: null,
            blurFondo: 0,
            usarColorTextoFondoPrimario: false,
            vistaHorariosPrincipal: false,
            busquedaPlantillas: false
        };
        this.fuentesDisponibles = [
            // Google Fonts (Requieren ser importadas en tu CSS/HTML, como ya haces con Open Sans y Nunito)
            { nombre: 'Nunito', valor: "'Nunito', sans-serif" },
            { nombre: 'Open Sans', valor: "'Open Sans', sans-serif" },

            // Fuentes Web Seguras (Siempre instaladas en la mayoría de los sistemas operativos)
            { nombre: 'Arial', valor: 'Arial, sans-serif' },
            { nombre: 'Verdana', valor: 'Verdana, Geneva, sans-serif' },
            { nombre: 'Georgia', valor: 'Georgia, serif' },
            { nombre: 'Times New Roman', valor: '"Times New Roman", Times, serif' },
            { nombre: 'Tahoma', valor: 'Tahoma, Geneva, sans-serif' },
            { nombre: 'Trebuchet MS', valor: '"Trebuchet MS", Helvetica, sans-serif' },

            // Fuentes Monospace (Para código o diseño tabular)
            { nombre: 'Courier New', valor: '"Courier New", Courier, monospace' },
            { nombre: 'Consolas', valor: 'Consolas, "Courier New", monospace' }
        ];
        this.init();
    }

    obtenerNombreUsuario() {
        return localStorage.getItem("nombreAsesorActual") || "usuario_anonimo";
    }

    generarClavePreferencias() {
        return `preferencias_${this.nombreUsuario}`;
    }

    init() {
        this.cargarPreferencias();
        this.configurarSelectFuente();
        this.configurarEventos();
        this.aplicarConfiguracion();
    }

    configurarSelectFuente() {
        const selectFuente = document.getElementById('FontFamily');
        if (selectFuente && selectFuente.options.length === 0) {
            this.fuentesDisponibles.forEach(fuente => {
                const option = document.createElement('option');
                option.value = fuente.valor;
                option.textContent = fuente.nombre;
                selectFuente.appendChild(option);
            });
        }
    }

    cargarPreferencias() {
        const clave = this.generarClavePreferencias();
        const preferenciasGuardadas = localStorage.getItem(clave);

        if (preferenciasGuardadas) {
            try {
                const preferencias = JSON.parse(preferenciasGuardadas);
                this.configuracionActual = {
                    primario: preferencias.colorPrimario || this.configuracionDefecto.primario,
                    secundario: preferencias.colorSecundario || this.configuracionDefecto.secundario,
                    colorFondo: preferencias.colorFondo || this.configuracionDefecto.colorFondo,
                    colorTexto: preferencias.colorTexto || this.configuracionDefecto.colorTexto,
                    colorTextoFondoPrimario: preferencias.colorTextoFondoPrimario || this.configuracionDefecto.colorTextoFondoPrimario,
                    usarColorTextoFondoPrimario: preferencias.usarColorTextoFondoPrimario || false,
                    fuente: preferencias.fuente || this.configuracionDefecto.fuente,
                    imagenFondo: preferencias.imagenFondo || this.configuracionDefecto.imagenFondo,
                    blurFondo: preferencias.blurFondo !== undefined ? preferencias.blurFondo : this.configuracionDefecto.blurFondo,
                    vistaHorariosPrincipal: preferencias.vistaHorariosPrincipal || false,
                    busquedaPlantillas: preferencias.busquedaPlantillas || false
                };
            } catch (error) {
                console.error('Error al cargar preferencias:', error);
                this.configuracionActual = { ...this.configuracionDefecto };
            }
        } else {
            this.configuracionActual = { ...this.configuracionDefecto };
        }

        this.actualizarInputsConfiguracion();
    }

    actualizarInputsConfiguracion() {
        const inputPrimario = document.getElementById('ColorPrimario');
        const inputSecundario = document.getElementById('ColorSecundario');
        const inputColorFondo = document.getElementById('ColorFondo');
        const inputColorTexto = document.getElementById('ColorTexto');
        const selectFuente = document.getElementById('FontFamily');
        const inputBlur = document.getElementById('blur');
        const blurValue = document.getElementById('blurValue');
        const checkboxColorTextoFondoPrimario = document.getElementById('activarColorTextoFondoPrimario');
        const inputColorTextoFondoPrimario = document.getElementById('ColorTextoFondoPrimario');
        const contenedorColorTextoFondoPrimario = document.getElementById('contenedorColorTextoFondoPrimario');
        const switchVistaHorarios = document.getElementById('vistaHorariosPrincipal');
        const switchBusquedaPlantillas = document.getElementById('busquedaPlantillas');


        if (inputPrimario) inputPrimario.value = this.configuracionActual.primario;
        if (inputSecundario) inputSecundario.value = this.configuracionActual.secundario;
        if (inputColorFondo) inputColorFondo.value = this.configuracionActual.colorFondo;
        if (inputColorTexto) inputColorTexto.value = this.configuracionActual.colorTexto;
        if (checkboxColorTextoFondoPrimario) {
            checkboxColorTextoFondoPrimario.checked = this.configuracionActual.usarColorTextoFondoPrimario;
        }
        if (inputColorTextoFondoPrimario) {
            // Si no hay color guardado, usa el color de texto actual como valor inicial
            const valorInicial = this.configuracionActual.colorTextoFondoPrimario || this.configuracionActual.colorTexto;
            inputColorTextoFondoPrimario.value = valorInicial;
        }
        if (contenedorColorTextoFondoPrimario) {
            contenedorColorTextoFondoPrimario.style.display =
                this.configuracionActual.usarColorTextoFondoPrimario ? 'flex' : 'none';
            contenedorColorTextoFondoPrimario.style.alignItems =
                this.configuracionActual.usarColorTextoFondoPrimario ? 'flex-start' : 'flex-start';
            contenedorColorTextoFondoPrimario.style.gap =
                this.configuracionActual.usarColorTextoFondoPrimario ? '10px' : '0px';
        }
        if (selectFuente) selectFuente.value = this.configuracionActual.fuente;
        if (inputBlur) inputBlur.value = this.configuracionActual.blurFondo;
        if (blurValue) blurValue.textContent = `${this.configuracionActual.blurFondo}%`;
        if (switchVistaHorarios) switchVistaHorarios.checked = this.configuracionActual.vistaHorariosPrincipal;
        if (switchBusquedaPlantillas) switchBusquedaPlantillas.checked = this.configuracionActual.busquedaPlantillas;

        this.mostrarPreviewImagenActual();
    }

    mostrarPreviewImagenActual() {
        const previewContainer = document.getElementById('previewImagenFondo');
        if (previewContainer) {
            previewContainer.innerHTML = '';

            if (this.configuracionActual.imagenFondo) {
                const img = document.createElement('img');
                img.src = this.configuracionActual.imagenFondo;
                img.style.maxWidth = '200px';
                img.style.maxHeight = '150px';
                img.style.objectFit = 'cover';
                img.style.border = '2px solid var(--color-primario)';
                img.style.borderRadius = '8px';
                img.style.display = 'block';
                img.style.marginTop = '5px';

                previewContainer.appendChild(img);
            }
        }
    }

    eliminarImagenFondo() {
        const confirmacion = confirm('¿Está seguro que desea eliminar la imagen de fondo?');

        if (!confirmacion) {
            return;
        }

        this.configuracionActual.imagenFondo = null;

        this.aplicarConfiguracion();

        this.mostrarPreviewImagenActual();

        const inputImagen = document.getElementById('ImagenFondo');
        if (inputImagen) {
            inputImagen.value = '';
        }

        const nombreUsuario = this.obtenerNombreUsuario();
        const clavePreferencias = `preferencias_${nombreUsuario}`;

        const preferenciasGuardadas = localStorage.getItem(clavePreferencias);
        let preferencias = {};

        if (preferenciasGuardadas) {
            try {
                preferencias = JSON.parse(preferenciasGuardadas);
            } catch (error) {
                console.error('Error al leer preferencias:', error);
                preferencias = {};
            }
        }

        preferencias.imagenFondo = null;
        preferencias.fechaGuardado = new Date().toISOString();

        try {
            localStorage.setItem(clavePreferencias, JSON.stringify(preferencias));
            this.mostrarNotificacion('Imagen de fondo eliminada correctamente', 'exito');
        } catch (error) {
            console.error('Error al guardar preferencias:', error);
            this.mostrarNotificacion('Error al eliminar la imagen de fondo', 'error');
        }
    }

    aplicarConfiguracion() {
        const root = document.documentElement;
        root.style.setProperty('--color-primario', this.configuracionActual.primario);
        root.style.setProperty('--color-secundario', this.configuracionActual.secundario);
        root.style.setProperty('--color-fondo', this.configuracionActual.colorFondo);
        root.style.setProperty('--color-texto', this.configuracionActual.colorTexto);
        if (this.configuracionActual.usarColorTextoFondoPrimario && this.configuracionActual.colorTextoFondoPrimario) {
            root.style.setProperty('--color-texto-fondo-primario', this.configuracionActual.colorTextoFondoPrimario);
        } else {
            root.style.setProperty('--color-texto-fondo-primario', this.configuracionActual.colorTexto);
        }
        root.style.setProperty('--font-family', this.configuracionActual.fuente);

        if (this.configuracionActual.imagenFondo) {
            document.body.style.backgroundImage = `url(${this.configuracionActual.imagenFondo})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundRepeat = 'no-repeat';
            document.body.style.backgroundAttachment = 'fixed';
        } else {
            document.body.style.backgroundImage = 'none';
        }

        const nav = document.querySelector('nav');
        const footer = document.querySelector('footer');
        const header = document.querySelector('header');

        if (this.configuracionActual.imagenFondo) {
            const blurPixels = this.configuracionActual.blurFondo / 10;
            const opacity = this.configuracionActual.blurFondo / 100;

            if (nav) {
                nav.style.backdropFilter = `blur(${blurPixels}px)`;
                nav.style.backgroundColor = `rgba(255, 255, 255, ${opacity * 0.2})`;
            }
            if (footer) {
                footer.style.backdropFilter = `blur(${blurPixels}px)`;
                footer.style.backgroundColor = `rgba(255, 255, 255, ${opacity * 0.2})`;
            }
            if (header) {
                header.style.backdropFilter = `blur(${blurPixels}px)`;
                header.style.backgroundColor = `rgba(255, 255, 255, 0)`;
            }
        } else {
            if (nav) {
                nav.style.backdropFilter = '';
                nav.style.backgroundColor = '';
            }
            if (footer) {
                footer.style.backdropFilter = '';
                footer.style.backgroundColor = '';
            }
            if (header) {
                header.style.backdropFilter = '';
                header.style.backgroundColor = '';
            }
        }

        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute('content', this.configuracionActual.primario);
        }
    }

    procesarImagenFondo(archivo) {
        if (!archivo.type.startsWith('image/')) {
            this.mostrarNotificacion('Por favor seleccione un archivo de imagen válido', 'error');
            return;
        }

        const tamañoMaximo = 5 * 1024 * 1024;
        if (archivo.size > tamañoMaximo) {
            this.mostrarNotificacion('La imagen es demasiado grande. Máximo 5MB permitido.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imagenBase64 = e.target.result;

                const img = new Image();
                img.onload = () => {
                    this.configuracionActual.imagenFondo = imagenBase64;
                    this.aplicarConfiguracion();
                    this.mostrarPreviewImagenActual();

                    const blurValue = document.getElementById('blurValue');
                    const inputBlur = document.getElementById('blur');
                    if (blurValue && inputBlur) {
                        blurValue.textContent = `${inputBlur.value}%`;
                    }

                    this.mostrarNotificacion('Imagen de fondo cargada correctamente', 'exito');
                };

                img.onerror = () => {
                    this.mostrarNotificacion('Error al cargar la imagen', 'error');
                };

                img.src = imagenBase64;

            } catch (error) {
                console.error('Error al procesar imagen:', error);
                this.mostrarNotificacion('Error al procesar la imagen', 'error');
            }
        };

        reader.onerror = () => {
            this.mostrarNotificacion('Error al leer el archivo', 'error');
        };

        reader.readAsDataURL(archivo);
    }

    guardarPreferencias() {
        const inputPrimario = document.getElementById('ColorPrimario');
        const inputSecundario = document.getElementById('ColorSecundario');
        const inputColorFondo = document.getElementById('ColorFondo');
        const inputColorTexto = document.getElementById('ColorTexto');
        const selectFuente = document.getElementById('FontFamily');
        const inputBlur = document.getElementById('blur');
        const checkboxColorTextoFondoPrimario = document.getElementById('activarColorTextoFondoPrimario');
        const inputColorTextoFondoPrimario = document.getElementById('ColorTextoFondoPrimario');

        if (!inputPrimario || !inputSecundario || !inputColorFondo || !inputColorTexto || !inputBlur) {
            console.error('No se encontraron todos los inputs de color');
            return false;
        }

        const nuevasPreferencias = {
            colorPrimario: inputPrimario.value,
            colorSecundario: inputSecundario.value,
            colorFondo: inputColorFondo.value,
            colorTexto: inputColorTexto.value,
            colorTextoFondoPrimario: inputColorTextoFondoPrimario ? inputColorTextoFondoPrimario.value : null,
            usarColorTextoFondoPrimario: checkboxColorTextoFondoPrimario ? checkboxColorTextoFondoPrimario.checked : false,
            fuente: selectFuente ? selectFuente.value : this.configuracionDefecto.fuente,
            imagenFondo: this.configuracionActual.imagenFondo,
            blurFondo: inputBlur ? parseInt(inputBlur.value) : 0,
            vistaHorariosPrincipal: document.getElementById('vistaHorariosPrincipal')?.checked || false,
            busquedaPlantillas: document.getElementById('busquedaPlantillas')?.checked || false,
            fechaGuardado: new Date().toISOString(),
            usuario: this.nombreUsuario
        };

        try {
            const clave = this.generarClavePreferencias();
            localStorage.setItem(clave, JSON.stringify(nuevasPreferencias));

            this.configuracionActual = {
                primario: nuevasPreferencias.colorPrimario,
                secundario: nuevasPreferencias.colorSecundario,
                colorFondo: nuevasPreferencias.colorFondo,
                colorTexto: nuevasPreferencias.colorTexto,
                colorTextoFondoPrimario: nuevasPreferencias.colorTextoFondoPrimario,
                usarColorTextoFondoPrimario: nuevasPreferencias.usarColorTextoFondoPrimario,
                fuente: nuevasPreferencias.fuente,
                imagenFondo: nuevasPreferencias.imagenFondo,
                blurFondo: nuevasPreferencias.blurFondo
            };

            this.aplicarConfiguracion();

            this.mostrarNotificacion('Configuraciones guardadas correctamente', 'exito');
            return true;
        } catch (error) {
            console.error('Error al guardar preferencias:', error);
            if (error.name === 'QuotaExceededError') {
                this.mostrarNotificacion('Error: No hay suficiente espacio de almacenamiento. La imagen es demasiado grande.', 'error');
            } else {
                this.mostrarNotificacion('Error al guardar configuraciones', 'error');
            }
            return false;
        }
    }

    restablecerPreferencias() {
        const confirmacion = confirm('¿Está seguro que desea restablecer la configuración a los valores por defecto?');

        if (confirmacion) {
            const inputPrimario = document.getElementById('ColorPrimario');
            const inputSecundario = document.getElementById('ColorSecundario');
            const inputColorFondo = document.getElementById('ColorFondo');
            const inputColorTexto = document.getElementById('ColorTexto');
            const selectFuente = document.getElementById('FontFamily');
            const inputImagen = document.getElementById('ImagenFondo');
            const inputBlur = document.getElementById('blur');
            const blurValue = document.getElementById('blurValue');
            const checkboxColorTextoFondoPrimario = document.getElementById('activarColorTextoFondoPrimario');
            const inputColorTextoFondoPrimario = document.getElementById('ColorTextoFondoPrimario');
            const contenedorColorTextoFondoPrimario = document.getElementById('contenedorColorTextoFondoPrimario');

            if (inputPrimario) inputPrimario.value = this.configuracionDefecto.primario;
            if (inputSecundario) inputSecundario.value = this.configuracionDefecto.secundario;
            if (inputColorFondo) inputColorFondo.value = this.configuracionDefecto.colorFondo;
            if (inputColorTexto) inputColorTexto.value = this.configuracionDefecto.colorTexto;
            if (selectFuente) selectFuente.value = this.configuracionDefecto.fuente;
            if (inputImagen) inputImagen.value = '';
            if (inputBlur) inputBlur.value = this.configuracionDefecto.blurFondo;
            if (blurValue) blurValue.textContent = `${this.configuracionDefecto.blurFondo}%`;
            if (checkboxColorTextoFondoPrimario) checkboxColorTextoFondoPrimario.checked = this.configuracionDefecto.usarColorTextoFondoPrimario;
            if (inputColorTextoFondoPrimario) inputColorTextoFondoPrimario.value = this.configuracionDefecto.colorTexto;
            if (contenedorColorTextoFondoPrimario) contenedorColorTextoFondoPrimario.style.display = 'none';

            this.configuracionActual = { ...this.configuracionDefecto };

            this.aplicarConfiguracion();
            this.mostrarPreviewImagenActual();

            const clave = this.generarClavePreferencias();
            localStorage.removeItem(clave);

            this.mostrarNotificacion('Configuraciones restablecidas', 'exito');
        }
    }

    previsualizarCambios() {
        const inputPrimario = document.getElementById('ColorPrimario');
        const inputSecundario = document.getElementById('ColorSecundario');
        const inputColorFondo = document.getElementById('ColorFondo');
        const inputColorTexto = document.getElementById('ColorTexto');
        const selectFuente = document.getElementById('FontFamily');

        if (inputPrimario && inputSecundario && inputColorFondo && inputColorTexto) {
            const root = document.documentElement;
            root.style.setProperty('--color-primario', inputPrimario.value);
            root.style.setProperty('--color-secundario', inputSecundario.value);
            root.style.setProperty('--color-fondo', inputColorFondo.value);
            root.style.setProperty('--color-texto', inputColorTexto.value);

            const checkboxColorTextoFondoPrimario = document.getElementById('activarColorTextoFondoPrimario');
            const inputColorTextoFondoPrimario = document.getElementById('ColorTextoFondoPrimario');

            if (checkboxColorTextoFondoPrimario && checkboxColorTextoFondoPrimario.checked && inputColorTextoFondoPrimario) {
                root.style.setProperty('--color-texto-fondo-primario', inputColorTextoFondoPrimario.value);
            } else {
                root.style.setProperty('--color-texto-fondo-primario', inputColorTexto.value);
            }

            if (selectFuente) {
                root.style.setProperty('--font-family', selectFuente.value);
            }
        }
    }

    configurarEventos() {
        const btnGuardar = document.getElementById('btnGuardarConfiguraciones');
        if (btnGuardar) {
            btnGuardar.addEventListener('click', () => this.guardarPreferencias());
        }

        const btnRestablecer = document.getElementById('btnRestablecerConfiguraciones');
        if (btnRestablecer) {
            btnRestablecer.addEventListener('click', () => this.restablecerPreferencias());
        }

        const inputImagenFondo = document.getElementById('ImagenFondo');
        if (inputImagenFondo) {
            inputImagenFondo.addEventListener('change', (e) => {
                const archivo = e.target.files[0];
                if (archivo) {
                    this.procesarImagenFondo(archivo);
                }
            });
        }

        const inputBlur = document.getElementById('blur');
        const blurValue = document.getElementById('blurValue');
        if (inputBlur) {
            inputBlur.addEventListener('input', () => {
                this.configuracionActual.blurFondo = parseInt(inputBlur.value);
                if (blurValue) blurValue.textContent = `${inputBlur.value}%`;
                this.aplicarConfiguracion();
            });
        }

        const inputPrimario = document.getElementById('ColorPrimario');
        const inputSecundario = document.getElementById('ColorSecundario');
        const inputColorFondo = document.getElementById('ColorFondo');
        const inputColorTexto = document.getElementById('ColorTexto');

        if (inputPrimario) {
            inputPrimario.addEventListener('input', () => this.previsualizarCambios());
        }

        if (inputSecundario) {
            inputSecundario.addEventListener('input', () => this.previsualizarCambios());
        }

        if (inputColorFondo) {
            inputColorFondo.addEventListener('input', () => this.previsualizarCambios());
        }

        if (inputColorTexto) {
            inputColorTexto.addEventListener('input', () => this.previsualizarCambios());
        }

        const selectFuente = document.getElementById('FontFamily');
        if (selectFuente) {
            selectFuente.addEventListener('change', () => this.previsualizarCambios());
        }

        const checkboxColorTextoFondoPrimario = document.getElementById('activarColorTextoFondoPrimario');
        const contenedorColorTextoFondoPrimario = document.getElementById('contenedorColorTextoFondoPrimario');
        const inputColorTextoFondoPrimario = document.getElementById('ColorTextoFondoPrimario');

        if (checkboxColorTextoFondoPrimario && contenedorColorTextoFondoPrimario) {
            checkboxColorTextoFondoPrimario.addEventListener('change', () => {
                contenedorColorTextoFondoPrimario.style.display =
                    checkboxColorTextoFondoPrimario.checked ? 'flex' : 'none';
                contenedorColorTextoFondoPrimario.style.alignItems =
                    checkboxColorTextoFondoPrimario.checked ? 'flex-start' : 'flex-start';
                contenedorColorTextoFondoPrimario.style.gap =
                    checkboxColorTextoFondoPrimario.checked ? '10px' : '0px';
                this.configuracionActual.usarColorTextoFondoPrimario = checkboxColorTextoFondoPrimario.checked;

                if (checkboxColorTextoFondoPrimario.checked && !this.configuracionActual.colorTextoFondoPrimario) {
                    const inputColorTexto = document.getElementById('ColorTexto');
                    const inputColorTextoFondoPrimario = document.getElementById('ColorTextoFondoPrimario');
                    if (inputColorTexto && inputColorTextoFondoPrimario) {
                        this.configuracionActual.colorTextoFondoPrimario = inputColorTexto.value;
                        inputColorTextoFondoPrimario.value = inputColorTexto.value;
                    }
                }

                this.previsualizarCambios();
            });
        }

        if (inputColorTextoFondoPrimario) {
            inputColorTextoFondoPrimario.addEventListener('input', () => {
                this.configuracionActual.colorTextoFondoPrimario = inputColorTextoFondoPrimario.value;
                this.previsualizarCambios(); // Cambia esto para que use previsualizarCambios
            });
        }

        const switchVistaHorarios = document.getElementById('vistaHorariosPrincipal');
        const switchBusquedaPlantillas = document.getElementById('busquedaPlantillas');

        if (switchVistaHorarios) {
            switchVistaHorarios.addEventListener('change', () => {
                this.configuracionActual.vistaHorariosPrincipal = switchVistaHorarios.checked;
            });
        }

        if (switchBusquedaPlantillas) {
            switchBusquedaPlantillas.addEventListener('change', () => {
                this.configuracionActual.busquedaPlantillas = switchBusquedaPlantillas.checked;
            });
        }
        const btnEliminarImagen = document.getElementById('eliminarImagen');
        if (btnEliminarImagen) {
            btnEliminarImagen.addEventListener('click', () => this.eliminarImagenFondo());
        }

        // Copiar tema al portapapeles
        const btnCopiarTema = document.getElementById('btnCopiarTema');
        if (btnCopiarTema) {
            btnCopiarTema.addEventListener('click', () => this.copiarTemaAlPortapapeles());
        }

        // Importar tema desde portapapeles
        const btnImportarTema = document.getElementById('btnImportarTema');
        if (btnImportarTema) {
            btnImportarTema.addEventListener('click', () => this.importarTemaDesdePortapapeles());
        }

        // Exportar configuración completa
        const btnExportarCompleto = document.getElementById('btnExportarCompleto');
        if (btnExportarCompleto) {
            btnExportarCompleto.addEventListener('click', () => this.exportarConfiguracionCompleta());
        }

        // Importar configuración completa
        const inputImportarCompleto = document.getElementById('inputImportarCompleto');
        if (inputImportarCompleto) {
            inputImportarCompleto.addEventListener('change', (e) => {
                const archivo = e.target.files[0];
                if (archivo) {
                    this.importarConfiguracionCompleta(archivo);
                }
            });
        }
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        if (typeof mostrarNotificacion === 'function') {
            mostrarNotificacion(mensaje, tipo);
        } else {
            alert(mensaje);
        }
    }

    static aplicarPreferenciasGlobales() {
        const nombreUsuario = localStorage.getItem("nombreAsesorActual") || "usuario_anonimo";
        const clave = `preferencias_${nombreUsuario}`;
        const preferenciasGuardadas = localStorage.getItem(clave);

        if (preferenciasGuardadas) {
            try {
                const preferencias = JSON.parse(preferenciasGuardadas);
                const root = document.documentElement;

                if (preferencias.colorPrimario) {
                    root.style.setProperty('--color-primario', preferencias.colorPrimario);
                }

                if (preferencias.colorSecundario) {
                    root.style.setProperty('--color-secundario', preferencias.colorSecundario);
                }

                if (preferencias.colorFondo) {
                    root.style.setProperty('--color-fondo', preferencias.colorFondo);
                }

                if (preferencias.colorTexto) {
                    root.style.setProperty('--color-texto', preferencias.colorTexto);
                }

                if (preferencias.usarColorTextoFondoPrimario && preferencias.colorTextoFondoPrimario) {
                    root.style.setProperty('--color-texto-fondo-primario', preferencias.colorTextoFondoPrimario);
                } else if (preferencias.colorTexto) {
                    root.style.setProperty('--color-texto-fondo-primario', preferencias.colorTexto);
                }

                if (preferencias.fuente) {
                    root.style.setProperty('--font-family', preferencias.fuente);
                }

                if (preferencias.imagenFondo) {
                    document.body.style.backgroundImage = `url(${preferencias.imagenFondo})`;
                    document.body.style.backgroundSize = 'cover';
                    document.body.style.backgroundPosition = 'center';
                    document.body.style.backgroundRepeat = 'no-repeat';
                    document.body.style.backgroundAttachment = 'fixed';
                } else {
                    document.body.style.backgroundImage = 'none';
                }

                const blurValue = preferencias.blurFondo !== undefined ? preferencias.blurFondo : 0;
                const nav = document.querySelector('nav');
                const footer = document.querySelector('footer');
                const header = document.querySelector('header');

                if (preferencias.imagenFondo) {
                    const blurPixels = blurValue / 10;
                    const opacity = blurValue / 100;

                    if (nav) {
                        nav.style.backdropFilter = `blur(${blurPixels}px)`;
                        nav.style.backgroundColor = `rgba(255, 255, 255, ${opacity * 0.2})`;
                    }
                    if (footer) {
                        footer.style.backdropFilter = `blur(${blurPixels}px)`;
                        footer.style.backgroundColor = `rgba(255, 255, 255, ${opacity * 0.2})`;
                    }
                    if (header) {
                        header.style.backdropFilter = `blur(${blurPixels}px)`;
                        header.style.backgroundColor = 'rgba(255, 255, 255, 0)';
                    }
                }

                const metaTheme = document.querySelector('meta[name="theme-color"]');
                if (metaTheme && preferencias.colorPrimario) {
                    metaTheme.setAttribute('content', preferencias.colorPrimario);
                }
            } catch (error) {
                console.error('Error al aplicar preferencias globales:', error);
            }
        }
    }

    static obtenerFuentesDisponibles() {
        return [
            // Google Fonts (Requieren ser importadas en tu CSS/HTML, como ya haces con Open Sans y Nunito)
            { nombre: 'Nunito', valor: "'Nunito', sans-serif" },
            { nombre: 'Open Sans', valor: "'Open Sans', sans-serif" },

            // Fuentes Web Seguras (Siempre instaladas en la mayoría de los sistemas operativos)
            { nombre: 'Arial', valor: 'Arial, sans-serif' },
            { nombre: 'Verdana', valor: 'Verdana, Geneva, sans-serif' },
            { nombre: 'Georgia', valor: 'Georgia, serif' },
            { nombre: 'Times New Roman', valor: '"Times New Roman", Times, serif' },
            { nombre: 'Tahoma', valor: 'Tahoma, Geneva, sans-serif' },
            { nombre: 'Trebuchet MS', valor: '"Trebuchet MS", Helvetica, sans-serif' },

            // Fuentes Monospace (Para código o diseño tabular)
            { nombre: 'Courier New', valor: '"Courier New", Courier, monospace' },
            { nombre: 'Consolas', valor: 'Consolas, "Courier New", monospace' }
        ];
    }

    copiarTemaAlPortapapeles() {
        const temaCompacto = {
            p: this.configuracionActual.primario,
            s: this.configuracionActual.secundario,
            f: this.configuracionActual.colorFondo,
            t: this.configuracionActual.colorTexto,
            tp: this.configuracionActual.colorTextoFondoPrimario,
            utp: this.configuracionActual.usarColorTextoFondoPrimario,
            fn: this.configuracionActual.fuente,
            b: this.configuracionActual.blurFondo
        };

        const jsonString = JSON.stringify(temaCompacto);
        const base64 = btoa(unescape(encodeURIComponent(jsonString)));
        const codigoTema = `THEME:${base64}`;

        navigator.clipboard.writeText(codigoTema).then(() => {
            this.mostrarNotificacion('Código de tema copiado al portapapeles', 'exito');
        }).catch(err => {
            console.error('Error al copiar:', err);
            this.mostrarNotificacion('Error al copiar el código', 'error');
        });
    }

    importarTemaDesdePortapapeles() {
        const codigo = prompt('Pega el código del tema (THEME:...)');

        if (!codigo) return;

        if (!codigo.startsWith('THEME:')) {
            this.mostrarNotificacion('Código de tema inválido', 'error');
            return;
        }

        try {
            const base64 = codigo.replace('THEME:', '');
            const jsonString = decodeURIComponent(escape(atob(base64)));
            const tema = JSON.parse(jsonString);

            // Aplicar al formulario
            const inputPrimario = document.getElementById('ColorPrimario');
            const inputSecundario = document.getElementById('ColorSecundario');
            const inputColorFondo = document.getElementById('ColorFondo');
            const inputColorTexto = document.getElementById('ColorTexto');
            const inputColorTextoFondoPrimario = document.getElementById('ColorTextoFondoPrimario');
            const checkboxColorTextoFondoPrimario = document.getElementById('activarColorTextoFondoPrimario');
            const selectFuente = document.getElementById('FontFamily');
            const inputBlur = document.getElementById('blur');
            const blurValue = document.getElementById('blurValue');

            if (inputPrimario) inputPrimario.value = tema.p;
            if (inputSecundario) inputSecundario.value = tema.s;
            if (inputColorFondo) inputColorFondo.value = tema.f;
            if (inputColorTexto) inputColorTexto.value = tema.t;
            if (inputColorTextoFondoPrimario && tema.tp) inputColorTextoFondoPrimario.value = tema.tp;
            if (checkboxColorTextoFondoPrimario) checkboxColorTextoFondoPrimario.checked = tema.utp || false;
            if (selectFuente && tema.fn) selectFuente.value = tema.fn;
            if (inputBlur && tema.b !== undefined) inputBlur.value = tema.b;
            if (blurValue && tema.b !== undefined) blurValue.textContent = `${tema.b}%`;

            // Actualizar vista del contenedor
            const contenedorColorTextoFondoPrimario = document.getElementById('contenedorColorTextoFondoPrimario');
            if (contenedorColorTextoFondoPrimario) {
                contenedorColorTextoFondoPrimario.style.display = tema.utp ? 'flex' : 'none';
            }

            // Previsualizar los cambios
            this.previsualizarCambios();

            this.mostrarNotificacion('Tema importado correctamente. Guarda para aplicar permanentemente.', 'exito');
        } catch (error) {
            console.error('Error al importar tema:', error);
            this.mostrarNotificacion('Error al importar el código del tema', 'error');
        }
    }

    exportarConfiguracionCompleta() {
        const clave = this.generarClavePreferencias();
        const preferencias = localStorage.getItem(clave);

        if (preferencias) {
            const blob = new Blob([preferencias], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tema_completo_${this.nombreUsuario}_${new Date().getTime()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.mostrarNotificacion('Configuración completa exportada (incluye imagen)', 'exito');
        } else {
            this.mostrarNotificacion('No hay configuración para exportar', 'warning');
        }
    }

    importarConfiguracionCompleta(archivo) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const preferencias = JSON.parse(e.target.result);

                // Validar que tenga los campos mínimos
                if (preferencias.colorPrimario && preferencias.colorSecundario && preferencias.colorFondo) {
                    const clave = this.generarClavePreferencias();
                    localStorage.setItem(clave, JSON.stringify(preferencias));

                    this.cargarPreferencias();
                    this.aplicarConfiguracion();

                    this.mostrarNotificacion('Configuración completa importada (incluye imagen)', 'exito');
                } else {
                    throw new Error('Archivo de configuración inválido');
                }
            } catch (error) {
                console.error('Error al importar configuración completa:', error);
                this.mostrarNotificacion('Error al importar la configuración', 'error');
            }
        };
        reader.readAsText(archivo);
    }

    obtenerConfiguracionActual() {
        return { ...this.configuracionActual };
    }

    actualizarConfiguracion(tipo, valor) {
        if (this.configuracionActual.hasOwnProperty(tipo)) {
            this.configuracionActual[tipo] = valor;
            this.aplicarConfiguracion();
            return true;
        }
        return false;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('ColorPrimario') && document.getElementById('ColorSecundario') && document.getElementById('ColorFondo') && document.getElementById('ColorTexto')) {
        window.preferenciasColores = new PreferenciasColores();
    } else {
        PreferenciasColores.aplicarPreferenciasGlobales();
    }
});

PreferenciasColores.aplicarPreferenciasGlobales();
let temas = [];

// Cargar temas desde JSON
async function cargarTemas() {
    try {
        const respuesta = await fetch('temas.json'); // Ruta al archivo
        if (!respuesta.ok) throw new Error('No se pudo cargar temas.json');
        temas = await respuesta.json();
        crearBotonesTemas();
    } catch (error) {
        console.error('Error al cargar los temas:', error);
    }
}

// Función para crear los botones de tema
function crearBotonesTemas() {
    const container = document.getElementById('temasButtons');
    if (!container) {
        return;
    }

    container.innerHTML = '';

    temas.forEach((tema) => {
        const temaContainer = document.createElement('div');
        temaContainer.className = 'tema-container';

        const nombreSpan = document.createElement('span');
        nombreSpan.className = 'tema-nombre';
        nombreSpan.textContent = tema.nombre;

        const boton = document.createElement('button');
        boton.className = 'tema-boton';

        // Si tiene color de texto fondo primario, dividir el cuarto del texto en 2
        if (tema.textoFondoPrimario) {
            boton.style.background = `conic-gradient(
                from 0deg,
                ${tema.primario} 0deg 90deg,
                ${tema.secundario} 90deg 180deg,
                ${tema.fondo} 180deg 270deg,
                ${tema.texto} 270deg 315deg,
                ${tema.textoFondoPrimario} 315deg 360deg
            )`;
        } else {
            // Si NO tiene, dividir en 4 partes iguales (original)
            boton.style.background = `conic-gradient(
                from 0deg,
                ${tema.primario} 0deg 90deg,
                ${tema.secundario} 90deg 180deg,
                ${tema.fondo} 180deg 270deg,
                ${tema.texto} 270deg 360deg
            )`;
        }

        boton.title = tema.nombre;

        boton.addEventListener('click', () => aplicarTema(tema));

        temaContainer.appendChild(nombreSpan);
        temaContainer.appendChild(boton);
        container.appendChild(temaContainer);
    });

    console.log(`Se crearon ${temas.length} botones de tema`);
}

function aplicarTema(tema) {
    const ids = ['ColorPrimario', 'ColorSecundario', 'ColorFondo', 'ColorTexto'];
    const valores = [tema.primario, tema.secundario, tema.fondo, tema.texto];

    ids.forEach((id, i) => {
        const input = document.getElementById(id);
        if (input) {
            input.value = valores[i];
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });

    // Manejar el color de texto para fondo primario
    const checkboxColorTextoFondoPrimario = document.getElementById('activarColorTextoFondoPrimario');
    const inputColorTextoFondoPrimario = document.getElementById('ColorTextoFondoPrimario');
    const contenedorColorTextoFondoPrimario = document.getElementById('contenedorColorTextoFondoPrimario');

    if (tema.textoFondoPrimario) {
        // Si el tema tiene color de texto para fondo primario
        if (checkboxColorTextoFondoPrimario) {
            checkboxColorTextoFondoPrimario.checked = true;
        }
        if (inputColorTextoFondoPrimario) {
            inputColorTextoFondoPrimario.value = tema.textoFondoPrimario;
            inputColorTextoFondoPrimario.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (contenedorColorTextoFondoPrimario) {
            contenedorColorTextoFondoPrimario.style.display = 'flex';
        }
    } else {
        // Si el tema NO tiene color de texto para fondo primario
        if (checkboxColorTextoFondoPrimario) {
            checkboxColorTextoFondoPrimario.checked = false;
        }
        if (contenedorColorTextoFondoPrimario) {
            contenedorColorTextoFondoPrimario.style.display = 'none';
        }
    }

    // Disparar el evento change del checkbox para que actualice correctamente
    if (checkboxColorTextoFondoPrimario) {
        checkboxColorTextoFondoPrimario.dispatchEvent(new Event('change', { bubbles: true }));
    }
}

// Inicializar al cargar la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cargarTemas);
} else {
    cargarTemas();
}

