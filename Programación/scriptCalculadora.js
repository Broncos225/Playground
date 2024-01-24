// Añadir un par de campos de entrada al principio
window.onload = function() {
    var notaDiv = document.createElement('div');
    notaDiv.innerHTML = '<input type="number" placeholder="Nota" min="0" max="100"> <input type="number" placeholder="Porcentaje" min="0" max="100">';
    document.getElementById('notas').appendChild(notaDiv);
};

document.getElementById('agregarNota').addEventListener('click', function() {
    var notaDiv = document.createElement('div');
    notaDiv.innerHTML = '<input type="number" placeholder="Nota" min="0" max="100"> <input type="number" placeholder="Porcentaje" min="0" max="100">';
    document.getElementById('notas').appendChild(notaDiv);
});

document.getElementById('eliminarNota').addEventListener('click', function() {
    var notasDiv = document.getElementById('notas');
    if (notasDiv.children.length > 1) {
        notasDiv.removeChild(notasDiv.lastChild);
    }
});

document.getElementById('calcular').addEventListener('click', function() {
    var notas = document.getElementById('notas').getElementsByTagName('input');
    var notaMinima = document.getElementById('Minima').getElementsByTagName('input');
    var notaFinal = 0;
    var Porcentajes = 0;


    for (var i = 0; i < notas.length; i += 2) {
        Porcentajes += notas[i + 1].valueAsNumber;
    }
    for (var i = 0; i < notas.length; i += 2) {
        if (notas[i].valueAsNumber > 5 || notas[i].valueAsNumber < 0 || isNaN(notas[i].valueAsNumber)){
            alert("La nota no puede ser mayor a 5 o menor a 0, no puede estar vacía y no puede ser una letra o un símbolo");
            return;
        } else if (Porcentajes > 100 || Porcentajes < 0 || isNaN(Porcentajes)){
            alert("Los porcentajes no pueden ser mayor a 100 o menor a 0, no pueden estar vacíos y no pueden ser una letra o un símbolo");
            return;
        } else {
            
            notaFinal += notas[i].valueAsNumber * (notas[i + 1].valueAsNumber / 100);
        
        }
    }

    if (notaMinima[0].valueAsNumber > 5 || notaMinima[0].valueAsNumber < 0){
        alert("La nota mínima no puede ser mayor a 5 o menor a 0");
        return;
    } else if (isNaN(notaMinima[0].valueAsNumber)){
        
    } else {
        var Faltante = 100 - Porcentajes;
        var notaFaltante = (notaMinima[0].valueAsNumber - notaFinal) / (Faltante / 100);
        document.getElementById('notaFaltante').innerText = 'Nota faltante: ' + notaFaltante.toFixed(2) + " en el " + Faltante + "% restante";
        document.getElementById('notaFaltante').style.color = 'Chocolate';
        document.getElementById('notaFaltante').style.fontWeight = 'bold';
        if (notaFaltante > 5){
            document.getElementById('notaFaltante').innerText = 'No es posible alcanzar la nota mínima';
            document.getElementById('notaFaltante').style.color = 'red';
            document.getElementById('notaFaltante').style.fontWeight = 'bold';
        } else if (notaFaltante <= 0 || isNaN(notaFaltante)){
            document.getElementById('notaFaltante').innerText = 'Ya alcanzo la nota mínima';
            document.getElementById('notaFaltante').style.color = 'green';
            document.getElementById('notaFaltante').style.fontWeight = 'bold';
        }
    }



    
    document.getElementById('notaFinal').innerText = 'Nota final: ' + notaFinal.toFixed(2);
    document.getElementById('Porcentajes').innerText = 'Porcentajes: ' + Porcentajes + "%";
    
});

document.getElementById('Refresh').addEventListener('click', function() {
    location.reload();
});