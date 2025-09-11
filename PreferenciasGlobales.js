// PreferenciasGlobales.js - Para incluir en todas las páginas
// Este archivo debe incluirse en todas las páginas para aplicar las preferencias de colores y imagen de fondo

(function () {
    'use strict';

    // Función para aplicar preferencias de colores e imagen de fondo
    function aplicarPreferenciasColores() {
        // Obtener nombre del usuario
        const nombreUsuario = localStorage.getItem("nombreAsesorActual") || "usuario_anonimo";
        const clavePreferencias = `preferencias_${nombreUsuario}`;

        // Obtener preferencias guardadas
        const preferenciasGuardadas = localStorage.getItem(clavePreferencias);

        if (preferenciasGuardadas) {
            try {
                const preferencias = JSON.parse(preferenciasGuardadas);
                const root = document.documentElement;

                // Aplicar color primario
                if (preferencias.colorPrimario) {
                    root.style.setProperty('--color-primario', preferencias.colorPrimario);
                }

                // Aplicar color secundario
                if (preferencias.colorSecundario) {
                    root.style.setProperty('--color-secundario', preferencias.colorSecundario);
                }

                // Aplicar color de fondo
                if (preferencias.colorFondo) {
                    root.style.setProperty('--color-fondo', preferencias.colorFondo);
                }

                // Aplicar color de texto
                if (preferencias.colorTexto) {
                    root.style.setProperty('--color-texto', preferencias.colorTexto);
                }

                // Aplicar fuente
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
                    document.body.style.backgroundSize = '';
                    document.body.style.backgroundPosition = '';
                    document.body.style.backgroundRepeat = '';
                    document.body.style.backgroundAttachment = '';
                }

                // Aplicar efecto blur al nav y footer
                const nav = document.querySelector('nav');
                const header = document.querySelector('header');
                const footer = document.querySelector('footer');

                if (preferencias.blurFondo && preferencias.imagenFondo) {
                    // Aplicar blur solo si hay imagen de fondo
                    if (nav) {
                        nav.style.backdropFilter = 'blur(10px)';
                        nav.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }
                    if (header) {
                        header.style.backdropFilter = 'blur(10px)';
                        header.style.backgroundColor = 'rgba(255, 255, 255, 0%)';
                    }
                    if (footer) {
                        footer.style.backdropFilter = 'blur(10px)';
                        footer.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }
                } else {
                    // Quitar blur
                    if (nav) {
                        nav.style.backdropFilter = '';
                        nav.style.backgroundColor = '';
                    }
                    if (header) {
                        header.style.backdropFilter = '';
                        header.style.backgroundColor = '';
                    }
                    if (footer) {
                        footer.style.backdropFilter = '';
                        footer.style.backgroundColor = '';
                    }
                }

                // Actualizar meta theme-color si existe
                const metaTheme = document.querySelector('meta[name="theme-color"]');
                if (metaTheme && preferencias.colorPrimario) {
                    metaTheme.setAttribute('content', preferencias.colorPrimario);
                }

            } catch (error) {
                console.error('Error al aplicar preferencias de colores:', error);
                // En caso de error, limpiar estilos de imagen de fondo
                document.body.style.backgroundImage = 'none';
            }
        } else {
            // Si no hay preferencias guardadas, asegurar que no haya imagen de fondo
            document.body.style.backgroundImage = 'none';
            document.body.style.backgroundSize = '';
            document.body.style.backgroundPosition = '';
            document.body.style.backgroundRepeat = '';
            document.body.style.backgroundAttachment = '';
        }
    }

    // Aplicar inmediatamente si el DOM ya está listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', aplicarPreferenciasColores);
    } else {
        aplicarPreferenciasColores();
    }

    // También aplicar cuando cambie el usuario
    let usuarioActual = localStorage.getItem("nombreAsesorActual");

    // Escuchar cambios en localStorage
    window.addEventListener('storage', function (e) {
        if (e.key === 'nombreAsesorActual' || e.key?.startsWith('preferencias_')) {
            aplicarPreferenciasColores();
        }
    });

    // Verificar periódicamente si cambió el usuario (para cambios en la misma pestaña)
    setInterval(function () {
        const nuevoUsuario = localStorage.getItem("nombreAsesorActual");
        if (nuevoUsuario !== usuarioActual) {
            usuarioActual = nuevoUsuario;
            aplicarPreferenciasColores();
        }
    }, 1000);

    // Función global para aplicar preferencias (accesible desde otras partes del código)
    window.aplicarPreferenciasGlobales = aplicarPreferenciasColores;

})();