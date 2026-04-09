/**
 * formulario_unidades.js
 * Lógica para el registro y caracterización de unidades de transporte
 */
function formulario_admin() {
    const preguntas = [
        { 
            id: "Id_unidad", 
            label: "¿Cuál es el número de unidad?", 
            type: "text", 
            placeholder: "Ej. TX-100" 
        },
        { 
            id: "Tipo_unidad", 
            label: "¿Qué tipo de unidad o marca es?", 
            type: "text", 
            placeholder: "Ej. Tractocamión, Remolque, Van..." 
        },
        { 
            id: "Antiguedad_anos", 
            label: "¿Cuál es la antigüedad de la unidad? (Años)", 
            type: "number", 
            placeholder: "Ingrese los años de antigüedad" 
        },
        { 
            id: "Tipo_operacion", 
            label: "¿Tipo de operación habitual?", 
            type: "select", 
            options: ["Urbano", "Carretera", "Mixto"] 
        },
        { 
            id: "Inversion_acumulada", 
            label: "¿Cuál es el costo aproximado de mantenimiento acumulado?", 
            type: "number", 
            placeholder: "Monto total en pesos ($)" 
        },
        { 
            id: "ultimo_mantenimiento_dias", 
            label: "¿Hace cuánto fue el último mantenimiento? (Días)", 
            type: "number", 
            placeholder: "Días transcurridos desde el último servicio" 
        }
    ];

    let pasoActual = 0;
    const respuestas = {};

    /**
     * Renderiza la pregunta actual en el contenedor
     */
    function renderPaso() {
        const container = document.getElementById("dynamic-questions-container");
        if (!container) return;

        const preg = preguntas[pasoActual];
        const totalPasos = preguntas.length;

        // Actualizar Textos y Barra de Progreso
        document.getElementById("current-step-text").innerText = pasoActual + 1;
        document.getElementById("total-steps-text").innerText = totalPasos;
        
        const porcentaje = ((pasoActual + 1) / totalPasos) * 100;
        document.getElementById("form-progress-bar").style.width = `${porcentaje}%`;

        // Generar HTML según el tipo
        let inputHTML = '';
        if (preg.type === "text") {
            inputHTML = `<input type="text" id="val-${preg.id}" class="form-control input-barra-traxion w-100" placeholder="${preg.placeholder}" value="${respuestas[preg.id] || ''}" autocomplete="off">`;
        } else if (preg.type === "number") {
            inputHTML = `<input type="number" id="val-${preg.id}" class="form-control input-barra-traxion w-100" placeholder="${preg.placeholder}" value="${respuestas[preg.id] || ''}">`;
        } else if (preg.type === "select") {
            inputHTML = `
                <select id="val-${preg.id}" class="form-select select-traxion p-3" style="border-radius: 15px; border: 2px solid #ddd;">
                    <option value="" disabled ${!respuestas[preg.id] ? 'selected' : ''}>Seleccione una opción...</option>
                    ${preg.options.map(opt => `<option value="${opt}" ${respuestas[preg.id] === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>`;
        }

        container.innerHTML = `
            <div class="question-step mt-4">
                <label class="form-label h4 fw-bold mb-4">${preg.label}</label>
                ${inputHTML}
            </div>
        `;

        // Control de botones
        document.getElementById("btn-prev").classList.toggle("d-none", pasoActual === 0);
        
        const esUltimo = (pasoActual === totalPasos - 1);
        document.getElementById("btn-next").classList.toggle("d-none", esUltimo);
        document.getElementById("btn-submit").classList.toggle("d-none", !esUltimo);
    }

    // --- MANEJO DE EVENTOS ---
    const btnNext = document.getElementById("btn-next");
    const btnPrev = document.getElementById("btn-prev");
    const btnSubmit = document.getElementById("btn-submit");

    // Reiniciar listeners (Truco para evitar duplicados)
    const newBtnNext = btnNext.cloneNode(true);
    const newBtnPrev = btnPrev.cloneNode(true);
    const newBtnSubmit = btnSubmit.cloneNode(true);
    btnNext.replaceWith(newBtnNext);
    btnPrev.replaceWith(newBtnPrev);
    btnSubmit.replaceWith(newBtnSubmit);

    newBtnNext.addEventListener("click", () => {
        const currentId = preguntas[pasoActual].id;
        const input = document.getElementById(`val-${currentId}`);
        if (input) {
            if (input.value.trim() === "") {
                alert("Por favor, completa este campo antes de continuar.");
                return;
            }
            respuestas[currentId] = input.value;
        }

        pasoActual++;
        renderPaso();
    });

    newBtnPrev.addEventListener("click", () => {
        pasoActual--;
        renderPaso();
    });

    newBtnSubmit.addEventListener("click", async () => {
        // 1. Guardar el último valor ingresado
        const currentId = preguntas[pasoActual].id;
        const input = document.getElementById(`val-${currentId}`);
        if (input) respuestas[currentId] = input.value;

        // 2. Validación de seguridad para que no creen filas vacías en Excel
        if (!respuestas["Id_unidad"]) {
            alert("⚠️ Error: El ID de la unidad es obligatorio para guardar el registro.");
            return;
        }

        console.log("Datos de la unidad listos, enviando al servidor:", respuestas);

        try {
            // 3. Enviamos los datos a la misma ruta de Node.js (Upsert)
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

            // 4. Mensaje de éxito original y reseteo visual
            alert("✅ Registro de unidad exitoso.\nLa información ha sido almacenada correctamente.");

            pasoActual = 0;
            Object.keys(respuestas).forEach(key => delete respuestas[key]);
            renderPaso();

        } catch (error) {
            console.error("Error al guardar en BD:", error);
            alert("❌ Hubo un problema al guardar el registro. Verifica que el servidor esté encendido.");
        }
    });

    renderPaso();
}