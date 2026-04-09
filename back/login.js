document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const errorMsg = document.getElementById("errorMsg");

    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();
        errorMsg.classList.add("d-none"); // Ocultar mensaje de error por si estaba visible

        const credenciales = {
            id_camionero: document.getElementById("idCamionero").value.trim(),
            password: document.getElementById("password").value
        };

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credenciales)
            });

            const data = await response.json();

            if (response.ok) {
                // ¡ÉXITO! Guardamos el nombre en el navegador temporalmente
                sessionStorage.setItem("usuarioLogueado", data.nombre);
                
                // Redirigimos al Dashboard
                window.location.href = "index.html";
            } else {
                // ERROR: Mostramos el mensaje en la pantalla
                errorMsg.textContent = data.error;
                errorMsg.classList.remove("d-none");
            }

        } catch (error) {
            console.error('Error:', error);
            errorMsg.textContent = "Error de conexión con el servidor.";
            errorMsg.classList.remove("d-none");
        }
    });
});