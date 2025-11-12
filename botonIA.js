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

// Función para obtener el saludo según la hora
function obtenerSaludo() {
    const hora = new Date().getHours();
    if (hora >= 6 && hora < 12) {
        return 'Buenos días';
    } else if (hora >= 12 && hora < 19) {
        return 'Buenas tardes';
    } else {
        return 'Buenas noches';
    }
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

    // Mostrar indicador de carga
    document.getElementById('loadingIA').style.display = 'block';
    document.getElementById('textoMejorado').value = '';

    const saludo = obtenerSaludo();

    // Contexto base para todos los prompts
    const contextoBase = `Eres un agente de soporte técnico de mesa de ayuda. Trabajas con asesoras de tiendas de ropa que usan sistemas como CEGID (POS), LeanCore, Kaiowa, Credinet y Sumaspay.

REGLAS ESTRICTAS:
- SIEMPRE iniciar con "${saludo}"
- SIEMPRE terminar en una nueva línea con "Saludos."
- Usar tono empático, claro y profesional (no demasiado informal)
- NUNCA culpar a nadie (ni otros departamentos, ni sistemas, ni personas)
- NUNCA prometer nada, solo CONFIRMAR lo que vas a hacer
- Mantener la información técnica clara pero no complicada
- Escribir en español (algunos términos técnicos pueden quedar en inglés)`;

    // Definir los prompts según el tipo
    const prompts = {
        'mejorar': `${contextoBase}

Mejora el siguiente texto de soporte técnico manteniendo su significado pero haciéndolo más efectivo, empático y profesional:

${textoOriginal}`,

        'formal': `${contextoBase}

Reescribe este texto de soporte técnico de manera más formal y profesional, pero manteniendo la empatía:

${textoOriginal}`,

        'claro': `${contextoBase}

Reescribe este texto de soporte técnico de manera más clara y fácil de entender para las asesoras de tienda:

${textoOriginal}`,

        'conciso': `${contextoBase}

Reescribe este texto de soporte técnico de manera más concisa y directa sin perder información importante:

${textoOriginal}`,

        'profesional': `${contextoBase}

Reescribe este texto de soporte técnico con un tono más profesional pero manteniendo la calidez y empatía:

${textoOriginal}`,

        'pedir_info': `${contextoBase}

Convierte este texto en una solicitud clara y amable de información adicional necesaria para resolver el caso:

${textoOriginal}`,

        'seguimiento': `${contextoBase}

Convierte este texto en un mensaje de seguimiento que actualice el estado del caso de manera clara y tranquilizadora:

${textoOriginal}`,

        'cerrar': `${contextoBase}

Convierte este texto en un cierre de ticket que confirme que el problema está resuelto. Solo informa la resolución, NO preguntes si necesitan algo más:

${textoOriginal}`,

        'escalamiento': `${contextoBase}

Convierte este texto en un mensaje que informe que el caso será derivado a otra área, explicando qué pasará a continuación de forma clara:

${textoOriginal}`,

        'corregir': `${contextoBase}

Corrige únicamente los errores ortográficos y gramaticales de este texto de soporte técnico, manteniendo el tono y estructura:

${textoOriginal}`
    };

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
function copiarTexto() {
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