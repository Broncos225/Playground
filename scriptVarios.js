window.addEventListener('load', function () {
    var passwordTime = localStorage.getItem('passwordTime');
    var currentTime = new Date().getTime();

    if (!passwordTime || currentTime - passwordTime > 10 * 60 * 1000) { // 5 minutos
        var password = prompt("Por favor, introduzca su contraseña", "");
        if (password != "minuta") { // reemplaza "contraseña_correcta" con la contraseña real
            window.location.href = "index.html";
        } else {
            localStorage.setItem('passwordTime', currentTime);
        }
    }
});

