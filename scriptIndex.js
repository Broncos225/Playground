function minuta() {
    var listaTiendas = document.getElementById('ListaTiendas').value;
    var listaTiendasJuntas = document.getElementById('ListaTiendasJuntas');
    var formattedString = listaTiendas.split('\n').join(';');
    listaTiendasJuntas.value = formattedString;
}

document.getElementById('convertir').addEventListener('click', minuta);