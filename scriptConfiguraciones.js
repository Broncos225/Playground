// Configuraciones.js - Sistema de preferencias de colores y fuentes
class PreferenciasColores {
    constructor() {
        this.nombreUsuario = this.obtenerNombreUsuario();
        this.configuracionDefecto = {
            primario: '#e69500',
            secundario: '#e69500',
            colorFondo: '#FFFFFF',
            colorTexto: '#000000ff', // Nuevo color por defecto para el texto
            fuente: 'Nunito, sans-serif' // Fuente por defecto
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
                    fuente: preferencias.fuente || this.configuracionDefecto.fuente
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

        if (inputPrimario) inputPrimario.value = this.configuracionActual.primario;
        if (inputSecundario) inputSecundario.value = this.configuracionActual.secundario;
        if (inputColorFondo) inputColorFondo.value = this.configuracionActual.colorFondo;
        if (inputColorTexto) inputColorTexto.value = this.configuracionActual.colorTexto;
        if (selectFuente) selectFuente.value = this.configuracionActual.fuente;
    }

    // Aplicar configuración completa a la página
    aplicarConfiguracion() {
        const root = document.documentElement;
        root.style.setProperty('--color-primario', this.configuracionActual.primario);
        root.style.setProperty('--color-secundario', this.configuracionActual.secundario);
        root.style.setProperty('--color-fondo', this.configuracionActual.colorFondo);
        root.style.setProperty('--color-texto', this.configuracionActual.colorTexto);
        root.style.setProperty('--font-family', this.configuracionActual.fuente);

        // También actualizar el theme-color del meta tag
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute('content', this.configuracionActual.primario);
        }
    }

    // Guardar preferencias
    guardarPreferencias() {
        const inputPrimario = document.getElementById('ColorPrimario');
        const inputSecundario = document.getElementById('ColorSecundario');
        const inputColorFondo = document.getElementById('ColorFondo');
        const inputColorTexto = document.getElementById('ColorTexto');
        const selectFuente = document.getElementById('FontFamily');

        if (!inputPrimario || !inputSecundario || !inputColorFondo || !inputColorTexto) {
            console.error('No se encontraron todos los inputs de color');
            return false;
        }

        const nuevasPreferencias = {
            colorPrimario: inputPrimario.value,
            colorSecundario: inputSecundario.value,
            colorFondo: inputColorFondo.value,
            colorTexto: inputColorTexto.value,
            fuente: selectFuente ? selectFuente.value : this.configuracionDefecto.fuente,
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
                fuente: nuevasPreferencias.fuente
            };

            // Aplicar la nueva configuración
            this.aplicarConfiguracion();

            // Mostrar notificación de éxito
            this.mostrarNotificacion('Configuraciones guardadas correctamente', 'exito');
            return true;
        } catch (error) {
            console.error('Error al guardar preferencias:', error);
            this.mostrarNotificacion('Error al guardar configuraciones', 'error');
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

            if (inputPrimario) inputPrimario.value = this.configuracionDefecto.primario;
            if (inputSecundario) inputSecundario.value = this.configuracionDefecto.secundario;
            if (inputColorFondo) inputColorFondo.value = this.configuracionDefecto.colorFondo;
            if (inputColorTexto) inputColorTexto.value = this.configuracionDefecto.colorTexto;
            if (selectFuente) selectFuente.value = this.configuracionDefecto.fuente;

            // Actualizar configuración actual
            this.configuracionActual = { ...this.configuracionDefecto };

            // Aplicar configuración
            this.aplicarConfiguracion();

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