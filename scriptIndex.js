const input = document.getElementById('Pagos');
input.addEventListener('input', function () {
    const valor = input.value;
    if (valor === '111213') {
        window.location.href = 'Pagos.html';
    }
});

