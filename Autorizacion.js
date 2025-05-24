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

    // Función para cerrar sesión cada hora
    function scheduleSignOutEveryHour() {
        const now = new Date();
        const millisTillNextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 2, 0, 0, 0) - now;

        setTimeout(() => {
            firebase.auth().signOut().then(() => {
                console.log('User signed out at the top of the hour.');
                localStorage.removeItem('lastLoginDate');
                window.location.href = 'login.html';
            }).catch(error => {
                console.error('Sign out error:', error);
            });
            // Vuelve a programar para la próxima hora
            scheduleSignOutEveryHour();
        }, millisTillNextHour);
    }

    firebase.auth().onAuthStateChanged(user => {
        if (!user && window.location.pathname !== '/login.html') {
            localStorage.removeItem('nombreAsesorActual');
            window.location.href = 'login.html';
        } else if (user && window.location.pathname === '/login.html') {
            window.location.href = 'index.html';
        }
    });

    // Programar el cierre de sesión cada hora
    scheduleSignOutEveryHour();
});