window.addEventListener('load', function () {
    var passwordTime = localStorage.getItem('passwordTime');
    var currentTime = new Date().getTime();

    if (!passwordTime || currentTime - passwordTime > 10 * 60 * 1000) { // 5 minutos
        var password = prompt("Por favor, introduzca su contraseña", "");
        if (password != "Latex") { // reemplaza "contraseña_correcta" con la contraseña real
            window.location.href = "index.html";
        } else {
            localStorage.setItem('passwordTime', currentTime);
        }
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const calculateButton = document.getElementById('calculateButton');
    const resultado = document.getElementById('resultado');

    // Función para traducir a LaTeX en tiempo real
    inputText.addEventListener('input', function () {
        const inputContent = inputText.value;
        const latexResult = translateToLatex(inputContent);
        outputText.textContent = latexResult;
    });

    // Función para ejecutar el cálculo al hacer clic en el botón
    calculateButton.addEventListener('click', function () {
        const latexFormula = outputText.textContent;
        const calculationResult = calculateLatex(latexFormula);
        resultado.textContent = `Resultado del cálculo: ${calculationResult}`;
    });

    // Función para traducir a LaTeX
    function translateToLatex(text) {
        // Reemplaza caracteres especiales por su equivalente en LaTeX
        const latexText = text.replace(/&/g, '\\&')
                              .replace(/%/g, '\\%')
                              .replace(/\$/g, '\\$')
                              .replace(/_/g, '\\_')
                              .replace(/#/g, '\\#')
                              .replace(/\\/g, '\\backslash');

        // Devuelve el texto LaTeX
        return `\\[${latexText}\\]`;
    }

    // Función para realizar el cálculo LaTeX
    function calculateLatex(latexFormula) {
        try {
            // Evalúa la fórmula LaTeX como JavaScript
            const result = eval(latexFormula.replace(/\\\[|\\\]/g, ''));
            return result;
        } catch (error) {
            return 'Error al calcular la fórmula';
        }
    }
});
  
