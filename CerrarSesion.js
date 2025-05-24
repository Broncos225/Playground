// Copyright (c) 2024 Andrés Felipe Yepes Tascón
// Licensed under the MIT License. See LICENSE file for details.
document.getElementById('btnCerrarSesion').addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
        console.log('User signed out.');
        window.location.href = 'login.html';
    }).catch(error => {
        console.error('Sign out error:', error);
    });
});
