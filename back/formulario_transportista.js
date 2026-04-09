/**
 * formularios.js
 * Lógica de Formulario Dinámico con Bifurcación (Recepción/Entrega)
 */

const preguntas = [
    { id: "nombre", label: "Nombre del Transportista", type: "text", placeholder: "Escribe tu nombre completo..." },
    { id: "camion", label: "Número de Camión", type: "text", placeholder: "Ej. TRAX-99" },
    { 
        id: "estado", 
        label: "¿Qué movimiento realizarás?", 
        type: "toggle", 
        options: ["Recepción", "Entrega"] 
    },
    // --- RUTA: RECEPCIÓN ---
    { id: "sello", label: "¿El sello de seguridad está intacto?", type: "text", placeholder: "Ingrese número de sello...", ruta: "Recepción" },
    { id: "danos", label: "Reporte de daños externos", type: "text", placeholder: "Describa abolladuras o raspones...", ruta: "Recepción" },
    
    // --- RUTA: ENTREGA ---
    { id: "combustible", label: "Nivel de combustible al salir", type: "text", placeholder: "Ej. 3/4, Tanque lleno...", ruta: "Entrega" },
    { id: "documentos", label: "Folio de salida / Guía", type: "text", placeholder: "Ingrese el número de folio...", ruta: "Entrega" },
    
    // --- PREGUNTA FINAL (PARA AMBOS) ---
    { id: "observaciones", label: "Observaciones Generales", type: "textarea", placeholder: "Escriba aquí sus comentarios finales..." }
];

let pasoActual = 0;
let rutaElegida = ""; 
const respuestas = {};

/**
 * Renderiza la pregunta actual en el contenedor
 */
function renderPaso() {
    const container = document.getElementById("dynamic-questions-container");
    const preg = preguntas[pasoActual];
    
    // Filtrar preguntas válidas para la ruta actual para calcular progreso real
    const preguntasFiltradas = preguntas.filter(p => !p.ruta || p.ruta === rutaElegida);
    const totalPasosFiltrados = preguntasFiltradas.length;
    const indiceVisual = preguntasFiltradas.findIndex(p => p.id === preg.id) + 1;

    // Actualizar Textos de progreso
    document.getElementById("current-step-text").innerText = indiceVisual > 0 ? indiceVisual : 1;
    document.getElementById("total-steps-text").innerText = totalPasosFiltrados;
    
    // Barra de progreso
    const porcentaje = (indiceVisual / totalPasosFiltrados) * 100;
    document.getElementById("form-progress-bar").style.width = `${porcentaje}%`;

    // Generar HTML según el tipo de input
    let inputHTML = '';
    if (preg.type === "text") {
        inputHTML = `<input type="text" id="val-${preg.id}" class="form-control input-barra-traxion w-100" placeholder="${preg.placeholder}" value="${respuestas[preg.id] || ''}" autocomplete="off">`;
    } else if (preg.type === "toggle") {
        inputHTML = `
            <div class="d-flex gap-3">
                ${preg.options.map(opt => `
                    <button type="button" class="btn btn-toggle-traxion ${rutaElegida === opt ? 'active' : ''}" onclick="saveToggle('${preg.id}', '${opt}')">
                        ${opt === 'Recepción' ? '<i class="bi bi-download me-2"></i>' : '<i class="bi bi-upload me-2"></i>'} ${opt}
                    </button>
                `).join('')}
            </div>`;
    } else if (preg.type === "textarea") {
        inputHTML = `<textarea id="val-${preg.id}" class="form-control textarea-traxion w-100" rows="4" placeholder="${preg.placeholder}">${respuestas[preg.id] || ''}</textarea>`;
    }

    // Inyectar con animación
    container.innerHTML = `
        <div class="question-step mt-4">
            <label class="form-label h4 fw-bold mb-4">${preg.label}</label>
            ${inputHTML}
        </div>
    `;

    // Gestionar visibilidad de botones
    document.getElementById("btn-prev").classList.toggle("d-none", pasoActual === 0);
    
    // Si es el último paso de la ruta actual, mostrar 'Enviar', si no, 'Siguiente'
    const esUltimo = (indiceVisual === totalPasosFiltrados);
    document.getElementById("btn-next").classList.toggle("d-none", esUltimo);
    document.getElementById("btn-submit").classList.toggle("d-none", !esUltimo);
}

/**
 * Guarda la elección de Recepción/Entrega y actualiza la ruta
 */
function saveToggle(id, valor) {
    respuestas[id] = valor;
    if (id === "estado") {
        rutaElegida = valor;
    }
    renderPaso();
}

/**
 * Lógica para saltar preguntas que no pertenecen a la ruta
 */
function obtenerSiguientePaso(indice) {
    let sig = indice + 1;
    while (sig < preguntas.length) {
        if (!preguntas[sig].ruta || preguntas[sig].ruta === rutaElegida) return sig;
        sig++;
    }
    return indice;
}

function obtenerPasoAnterior(indice) {
    let ant = indice - 1;
    while (ant >= 0) {
        if (!preguntas[ant].ruta || preguntas[ant].ruta === rutaElegida) return ant;
        ant--;
    }
    return 0;
}

// --- EVENT LISTENERS ---

document.getElementById("btn-next").addEventListener("click", () => {
    const currentId = preguntas[pasoActual].id;
    const input = document.getElementById(`val-${currentId}`);
    
    // Guardar valor actual (si no es toggle que se guarda solo)
    if (input) respuestas[currentId] = input.value;

    // Validación: No dejar pasar si no hay ruta en la pregunta de estado
    if (currentId === "estado" && !rutaElegida) {
        alert("Por favor, seleccione Recepción o Entrega.");
        return;
    }

    pasoActual = obtenerSiguientePaso(pasoActual);
    renderPaso();
});

document.getElementById("btn-prev").addEventListener("click", () => {
    pasoActual = obtenerPasoAnterior(pasoActual);
    renderPaso();
});

document.getElementById("btn-submit").addEventListener("click", () => {
    const currentId = preguntas[pasoActual].id;
    const input = document.getElementById(`val-${currentId}`);
    if (input) respuestas[currentId] = input.value;

    // Simulación de envío
    console.log("Enviando reporte final:", respuestas);
    alert("✅ Formulario enviado correctamente.\nEl reporte ha sido guardado en el sistema Traxion.");

    // Resetear formulario
    pasoActual = 0;
    rutaElegida = "";
    Object.keys(respuestas).forEach(key => delete respuestas[key]);
    renderPaso();
});

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    renderPaso();
});