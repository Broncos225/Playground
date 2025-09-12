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

    // Función para cerrar sesión cada 3 horas
    function scheduleSignOutEveryThreeHours() {
        // Limpiar el timer anterior si existe
        if (signOutTimer) {
            clearTimeout(signOutTimer);
            signOutTimer = null;
        }

        // Calcular exactamente 3 horas desde ahora
        const threeHoursInMs = 3 * 60 * 60 * 1000; // 3 horas en milisegundos
        
        console.log(`Programando cierre de sesión en 3 horas (${new Date(Date.now() + threeHoursInMs).toLocaleString()})`);
        
        signOutTimer = setTimeout(() => {
            firebase.auth().signOut().then(() => {
                console.log('Usuario desconectado automáticamente después de 3 horas.');
                localStorage.removeItem('lastLoginDate');
                localStorage.removeItem('nombreAsesorActual');
                window.location.href = 'login.html';
            }).catch(error => {
                console.error('Error al cerrar sesión:', error);
            });

            // Vuelve a programar para dentro de otras 3 horas
            scheduleSignOutEveryThreeHours();
        }, threeHoursInMs);
    }

    firebase.auth().onAuthStateChanged(user => {
        if (!user && window.location.pathname !== '/login.html') {
            localStorage.removeItem('nombreAsesorActual');
            window.location.href = 'login.html';
        } else if (user && window.location.pathname === '/login.html') {
            window.location.href = 'index.html';
        }
    });

    scheduleSignOutEveryThreeHours();

    window.addEventListener('beforeunload', () => {
        if (signOutTimer) {
            clearTimeout(signOutTimer);
        }
    });
});