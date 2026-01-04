
// Función que se ejecuta cuando el documento ha sido cargado
// Se encarga de registrar un usuario en la base de datos enviando el formulario en el body de la petición POST
// Si la petición es exitosa, redirige al usuario al login

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("registroForm");

    form.addEventListener("submit", async function (event) {
        event.preventDefault(); // Evita que el formulario se envíe por defecto

        // Capturamos los valores del formulario
        const usuario = {
            usunom: document.getElementById("nombre").value,
            usuema: document.getElementById("email").value,
            usupas: document.getElementById("pass").value,
            usuniv: document.getElementById("nivel").value.toUpperCase(),
            usuconectado: document.getElementById("conectado").checked
        };

        try {
            const response = await fetch("http://localhost:8080/api/auth/registro", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(usuario)
            });

            if (response.ok) {
                // Mostrar modal de éxito
                document.getElementById('successModalBody').textContent = "Usuario registrado con éxito";
                const successModal = new bootstrap.Modal(document.getElementById('successModal'));
                successModal.show();
                
                // Esperar a que se cierre el modal antes de redirigir
                document.getElementById('successModal').addEventListener('hidden.bs.modal', function () {
                    if (usuario.usuconectado) {
                        localStorage.setItem("usuarioConectado", JSON.stringify(usuario));
                        window.location.href = "/index.html";
                    } else {
                        window.location.href = "/views/login.html";
                    }
                }, { once: true });
            } else if (response.status === 409) {
                // Modal de advertencia si el email ya está registrado
                document.getElementById('warningModalBody').textContent = "El email ingresado ya está registrado";
                const warningModal = new bootstrap.Modal(document.getElementById('warningModal'));
                warningModal.show();
            } else {
                const errorData = await response.json();
                let errorMessage = "Error desconocido";
                
                // Si hay errores de validación específicos que provienen del backend, mostrarlos
                if (errorData.errors && Object.keys(errorData.errors).length > 0) {
                    // Obtener todos los mensajes de error de validación
                    errorMessage = Object.values(errorData.errors).join(', ');
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
                
                document.getElementById('errorModalBody').textContent = errorMessage;
                const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
                errorModal.show();
            }

        } catch (error) {
            console.error("Error en la petición:", error);
            document.getElementById('errorModalBody').textContent = "Hubo un error al registrar el usuario";
            const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
            errorModal.show();
        }
    });
});

