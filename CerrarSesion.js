// logout.js
document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('btnCerrarSesion');
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            localStorage.removeItem('nombreAsesorActual');
            try {
                await firebase.auth().signOut();
                console.log('User signed out.');
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Sign out error:', error);
            }
        });
    } else {
        console.error('Logout button not found');
    }
});
