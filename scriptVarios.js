// Copyright (c) 2024 Andrés Felipe Yepes Tascón
// Licensed under the MIT License. See LICENSE file for details.
window.onload = function() {
    var img = document.getElementById('image');
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var colorValue = document.getElementById('color-value');

    // Asegúrate de que el canvas tenga el mismo tamaño que la imagen
    canvas.width = img.width;
    canvas.height = img.height;

    // Dibuja la imagen en el canvas
    ctx.drawImage(img, 0, 0, img.width, img.height);

    // Añade el evento de clic al canvas
    canvas.addEventListener('click', function(event) {
        var x = event.offsetX;
        var y = event.offsetY;
        var pixel = ctx.getImageData(x, y, 1, 1).data;
        var rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
        colorValue.textContent = `Color seleccionado: ${rgb}`;
        colorValue.style.color = rgb;
    });
};
