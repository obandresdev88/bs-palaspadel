// Función que se ejecuta cuando el documento ha sido cargado
// Se encarga de registrar un usuario en la base de datos enviando el formulario en el body de la petición POST
// Si la petición es exitosa, redirige al usuario al login

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("registroForm");

    // Función para mostrar modales de Bootstrap
    function showBootstrapModal(modalId, message) {
        let modalElement = document.getElementById(modalId);
        if (!modalElement) {
            modalElement = document.createElement('div');
            modalElement.id = modalId;
            modalElement.className = 'modal fade';
            modalElement.dataset.bsBackdrop = 'static';
            modalElement.dataset.bsKeyboard = 'false';
            modalElement.tabIndex = -1;
            modalElement.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                <div class="modal-header ${modalId === 'successModal' ? 'bg-success text' : 'bg-danger text-white'}">
                    <h5 class="modal-title">${modalId === 'successModal' ? 'Éxito' : 'Error'}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p id="${modalId}Body"></p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="${modalId === 'successModal' ? 'btn btn-success' : 'btn btn-danger' }" data-bs-dismiss="modal">Cerrar</button>
                </div>
                </div>
            </div>
            `;
            document.body.appendChild(modalElement);
        }
        const bodyP = document.getElementById(`${modalId}Body`);
        if (bodyP) bodyP.textContent = message;
        // Create and show the Bootstrap modal (requires Bootstrap JS loaded)
        const bsModal = new bootstrap.Modal(modalElement);
        bsModal.show();
    }

    // MANEJO del evento SUBMIT del FORMULARIO DE REGISTRO
    form.addEventListener("submit", async function (event) {
        event.preventDefault(); // Evita que el formulario se envíe por defecto

        // Capturamos los valores del formulario
        const usuario = {
            usunom: document.getElementById("nombre").value,
            usuema: document.getElementById("email").value,
            usupas: document.getElementById("pass").value,
            usuniv: document.getElementById("nivel").value.toUpperCase()
        };

        try {
            const response = await fetch("http://localhost:8080/usuarios/registro", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(usuario)
            });

            if (response.ok) {
                // Mostrar modal de éxito y redirigir después de un breve retardo
                showBootstrapModal('successModal', 'Usuario registrado con éxito');
                const successModal = document.getElementById('successModal');
                successModal.addEventListener('hidden.bs.modal', () => {
                    // Redirect to login after success
                    setTimeout(() => window.location.href = "/views/login.html", 1200);                   
                });
            } else if (response.status === 409) {
                showBootstrapModal('errorModal', 'El email ingresado ya está registrado');  
                
                // Limpiar el campo email cuando se cierre el modal
                const email = document.getElementById("email");
                const errorModal = document.getElementById('errorModal');
                errorModal.addEventListener('hidden.bs.modal', () => {
                    email.value = '';
                    email.focus();
                });                                
            } else {
                const errorData = await response.json().catch(() => null);
                const msg = (errorData && errorData.message) ? errorData.message : 'Error desconocido';
                showBootstrapModal('errorModal', 'Error: ' + msg);
            }

        } catch (error) {
            console.error("Error en la petición:", error);
            showBootstrapModal('errorModal', 'Hubo un error al registrar el usuario');
        }
    });
});

