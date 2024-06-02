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

    // Función para obtener la fecha actual en formato YYYY-MM-DD
    function getCurrentDate() {
        const today = new Date();
        return today.toISOString().split('T')[0];
    }

    // Guardar la fecha actual en el almacenamiento local
    let lastLoginDate = localStorage.getItem('lastLoginDate');
    if (!lastLoginDate) {
        lastLoginDate = getCurrentDate();
        localStorage.setItem('lastLoginDate', lastLoginDate);
    }

    // Verificar si la fecha ha cambiado
    function checkDateChange() {
        const currentDate = getCurrentDate();
        if (currentDate !== lastLoginDate) {
            firebase.auth().signOut().then(() => {
                console.log('User signed out due to date change.');
                localStorage.removeItem('lastLoginDate');
                window.location.href = 'login.html';
            }).catch(error => {
                console.error('Sign out error:', error);
            });
        }
    }

    // Temporizador para verificar el cambio de fecha cada minuto
    setInterval(checkDateChange, 60 * 1000); // 60 segundos

    firebase.auth().onAuthStateChanged(user => {
        if (!user && window.location.pathname !== '/login.html') {
            localStorage.removeItem('nombreAsesorActual');
            window.location.href = 'login.html';
        } else if (user && window.location.pathname === '/login.html') {
            window.location.href = 'index.html';
        }
    });
});
