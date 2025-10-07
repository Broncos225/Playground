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
            usarColorTextoFondoPrimario: false
        };
        this.fuentesDisponibles = [
            { nombre: 'Nunito', valor: "'Nunito', Arial, sans-serif" },
            { nombre: 'Arial', valor: 'Arial, sans-serif' },
            { nombre: 'Helvetica', valor: 'Helvetica, Arial, sans-serif' },
            { nombre: 'Times New Roman', valor: '"Times New Roman", Times, serif' },
            { nombre: 'Georgia', valor: 'Georgia, serif' },
            { nombre: 'Verdana', valor: 'Verdana, Geneva, sans-serif' },
            { nombre: 'Trebuchet MS', valor: '"Trebuchet MS", Helvetica, sans-serif' },
            { nombre: 'Comic Sans MS', valor: '"Comic Sans MS", cursive' },
            { nombre: 'Impact', valor: 'Impact, Charcoal, sans-serif' },
            { nombre: 'Courier New', valor: '"Courier New", Courier, monospace' },
            { nombre: 'Lucida Console', valor: '"Lucida Console", Monaco, monospace' }
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
                    blurFondo: preferencias.blurFondo !== undefined ? preferencias.blurFondo : this.configuracionDefecto.blurFondo
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
                this.configuracionActual.usarColorTextoFondoPrimario ? 'center' : 'flex-start';
            contenedorColorTextoFondoPrimario.style.gap =
                this.configuracionActual.usarColorTextoFondoPrimario ? '10px' : '0px';
        }
        if (selectFuente) selectFuente.value = this.configuracionActual.fuente;
        if (inputBlur) inputBlur.value = this.configuracionActual.blurFondo;
        if (blurValue) blurValue.textContent = `${this.configuracionActual.blurFondo}%`;

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
                    checkboxColorTextoFondoPrimario.checked ? 'center' : 'flex-start';
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

        const btnEliminarImagen = document.getElementById('eliminarImagen');
        if (btnEliminarImagen) {
            btnEliminarImagen.addEventListener('click', () => this.eliminarImagenFondo());
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
            { nombre: 'Nunito', valor: "'Nunito', Arial, sans-serif" },
            { nombre: 'Arial', valor: 'Arial, sans-serif' },
            { nombre: 'Helvetica', valor: 'Helvetica, Arial, sans-serif' },
            { nombre: 'Times New Roman', valor: '"Times New Roman", Times, serif' },
            { nombre: 'Georgia', valor: 'Georgia, serif' },
            { nombre: 'Verdana', valor: 'Verdana, Geneva, sans-serif' },
            { nombre: 'Trebuchet MS', valor: '"Trebuchet MS", Helvetica, sans-serif' },
            { nombre: 'Comic Sans MS', valor: '"Comic Sans MS", cursive' },
            { nombre: 'Impact', valor: 'Impact, Charcoal, sans-serif' },
            { nombre: 'Courier New', valor: '"Courier New", Courier, monospace' },
            { nombre: 'Lucida Console', valor: '"Lucida Console", Monaco, monospace' }
        ];
    }

    exportarPreferencias() {
        const clave = this.generarClavePreferencias();
        const preferencias = localStorage.getItem(clave);

        if (preferencias) {
            const blob = new Blob([preferencias], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `preferencias_${this.nombreUsuario}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.mostrarNotificacion('Preferencias exportadas correctamente', 'exito');
        } else {
            this.mostrarNotificacion('No hay preferencias para exportar', 'warning');
        }
    }

    importarPreferencias(archivo) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const preferencias = JSON.parse(e.target.result);

                if (preferencias.colorPrimario && preferencias.colorSecundario && preferencias.colorFondo) {
                    if (!preferencias.fuente) {
                        preferencias.fuente = this.configuracionDefecto.fuente;
                    }
                    if (!preferencias.colorTexto) {
                        preferencias.colorTexto = this.configuracionDefecto.colorTexto;
                    }
                    if (!preferencias.imagenFondo) {
                        preferencias.imagenFondo = null;
                    }
                    if (preferencias.blurFondo === undefined) {
                        preferencias.blurFondo = this.configuracionDefecto.blurFondo;
                    }

                    const clave = this.generarClavePreferencias();
                    localStorage.setItem(clave, JSON.stringify(preferencias));

                    this.cargarPreferencias();
                    this.aplicarConfiguracion();

                    this.mostrarNotificacion('Preferencias importadas correctamente', 'exito');
                } else {
                    throw new Error('Archivo de preferencias inválido');
                }
            } catch (error) {
                console.error('Error al importar preferencias:', error);
                this.mostrarNotificacion('Error al importar preferencias', 'error');
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
        console.error('No se encontró el contenedor temasButtons');
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
        boton.style.background = `conic-gradient(
            from 0deg,
            ${tema.primario} 0deg 90deg,
            ${tema.secundario} 90deg 180deg,
            ${tema.fondo} 180deg 270deg,
            ${tema.texto} 270deg 360deg
        )`;
        boton.title = tema.nombre;

        boton.addEventListener('click', () => aplicarTema(tema));

        temaContainer.appendChild(nombreSpan);
        temaContainer.appendChild(boton);
        container.appendChild(temaContainer);
    });

    console.log(`Se crearon ${temas.length} botones de tema`);
}

// Función para aplicar un tema
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
}

// Inicializar al cargar la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cargarTemas);
} else {
    cargarTemas();
}
