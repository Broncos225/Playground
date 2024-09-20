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

    // Función para cerrar sesión a la medianoche
    function scheduleSignOutAtMidnight() {
        const now = new Date();
        const millisTillMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0) - now;

        setTimeout(() => {
            firebase.auth().signOut().then(() => {
                console.log('User signed out at midnight.');
                localStorage.removeItem('lastLoginDate');
                window.location.href = 'login.html';
            }).catch(error => {
                console.error('Sign out error:', error);
            });
            // Vuelve a programar para la próxima medianoche
            scheduleSignOutAtMidnight();
        }, millisTillMidnight);
    }

    firebase.auth().onAuthStateChanged(user => {
        if (!user && window.location.pathname !== '/login.html') {
            localStorage.removeItem('nombreAsesorActual');
            window.location.href = 'login.html';
        } else if (user && window.location.pathname === '/login.html') {
            window.location.href = 'index.html';
        }
    });

    // Programar el cierre de sesión a la medianoche
    scheduleSignOutAtMidnight();
});
