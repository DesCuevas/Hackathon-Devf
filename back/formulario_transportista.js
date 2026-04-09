/**
 * formularios.js
 * Lógica de Formulario Dinámico con Bifurcación (Recepción/Entrega)
 */
function formulario_transportista() {
    
    const preguntas = [
        { 
            id: "Id_unidad", 
            label: "ID de la Unidad (Camión)", 
            type: "text", 
            placeholder: "Ingrese el ID oficial del camión..." 
        },
        { 
            id: "estado", 
            label: "¿Qué movimiento realizarás?", 
            type: "toggle", 
            options: ["Recepción", "Entrega"] 
        },

        // --- RUTA: RECEPCIÓN ---
        { 
            id: "Estado_inicio", 
            label: "¿En qué estado recibes la unidad?", 
            type: "select", 
            options: ["Óptimo", "Regular", "Malo"], 
            ruta: "Recepción" 
        },
        { 
            id: "Combustible_inicio", 
            label: "¿Nivel de combustible al inicio?", 
            type: "range", 
            min: 0, max: 100, unit: "%", 
            ruta: "Recepción" 
        },
        { 
            id: "Km_inicio", 
            label: "¿Kilometraje inicial?", 
            type: "number", 
            placeholder: "Ingrese el kilometraje actual (solo números)", 
            ruta: "Recepción" 
        },
        { 
            id: "Fugas_inicio", 
            label: "¿Tiene alguna fuga?", 
            type: "toggle_mini", 
            options: ["Sí", "No"], 
            ruta: "Recepción" 
        },
        { 
            id: "Ruido_motor_inicio", 
            label: "¿El motor presenta ruidos inusuales al encender?", 
            type: "toggle_mini", 
            options: ["Sí", "No"], 
            ruta: "Recepción" 
        },
        { 
            id: "Frenos_correctos_inicio", 
            label: "¿El sistema de frenos responde correctamente?", 
            type: "toggle_mini", 
            options: ["Sí", "No"], 
            ruta: "Recepción" 
        },

        // --- RUTA: ENTREGA ---
        { 
            id: "estado_final", 
            label: "¿Cómo entregas la unidad?", 
            type: "select", 
            options: ["Óptimo", "Regular", "Malo"], 
            ruta: "Entrega" 
        },
        { 
            id: "combustible_final", 
            label: "¿Nivel de combustible al final?", 
            type: "range", 
            min: 0, max: 100, unit: "%", 
            ruta: "Entrega" 
        },
        { 
            id: "km_final", 
            label: "¿Kilometraje final?", 
            type: "number", 
            placeholder: "Km al finalizar ruta", 
            ruta: "Entrega" 
        },
        { 
            id: "rendimiento", 
            label: "¿El rendimiento fue?", 
            type: "select", 
            options: ["Óptimo", "Medio", "Bajo"], 
            ruta: "Entrega" 
        },
        { 
            id: "ruido_motor_final", 
            label: "¿Cuál fue el nivel de ruido del motor?", 
            type: "select", 
            options: ["Bajo", "Medio", "Alto"], 
            ruta: "Entrega" 
        },
        { 
            id: "vibracion_final", 
            label: "¿Cuál fue el nivel de vibración?", 
            type: "select", 
            options: ["Bajo", "Medio", "Alto"], 
            ruta: "Entrega" 
        },
        { 
            id: "menor_desempeno", 
            label: "¿La unidad tuvo menor desempeño que al inicio?", 
            type: "toggle_mini", 
            options: ["Sí", "No"], 
            ruta: "Entrega" 
        },
        { 
            id: "perdida_potencia", 
            label: "¿Hubo pérdida de potencia?", 
            type: "toggle_mini", 
            options: ["Sí", "No"], 
            ruta: "Entrega" 
        },
        { 
            id: "consumo_normal", 
            label: "¿El consumo de combustible fue normal?", 
            type: "toggle_mini", 
            options: ["Sí", "No"], 
            ruta: "Entrega" 
        },
        { 
            id: "sobrecalentamiento", 
            label: "¿El motor presentó sobrecalentamiento?", 
            type: "toggle_mini", 
            options: ["Sí", "No"], 
            ruta: "Entrega" 
        },

        // --- PREGUNTA FINAL PARA AMBOS ---
        { 
            id: "comentario_general", 
            label: "¿Deseas agregar comentario sobre alguna falla para analizarlo con IA?", 
            type: "textarea", 
            placeholder: "Escriba aquí sus comentarios adicionales..." 
        }
    ];

    let pasoActual = 0;
    let rutaElegida = ""; 
    const respuestas = {};

    /**
     * Renderiza la pregunta actual en el contenedor
     */
    
    function renderPaso() {

        const container = document.getElementById("dynamic-questions-container");
        if (!container) return; // Validación de seguridad

        const preg = preguntas[pasoActual];
        
        // Filtrar preguntas válidas
        const preguntasFiltradas = preguntas.filter(p => !p.ruta || p.ruta === rutaElegida);
        const totalPasosFiltrados = preguntasFiltradas.length;
        const indiceVisual = preguntasFiltradas.findIndex(p => p.id === preg.id) + 1;

        // Actualizar Textos
        document.getElementById("current-step-text").innerText = indiceVisual > 0 ? indiceVisual : 1;
        document.getElementById("total-steps-text").innerText = totalPasosFiltrados;
        
        // Barra de progreso
        const porcentaje = (indiceVisual / totalPasosFiltrados) * 100;
        document.getElementById("form-progress-bar").style.width = `${porcentaje}%`;

        // Generar HTML
        let inputHTML = '';
        if (preg.type === "text") {
            inputHTML = `<input type="text" id="val-${preg.id}" class="form-control input-barra-traxion" placeholder="${preg.placeholder}" value="${respuestas[preg.id] || ''}" autocomplete="off">`;
        } else if (preg.type === "number") {
            inputHTML = `<input type="number" id="val-${preg.id}" class="form-control input-barra-traxion" placeholder="${preg.placeholder}" value="${respuestas[preg.id] || ''}">`;
        } else if (preg.type === "range") {
            const val = respuestas[preg.id] || 50;
            inputHTML = `
                <div class="text-center">
                    <h1 class="display-4 fw-bold text-primary-traxion">${val}${preg.unit}</h1>
                    <input type="range" id="val-${preg.id}" class="form-range custom-range" min="${preg.min}" max="${preg.max}" value="${val}" oninput="updateRangeVal(this, '${preg.unit}')">
                </div>`;
        } else if (preg.type === "select") {
            inputHTML = `
                <select id="val-${preg.id}" class="form-select select-traxion p-3">
                    <option value="" disabled ${!respuestas[preg.id] ? 'selected' : ''}>Seleccione una opción...</option>
                    ${preg.options.map(opt => `<option value="${opt}" ${respuestas[preg.id] === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>`;
        } else if (preg.type === "toggle" || preg.type === "toggle_mini") {
            inputHTML = `
                <div class="d-flex gap-3">
                    ${preg.options.map(opt => `
                        <button type="button" class="btn ${preg.type === 'toggle_mini' ? 'btn-lg flex-fill' : 'btn-toggle-traxion'} ${respuestas[preg.id] === opt ? 'btn-dark' : 'btn-outline-dark'}" onclick="saveToggle('${preg.id}', '${opt}')">
                            ${opt}
                        </button>
                    `).join('')}
                </div>`;
        } else if (preg.type === "textarea") {
            inputHTML = `<textarea id="val-${preg.id}" class="form-control textarea-traxion" rows="4" placeholder="${preg.placeholder}">${respuestas[preg.id] || ''}</textarea>`;
        }

        container.innerHTML = `
            <div class="question-step mt-4">
                <label class="form-label h4 fw-bold mb-4">${preg.label}</label>
                ${inputHTML}
            </div>
        `;

        document.getElementById("btn-prev").classList.toggle("d-none", pasoActual === 0);

        const esUltimo = (indiceVisual === totalPasosFiltrados);
        document.getElementById("btn-next").classList.toggle("d-none", esUltimo);
        document.getElementById("btn-submit").classList.toggle("d-none", !esUltimo);
    }

    // Solución al Bug de Espacio: Hacemos que saveToggle sea global anexándola a 'window'
    window.saveToggle = function(id, valor) {
        respuestas[id] = valor;
        if (id === "estado") {
            rutaElegida = valor;
        }
        renderPaso();
    };

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

    // Limpiamos listeners previos para evitar duplicados si entran y salen de la pestaña
    const btnNext = document.getElementById("btn-next");
    const btnPrev = document.getElementById("btn-prev");
    const btnSubmit = document.getElementById("btn-submit");

    // Clonamos los botones para borrar eventos viejos (truco de SPA)
    const newBtnNext = btnNext.cloneNode(true);
    const newBtnPrev = btnPrev.cloneNode(true);
    const newBtnSubmit = btnSubmit.cloneNode(true);
    btnNext.replaceWith(newBtnNext);
    btnPrev.replaceWith(newBtnPrev);
    btnSubmit.replaceWith(newBtnSubmit);

    newBtnNext.addEventListener("click", () => {
        const currentId = preguntas[pasoActual].id;
        const input = document.getElementById(`val-${currentId}`);
        if (input) respuestas[currentId] = input.value;

        if (currentId === "estado" && !rutaElegida) {
            alert("Por favor, seleccione Recepción o Entrega.");
            return;
        }

        pasoActual = obtenerSiguientePaso(pasoActual);
        renderPaso();
    });

    newBtnPrev.addEventListener("click", () => {
        pasoActual = obtenerPasoAnterior(pasoActual);
        renderPaso();
    });

    newBtnSubmit.addEventListener("click", async () => {
        // 1. Guardar el último input visible
        const currentId = preguntas[pasoActual].id;
        const input = document.getElementById(`val-${currentId}`);
        if (input) respuestas[currentId] = input.value;

        // 2. Validación de seguridad mínima
        if (!respuestas["Id_unidad"]) {
            alert("⚠️ Error: El ID de la unidad es obligatorio para guardar el reporte.");
            return;
        }

        console.log("Enviando reporte final al servidor:", respuestas);

        try {
            // 3. Enviamos los datos a Node.js
            const response = await fetch('http://localhost:3000/api/guardar-reporte', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(respuestas)
            });

            if (!response.ok) {
                throw new Error("Fallo al comunicarse con el servidor");
            }

            // 4. Éxito y reseteo
            alert("✅ Formulario enviado correctamente.\nEl reporte ha sido guardado en la base de datos.");

            pasoActual = 0;
            rutaElegida = "";
            Object.keys(respuestas).forEach(key => delete respuestas[key]);
            renderPaso();

        } catch (error) {
            console.error("Error al guardar:", error);
            alert("❌ Hubo un problema al guardar el reporte. Verifica tu conexión.");
        }
    });

    // Solución al Bug de Tiempo: Arrancamos el primer paso directamente en vez de esperar
    renderPaso();

    window.updateRangeVal = function(el, unit) {
    const display = el.previousElementSibling;
    display.innerText = el.value + unit;
    const id = el.id.replace('val-', '');
    respuestas[id] = el.value; // Guardado en tiempo real
    };
}