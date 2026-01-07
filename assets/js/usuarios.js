
document.addEventListener("DOMContentLoaded", async function () {
    // Obtener el token del localStorage
    const token = localStorage.getItem("authToken");
    
    // Verificar si hay token
    if (!token) {
        document.getElementById('errorModalBody').textContent = "Debes iniciar sesión para acceder a esta sección";
        const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
        errorModal.show();
        
        document.getElementById('errorModal').addEventListener('hidden.bs.modal', function () {
            redirectToLogin();
        }, { once: true });
        return;
    }
    
    try {
        const response = await fetch(`${window.CONFIG.API_URL}/usuarios`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            const usuarios = await response.json();
            mostrarUsuarios(usuarios);
        } else if (response.status === 401) {
            // Token inválido o expirado
            document.getElementById('warningModalBody').textContent = "Sesión expirada. Por favor, inicia sesión nuevamente.";
            const warningModal = new bootstrap.Modal(document.getElementById('warningModal'));
            warningModal.show();
            
            document.getElementById('warningModal').addEventListener('hidden.bs.modal', function () {
                localStorage.removeItem("authToken");
                sessionStorage.removeItem("usuarioConectado");
                localStorage.removeItem("usuarioConectado");
                redirectToLogin();
            }, { once: true });
        } else if (response.status === 403) {
            // Sin permisos (no es ADMIN)
            let errorMessage = "No tienes permisos para visualizar esta sección";
            
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
            
            document.getElementById('warningModal').addEventListener('hidden.bs.modal', function () {
                redirectToHome();
            }, { once: true });
        } else {
            // Otros errores
            let errorMessage = "Error al cargar los usuarios";
            
            try {
                const errorData = await response.json();
                if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (e) {
                // Si no se puede parsear el JSON, usar el mensaje por defecto
            }
            
            document.getElementById('errorModalBody').textContent = errorMessage;
            const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
            errorModal.show();
        }

    } catch (error) {
        console.error("Error en la petición:", error);
        document.getElementById('errorModalBody').textContent = "Hubo un error al cargar los usuarios";
        const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
        errorModal.show();
    }
});

function mostrarUsuarios(usuarios) {
    const tbody = document.getElementById("usuarios");
    tbody.innerHTML = "";

    usuarios.forEach(usuario => { 
        console.log("Usuario:", usuario);       
        const fila = `
            <tr>
                <td>${usuario.id}</td>
                <td>${usuario.usunom}</td>
                <td>${usuario.usuema}</td>
                <td>${usuario.usuniv}</td>
                <td>${usuario.usufec}</td>
            </tr>
        `;
        tbody.innerHTML += fila;
    });
}
