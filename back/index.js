// 1. ÚNICA Función para inyectar los fragmentos HTML
async function showSection(sectionId) {
    // Apagar todos los botones y prender el seleccionado
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    const targetBtn = document.getElementById('btn-' + sectionId);
    if (targetBtn) targetBtn.classList.add('active');

    const contenedor = document.getElementById('contenedor-vistas');
    
    try {
        // Como todos los HTML están juntos, los llamamos directo por su nombre
        const response = await fetch(`${sectionId}.html`);
        
        if (!response.ok) throw new Error("Vista no encontrada");
        
        // Convertimos la respuesta en texto HTML y la inyectamos
        const htmlFragment = await response.text();
        contenedor.innerHTML = htmlFragment;
        // Si la sección que acaba de cargar es 'reportes', ejecutamos su script
        if (sectionId === 'formulario_transportista') {
            formulario_transportista();
        }
        if (sectionId === 'admin') {
            cargarDatosTablaAdmin();
        }

    } catch (error) {
        console.error("Error al cargar la sección:", error);
        contenedor.innerHTML = `<div class="content-card shadow-lg p-5 text-center text-danger"><h3>Error al cargar la vista. Verifica que ${sectionId}.html exista en tu carpeta.</h3></div>`;
    }
}

// 2. ÚNICA Lógica que se ejecuta al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    // Leemos los datos de la sesión actual
    const usuarioLogueado = sessionStorage.getItem("usuarioLogueado");
    const rolUsuario = sessionStorage.getItem("rolUsuario"); 
    const contenedorMenu = document.getElementById("menu-usuario-container");
    
    // --- PARTE A: RENDERIZAR MENÚ SUPERIOR ---
    if (usuarioLogueado) {
        let linkRegistro = "";
        // Validamos si es Administrador para mostrarle el botón de registro
        if (rolUsuario === "Administrador") {
            linkRegistro = `
                <li><a class="dropdown-item" href="registro.html"><i class="bi bi-person-plus me-2"></i>Registrar usuario</a></li>
                <li><hr class="dropdown-divider"></li>
            `;
        }

        contenedorMenu.innerHTML = `
            <p class="rol-header mb-0 me-3 text-uppercase fw-bold">${rolUsuario}</p>
            <div class="dropdown">
                <a class="nav-link dropdown-toggle text-dark fw-bold" href="#" role="button" id="userMenu" data-bs-toggle="dropdown" aria-expanded="false">
                    ¡Hola, ${usuarioLogueado}!
                </a>
                <ul class="dropdown-menu dropdown-menu-end shadow border-0" aria-labelledby="userMenu">
                    ${linkRegistro}
                    <li><a class="dropdown-item text-danger fw-bold" href="#" id="btnCerrarSesion"><i class="bi bi-box-arrow-right me-2"></i>Cerrar sesión</a></li>
                </ul>
            </div>
        `;

        document.getElementById("btnCerrarSesion").addEventListener("click", (e) => {
            e.preventDefault();
            sessionStorage.clear(); // Limpiamos la memoria
            window.location.reload(); 
        });

    } else {
        // Si no hay sesión, mostramos Iniciar Sesión (ruta directa)
        contenedorMenu.innerHTML = `
            <a href="login.html" class="btn btn-dark fw-bold px-4 py-2 rounded-pill shadow-sm">
                <i class="bi bi-box-arrow-in-right me-2"></i> Iniciar Sesión
            </a>
        `;
    }

    // --- PARTE B: LÓGICA DE ROLES (OCULTAR LO QUE NO DEBEN VER) ---
    const menuItems = document.querySelectorAll('.menu-item');

    menuItems.forEach(item => {
        const rolesPermitidos = item.getAttribute('data-role'); 

        if (!usuarioLogueado) {
            // Visitante: No ve el menú lateral
            item.style.display = 'none'; 
        } else if (rolesPermitidos && rolUsuario) {
            const rolesPermitidosArray = rolesPermitidos.toLowerCase().split(' ');
            const miRol = rolUsuario.toLowerCase();

            if (!rolesPermitidosArray.includes(miRol)) {
                item.style.display = 'none'; 
            }
        }
    });

    // Cargar la vista principal por defecto al final
    showSection('cuidado'); 
});


// Función para llenar la tabla del Administrador CON DATOS REALES
// Variable global para almacenar el JSON de cada camión temporalmente
window.datosMantenimientoGlobal = {}; 

async function cargarDatosTablaAdmin() {
    const tbody = document.getElementById('tabla-unidades-body');
    if (!tbody) return;

    try {
        const response = await fetch('http://localhost:3000/api/unidades');
        if (!response.ok) throw new Error("No se pudo conectar con la BD");

        const unidadesData = await response.json();
        let htmlFilas = "";

        unidadesData.forEach(unidad => {
            const idCamion = unidad.Id_unidad || "N/A";
            const status = unidad.status ? unidad.status.toUpperCase() : "SIN DATOS";
            const ponderacion = unidad.ponderacion_status || 0;
            const comentario = unidad.comentario_ia || "Sin comentarios.";

            // Extraer y guardar la lista de mantenimientos de este camión en la memoria del navegador
            let listaMantenimientos = [];
            if (unidad.mantenimientos) {
                try {
                    listaMantenimientos = JSON.parse(unidad.mantenimientos);
                } catch(e) { console.error("Error leyendo JSON del camión", idCamion); }
            }
            window.datosMantenimientoGlobal[idCamion] = listaMantenimientos;

            let colorStatus = "bg-secondary"; 
            if (status === "URGENTE") colorStatus = "bg-danger";
            if (status === "PREVENTIVO") colorStatus = "bg-warning";
            if (status === "REVISIÓN SUGERIDA") colorStatus = "bg-info";
            if (status === "ESTABLE" || status === "OPTIMO") colorStatus = "bg-success";

            htmlFilas += `
                <tr>
                    <td class="fw-bold">${idCamion}</td>
                    <td><span class="status-indicator ${colorStatus}"></span> ${status} <small class="text-muted">(${ponderacion}/100)</small></td>
                    <td class="text-muted" style="max-width: 300px; white-space: normal;"><em>"${comentario}"</em></td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-dark shadow-sm" onclick="abrirModalMantenimientos('${idCamion}')">
                            <i class="bi bi-card-list me-1"></i> Detalles
                        </button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = htmlFilas;

    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger fw-bold">❌ Error al cargar la base de datos.</td></tr>`;
    }
}

// Función que se ejecuta al darle clic a "Detalles"
window.abrirModalMantenimientos = function(idCamion) {
    document.getElementById("modal-unidad-id").innerText = idCamion;
    renderizarListaMantenimientos(idCamion);
    
    // Mostramos el modal de Bootstrap
    const modal = new bootstrap.Modal(document.getElementById('modalMantenimientos'));
    modal.show();
};

// Función para pintar la lista (Separada para poder repintarla cuando marquemos una casilla)
function renderizarListaMantenimientos(idCamion) {
    const contenedor = document.getElementById("modal-mantenimientos-body");
    const mantenimientos = window.datosMantenimientoGlobal[idCamion] || [];

    if (mantenimientos.length === 0) {
        contenedor.innerHTML = `<div class="alert alert-secondary text-center">No hay registros de mantenimiento para esta unidad.</div>`;
        return;
    }

    let html = '<ul class="list-group list-group-flush">';
    
    mantenimientos.forEach((mant, index) => {
        if (mant.concluido) {
            // Diseño para tarea CONCLUIDA
            html += `
                <li class="list-group-item bg-transparent border-bottom py-3">
                    <div class="d-flex w-100 justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1 fw-bold text-success"><i class="bi bi-check-circle-fill me-2"></i>${mant.nombre_mantenimiento}</h6>
                            <small class="text-muted">Solicitado: ${mant.fecha_solicitud} | <span class="fw-bold">Realizado: ${mant.fecha_realizacion}</span></small>
                        </div>
                        <span class="badge bg-success rounded-pill">Completado</span>
                    </div>
                </li>
            `;
        } else {
            // Diseño para tarea PENDIENTE (Con Checkbox)
            html += `
                <li class="list-group-item bg-white border border-warning rounded-3 my-2 py-3 shadow-sm">
                    <div class="d-flex w-100 justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1 fw-bold text-dark"><i class="bi bi-exclamation-triangle-fill text-warning me-2"></i>${mant.nombre_mantenimiento}</h6>
                            <small class="text-muted">Solicitado: ${mant.fecha_solicitud}</small>
                        </div>
                        <div class="form-check form-switch ms-3">
                            <input class="form-check-input fs-4" type="checkbox" role="switch" id="check-${idCamion}-${index}" onchange="marcarComoRealizado('${idCamion}', ${index})">
                            <label class="form-check-label ms-1" for="check-${idCamion}-${index}">Marcar Listo</label>
                        </div>
                    </div>
                </li>
            `;
        }
    });
    
    html += '</ul>';
    contenedor.innerHTML = html;
}

// Función que se ejecuta al encender el "switch" de completado
window.marcarComoRealizado = async function(idCamion, indexMantenimiento) {
    // 1. Obtenemos la fecha de hoy
    const fechaHoy = new Date().toISOString().split('T')[0];

    // 2. Modificamos el JSON en la memoria del navegador
    const mantenimientos = window.datosMantenimientoGlobal[idCamion];
    mantenimientos[indexMantenimiento].concluido = true;
    mantenimientos[indexMantenimiento].fecha_realizacion = fechaHoy;

    // 3. Repintamos el modal para que se vea el cambio visualmente
    renderizarListaMantenimientos(idCamion);

    // 4. Enviamos la orden silenciosa al servidor para que guarde en Excel
    try {
        await fetch('http://localhost:3000/api/actualizar-mantenimiento', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id_camion: idCamion, 
                mantenimientosActualizados: mantenimientos 
            })
        });
        console.log("Excel actualizado correctamente.");
    } catch (error) {
        console.error("No se pudo guardar en Excel", error);
        alert("Atención: Hubo un error guardando el dato en la base de datos.");
    }
};


// Función temporal para cuando hagan clic en el botón (luego armamos esa pestaña)
window.verHistorial = function(id) {
    alert("Abriendo lista de mantenimientos para la unidad: " + id);
    // Aquí después programaremos que abra tu nueva pestaña de detalles
};