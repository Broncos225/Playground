function minuta() {
    var listaTiendas = document.getElementById('ListaTiendas').value;
    var listaTiendasJuntas = document.getElementById('ListaTiendasJuntas');
    var formattedString = listaTiendas.split('\n').join(';');
    listaTiendasJuntas.value = formattedString;

    // Contar la cantidad de tiendas
    var cantidadTiendas = formattedString.split(';').length;
    document.getElementById('texto').innerHTML = "Cantidad: " + cantidadTiendas;
}

document.getElementById('convertir').addEventListener('click', minuta);

document.getElementById('limpiar').addEventListener('click', function () {
    document.getElementById('ListaTiendas').value = '';
    document.getElementById('ListaTiendasJuntas').value = '';
    document.getElementById('texto').innerText = '';
});