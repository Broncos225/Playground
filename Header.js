window.addEventListener('scroll', function() {
    var header = document.querySelector('nav');
    if (window.innerWidth > 968) { /* Cambia 968 a la anchura mínima que quieras */
        if (window.pageYOffset > 50) { /* Cambia 50 a la cantidad de desplazamiento que deseas */
            header.classList.add('small-header');
            header.classList.remove('small-header-scroll');
        } else {
            header.classList.remove('small-header');
            header.classList.remove('small-header-scroll');
        }
    } else {
        header.classList.remove('small-header');
        if (window.pageYOffset > 50) { /* Cambia 50 a la cantidad de desplazamiento que deseas */
            header.classList.add('small-header-scroll');
        } else {
            header.classList.remove('small-header-scroll');
        }
    }
});

window.addEventListener('resize', function() {
    var header = document.querySelector('nav');
    if (window.innerWidth <= 968) { /* Cambia 968 a la anchura máxima que quieras */
        header.classList.remove('small-header');
        if (window.pageYOffset > 50) { /* Cambia 50 a la cantidad de desplazamiento que deseas */
            header.classList.add('small-header-scroll');
        } else {
            header.classList.remove('small-header-scroll');
        }
    } else if (window.pageYOffset > 50) { /* Cambia 50 a la cantidad de desplazamiento que deseas */
        header.classList.add('small-header');
        header.classList.remove('small-header-scroll');
    }
});