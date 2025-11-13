document.getElementById('btnAbrirModalIA').addEventListener('click', function () {
    document.getElementById('ModalIA').style.display = 'block';
});

function cerrarModalIA() {
    document.getElementById('ModalIA').style.display = 'none';
}

// Cerrar al hacer clic fuera del modal
window.addEventListener('click', function (event) {
    const modal = document.getElementById('ModalIA');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
});

// Función para abrir el modal
function abrirModalIA() {
    document.getElementById('ModalIA').style.display = 'block';
}

// Función para cerrar el modal
function cerrarModalIA() {
    document.getElementById('ModalIA').style.display = 'none';
}

// Función para aplicar la mejora seleccionada
function aplicarMejora() {
    const tipoSeleccionado = document.getElementById('tipoMejora').value;
    mejorarTexto(tipoSeleccionado);
}

// Función principal para mejorar texto con Gemini
async function mejorarTexto(tipo) {
    console.log('🔵 mejorarTexto llamada -', new Date().toLocaleTimeString(), 'tipo:', tipo);

    const textoOriginal = document.getElementById('textoOriginal').value.trim();

    if (!textoOriginal) {
        alert('Por favor, ingresa un texto primero');
        return;
    }

    // Definir los prompts según el tipo
    const prompts = {
        'mejorar': `Reescribe el siguiente texto para hacerlo más claro, formal y coherente, manteniendo su sentido técnico y operativo.

INSTRUCCIONES:
1. No alterar el significado original. Conservar exactamente el mismo sentido y secuencia lógica.
2. Corregir errores de redacción, ortografía y gramática. Ajustar mayúsculas, tildes, puntuación y uso de conectores.
3. Usar un tono formal, técnico y profesional.
4. Evitar repeticiones o redundancias innecesarias.
5. Estructurar el texto con lógica: motivo del contacto, acción realizada, resultado o estado final.
6. No agregar información que no esté en el texto original. Solo aclarar ideas con conectores.
7. Responder solo con texto plano, sin formato markdown, sin asteriscos ni negritas.

Texto a mejorar:
${textoOriginal}`,

        'corregir': `Corrige únicamente los errores de ortografía, gramática y puntuación del siguiente texto. No cambies palabras, no cambies el tono, no reorganices frases. Solo corrige errores. Responde solo con texto plano, sin formato markdown, sin asteriscos ni negritas:

${textoOriginal}`,

        'conciso': `Reescribe el siguiente texto de forma más breve y directa, eliminando palabras innecesarias pero conservando toda la información técnica importante. Mantén el tono profesional. Responde solo con texto plano, sin formato markdown, sin asteriscos ni negritas:

${textoOriginal}`,

        'ampliar': `Reescribe el siguiente texto agregando más detalles y contexto para que sea más completo y descriptivo. Mantén el tono profesional y técnico. Responde solo con texto plano, sin formato markdown, sin asteriscos ni negritas:

${textoOriginal}`,

        'pedir_info': `Reescribe el siguiente texto como una solicitud profesional de información adicional necesaria para resolver el caso. Indica claramente qué datos específicos se necesitan. Mantén el contexto del problema. Responde solo con texto plano, sin formato markdown, sin asteriscos ni negritas:

${textoOriginal}`,

        'seguimiento': `Reescribe el siguiente texto como un mensaje de seguimiento profesional que actualice el estado actual del caso. Indica qué se está haciendo o qué se hizo, y cuál es el siguiente paso si aplica. Responde solo con texto plano, sin formato markdown, sin asteriscos ni negritas:

${textoOriginal}`,

        'solucion': `Reescribe el siguiente texto como una explicación clara de la solución implementada. Describe qué se hizo para resolver el problema de forma técnica pero comprensible. Responde solo con texto plano, sin formato markdown, sin asteriscos ni negritas:

${textoOriginal}`,

        'escalamiento': `Reescribe el siguiente texto para informar que el caso será escalado o derivado a otra área. Explica por qué se hace el escalamiento y qué pueden esperar a continuación. Mantén un tono profesional y tranquilizador. Responde solo con texto plano, sin formato markdown, sin asteriscos ni negritas:

${textoOriginal}`
    };

    // Validar que el tipo existe
    if (!prompts[tipo]) {
        alert(`Tipo de mejora no válido: ${tipo}`);
        return;
    }

    // Mostrar indicador de carga
    document.getElementById('loadingIA').style.display = 'block';
    document.getElementById('textoMejorado').value = '';

    // Aquí debes poner tu API key
    const API_KEY = 'AIzaSyBPmsVZMLZV6D7io-1OgseeNqDia3cFmqM';

    try {
        console.log('📝 Prompt length:', prompts[tipo].length);
        console.log('📝 Prompt:', prompts[tipo].substring(0, 200) + '...');
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': API_KEY
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompts[tipo]
                    }]
                }]
            })
        });

        const data = await response.json();

        // Verificar si hay error de límite de solicitudes
        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Has excedido el límite de solicitudes. Espera unos minutos e intenta de nuevo.');
            }
            throw new Error(`Error ${response.status}: ${data.error?.message || 'Error desconocido'}`);
        }

        if (data.candidates && data.candidates[0].content) {
            const textoMejorado = data.candidates[0].content.parts[0].text;
            document.getElementById('textoMejorado').value = textoMejorado;
        } else {
            throw new Error('No se recibió respuesta válida de la IA');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error al procesar el texto. Por favor, intenta de nuevo.');
    } finally {
        document.getElementById('loadingIA').style.display = 'none';
    }
}

// Función para copiar el texto mejorado
function copiarTextoIA() {
    const textoMejorado = document.getElementById('textoMejorado').value;

    if (!textoMejorado) {
        alert('No hay texto para copiar');
        return;
    }

    navigator.clipboard.writeText(textoMejorado).then(() => {
        alert('Texto copiado al portapapeles');
    }).catch(err => {
        console.error('Error al copiar:', err);
    });
}

// Función para reemplazar el texto original con el mejorado
function reemplazarTexto() {
    const textoMejorado = document.getElementById('textoMejorado').value;

    if (!textoMejorado) {
        alert('No hay texto mejorado para usar');
        return;
    }

    document.getElementById('textoOriginal').value = textoMejorado;
    document.getElementById('textoMejorado').value = '';
}