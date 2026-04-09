/**
 * formulario_unidades_v2.js
 * Registro de unidades con historial de mantenimientos múltiples
 */
function formulario_admin() {
    const preguntas = [
        { id: "Id_unidad", label: "¿Cuál es el número de unidad?", type: "text", placeholder: "Ej. TX-100" },
        { id: "Tipo_unidad", label: "¿Qué tipo de unidad y marca es?", type: "text", placeholder: "Ej. Tractocamión Mercedes..." },
        { id: "Antiguedad_anos", label: "¿Cuál es la antigüedad? (Años)", type: "number", placeholder: "Años de antigüedad" },
        { id: "Tipo_operacion", label: "¿Tipo de operación habitual?", type: "select", options: ["Urbano", "Carretera", "Mixto"] },
        { id: "Inversion_acumulada", label: "¿Inversión acumulada en mantenimiento?", type: "number", placeholder: "Monto en pesos ($)" },
        { id: "ultimo_mantenimiento_dias", label: "¿Días desde el último mantenimiento?", type: "number", placeholder: "Días transcurridos" },
        
        // --- NUEVA PREGUNTA COMPLEJA: MANTENIMIENTOS ---
        { 
            id: "mantenimientos", 
            label: "Mantenimientos a la unidad", 
            type: "checklist_fechas", 
            options: [
                "Reemplazo de banda de distribución",
                "Inspección y sellado de fugas en mangueras de presión",
                "Cambio de aceite y filtros de motor",
                "Alineación, balanceo y rotación de neumáticos",
                "Revisión de sistema de frenos y balatas",
                "Mantenimiento preventivo al sistema eléctrico"
            ]
        },
        
        { id: "comentario_general", label: "¿Deseas agregar comentarios adicionales para análisis con IA?", type: "textarea", placeholder: "Escriba aquí..." }
    ];

    let pasoActual = 0;
    const respuestas = {};

    function renderPaso() {
        const container = document.getElementById("dynamic-questions-container");
        if (!container) return;

        const preg = preguntas[pasoActual];
        const totalPasos = preguntas.length;

        document.getElementById("current-step-text").innerText = pasoActual + 1;
        document.getElementById("total-steps-text").innerText = totalPasos;
        document.getElementById("form-progress-bar").style.width = `${((pasoActual + 1) / totalPasos) * 100}%`;

        let inputHTML = '';
        
        if (preg.type === "checklist_fechas") {
            inputHTML = `
                <div class="maintenance-list" style="max-height: 400px; overflow-y: auto; padding-right: 10px;">
                    <p class="text-muted small mb-3">Selecciona los servicios realizados y registra sus fechas:</p>
                    ${preg.options.map((opt, index) => `
                        <div class="maintenance-item border rounded p-3 mb-2 bg-white shadow-sm">
                            <div class="form-check mb-2">
                                <input class="form-check-input maint-check" type="checkbox" id="check-${index}" data-name="${opt}">
                                <label class="form-check-label fw-bold" for="check-${index}">${opt}</label>
                            </div>
                            <div class="row g-2">
                                <div class="col-6">
                                    <label class="small text-muted">Fecha Solicitud</label>
                                    <input type="date" class="form-control form-control-sm date-sol" id="sol-${index}">
                                </div>
                                <div class="col-6">
                                    <label class="small text-muted">Fecha Realización</label>
                                    <input type="date" class="form-control form-control-sm date-real" id="real-${index}">
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>`;
        } else if (preg.type === "text" || preg.type === "number") {
            inputHTML = `<input type="${preg.type}" id="val-${preg.id}" class="form-control input-barra-traxion" placeholder="${preg.placeholder}" value="${respuestas[preg.id] || ''}">`;
        } else if (preg.type === "select") {
            inputHTML = `<select id="val-${preg.id}" class="form-select select-traxion p-3">${preg.options.map(o => `<option value="${o}">${o}</option>`).join('')}</select>`;
        } else if (preg.type === "textarea") {
            inputHTML = `<textarea id="val-${preg.id}" class="form-control textarea-traxion" rows="4">${respuestas[preg.id] || ''}</textarea>`;
        }

        container.innerHTML = `<div class="question-step mt-4"><label class="h4 fw-bold mb-4">${preg.label}</label>${inputHTML}</div>`;
        
        document.getElementById("btn-prev").classList.toggle("d-none", pasoActual === 0);
        const esUltimo = (pasoActual === totalPasos - 1);
        document.getElementById("btn-next").classList.toggle("d-none", esUltimo);
        document.getElementById("btn-submit").classList.toggle("d-none", !esUltimo);
    }

    /**
     * Captura la data del checklist complejo
     */
    function procesarMantenimientos() {
        const items = document.querySelectorAll('.maintenance-item');
        const listaMantenimientos = [];

        items.forEach((item, index) => {
            const checkbox = item.querySelector('.maint-check');
            if (checkbox.checked) {
                const fRealizacion = item.querySelector('.date-real').value;
                listaMantenimientos.push({
                    "nombre_mantenimiento": checkbox.getAttribute('data-name'),
                    "fecha_solicitud": item.querySelector('.date-sol').value,
                    "concluido": fRealizacion !== "",
                    "fecha_realizacion": fRealizacion
                });
            }
        });
        return listaMantenimientos;
    }

    // --- MANEJO DE BOTONES ---
    const btnNext = document.getElementById("btn-next");
    const btnSubmit = document.getElementById("btn-submit");

    // Reinicio de listeners
    const newBtnNext = btnNext.cloneNode(true);
    const newBtnSubmit = btnSubmit.cloneNode(true);
    btnNext.replaceWith(newBtnNext);
    btnSubmit.replaceWith(newBtnSubmit);

  newBtnNext.addEventListener("click", () => {
        const preg = preguntas[pasoActual];
        
        if (preg.type === "checklist_fechas") {
            // MAGIA 1: Convertimos el arreglo a un String antes de guardarlo
            const lista = procesarMantenimientos();
            respuestas[preg.id] = JSON.stringify(lista);
        } else {
            const input = document.getElementById(`val-${preg.id}`);
            if (input) respuestas[preg.id] = input.value;
        }
        
        pasoActual++;
        renderPaso();
    });

    document.getElementById("btn-prev").addEventListener("click", () => {
        pasoActual--;
        renderPaso();
    });
newBtnSubmit.addEventListener("click", async () => {
        // 1. Guardamos el valor de la última pregunta (sea textarea o checklist)
        const preg = preguntas[pasoActual];
        
        if (preg.type === "checklist_fechas") {
            // MAGIA 2: Si el checklist es la última pantalla, lo capturamos aquí también
            const lista = procesarMantenimientos();
            respuestas[preg.id] = JSON.stringify(lista);
        } else {
            // Funciona para textarea, text, number, etc.
            const input = document.getElementById(`val-${preg.id}`);
            if (input) respuestas[preg.id] = input.value;
        }

        // 2. Validación de seguridad
        if (!respuestas["Id_unidad"]) {
            alert("⚠️ Error: Falta el ID de la unidad. Es obligatorio para guardar en la base de datos.");
            return;
        }

        console.log("JSON FINAL PARA BASE DE DATOS:", JSON.stringify(respuestas, null, 2));

        try {
            // 3. Enviamos los datos a Node.js usando fetch
            const response = await fetch('http://localhost:3000/api/guardar-reporte', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(respuestas)
            });

            if (!response.ok) {
                throw new Error("Fallo al comunicarse con el servidor Node.js");
            }

            alert("✅ Información de unidad y mantenimientos guardada correctamente en la Base de Datos.");
            
            // 4. REINICIO TOTAL
            pasoActual = 0;
            for (let key in respuestas) {
                delete respuestas[key];
            }
            renderPaso();

        } catch (error) {
            console.error("Error al guardar en BD:", error);
            alert("❌ Hubo un problema al guardar la información. Verifica que tu servidor esté encendido.");
        }
    });

    renderPaso();
}