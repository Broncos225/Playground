document.getElementById('btnCerrarSesion').addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
        console.log('User signed out.');
        window.location.href = 'login.html';
    }).catch(error => {
        console.error('Sign out error:', error);
    });
});
