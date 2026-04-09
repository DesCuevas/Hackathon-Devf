// Simulación (cámbialo luego por backend)
const role = "administrador"; 
// prueba con "transportista"

// Filtrar elementos por rol
document.querySelectorAll("[data-role]").forEach(el => {
  const roles = el.getAttribute("data-role").split(" ");

  if (!roles.includes(role)) {
    el.remove(); // elimina lo que no corresponde
  }

  // 1. Actualizar el texto del encabezado (Administrador / Transportista)
  const rolHeader = document.querySelector(".rol-header");
  if (rolHeader) {
      // Convertimos la primera letra a mayúscula para que se vea profesional
      rolHeader.textContent = role.charAt(0).toUpperCase() + role.slice(1);
  }
});