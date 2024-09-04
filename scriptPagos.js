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
