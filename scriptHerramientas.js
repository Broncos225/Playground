// Selecciona los campos de entrada y el elemento de resultado
let valorInput = document.querySelector('input[placeholder="Valor"]');
let porcentajeInput = document.querySelector('input[placeholder="Porcentaje"]');
let resultadoLabel = document.querySelector('#Resultado1');
let resultadoLabel11 = document.querySelector('#Resultado11');
let limpiarButton = document.getElementById('Limpiar');

function formatearNumero(num) {
    let partes = num.toString().split(".");
    partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return partes.join(",");
}

function calcularPorcentaje() {
    let valor = parseFloat(valorInput.value.replace(/\./g, ''));
    let porcentaje = parseFloat(porcentajeInput.value);
    if (!isNaN(valor) && !isNaN(porcentaje)) {
        let resultado = valor * (porcentaje / 100);
        resultado = Math.round(resultado * 100) / 100;
        let resultadoFormateado = formatearNumero(resultado);
        resultadoLabel.innerHTML = `El valor descontado es: <strong>${resultadoFormateado}</strong> pesos.`;
        let total = valor - resultado;
        let totalFormateado = formatearNumero(total);
        resultadoLabel11.innerHTML = `El total a pagar es: <strong>${totalFormateado}</strong> pesos.`;
    } else {
        resultadoLabel.textContent = '';
        resultadoLabel11.textContent = '';
    }
}

valorInput.addEventListener('input', calcularPorcentaje);
porcentajeInput.addEventListener('input', calcularPorcentaje);

limpiarButton.addEventListener('click', function() {
    valorInput.value = '';
    porcentajeInput.value = 0;
    resultadoLabel.textContent = '';
    resultadoLabel11.textContent = '';
});