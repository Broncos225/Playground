// Copyright (c) 2024 Andrés Felipe Yepes Tascón
// Licensed under the MIT License. See LICENSE file for details.
document.addEventListener('DOMContentLoaded', () => {
    const firebaseConfig = {
        apiKey: "AIzaSyAw5z5-aKicJ78N1UahQ-Lu_u7WP6MNVRE",
        authDomain: "playgroundbdstop.firebaseapp.com",
        databaseURL: "https://playgroundbdstop-default-rtdb.firebaseio.com",
        projectId: "playgroundbdstop",
        storageBucket: "playgroundbdstop.appspot.com",
        messagingSenderId: "808082296806",
        appId: "1:808082296806:web:c1d0dc3c2fc5fbf6c9d027"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    let signOutTimer = null; // Variable para almacenar el timer

    // Función para cerrar sesión cada 8 horas
    function scheduleSignOutEveryEightHours() {
        // Limpiar el timer anterior si existe
        if (signOutTimer) {
            clearTimeout(signOutTimer);
            signOutTimer = null;
        }

        // Calcular exactamente 8 horas desde ahora
        const eightHoursInMs = 8 * 60 * 60 * 1000; // 8 horas en milisegundos

        console.log(`Programando cierre de sesión en 8 horas (${new Date(Date.now() + eightHoursInMs).toLocaleString()})`);

        signOutTimer = setTimeout(() => {
            firebase.auth().signOut().then(() => {
                console.log('Usuario desconectado automáticamente después de 8 horas.');
                localStorage.removeItem('lastLoginDate');
                localStorage.removeItem('nombreAsesorActual');
                window.location.href = 'login.html';
            }).catch(error => {
                console.error('Error al cerrar sesión:', error);
            });

            // Vuelve a programar para dentro de otras 8 horas
            scheduleSignOutEveryEightHours();
        }, eightHoursInMs);
    }

    firebase.auth().onAuthStateChanged(user => {
        if (!user && window.location.pathname !== '/login.html') {
            localStorage.removeItem('nombreAsesorActual');
            window.location.href = 'login.html';
        } else if (user && window.location.pathname === '/login.html') {
            window.location.href = 'index.html';
        }
    });

    scheduleSignOutEveryEightHours();

    window.addEventListener('beforeunload', () => {
        if (signOutTimer) {
            clearTimeout(signOutTimer);
        }
    });
});