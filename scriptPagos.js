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

async function obtenerDatosTurno(turnoId) {
    try {
      const snapshot = await db.ref(`Turnos/${turnoId}`).once('value');
      const datosTurno = snapshot.val();
      
      if (datosTurno) {
        return {
          apertura: datosTurno.Apertura || "",
          cierre: datosTurno.Cierre || "",
          cantidad: datosTurno.Cantidad || 0,
          descripcion: datosTurno.Descripcion || ""
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error al obtener datos del turno ${turnoId}:`, error);
      return null;
    }
  }
  
  async function convertirTurnos() {
    const textoTurnos = document.getElementById("turnos").value.trim();
    if (!textoTurnos) {
      document.getElementById("resultado").textContent = "Por favor, introduce turnos.";
      return;
    }
  
    // Mostrar indicador de carga
    document.getElementById("resultado").textContent = "Consultando turnos...";
    
    // Separar los turnos ingresados
    const listaTurnos = textoTurnos.split(/\s+/);
    
    // Array para almacenar las promesas
    const promesas = [];
    
    // Para cada turno, crear una promesa que obtenga sus datos
    for (const turno of listaTurnos) {
      const promesa = obtenerDatosTurno(turno).then(datosTurno => {
        if (!datosTurno) {
          return "Horario no definido";
        }
        
        // Si apertura y cierre son ambos "12:00 AM", usar la descripción
        if (datosTurno.apertura === "12:00 AM" && datosTurno.cierre === "12:00 AM") {
          return datosTurno.descripcion;
        } else {
          return `${datosTurno.apertura} a ${datosTurno.cierre}`;
        }
      });
      
      promesas.push(promesa);
    }
    
    try {
      // Esperar a que todas las promesas se resuelvan
      const resultados = await Promise.all(promesas);
      
      // Mostrar el resultado
      document.getElementById("resultado").innerHTML = resultados.join("<br>");
      document.getElementById("copiar").style.display = "inline-block"; // Mostrar botón de copiar
    } catch (error) {
      console.error("Error al consultar los turnos:", error);
      document.getElementById("resultado").textContent = "Error al consultar los turnos. Inténtalo de nuevo.";
    }
  }
  
  async function calcularValorTurno() {
    const textoTurnos = document.getElementById("turnos").value.trim();
    if (!textoTurnos) {
      document.getElementById("valor").textContent = "Por favor, introduce turnos.";
      return;
    }
    
    // Mostrar indicador de carga
    document.getElementById("valor").textContent = "Calculando valores...";
    
    // Separar los turnos ingresados
    const listaTurnos = textoTurnos.split(/\s+/);
    
    // Array para almacenar las promesas
    const promesas = [];
    
    // Para cada turno, obtener su valor desde Firebase
    for (const turno of listaTurnos) {
      const promesa = obtenerDatosTurno(turno).then(datosTurno => {
        return datosTurno ? datosTurno.cantidad.toString() : "Valor no definido";
      });
      
      promesas.push(promesa);
    }
    
    try {
      // Esperar a que todas las promesas se resuelvan
      const resultadosValor = await Promise.all(promesas);
      
      // Mostrar el resultado
      document.getElementById("valor").innerHTML = resultadosValor.join("<br>");
      document.getElementById("copiarV").style.display = "inline-block"; // Mostrar botón de copiar
    } catch (error) {
      console.error("Error al calcular los valores de los turnos:", error);
      document.getElementById("valor").textContent = "Error al calcular los valores. Inténtalo de nuevo.";
    }
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


// Añadir la llamada a calcularValorTurno después de convertirTurnos
document.getElementById("convertirTurnoHora").addEventListener("click", calcularValorTurno);

// Añadir evento al botón
document.getElementById("convertir").addEventListener("click", convertirTurnos);
document.getElementById("copiar").addEventListener("click", copiarResultado);
document.getElementById("copiarV").addEventListener("click", copiarHoras);

const turnosRef = db.ref("Turnos");
const modal = document.getElementById("modalNuevoTurno");
const btnNuevoTurno = document.getElementById("btnNuevoTurno");
const closeBtn = document.querySelector(".close-btn");
const btnCancelar = document.getElementById("btnCancelar");
const btnGuardarNuevo = document.getElementById("btnGuardarNuevo");

// Función para cargar los turnos desde Firebase y mostrarlos en la tabla
function cargarTurnos() {
    turnosRef.on("value", snapshot => {
        const turnos = snapshot.val();
        const tabla = document.getElementById("tablaTurnos");
        tabla.innerHTML = ""; // Limpiar la tabla antes de agregar nuevos datos

        for (const key in turnos) {
            if (turnos.hasOwnProperty(key)) {
                const turno = turnos[key];
                // Remover el # del color si existe
                const colorF = turno.ColorF.startsWith('#') ? turno.ColorF.substring(1) : turno.ColorF;
                const colorT = turno.ColorT.startsWith('#') ? turno.ColorT.substring(1) : turno.ColorT;

                // Separar la hora en componentes (hora y periodo)
                const [horaApertura, periodoApertura] = separarHoraYPeriodo(turno.Apertura);
                const [horaCierre, periodoCierre] = separarHoraYPeriodo(turno.Cierre);

                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td style="background-color: #${colorF}; color: #${colorT}; text-align: center"><b>${key}</b></td>
                    <td>
                        <div class="d-flex" style="display: flex; flex-direction: row; gap: 5px;">
                            <select class="form-control hora-selector mr-1" id="apertura-hora-${key}" data-turno-id="${key}">
                                ${generarOpcionesHorasNumeros(horaApertura)}
                            </select>
                            <select class="form-control periodo-selector" id="apertura-periodo-${key}" data-turno-id="${key}">
                                <option value="AM" ${periodoApertura === 'AM' ? 'selected' : ''}>AM</option>
                                <option value="PM" ${periodoApertura === 'PM' ? 'selected' : ''}>PM</option>
                            </select>
                        </div>
                    </td>
                    <td><input type="number" class="form-control" value="${turno.Cantidad}" id="cantidad-${key}"></td>
                    <td>
                        <div class="d-flex" style="display: flex; flex-direction: row; gap: 5px;">
                            <select class="form-control hora-selector mr-1" id="cierre-hora-${key}" data-turno-id="${key}">
                                ${generarOpcionesHorasNumeros(horaCierre)}
                            </select>
                            <select class="form-control periodo-selector" id="cierre-periodo-${key}" data-turno-id="${key}">
                                <option value="AM" ${periodoCierre === 'AM' ? 'selected' : ''}>AM</option>
                                <option value="PM" ${periodoCierre === 'PM' ? 'selected' : ''}>PM</option>
                            </select>
                        </div>
                    </td>
                    <td><input type="color" class="form-control form-control-color Colorpicker" value="#${colorF}" id="colorF-${key}"></td>
                    <td><input type="color" class="form-control form-control-color Colorpicker" value="#${colorT}" id="colorT-${key}"></td>
                    <td><input type="text" class="form-control" value="${turno.Descripcion}" id="descripcion-${key}"></td>
                    <td style="display: flex; flex-direction: row; gap: 5px;">
                        <button style="background-color: #154360; color: white" onclick="confirmarGuardarTurno('${key}')">
                            <i class="fas fa-save"></i> 
                        </button>
                        <button style="background-color: #cb4335; color: white" onclick="confirmarEliminarTurno('${key}')">
                            <i class="fas fa-trash"></i> 
                        </button>
                    </td>
                `;

                tabla.appendChild(fila);
            }
        }

        // Eliminar los event listeners para los selectores de hora y periodo
        // que actualizaban la cantidad automáticamente
    });
}

// Función para separar la hora del periodo (AM/PM)
function separarHoraYPeriodo(horaCompleta) {
    // Si ya está en formato de objeto, devolver como está
    if (typeof horaCompleta === 'object') {
        return [horaCompleta.hora, horaCompleta.periodo];
    }
    
    // Si es un string en formato "HH:MM AM/PM"
    const partes = horaCompleta.split(' ');
    if (partes.length === 2) {
        return [partes[0], partes[1]];
    }
    
    // Valor por defecto
    return ["12:00", "AM"];
}

// Función para generar opciones de horas solo con números (cada 30 min)
function generarOpcionesHorasNumeros(horaSeleccionada) {
    let opciones = '';
    
    // Si la hora seleccionada incluye periodo, extraer solo la parte de la hora
    if (horaSeleccionada.includes(' ')) {
        horaSeleccionada = horaSeleccionada.split(' ')[0];
    }
    
    for (let hora = 1; hora <= 12; hora++) {
        for (let minuto = 0; minuto < 60; minuto += 30) {
            const minutoStr = minuto === 0 ? '00' : minuto.toString();
            const valorHora = `${hora}:${minutoStr}`;
            
            const seleccionado = valorHora === horaSeleccionada ? 'selected' : '';
            opciones += `<option value="${valorHora}" ${seleccionado}>${valorHora}</option>`;
        }
    }
    return opciones;
}

// Función para confirmar antes de guardar un turno
function confirmarGuardarTurno(turnoId) {
    const turnoActual = {
        Apertura: obtenerHoraCompleta(`apertura-hora-${turnoId}`, `apertura-periodo-${turnoId}`),
        Cierre: obtenerHoraCompleta(`cierre-hora-${turnoId}`, `cierre-periodo-${turnoId}`),
        Cantidad: document.getElementById(`cantidad-${turnoId}`).value,
        Descripcion: document.getElementById(`descripcion-${turnoId}`).value,
        ColorF: document.getElementById(`colorF-${turnoId}`).value,
        ColorT: document.getElementById(`colorT-${turnoId}`).value
    };
    
    if (confirm(`¿Desea guardar los cambios del turno ${turnoId}?\n\nApertura: ${turnoActual.Apertura}\nCierre: ${turnoActual.Cierre}\nCantidad: ${turnoActual.Cantidad}\nDescripción: ${turnoActual.Descripcion}`)) {
        guardarTurnoFirebase(turnoId);
        cerrarModal();
    } else {
        // Recargar los datos actuales de la base de datos
        turnosRef.child(turnoId).once("value", snapshot => {
            if (snapshot.exists()) {
                const turno = snapshot.val();
                const [horaApertura, periodoApertura] = separarHoraYPeriodo(turno.Apertura);
                const [horaCierre, periodoCierre] = separarHoraYPeriodo(turno.Cierre);
                
                // Restablecer valores
                document.getElementById(`apertura-hora-${turnoId}`).value = horaApertura;
                document.getElementById(`apertura-periodo-${turnoId}`).value = periodoApertura;
                document.getElementById(`cierre-hora-${turnoId}`).value = horaCierre;
                document.getElementById(`cierre-periodo-${turnoId}`).value = periodoCierre;
                document.getElementById(`cantidad-${turnoId}`).value = turno.Cantidad;
                document.getElementById(`colorF-${turnoId}`).value = `#${turno.ColorF}`;
                document.getElementById(`colorT-${turnoId}`).value = `#${turno.ColorT}`;
                document.getElementById(`descripcion-${turnoId}`).value = turno.Descripcion;
                
                mostrarAlerta("Cambios cancelados", "info");
            }
        });
    }
}

// Función para obtener la hora completa (hora + periodo)
function obtenerHoraCompleta(horaSelectId, periodoSelectId) {
    const hora = document.getElementById(horaSelectId).value;
    const periodo = document.getElementById(periodoSelectId).value;
    return `${hora} ${periodo}`;
}

function guardarTurnoFirebase(turnoId) {
    const colorFValue = document.getElementById(`colorF-${turnoId}`).value;
    const colorTValue = document.getElementById(`colorT-${turnoId}`).value;
    
    // Remover el # del color si existe
    const colorF = colorFValue.startsWith('#') ? colorFValue.substring(1) : colorFValue;
    const colorT = colorTValue.startsWith('#') ? colorTValue.substring(1) : colorTValue;

    // Obtener la hora completa (hora + periodo)
    const apertura = obtenerHoraCompleta(`apertura-hora-${turnoId}`, `apertura-periodo-${turnoId}`);
    const cierre = obtenerHoraCompleta(`cierre-hora-${turnoId}`, `cierre-periodo-${turnoId}`);

    const nuevoTurno = {
        Apertura: apertura,
        Cantidad: parseFloat(document.getElementById(`cantidad-${turnoId}`).value),
        Cierre: cierre,
        ColorF: colorF,
        ColorT: colorT,
        Descripcion: document.getElementById(`descripcion-${turnoId}`).value
    };

    turnosRef.child(turnoId).update(nuevoTurno)
        .then(() => {
            mostrarAlerta("Turno actualizado correctamente", "success");
        })
        .catch(error => {
            console.error("Error al actualizar turno:", error);
            mostrarAlerta("Error al actualizar turno", "danger");
        });
}

// Función para confirmar antes de eliminar un turno
function confirmarEliminarTurno(turnoId) {
    turnosRef.child(turnoId).once("value", snapshot => {
        if (snapshot.exists()) {
            const turno = snapshot.val();
            if (confirm(`¿Estás seguro de eliminar el turno ${turnoId}?\n\nApertura: ${turno.Apertura}\nCierre: ${turno.Cierre}\nCantidad: ${turno.Cantidad}\nDescripción: ${turno.Descripcion}`)) {
                eliminarTurno(turnoId);
            }
        }
    });
}

function eliminarTurno(turnoId) {
    turnosRef.child(turnoId).remove()
        .then(() => {
            mostrarAlerta("Turno eliminado correctamente", "success");
        })
        .catch(error => {
            console.error("Error al eliminar turno:", error);
            mostrarAlerta("Error al eliminar el turno", "danger");
        });
}

function agregarNuevoTurno() {
    const turnoId = document.getElementById("nuevo-id").value.trim();
    
    // Validar que se haya ingresado un ID
    if (!turnoId) {
        mostrarAlerta("Debe ingresar un ID para el turno", "danger");
        return;
    }
    
    // Verificar si el ID ya existe
    turnosRef.child(turnoId).once("value", snapshot => {
        if (snapshot.exists()) {
            mostrarAlerta("El ID ya existe. Por favor, elija otro ID", "danger");
            return;
        }
        
        const horaApertura = document.getElementById("nuevo-apertura-hora").value;
        const periodoApertura = document.getElementById("nuevo-apertura-periodo").value;
        const horaCierre = document.getElementById("nuevo-cierre-hora").value;
        const periodoCierre = document.getElementById("nuevo-cierre-periodo").value;
        
        const apertura = `${horaApertura} ${periodoApertura}`;
        const cierre = `${horaCierre} ${periodoCierre}`;
        // Usar el valor manual en lugar de calcularlo
        const cantidad = document.getElementById("nuevo-cantidad").value;
        
        // Preparar los colores
        const colorFValue = document.getElementById("nuevo-colorF").value;
        const colorTValue = document.getElementById("nuevo-colorT").value;
        const colorF = colorFValue.startsWith('#') ? colorFValue.substring(1) : colorFValue;
        const colorT = colorTValue.startsWith('#') ? colorTValue.substring(1) : colorTValue;
        
        // Confirmar la creación del nuevo turno
        if (confirm(`¿Desea crear el turno ${turnoId}?\n\nApertura: ${apertura}\nCierre: ${cierre}\nCantidad: ${cantidad}\nDescripción: ${document.getElementById("nuevo-descripcion").value}`)) {
            // Si el ID no existe, proceder a crear el turno
            const nuevoTurno = {
                Apertura: apertura,
                Cantidad: parseFloat(cantidad),
                Cierre: cierre,
                ColorF: colorF,
                ColorT: colorT,
                Descripcion: document.getElementById("nuevo-descripcion").value
            };
            
            // Usar el ID personalizado en lugar de dejar que Firebase genere uno
            turnosRef.child(turnoId).set(nuevoTurno)
                .then(() => {
                    mostrarAlerta("Nuevo turno agregado correctamente", "success");
                    cerrarModal();
                    limpiarFormularioNuevo();
                })
                .catch(error => {
                    console.error("Error al agregar nuevo turno:", error);
                    mostrarAlerta("Error al agregar el turno", "danger");
                });
        }
    });
}

function limpiarFormularioNuevo() {
    document.getElementById("nuevo-id").value = "";
    
    // Resetear selectores de hora
    if (document.getElementById("nuevo-apertura-hora")) {
        document.getElementById("nuevo-apertura-hora").selectedIndex = 0;
        document.getElementById("nuevo-apertura-periodo").selectedIndex = 0;
        document.getElementById("nuevo-cierre-hora").selectedIndex = 0;
        document.getElementById("nuevo-cierre-periodo").selectedIndex = 0;
    }
    
    document.getElementById("nuevo-cantidad").value = "";
    document.getElementById("nuevo-colorF").value = "#FFFFFF";
    document.getElementById("nuevo-colorT").value = "#000000";
    document.getElementById("nuevo-descripcion").value = "";
}

function mostrarAlerta(mensaje, tipo) {
    // Crear elemento de alerta
    const alertaDiv = document.createElement("div");
    alertaDiv.className = `alerta alerta-${tipo}`;
    alertaDiv.innerHTML = mensaje;
    
    // Estilos para la alerta
    alertaDiv.style.padding = "10px 15px";
    alertaDiv.style.marginBottom = "15px";
    alertaDiv.style.borderRadius = "4px";
    
    if (tipo === "success") {
        alertaDiv.style.backgroundColor = "#d4edda";
        alertaDiv.style.color = "#155724";
        alertaDiv.style.border = "1px solid #c3e6cb";
    } else if (tipo === "danger") {
        alertaDiv.style.backgroundColor = "#f8d7da";
        alertaDiv.style.color = "#721c24";
        alertaDiv.style.border = "1px solid #f5c6cb";
    } else if (tipo === "info") {
        alertaDiv.style.backgroundColor = "#d1ecf1";
        alertaDiv.style.color = "#0c5460";
        alertaDiv.style.border = "1px solid #bee5eb";
    }
    
    // Insertar alerta antes de la tabla
    const container = document.querySelector(".container");
    container.insertBefore(alertaDiv, document.querySelector("table").parentNode);
    
    // Remover la alerta después de 3 segundos
    setTimeout(() => {
        alertaDiv.remove();
    }, 3000);
}

// Funciones para inicializar los selectores de hora en el modal
function inicializarSelectorHoras() {
    const nuevoAperturaHoraSelect = document.getElementById("nuevo-apertura-hora");
    const nuevoCierreHoraSelect = document.getElementById("nuevo-cierre-hora");
    
    if (nuevoAperturaHoraSelect && nuevoCierreHoraSelect) {
        // Limpiar contenido existente
        nuevoAperturaHoraSelect.innerHTML = generarOpcionesHorasNumeros("8:00");
        nuevoCierreHoraSelect.innerHTML = generarOpcionesHorasNumeros("5:00");
        
        // Establecer períodos por defecto (AM para apertura, PM para cierre)
        document.getElementById("nuevo-apertura-periodo").value = "AM";
        document.getElementById("nuevo-cierre-periodo").value = "PM";
        
        // No agregamos los event listeners para actualizar cantidad automáticamente
    }
}

// Funciones para el modal
function abrirModal() {
    modal.style.display = "block";
    limpiarFormularioNuevo();
    inicializarSelectorHoras();
}

function cerrarModal() {
    modal.style.display = "none";
}

// Event Listeners para el modal
btnNuevoTurno.addEventListener("click", abrirModal);
closeBtn.addEventListener("click", cerrarModal);
btnLimpiar.addEventListener("click", limpiarFormularioNuevo);
btnCancelar.addEventListener("click", cerrarModal);
btnGuardarNuevo.addEventListener("click", agregarNuevoTurno);

// Cerrar el modal si se hace clic fuera de él
window.addEventListener("click", (event) => {
    if (event.target == modal) {
        cerrarModal();
    }
});

// Exponer funciones al ámbito global
window.guardarTurnoFirebase = guardarTurnoFirebase;
window.eliminarTurno = eliminarTurno;
window.confirmarGuardarTurno = confirmarGuardarTurno;
window.confirmarEliminarTurno = confirmarEliminarTurno;

// Inicializar
window.onload = function() {
    // Reemplazar los inputs con selectores separados para hora y periodo
    reemplazarInputsConSelectores();
    cargarTurnos();
};

function reemplazarInputsConSelectores() {
    // Formulario de nuevo turno
    const nuevoAperturaInput = document.getElementById("nuevo-apertura");
    const nuevoCierreInput = document.getElementById("nuevo-cierre");
    
    if (nuevoAperturaInput && nuevoCierreInput) {
        // Crear contenedor para apertura
        const aperturaContainer = document.createElement("div");
        aperturaContainer.className = "d-flex";
        aperturaContainer.style.display = "flex";
        aperturaContainer.style.justifyContent = "center";
        aperturaContainer.style.gap = "5px";
        
        // Crear select para hora de apertura
        const aperturaHoraSelect = document.createElement("select");
        aperturaHoraSelect.id = "nuevo-apertura-hora";
        aperturaHoraSelect.className = "form-control mr-1";
        aperturaHoraSelect.innerHTML = generarOpcionesHorasNumeros("8:00");
        
        // Crear select para periodo de apertura
        const aperturaPeriodoSelect = document.createElement("select");
        aperturaPeriodoSelect.id = "nuevo-apertura-periodo";
        aperturaPeriodoSelect.className = "form-control";
        aperturaPeriodoSelect.innerHTML = `
            <option value="AM" selected>AM</option>
            <option value="PM">PM</option>
        `;
        
        // Agregar a contenedor
        aperturaContainer.appendChild(aperturaHoraSelect);
        aperturaContainer.appendChild(aperturaPeriodoSelect);
        
        // Reemplazar el input original
        nuevoAperturaInput.parentNode.replaceChild(aperturaContainer, nuevoAperturaInput);
        
        // Hacer lo mismo para cierre
        const cierreContainer = document.createElement("div");
        cierreContainer.className = "d-flex";
        cierreContainer.style.display = "flex";
        cierreContainer.style.justifyContent = "center";
        cierreContainer.style.gap = "5px";
        
        const cierreHoraSelect = document.createElement("select");
        cierreHoraSelect.id = "nuevo-cierre-hora";
        cierreHoraSelect.className = "form-control mr-1";
        cierreHoraSelect.innerHTML = generarOpcionesHorasNumeros("5:00");
        
        const cierrePeriodoSelect = document.createElement("select");
        cierrePeriodoSelect.id = "nuevo-cierre-periodo";
        cierrePeriodoSelect.className = "form-control";
        cierrePeriodoSelect.innerHTML = `
            <option value="AM">AM</option>
            <option value="PM" selected>PM</option>
        `;
        
        cierreContainer.appendChild(cierreHoraSelect);
        cierreContainer.appendChild(cierrePeriodoSelect);
        
        nuevoCierreInput.parentNode.replaceChild(cierreContainer, nuevoCierreInput);
        
        // Hacer que el campo cantidad sea editable en lugar de solo lectura
        document.getElementById("nuevo-cantidad").readOnly = false;
        
        // Ya no agregamos los event listeners para actualizar cantidad automáticamente
    }
}