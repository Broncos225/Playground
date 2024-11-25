// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAw5z5-aKicJ78N1UahQ-Lu_u7WP6MNVRE",
    authDomain: "playgroundbdstop.firebaseapp.com",
    databaseURL: "https://playgroundbdstop-default-rtdb.firebaseio.com",
    projectId: "playgroundbdstop",
    storageBucket: "playgroundbdstop.appspot.com",
    messagingSenderId: "808082296806",
    appId: "1:808082296806:web:c1d0dc3c2fc5fbf6c9d027"
};

// Inicialización de Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth() + 1;

// Función para cargar los datos desde Firebase
async function cargarDatos() {
    const promesasPrimeraQuincena = [];
    const promesasSegundaQuincena = [];
    var asesor = localStorage.getItem("nombreAsesorActual");
    var asesorConEspacios = asesor.replace(/_/g, ' ');


    for (let i = 1; i <= 15; i++) {
        const ref = firebase.database().ref(`celdas/${asesorConEspacios}/${i + 1}/${year}/${month}`);

        const promesa = new Promise((resolve, reject) => {
            ref.on('value', (snapshot) => {
                const data = snapshot.val();
                const cell = document.getElementById(`Dia${i}`);

                if (cell && data) {
                    cell.innerHTML = data.texto;
                }
                resolve();
            }, (error) => {
                console.error(`Error al leer datos para el día ${i}:`, error);
                reject(error);
            });
        });

        promesasPrimeraQuincena.push(promesa);
    }

    for (let i = 16; i <= 31; i++) {
        const ref = firebase.database().ref(`celdas/${asesorConEspacios}/${i + 1}/${year}/${month}`);

        const promesa = new Promise((resolve, reject) => {
            ref.on('value', (snapshot) => {
                const data = snapshot.val();
                const cell = document.getElementById(`Dia${i}`);

                if (cell && data) {
                    cell.innerHTML = data.texto;
                }
                resolve();
            }, (error) => {
                console.error(`Error al leer datos para el día ${i}:`, error);
                reject(error);
            });
        });

        promesasSegundaQuincena.push(promesa);
    }

    // Espera a que todas las promesas se resuelvan para cada quincena
    await Promise.all(promesasPrimeraQuincena);
    await Promise.all(promesasSegundaQuincena);

    asignarValores();
    calcularTotalQuincenas();
}


// Función para asignar valores después de cargar los datos
function asignarValores() {
    let Turnos = {
        T1: { nombre: "T1", HN: 7.5, RNO: 0, HEDO: 0, HENO: 0, FSC: 0, DFN: 0 },
        T1N: { nombre: "T1N", HN: 8, RNO: 0, HEDO: 0, HENO: 0, FSC: 0, DFN: 0 },
        T1U: { nombre: "T1U", HN: 8.5, RNO: 0, HEDO: 0, HENO: 0, FSC: 0, DFN: 0 },
        T2: { nombre: "T2", HN: 7.5, RNO: 0, HEDO: 0, HENO: 0, FSC: 0, DFN: 0 },
        T2N: { nombre: "T2N", HN: 8, RNO: 0, HEDO: 0, HENO: 0, FSC: 0, DFN: 0 },
        T2U: { nombre: "T2U", HN: 8.5, RNO: 0, HEDO: 0, HENO: 0, FSC: 0, DFN: 0 },
        T3: { nombre: "T3", HN: 7.5, RNO: 0, HEDO: 0, HENO: 0, FSC: 0, DFN: 0 },
        T3N: { nombre: "T3N", HN: 8, RNO: 0, HEDO: 0, HENO: 0, FSC: 0, DFN: 0 },
        T4: { nombre: "T4", HN: 7.5, RNO: 0, HEDO: 0, HENO: 0, FSC: 0, DFN: 0 },
        T4N: { nombre: "T4N", HN: 8, RNO: 0, HEDO: 0, HENO: 0, FSC: 0, DFN: 0 },
        T5: { nombre: "T5", HN: 7.5, RNO: 0, HEDO: 0, HENO: 0, FSC: 0, DFN: 0 },
        T5N: { nombre: "T5N", HN: 8, RNO: 0, HEDO: 0, HENO: 0, FSC: 0, DFN: 0 },
        T6: { nombre: "T6", HN: 7, RNO: 0.5, HEDO: 0, HENO: 0, FSC: 0, DFN: 0 },
        T6N: { nombre: "T6N", HN: 7.5, RNO: 0.5, HEDO: 0, HENO: 0, FSC: 0, DFN: 0 },
        T6U: { nombre: "T6U", HN: 6, RNO: 0.5, HEDO: 0, HENO: 0, FSC: 0, DFN: 0 },
        TSA: { nombre: "TSA", HN: 8, RNO: 0, HEDO: 0, HENO: 0, FSC: 0, DFN: 0 },
        NN: { nombre: "NN", HN: 0, RNO: 0, HEDO: 0, HENO: 0, FSC: 0, DFN: 0 },
        D: { nombre: "D", HN: 0, RNO: 0, HEDO: 0, HENO: 0, FSC: 0, DFN: 0 }
    };

    for (let i = 1; i <= 32; i++) {
        const diaId = `Dia${i}`;
        const diaElement = document.getElementById(diaId);

        if (diaElement) {
            const diaValue = diaElement.innerText || diaElement.value;
            const turno = Turnos[diaValue];

            if (turno !== undefined) {
                const keys = Object.keys(turno);
                keys.forEach(key => {
                    if (key !== 'nombre') {
                        const valorId = `${key}${i}`;
                        const valorElement = document.getElementById(valorId);
                        if (valorElement) {
                            valorElement.innerText = turno[key];
                        }
                    }
                });
            }
        }
    }
}


// Llama a la función principal para cargar datos
cargarDatos();

function calcularTotalQuincenas() {
    const tipos = ['HN', 'RNO', 'HEDO', 'HENO', 'FSC', 'DFN']; // Tipos de valores que deseas sumar

    tipos.forEach(tipo => {
        let totalPrimeraQuincena = 0;
        let totalSegundaQuincena = 0;

        // Calcular total de la primera quincena (días 1-15)
        for (let i = 1; i <= 15; i++) {
            const valorElement = document.getElementById(`${tipo}${i}`);

            if (valorElement && valorElement.innerText.trim() !== "") {
                const valor = parseFloat(valorElement.innerText);

                if (!isNaN(valor)) {
                    totalPrimeraQuincena += valor;
                }
            }
        }

        // Calcular total de la segunda quincena (días 16-31)
        for (let i = 16; i <= 31; i++) {
            const valorElement = document.getElementById(`${tipo}${i}`);

            if (valorElement && valorElement.innerText.trim() !== "") {
                const valor = parseFloat(valorElement.innerText);

                if (!isNaN(valor)) {
                    totalSegundaQuincena += valor;
                }
            }
        }

        // Mostrar totales de cada quincena
        document.getElementById(`Total${tipo}Q1`).innerText = totalPrimeraQuincena;
        document.getElementById(`Total${tipo}Q2`).innerText = totalSegundaQuincena;

        // Mostrar total por quincenas en días
        document.getElementById(`Dias${tipo}Q1`).innerText = totalPrimeraQuincena / 8;
        document.getElementById(`Dias${tipo}Q2`).innerText = totalSegundaQuincena / 8;

    });

    // Calcular y mostrar el total general por quincena
    const totalGeneralQ1 = tipos.reduce((sum, tipo) => sum + parseFloat(document.getElementById(`Total${tipo}Q1`).innerText), 0);
    const totalGeneralQ2 = tipos.reduce((sum, tipo) => sum + parseFloat(document.getElementById(`Total${tipo}Q2`).innerText), 0);

    document.getElementById(`SumaCantTotalQ1`).innerText = totalGeneralQ1;
    document.getElementById(`SumaCantTotalQ2`).innerText = totalGeneralQ2;

    document.getElementById(`SumaDiasTotalQ1`).innerText = totalGeneralQ1 / 8;
    document.getElementById(`SumaDiasTotalQ2`).innerText = totalGeneralQ2 / 8;
    actualizarTodosLosValores();

}
function actualizarTodosLosValores() {
    // Obtén el salario base desde el elemento con id "Salario"
    var salarioBase = parseFloat(document.getElementById("Salario").value);
    var horaBase = salarioBase / 192;
    console.log(`Salario Base: ${salarioBase}, Hora Base: ${horaBase}`); // Verifica el cálculo de horaBase

    // Tabla de incrementos según el tipo de hora
    var incremento = {
        "HN": 1,
        "RNO": 0.35,
        "HEDO": 1.25,
        "HENO": 1.75,
        "FSC": 1.75,
        "DFN": 2.1
    };

    // Variables para acumular las sumas totales de las quincenas
    var sumaTotalQ1 = 0;
    var sumaTotalQ2 = 0;

    // Itera sobre cada tipo de hora para ambas quincenas
    for (var tipo in incremento) {
        if (incremento.hasOwnProperty(tipo)) {
            // Obtén y convierte el valor de las horas trabajadas en la primera quincena
            var HorasQ1Text = document.getElementById(`Total${tipo}Q1`).innerText;
            var HorasQ1 = parseFloat(HorasQ1Text);
            if (isNaN(HorasQ1)) HorasQ1 = 0;  // Manejo de posibles valores no numéricos

            // Calcula el valor para la primera quincena
            var valorCalculadoQ1 = HorasQ1 * horaBase * incremento[tipo];
            console.log(`Horas Q1 para ${tipo}: ${HorasQ1}, Valor Calculado Q1: ${valorCalculadoQ1.toFixed(2)}`);
            document.getElementById(`Valor${tipo}Q1`).innerText = valorCalculadoQ1.toFixed(2);

            // Obtén y convierte el valor de las horas trabajadas en la segunda quincena
            var HorasQ2Text = document.getElementById(`Total${tipo}Q2`).innerText;
            var HorasQ2 = parseFloat(HorasQ2Text);
            if (isNaN(HorasQ2)) HorasQ2 = 0;  // Manejo de posibles valores no numéricos

            // Calcula el valor para la segunda quincena
            var valorCalculadoQ2 = HorasQ2 * horaBase * incremento[tipo];
            console.log(`Horas Q2 para ${tipo}: ${HorasQ2}, Valor Calculado Q2: ${valorCalculadoQ2.toFixed(2)}`);
            document.getElementById(`Valor${tipo}Q2`).innerText = valorCalculadoQ2.toFixed(2);

            // Suma los valores de las quincenas
            sumaTotalQ1 += valorCalculadoQ1;
            sumaTotalQ2 += valorCalculadoQ2;
        }
    }

    // Actualiza los totales en los elementos correspondientes
    document.getElementById(`SumaValorTotalQ1`).innerText = sumaTotalQ1.toFixed(2);
    document.getElementById(`SumaValorTotalQ2`).innerText = sumaTotalQ2.toFixed(2);
}



// Función para actualizar el saludo dinámicamente
function actualizarSaludo() {
    const saludo = document.getElementById("Saludo").value;
    const saludoLabel = document.getElementById("SaludoLabel");

    // Cambiar entre "Buenos" y "Buenas"
    if (saludo === "días") {
        saludoLabel.textContent = "Buenos";
    } else {
        saludoLabel.textContent = "Buenas";
    }
}

// Escuchar los cambios en el select de saludo
document.getElementById("Saludo").addEventListener("change", actualizarSaludo);

document.getElementById("btnCierre").addEventListener("click", function () {
    // Obtener los valores de los selects e inputs
    const saludo = document.getElementById("Saludo").value;
    const cierre = document.getElementById("Cierre").value;
    const llamadas = document.getElementById("Llamadas").value;
    const casos = document.getElementById("Casos").value;
    const minuta = document.getElementById("Minuta").value;

    // Ajustar el saludo (sin repetir la palabra seleccionada en el select)
    let saludoTexto;
    if (saludo === "días") {
        saludoTexto = "Buenos días";
    } else {
        saludoTexto = `Buenas ${saludo}`;
    }

    // Crear el texto a copiar
    const texto = `${saludoTexto}, ${cierre} ${llamadas} llamadas y ${casos} casos, ${minuta} se hace la minuta, VIP y correos listos.`;

    // Copiar el texto al portapapeles
    navigator.clipboard.writeText(texto).then(() => {
        alert("Texto copiado al portapapeles: " + texto);
    }).catch(err => {
        console.error("Error al copiar el texto: ", err);
    });
});

// Llamar a la función para inicializar el saludo
actualizarSaludo();


// Función para convertir turnos
function convertirTurnos() {
    const textoTurnos = document.getElementById("turnos").value.trim();
    if (!textoTurnos) {
        document.getElementById("resultado").textContent = "Por favor, introduce turnos.";
        return;
    }

    // Separar los turnos ingresados
    const listaTurnos = textoTurnos.split(/\s+/);

    // Convertir cada turno a su franja horaria
    const resultados = listaTurnos.map(turno => {
        const horario = turnos[turno] || "Horario no definido";
        return `${horario}`;
    });

    // Mostrar el resultado
    document.getElementById("resultado").innerHTML = resultados.join("<br>");
    document.getElementById("copiar").style.display = "inline-block"; // Mostrar botón de copiar
}

// Función para copiar el resultado al portapapeles
function copiarResultado() {
    const resultadoTexto = document.getElementById("resultado").innerText;
    navigator.clipboard.writeText(resultadoTexto)
        .then(() => {
            alert("Resultado copiado al portapapeles.");
        })
        .catch(err => {
            alert("Hubo un error al copiar: " + err);
        });
}

function copiarHoras() {
    const resultadoTexto = document.getElementById("valor").innerText;
    navigator.clipboard.writeText(resultadoTexto)
        .then(() => {
            alert("Resultado copiado al portapapeles.");
        })
        .catch(err => {
            alert("Hubo un error al copiar: " + err);
        });
}

// Añadir evento al botón
document.getElementById("convertir").addEventListener("click", convertirTurnos);
document.getElementById("copiar").addEventListener("click", copiarResultado);
document.getElementById("copiarV").addEventListener("click", copiarHoras);


function calcularValorTurno() {
    const textoTurnos = document.getElementById("turnos").value.trim();
    if (!textoTurnos) {
        document.getElementById("valor").textContent = "Por favor, introduce turnos.";
        return;
    }

    // Definir las categorías de turnos
    const tiposTurno7_5 = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'];
    const tiposTurno8 = ['T1N', 'T2N', 'T3N', 'T4N', 'T5N', 'T6N', 'TSA', 'DF'];
    const tiposTurno0 = ['NN', 'D', 'DV'];
    const tiposTurno9_5 = ['T1T'];
    const tiposTurno5 = ['T4NA'];

    // Separar los turnos ingresados
    const listaTurnos = textoTurnos.split(/\s+/);

    // Determinar el valor por cada turno
    const resultadosValor = listaTurnos.map(turno => {
        if (tiposTurno7_5.includes(turno)) return `7,5`;
        if (tiposTurno5.includes(turno)) return '5';
        if (tiposTurno8.includes(turno)) return `8`;
        if (tiposTurno0.includes(turno)) return `0`;
        if (tiposTurno8_5.includes(turno)) return `8,5`;
        if (tiposTurno9_5.includes(turno)) return `9,5`;
        return `Valor no definido`; // Por si el turno no está en las listas
    });

    // Mostrar el resultado
    document.getElementById("valor").innerHTML = resultadosValor.join("<br>");
    document.getElementById("copiarV").style.display = "inline-block"; // Mostrar botón de copiar
}

// Añadir la llamada a calcularValorTurno después de convertirTurnos
document.getElementById("convertirTurnoHora").addEventListener("click", calcularValorTurno);


const turnos = {
    T1: "07:00 a 03:30",
    T1N: "07:00 a 04:00",
    T1T: "07:00 a 05:30",
    T2: "09:00 a 05:30",
    T2N: "09:00 a 06:00",
    T3: "10:00 a 06:30",
    T3N: "09:30 a 06:30",
    T4: "10:30 a 07:00",
    T4N: "10:00 a 07:00",
    T4NA: "10:00 a 03:00",
    T5: "11:30 a 08:00",
    T5N: "11:00 a 08:00",
    T6: "01:00 a 09:30",
    T6N: "12:30 a 09:30",
    TSA: "08:00 a 04:00",
    D: "Descanso",
    DF: "Día Familiar",
    DV: "Día Vacaciones",
    IN: "Incapacidad"
};
