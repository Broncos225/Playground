// Configuraciones.js - Sistema de preferencias de colores y fuentes
class PreferenciasColores {
    constructor() {
        this.nombreUsuario = this.obtenerNombreUsuario();
        this.configuracionDefecto = {
            primario: '#e69500',
            secundario: '#e69500',
            colorFondo: '#FFFFFF',
            colorTexto: '#000000ff',
            fuente: 'Nunito, sans-serif',
            imagenFondo: null,
            blurFondo: false
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

    // Obtener el nombre del usuario actual
    obtenerNombreUsuario() {
        return localStorage.getItem("nombreAsesorActual") || "usuario_anonimo";
    }

    // Generar clave única para las preferencias del usuario
    generarClavePreferencias() {
        return `preferencias_${this.nombreUsuario}`;
    }

    // Inicializar el sistema
    init() {
        this.cargarPreferencias();
        this.configurarSelectFuente();
        this.configurarEventos();
        this.aplicarConfiguracion();
    }

    // Configurar el select de fuentes si existe
    configurarSelectFuente() {
        const selectFuente = document.getElementById('FontFamily');
        if (selectFuente && selectFuente.options.length === 0) {
            // Solo llenar si está vacío
            this.fuentesDisponibles.forEach(fuente => {
                const option = document.createElement('option');
                option.value = fuente.valor;
                option.textContent = fuente.nombre;
                selectFuente.appendChild(option);
            });
        }
    }

    // Cargar preferencias guardadas
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
                    fuente: preferencias.fuente || this.configuracionDefecto.fuente,
                    imagenFondo: preferencias.imagenFondo || this.configuracionDefecto.imagenFondo,
                    blurFondo: preferencias.blurFondo || this.configuracionDefecto.blurFondo
                };
            } catch (error) {
                console.error('Error al cargar preferencias:', error);
                this.configuracionActual = { ...this.configuracionDefecto };
            }
        } else {
            this.configuracionActual = { ...this.configuracionDefecto };
        }

        // Actualizar los inputs de color y fuente
        this.actualizarInputsConfiguracion();
    }

    // Actualizar los valores de los inputs de configuración
    actualizarInputsConfiguracion() {
        const inputPrimario = document.getElementById('ColorPrimario');
        const inputSecundario = document.getElementById('ColorSecundario');
        const inputColorFondo = document.getElementById('ColorFondo');
        const inputColorTexto = document.getElementById('ColorTexto');
        const selectFuente = document.getElementById('FontFamily');
        const inputBlur = document.getElementById('blur');

        if (inputPrimario) inputPrimario.value = this.configuracionActual.primario;
        if (inputSecundario) inputSecundario.value = this.configuracionActual.secundario;
        if (inputColorFondo) inputColorFondo.value = this.configuracionActual.colorFondo;
        if (inputColorTexto) inputColorTexto.value = this.configuracionActual.colorTexto;
        if (selectFuente) selectFuente.value = this.configuracionActual.fuente;
        if (inputBlur) inputBlur.checked = this.configuracionActual.blurFondo;

        // Mostrar preview de imagen actual si existe
        this.mostrarPreviewImagenActual();
    }

    // Mostrar preview de la imagen actual
    // Mostrar preview de la imagen actual
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

    // Eliminar imagen de fondo y guardar la preferencia
    eliminarImagenFondo() {
        const confirmacion = confirm('¿Está seguro que desea eliminar la imagen de fondo?');

        if (!confirmacion) {
            return;
        }

        // Limpiar la imagen de fondo de la configuración actual
        this.configuracionActual.imagenFondo = null;

        // Aplicar los cambios inmediatamente (quita la imagen del fondo)
        this.aplicarConfiguracion();

        // Actualizar el preview visual
        this.mostrarPreviewImagenActual();

        // Limpiar el input file
        const inputImagen = document.getElementById('ImagenFondo');
        if (inputImagen) {
            inputImagen.value = '';
        }

        // Guardar la preferencia inmediatamente (imagen = null)
        const nombreUsuario = this.obtenerNombreUsuario();
        const clavePreferencias = `preferencias_${nombreUsuario}`;

        // Obtener preferencias actuales
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

        // Actualizar solo la imagen de fondo (mantener otros ajustes)
        preferencias.imagenFondo = null;
        preferencias.fechaGuardado = new Date().toISOString();

        try {
            // Guardar las preferencias actualizadas
            localStorage.setItem(clavePreferencias, JSON.stringify(preferencias));
            this.mostrarNotificacion('Imagen de fondo eliminada correctamente', 'exito');
        } catch (error) {
            console.error('Error al guardar preferencias:', error);
            this.mostrarNotificacion('Error al eliminar la imagen de fondo', 'error');
        }
    }

    // Eliminar imagen de fondo
    eliminarImagenFondo() {
        this.configuracionActual.imagenFondo = null;
        this.aplicarConfiguracion();
        this.mostrarPreviewImagenActual();

        // Limpiar el input file
        const inputImagen = document.getElementById('ImagenFondo');
        if (inputImagen) {
            inputImagen.value = '';
        }
    }

    // Aplicar configuración completa a la página
    aplicarConfiguracion() {
        const root = document.documentElement;
        root.style.setProperty('--color-primario', this.configuracionActual.primario);
        root.style.setProperty('--color-secundario', this.configuracionActual.secundario);
        root.style.setProperty('--color-fondo', this.configuracionActual.colorFondo);
        root.style.setProperty('--color-texto', this.configuracionActual.colorTexto);
        root.style.setProperty('--font-family', this.configuracionActual.fuente);

        // Aplicar imagen de fondo
        if (this.configuracionActual.imagenFondo) {
            document.body.style.backgroundImage = `url(${this.configuracionActual.imagenFondo})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundRepeat = 'no-repeat';
            document.body.style.backgroundAttachment = 'fixed';
        } else {
            document.body.style.backgroundImage = 'none';
        }

        // Aplicar efecto blur al nav y footer
        const nav = document.querySelector('nav');
        const footer = document.querySelector('footer');
        const header = document.querySelector('header');

        if (this.configuracionActual.blurFondo && this.configuracionActual.imagenFondo) {
            // Aplicar blur solo si hay imagen de fondo
            if (nav) {
            nav.style.backdropFilter = 'blur(10px)';
            nav.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }
            if (footer) {
            footer.style.backdropFilter = 'blur(10px)';
            footer.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }
            if (header) {
            header.style.backdropFilter = 'blur(10px)';
            header.style.backgroundColor = 'rgba(255, 255, 255, 0%)';
            }
        } else {
            // Quitar blur
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


        // También actualizar el theme-color del meta tag
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute('content', this.configuracionActual.primario);
        }
    }

    // Procesar imagen seleccionada
    procesarImagenFondo(archivo) {
        // Validar que sea una imagen
        if (!archivo.type.startsWith('image/')) {
            this.mostrarNotificacion('Por favor seleccione un archivo de imagen válido', 'error');
            return;
        }

        // Validar tamaño (máximo 5MB)
        const tamañoMaximo = 5 * 1024 * 1024; // 5MB en bytes
        if (archivo.size > tamañoMaximo) {
            this.mostrarNotificacion('La imagen es demasiado grande. Máximo 5MB permitido.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imagenBase64 = e.target.result;

                // Crear una imagen temporal para verificar que se cargó correctamente
                const img = new Image();
                img.onload = () => {
                    this.configuracionActual.imagenFondo = imagenBase64;
                    this.aplicarConfiguracion();
                    this.mostrarPreviewImagenActual();
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

    // Guardar preferencias
    guardarPreferencias() {
        const inputPrimario = document.getElementById('ColorPrimario');
        const inputSecundario = document.getElementById('ColorSecundario');
        const inputColorFondo = document.getElementById('ColorFondo');
        const inputColorTexto = document.getElementById('ColorTexto');
        const selectFuente = document.getElementById('FontFamily');
        const inputBlur = document.getElementById('blur');

        if (!inputPrimario || !inputSecundario || !inputColorFondo || !inputColorTexto || !inputBlur) {
            console.error('No se encontraron todos los inputs de color');
            return false;
        }

        const nuevasPreferencias = {
            colorPrimario: inputPrimario.value,
            colorSecundario: inputSecundario.value,
            colorFondo: inputColorFondo.value,
            colorTexto: inputColorTexto.value,
            fuente: selectFuente ? selectFuente.value : this.configuracionDefecto.fuente,
            imagenFondo: this.configuracionActual.imagenFondo,
            blurFondo: inputBlur ? inputBlur.checked : false,
            fechaGuardado: new Date().toISOString(),
            usuario: this.nombreUsuario
        };

        try {
            const clave = this.generarClavePreferencias();
            localStorage.setItem(clave, JSON.stringify(nuevasPreferencias));

            // Actualizar configuración actual
            this.configuracionActual = {
                primario: nuevasPreferencias.colorPrimario,
                secundario: nuevasPreferencias.colorSecundario,
                colorFondo: nuevasPreferencias.colorFondo,
                colorTexto: nuevasPreferencias.colorTexto,
                fuente: nuevasPreferencias.fuente,
                imagenFondo: nuevasPreferencias.imagenFondo,
                blurFondo: nuevasPreferencias.blurFondo
            };

            // Aplicar la nueva configuración
            this.aplicarConfiguracion();

            // Mostrar notificación de éxito
            this.mostrarNotificacion('Configuraciones guardadas correctamente', 'exito');
            return true;
        } catch (error) {
            console.error('Error al guardar preferencias:', error);
            // Verificar si el error es por límite de almacenamiento
            if (error.name === 'QuotaExceededError') {
                this.mostrarNotificacion('Error: No hay suficiente espacio de almacenamiento. La imagen es demasiado grande.', 'error');
            } else {
                this.mostrarNotificacion('Error al guardar configuraciones', 'error');
            }
            return false;
        }
    }

    // Restablecer a configuración por defecto
    restablecerPreferencias() {
        const confirmacion = confirm('¿Está seguro que desea restablecer la configuración a los valores por defecto?');

        if (confirmacion) {
            // Actualizar inputs
            const inputPrimario = document.getElementById('ColorPrimario');
            const inputSecundario = document.getElementById('ColorSecundario');
            const inputColorFondo = document.getElementById('ColorFondo');
            const inputColorTexto = document.getElementById('ColorTexto');
            const selectFuente = document.getElementById('FontFamily');
            const inputImagen = document.getElementById('ImagenFondo');

            if (inputPrimario) inputPrimario.value = this.configuracionDefecto.primario;
            if (inputSecundario) inputSecundario.value = this.configuracionDefecto.secundario;
            if (inputColorFondo) inputColorFondo.value = this.configuracionDefecto.colorFondo;
            if (inputColorTexto) inputColorTexto.value = this.configuracionDefecto.colorTexto;
            if (selectFuente) selectFuente.value = this.configuracionDefecto.fuente;
            if (inputImagen) inputImagen.value = '';

            // Actualizar configuración actual
            this.configuracionActual = { ...this.configuracionDefecto };

            // Aplicar configuración
            this.aplicarConfiguracion();
            this.mostrarPreviewImagenActual();

            // Eliminar preferencias guardadas
            const clave = this.generarClavePreferencias();
            localStorage.removeItem(clave);

            this.mostrarNotificacion('Configuraciones restablecidas', 'exito');
        }
    }

    // Previsualizar cambios en tiempo real
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

            if (selectFuente) {
                root.style.setProperty('--font-family', selectFuente.value);
            }
        }
    }

    // Configurar eventos
    configurarEventos() {
        // Botón guardar
        const btnGuardar = document.getElementById('btnGuardarConfiguraciones');
        if (btnGuardar) {
            btnGuardar.addEventListener('click', () => this.guardarPreferencias());
        }

        // Botón restablecer
        const btnRestablecer = document.getElementById('btnRestablecerConfiguraciones');
        if (btnRestablecer) {
            btnRestablecer.addEventListener('click', () => this.restablecerPreferencias());
        }

        // Input de imagen de fondo
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
        if (inputBlur) {
            inputBlur.addEventListener('change', () => {
                this.configuracionActual.blurFondo = inputBlur.checked;
                this.aplicarConfiguracion();
            });
        }

        // Previsualización en tiempo real para colores
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

        // Previsualización en tiempo real para fuente
        const selectFuente = document.getElementById('FontFamily');
        if (selectFuente) {
            selectFuente.addEventListener('change', () => this.previsualizarCambios());
        }

        const btnEliminarImagen = document.getElementById('eliminarImagen');
        if (btnEliminarImagen) {
            btnEliminarImagen.addEventListener('click', () => this.eliminarImagenFondo());
        }
    }

    // Mostrar notificación
    mostrarNotificacion(mensaje, tipo = 'info') {
        if (typeof mostrarNotificacion === 'function') {
            mostrarNotificacion(mensaje, tipo);
        } else {
            alert(mensaje);
        }
    }

    // Método estático para aplicar preferencias en otras páginas
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

                if (preferencias.fuente) {
                    root.style.setProperty('--font-family', preferencias.fuente);
                }

                // Aplicar imagen de fondo
                if (preferencias.imagenFondo) {
                    document.body.style.backgroundImage = `url(${preferencias.imagenFondo})`;
                    document.body.style.backgroundSize = 'cover';
                    document.body.style.backgroundPosition = 'center';
                    document.body.style.backgroundRepeat = 'no-repeat';
                    document.body.style.backgroundAttachment = 'fixed';
                } else {
                    document.body.style.backgroundImage = 'none';
                }

                // Actualizar theme-color
                const metaTheme = document.querySelector('meta[name="theme-color"]');
                if (metaTheme && preferencias.colorPrimario) {
                    metaTheme.setAttribute('content', preferencias.colorPrimario);
                }
            } catch (error) {
                console.error('Error al aplicar preferencias globales:', error);
            }
        }
    }

    // Método para obtener las fuentes disponibles (útil para otras páginas)
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

    // Método para exportar preferencias
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

    // Método para importar preferencias
    importarPreferencias(archivo) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const preferencias = JSON.parse(e.target.result);

                // Validar estructura básica
                if (preferencias.colorPrimario && preferencias.colorSecundario && preferencias.colorFondo) {
                    // Si no tiene fuente, usar la por defecto
                    if (!preferencias.fuente) {
                        preferencias.fuente = this.configuracionDefecto.fuente;
                    }
                    // Si no tiene color de texto, usar el por defecto
                    if (!preferencias.colorTexto) {
                        preferencias.colorTexto = this.configuracionDefecto.colorTexto;
                    }
                    // Si no tiene imagen de fondo, usar null
                    if (!preferencias.imagenFondo) {
                        preferencias.imagenFondo = null;
                    }

                    const clave = this.generarClavePreferencias();
                    localStorage.setItem(clave, JSON.stringify(preferencias));

                    // Recargar preferencias
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

    // Método para obtener la configuración actual
    obtenerConfiguracionActual() {
        return { ...this.configuracionActual };
    }

    // Método para actualizar una configuración específica
    actualizarConfiguracion(tipo, valor) {
        if (this.configuracionActual.hasOwnProperty(tipo)) {
            this.configuracionActual[tipo] = valor;
            this.aplicarConfiguracion();
            return true;
        }
        return false;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    // Solo inicializar en la página de configuraciones
    if (document.getElementById('ColorPrimario') && document.getElementById('ColorSecundario') && document.getElementById('ColorFondo') && document.getElementById('ColorTexto')) {
        window.preferenciasColores = new PreferenciasColores();
    } else {
        // En otras páginas, solo aplicar las preferencias
        PreferenciasColores.aplicarPreferenciasGlobales();
    }
});

// Aplicar preferencias cuando se carga la página (para cualquier página)
PreferenciasColores.aplicarPreferenciasGlobales();