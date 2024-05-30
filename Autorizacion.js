// auth.js
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

    // Inicializar Firebase solo si no se ha inicializado previamente
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    // Verificar el estado de autenticación
    firebase.auth().onAuthStateChanged(user => {
        if (!user && window.location.pathname !== '/login.html') {
            localStorage.removeItem('nombreAsesorActual');
            window.location.href = 'login.html';
        } else if (user && window.location.pathname === '/login.html') { // Guarda el nombre de usuario en el almacenamiento local
            window.location.href = 'index.html';
        }
    });
});


