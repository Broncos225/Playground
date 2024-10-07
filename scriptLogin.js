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

    const form = document.getElementById('login-form');
    const loadingScreen = document.getElementById('loading-screen');
    const errorMessage = document.getElementById('error-message');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            loadingScreen.style.display = 'flex'; // Mostrar la pantalla de carga
            errorMessage.style.display = 'none'; // Ocultar el mensaje de error

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            localStorage.setItem('nombreAsesorActual', agentesA[username]?.nombre || 'Usuario Desconocido');

            try {
                const user = await authenticateUser(username, password);
                console.log('User logged in:', user);
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Authentication error:', error);
                errorMessage.textContent = getErrorMessage(error);
                errorMessage.style.display = 'block'; // Mostrar el mensaje de error
                loadingScreen.style.display = 'none'; // Ocultar la pantalla de carga
            }
        });
    } else {
        console.error('Form element not found');
    }
});

async function authenticateUser(username, password) {
    if (!validateUsername(username)) {
        throw new Error('auth/invalid-username');
    }

    const email = `${username}@playground.com`; // Convert username to email
    try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        return userCredential.user;
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            throw new Error('auth/user-not-found');
        } else if (error.code === 'auth/wrong-password') {
            throw new Error('auth/wrong-password');
        } else if (error.code === 'auth/invalid-email') {
            throw new Error('auth/invalid-email');
        } else {
            throw new Error('auth/generic-error');
        }
    }
}

function validateUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9.]+$/;
    return usernameRegex.test(username);
}

function getErrorMessage(error) {
    switch (error.message) {
        case 'auth/user-not-found':
            return 'No se encontró ningún usuario con estas credenciales.';
        case 'auth/wrong-password':
            return 'Contraseña incorrecta.';
        case 'auth/invalid-email':
            return 'Formato de correo electrónico no válido.';
        case 'auth/invalid-username':
            return 'Formato de usuario no válido.';
        default:
            return 'Fallo de autenticación. Por favor, inténtelo de nuevo.';
    }
}

let agentesA = {
    "anderson.cano": { nombre: "Anderson_Cano_Londoño" },
    "yesica.cano": { nombre: "Yesica_Johana_Cano_Quintero" },
    "andres.vidal": { nombre: "Andrés_Felipe_Vidal_Medina" },
    "juan.vidal": { nombre: "Juan_Pablo_Vidal_Saldarriaga" },
    "andres.yepes": { nombre: "Andrés_Felipe_Yepes_Tascón" },
    "oscar.cabrera": { nombre: "Oscar_Luis_Cabrera_Pacheco" },
    "yeison.torres": { nombre: "Yeison_Torres_Ochoa" },
    "santiago.perez": { nombre: "Santiago_Pérez_Martinez" }
};
