// PreferenciasGlobales.js - Para incluir en todas las páginas
// Este archivo debe incluirse en todas las páginas para aplicar las preferencias de colores

(function () {
    'use strict';

    // Función para aplicar preferencias de colores
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

                // Actualizar meta theme-color si existe
                const metaTheme = document.querySelector('meta[name="theme-color"]');
                if (metaTheme && preferencias.colorPrimario) {
                    metaTheme.setAttribute('content', preferencias.colorPrimario);
                }

                console.log('Preferencias de colores aplicadas para:', nombreUsuario);

            } catch (error) {
                console.error('Error al aplicar preferencias de colores:', error);
            }
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

})();