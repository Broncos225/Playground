// Configuraciones.js - Sistema de preferencias de colores
class PreferenciasColores {
    constructor() {
        this.nombreUsuario = this.obtenerNombreUsuario();
        this.coloresDefecto = {
            primario: '#e69500',
            secundario: '#FFFFFF'
        };
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
        this.configurarEventos();
        this.aplicarColores();
    }

    // Cargar preferencias guardadas
    cargarPreferencias() {
        const clave = this.generarClavePreferencias();
        const preferenciasGuardadas = localStorage.getItem(clave);

        if (preferenciasGuardadas) {
            try {
                const preferencias = JSON.parse(preferenciasGuardadas);
                this.coloresActuales = {
                    primario: preferencias.colorPrimario || this.coloresDefecto.primario,
                    secundario: preferencias.colorSecundario || this.coloresDefecto.secundario
                };
            } catch (error) {
                console.error('Error al cargar preferencias:', error);
                this.coloresActuales = { ...this.coloresDefecto };
            }
        } else {
            this.coloresActuales = { ...this.coloresDefecto };
        }

        // Actualizar los inputs de color
        this.actualizarInputsColor();
    }

    // Actualizar los valores de los inputs de color
    actualizarInputsColor() {
        const inputPrimario = document.getElementById('ColorPrimario');
        const inputSecundario = document.getElementById('ColorSecundario');

        if (inputPrimario) inputPrimario.value = this.coloresActuales.primario;
        if (inputSecundario) inputSecundario.value = this.coloresActuales.secundario;
    }

    // Aplicar colores a la página
    aplicarColores() {
        const root = document.documentElement;
        root.style.setProperty('--color-primario', this.coloresActuales.primario);
        root.style.setProperty('--color-secundario', this.coloresActuales.secundario);

        // También actualizar el theme-color del meta tag
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute('content', this.coloresActuales.primario);
        }
    }

    // Guardar preferencias
    guardarPreferencias() {
        const inputPrimario = document.getElementById('ColorPrimario');
        const inputSecundario = document.getElementById('ColorSecundario');

        if (!inputPrimario || !inputSecundario) {
            console.error('No se encontraron los inputs de color');
            return false;
        }

        const nuevasPreferencias = {
            colorPrimario: inputPrimario.value,
            colorSecundario: inputSecundario.value,
            fechaGuardado: new Date().toISOString(),
            usuario: this.nombreUsuario
        };

        try {
            const clave = this.generarClavePreferencias();
            localStorage.setItem(clave, JSON.stringify(nuevasPreferencias));

            // Actualizar colores actuales
            this.coloresActuales = {
                primario: nuevasPreferencias.colorPrimario,
                secundario: nuevasPreferencias.colorSecundario
            };

            // Aplicar los nuevos colores
            this.aplicarColores();

            // Mostrar notificación de éxito
            this.mostrarNotificacion('Configuraciones guardadas correctamente', 'exito');
            return true;
        } catch (error) {
            console.error('Error al guardar preferencias:', error);
            this.mostrarNotificacion('Error al guardar configuraciones', 'error');
            return false;
        }
    }

    // Restablecer a colores por defecto
    restablecerPreferencias() {
        const confirmacion = confirm('¿Está seguro que desea restablecer los colores a los valores por defecto?');

        if (confirmacion) {
            // Actualizar inputs
            document.getElementById('ColorPrimario').value = this.coloresDefecto.primario;
            document.getElementById('ColorSecundario').value = this.coloresDefecto.secundario;

            // Actualizar colores actuales
            this.coloresActuales = { ...this.coloresDefecto };

            // Aplicar colores
            this.aplicarColores();

            // Eliminar preferencias guardadas
            const clave = this.generarClavePreferencias();
            localStorage.removeItem(clave);

            this.mostrarNotificacion('Configuraciones restablecidas', 'exito');
        }
    }

    // Previsualizar colores en tiempo real
    previsualizarColores() {
        const inputPrimario = document.getElementById('ColorPrimario');
        const inputSecundario = document.getElementById('ColorSecundario');

        if (inputPrimario && inputSecundario) {
            const root = document.documentElement;
            root.style.setProperty('--color-primario', inputPrimario.value);
            root.style.setProperty('--color-secundario', inputSecundario.value);
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

        // Previsualización en tiempo real
        const inputPrimario = document.getElementById('ColorPrimario');
        const inputSecundario = document.getElementById('ColorSecundario');

        if (inputPrimario) {
            inputPrimario.addEventListener('input', () => this.previsualizarColores());
        }

        if (inputSecundario) {
            inputSecundario.addEventListener('input', () => this.previsualizarColores());
        }
    }

    // Mostrar notificación (asumiendo que tienes el sistema de notificaciones)
    mostrarNotificacion(mensaje, tipo = 'info') {
        // Si tienes una función de notificaciones personalizada, úsala aquí
        if (typeof mostrarNotificacion === 'function') {
            mostrarNotificacion(mensaje, tipo);
        } else {
            // Fallback a alert si no hay sistema de notificaciones
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

                // Validar estructura
                if (preferencias.colorPrimario && preferencias.colorSecundario) {
                    const clave = this.generarClavePreferencias();
                    localStorage.setItem(clave, JSON.stringify(preferencias));

                    // Recargar preferencias
                    this.cargarPreferencias();
                    this.aplicarColores();

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
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    // Solo inicializar en la página de configuraciones
    if (document.getElementById('ColorPrimario') && document.getElementById('ColorSecundario')) {
        window.preferenciasColores = new PreferenciasColores();
    } else {
        // En otras páginas, solo aplicar las preferencias
        PreferenciasColores.aplicarPreferenciasGlobales();
    }
});

// Aplicar preferencias cuando se carga la página (para cualquier página)
PreferenciasColores.aplicarPreferenciasGlobales();