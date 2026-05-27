document.getElementById('btnAbrirModalIA').addEventListener('click', function () {
    document.getElementById('ModalIA').style.display = 'block';
});

function cerrarModalIA() {
    document.getElementById('ModalIA').style.display = 'none';
}

window.addEventListener('click', function (event) {
    const modal = document.getElementById('ModalIA');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
});

document.getElementById('textoOriginal').addEventListener('paste', function () {
    setTimeout(() => analizarCorreo(), 100);
});

async function analizarCorreo() {
    const texto = document.getElementById('textoOriginal').value.trim();
    if (!texto) return;

    const prompt = `Analiza la siguiente conversación de correo electrónico y responde en texto plano, sin markdown, sin asteriscos, sin negritas, con estas cuatro secciones separadas por salto de línea:

PERSONAS EN LA CONVERSACIÓN:
Lista cada persona que aparezca mencionada como remitente, destinatario o participante. Incluye nombre y correo si están disponibles.

DE QUÉ TRATA:
Resume en 2 o 3 oraciones el tema principal del correo.

TIPO DE CORREO:
Sigue estos pasos en orden:
Paso 1: Ordena los mensajes del hilo de más antiguo a más reciente según las fechas de envío.
Paso 2: Recorre cada mensaje en ese orden y marca con SI o NO si ese mensaje menciona al Centro de Servicios directamente, ya sea porque nos etiquetan como @centrodeservicios, nos escriben como destinatario, o usan las palabras mesa de ayuda, soporte ti, centro de servicios o mesa.
Paso 3: Identifica cuál es el PRIMER mensaje marcado con SI.
Paso 4: Verifica si ese primer mensaje marcado con SI es también el más reciente del hilo.
Si es el más reciente: responde CASO NUEVO - este es el primer mensaje dirigido al centro de servicios, se debe crear un caso. El prefijo RE: o FW: en el asunto no cambia esta conclusión.
Si después de ese primer mensaje marcado con SI hay mensajes más recientes: responde RESPUESTA EN CONVERSACIÓN - ya existe un caso relacionado, no se debe crear uno nuevo.
Si ningún mensaje fue marcado con SI: responde SIN SOLICITUD DIRECTA - no se identifica ningún mensaje dirigido al centro de servicios.

SOLICITUDES PARA NOSOTROS:
Basándote en el mensaje que primero nos menciona, describe claramente qué se nos está pidiendo hacer. Si no hay ninguna mención, escribe: No se identificaron solicitudes dirigidas al centro de servicios.

Conversación:
${texto}`

    document.getElementById('loadingIA').style.display = 'block';
    document.getElementById('resultadoIA').innerHTML = '';
    document.getElementById('resultadoIA').style.display = 'none';
    document.getElementById('outputActions').style.display = 'none';

    const API_KEY = 'AIzaSyC5kXEb3DJdG_thAw-b75nSnp_QwY54hSQ';

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': API_KEY
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${data.error?.message || 'Error desconocido'}`);
        }

        if (data.candidates && data.candidates[0].content) {
            renderizarResultado(data.candidates[0].content.parts[0].text);
        } else {
            throw new Error('No se recibió respuesta válida');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al analizar el correo. Intenta de nuevo.');
    } finally {
        document.getElementById('loadingIA').style.display = 'none';
    }
}

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
function renderizarResultado(texto) {
    const contenedor = document.getElementById('resultadoIA');
    contenedor.innerHTML = '';

    const secciones = texto.split('\n\n').filter(s => s.trim() !== '');
    const config = {
        'PERSONAS EN LA CONVERSACIÓN': { icono: 'fa-users', color: '#2196F3' },
        'DE QUÉ TRATA':               { icono: 'fa-file-lines', color: '#4CAF50' },
        'TIPO DE CORREO':              { icono: 'fa-tag', color: '#FF9800' },
        'SOLICITUDES PARA NOSOTROS':   { icono: 'fa-bell', color: '#E53935' }
    };

    secciones.forEach(seccion => {
        const primeraLinea = seccion.split('\n')[0].replace(':', '').trim();
        const contenido = seccion.split('\n').slice(1).join('\n').trim();
        const cfg = config[primeraLinea] || { icono: 'fa-circle-info', color: '#607D8B' };

        const bloque = document.createElement('div');
        bloque.style.cssText = `border: 1px solid ${cfg.color}; border-radius: 8px; overflow: hidden;`;

        const encabezado = document.createElement('div');
        encabezado.style.cssText = `background: ${cfg.color}; color: white; padding: 8px 12px; display: flex; align-items: center; gap: 8px; font-weight: bold; font-size: 13px;`;
        encabezado.innerHTML = `<i class="fa-solid ${cfg.icono}"></i> ${primeraLinea}`;

        const cuerpo = document.createElement('div');
        cuerpo.style.cssText = `height: stretch; padding: 10px 12px; font-size: 13px; white-space: pre-line; line-height: 1.5; background: ${cfg.color}18;`;
        cuerpo.textContent = contenido;

        bloque.appendChild(encabezado);
        bloque.appendChild(cuerpo);
        contenedor.appendChild(bloque);
    });

    contenedor.style.display = 'grid';
    document.getElementById('outputActions').style.display = 'flex';
}

function copiarTextoIA() {
    const bloques = document.querySelectorAll('#resultadoIA > div');
    if (!bloques.length) {
        alert('No hay análisis para copiar');
        return;
    }
    let texto = '';
    bloques.forEach(bloque => {
        const titulo = bloque.querySelector('div:first-child').textContent.trim();
        const contenido = bloque.querySelector('div:last-child').textContent.trim();
        texto += `${titulo}:\n${contenido}\n\n`;
    });
    navigator.clipboard.writeText(texto.trim()).then(() => {
        alert('Análisis copiado al portapapeles');
    }).catch(err => console.error('Error al copiar:', err));
}