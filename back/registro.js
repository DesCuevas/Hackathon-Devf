document.addEventListener("DOMContentLoaded", () => {
    const registroForm = document.getElementById("registroForm");
    const idInput = document.getElementById("idCamionero");

    // Quitar el borde rojo cuando el usuario intente escribir de nuevo
    idInput.addEventListener("input", function() {
        this.style.border = "";
    });

    registroForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        // 1. Obtener los valores (Forzamos el ID a mayúsculas para evitar duplicados por error de dedo)
        const userData = {
            id_camionero: idInput.value.trim().toUpperCase(),
            nombre_completo: document.getElementById("nombreCompleto").value.trim(),
            fecha_nacimiento: document.getElementById("fechaNacimiento").value,
            password: document.getElementById("password").value,
            rol: document.getElementById("rol").value
        };

        try {
            // 2. Enviar los datos al servidor Node.js
            const response = await fetch('http://localhost:3000/api/registro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            // 3. Manejar la respuesta del servidor
            if (response.ok) {
                // ¡Todo salió bien!
                // Redirigimos al login
                window.location.href = "login.html";
                alert("✅ " + data.mensaje); 
                
                // Limpiamos el formulario para el siguiente registro
                registroForm.reset(); 

                
                
            } else {
                // 🚨 AQUÍ SALE EL MENSAJE SI EL ID YA EXISTE 🚨
                // Atrapamos el error que nos mandó Node.js
                alert("❌ Atención: " + data.error); 
                
                // Efecto visual: Pintar el input de rojo y enfocarlo
                idInput.style.border = "2px solid red";
                idInput.focus();
            }

        } catch (error) {
            console.error('Error:', error);
            alert("❌ Error al conectar con el servidor. Revisa que Node.js esté encendido en tu terminal.");
        }
    });
});