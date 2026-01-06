
// Función que se ejecuta cuando el documento ha sido cargado
// Se encarga de registrar un usuario en la base de datos enviando el formulario en el body de la petición POST
// Si la petición es exitosa, redirige al usuario al login

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");

    form.addEventListener("submit", async function (event) {
        event.preventDefault(); // Evita que el formulario se envíe por defecto

        // Capturamos los valores del formulario
        const usuario = {
            usuema: document.getElementById("email").value,
            usupas: document.getElementById("pass").value
        };

        try {
            const response = await fetch(`${window.CONFIG.API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(usuario)
            });

            if (response.ok) {
                const usuarioRespuesta = await response.json();
                
                
                // Guardar token (si viene) en localStorage y usuario en sessionStorage para la UI
                if (usuarioRespuesta.token) {
                    localStorage.setItem("authToken", usuarioRespuesta.token);
                }

                // La respuesta puede devolver directamente el user o un wrapper. Normalizamos:
                const userObj = usuarioRespuesta.user || usuarioRespuesta.usuario || usuarioRespuesta;
                try {
                    sessionStorage.setItem("usuarioConectado", JSON.stringify(userObj));
                } catch (e) {
                    console.error('No se pudo guardar usuario en sessionStorage', e);
                }
                
                // Mostrar modal de éxito
                document.getElementById('successModalBody').textContent = "Usuario logueado con éxito";
                const successModal = new bootstrap.Modal(document.getElementById('successModal'));
                successModal.show();
                
                // Esperar a que se cierre el modal antes de redirigir
                document.getElementById('successModal').addEventListener('hidden.bs.modal', function () {                  
                        window.location.href = "/index.html";                   
                }, { once: true });            
            } else if (response.status === 401) {
                // Credenciales inválidas
                let errorMessage = "Credenciales inválidas";
                try {
                    const errorData = await response.json();
                    if (errorData.message) {
                        errorMessage = errorData.message;
                    }
                } catch (e) {
                    // Si no se puede parsear el JSON, usar el mensaje por defecto
                }
                
                document.getElementById('warningModalBody').textContent = errorMessage;
                const warningModal = new bootstrap.Modal(document.getElementById('warningModal'));
                warningModal.show();
                // Limpiar el formulario después de cerrar el modal de error o advertencia
                document.getElementById('warningModal').addEventListener('hidden.bs.modal', function () {
                form.reset();
                }, { once: true });
            } else {
                let errorMessage = "Error desconocido";
                
                try {
                    const errorData = await response.json();
                    // Si hay errores de validación específicos que provienen del backend, mostrarlos
                    if (errorData.errors && Object.keys(errorData.errors).length > 0) {
                        // Obtener todos los mensajes de error de validación
                        errorMessage = Object.values(errorData.errors).join(', ');
                    } else if (errorData.message) {
                        errorMessage = errorData.message;
                    }
                } catch (e) {
                    // Si no se puede parsear el JSON, usar el mensaje por defecto
                }
                
                document.getElementById('errorModalBody').textContent = errorMessage;
                const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
                errorModal.show();
                // Limpiar el formulario después de cerrar el modal de error o advertencia
                document.getElementById('errorModal').addEventListener('hidden.bs.modal', function () {
                form.reset();
                }, { once: true });
            }

        } catch (error) {
            console.error("Error en la petición:", error);
            document.getElementById('errorModalBody').textContent = "Hubo un error al iniciar sesión";
            const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
            errorModal.show();
          // Limpiar el formulario después de cerrar el modal de error o advertencia
            document.getElementById('errorModal').addEventListener('hidden.bs.modal', function () {
                form.reset();
            }, { once: true });
        }       
          
               

        
    });

    // Funcionalidad para mostrar/ocultar contraseña
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('pass');

    if (togglePassword) {
        togglePassword.addEventListener('click', function () {
            // Cambiar el tipo de input
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Cambiar el icono (ahora el icono es togglePassword mismo)
            if (type === 'password') {
                togglePassword.classList.remove('bi-eye-slash');
                togglePassword.classList.add('bi-eye');
            } else {
                togglePassword.classList.remove('bi-eye');
                togglePassword.classList.add('bi-eye-slash');
            }
        });
    }
});
