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