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
const math = require('mathjs'); // Import `mathjs` before function declarations

function calcularIntegral() {
  // Retrieve user input
  const inputText = document.getElementById("inputText").value.trim();

  // Basic error handling (check for empty input)
  if (!inputText) {
    alert("Please enter a valid function to integrate.");
    return;
  }

  try {
    // Parse the input function using mathjs
    const f = math.parse(inputText);

    // Define lower and upper bounds
    const lowerBound = parseFloat(prompt("Enter the lower bound of integration:"));
    const upperBound = parseFloat(prompt("Enter the upper bound of integration:"));

    // Numerical integration using Simpson's rule with default steps
    const numSteps = 1000;
    const integralValue = integrateSimpson(f, lowerBound, upperBound, numSteps);

    // Display the result
    document.getElementById("resultado").textContent = `The approximate integral of f(x) = ${inputText} from ${lowerBound} to ${upperBound} is: ${integralValue.toFixed(4)}`;
  } catch (error) {
    const errorMessage = `Error al calcular la integral: ${error.message}`;
    alert(errorMessage);
    console.error(error);
  }
}

function integrateSimpson(f, a, b, n) {
  const h = (b - a) / n;
  let sum = math.evaluate(f, {x: a}) + math.evaluate(f, {x: b});

  for (let i = 1; i < n - 1; i++) {
    const x = a + i * h;
    sum += 4 * math.evaluate(f, {x: x});
  }

  for (let i = 2; i < n; i++) {
    const x = a + i * h;
    sum += 2 * math.evaluate(f, {x: x});
  }

  return (h / 3) * sum;
}
