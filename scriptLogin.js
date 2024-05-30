// scriptLogin.js
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

    const form = document.getElementById('login-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            localStorage.setItem('nombreAsesorActual', agentesA[username].nombre);

            try {
                const user = await authenticateUser(username, password);
                console.log('User logged in:', user);
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Authentication error:', error);
                document.getElementById('error-message').textContent = getErrorMessage(error);
            }
        });
    } else {
        console.error('Form element not found');
    }
});

async function authenticateUser(username, password) {
    if (!validateUsername(username)) {
        throw new Error('Invalid username format');
    }

    const email = `${username}@playground.com`; // Convert username to email
    try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        return userCredential.user;
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            // If user not found, create the user
            const newUser = await firebase.auth().createUserWithEmailAndPassword(email, password);
            return newUser.user;
        } else {
            throw error;
        }
    }
}

function validateUsername(username) {
    // Basic username validation: only allow alphanumeric characters and dots
    const usernameRegex = /^[a-zA-Z0-9.]+$/;
    return usernameRegex.test(username);
}

function getErrorMessage(error) {
    // Handle Firebase Authentication errors
    if (error.code === 'auth/user-not-found') {
        return 'No user found with these credentials.';
    } else if (error.code === 'auth/wrong-password') {
        return 'Incorrect password.';
    } else if (error.code === 'auth/invalid-email') {
        return 'Invalid email format.';
    } else {
        return 'Authentication failed. Please try again.';
    }
}

let agentesA = {
    "anderson.cano": {
        nombre: "Anderson_Cano_Londoño",
    },
    "miguel.naranjo": {
        nombre: "Miguel_Cadavid_Naranjo",
    },
    "milton.calle": {
        nombre: "Milton_Alexis_Calle_Londoño",
    },
    "yesica.cano": {
        nombre: "Yesica_Johana_Cano_Quintero",
    },
    "andres.vidal": {
        nombre: "Andrés_Felipe_Vidal_Medina",
    },
    "andres.yepes": {
        nombre: "Andrés_Felipe_Yepes_Tascón",
    },
    "oscar.cabrera": {
        nombre: "Oscar_Luis_Cabrera_Pacheco",
    },
};
