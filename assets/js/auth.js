// Script para manejar la autenticación en todas las páginas
// Muestra/oculta elementos según el estado de login y maneja el logout

document.addEventListener("DOMContentLoaded", function () {
    const loginIcon = document.getElementById("loginIcon");
    const userDropdown = document.getElementById("userDropdown");
    const nombreLogin = document.getElementById("nombreLogin");
    const logoutBtn = document.getElementById("logoutBtn");

    // Verificar si hay un usuario conectado
    // Preferimos sessionStorage para datos de sesión, fallback a localStorage
    let usuarioConectado = sessionStorage.getItem("usuarioConectado");
    if (!usuarioConectado) usuarioConectado = localStorage.getItem("usuarioConectado");

    if (usuarioConectado) {
        try {
            const usuario = JSON.parse(usuarioConectado);
            
            // Mostrar dropdown de usuario y ocultar icono de login
            if (loginIcon) loginIcon.style.display = "none";
            if (userDropdown) userDropdown.style.display = "block";
            
            // Mostrar nombre del usuario (nombre preferido, sino email)
            if (nombreLogin) nombreLogin.textContent = usuario.usunom || usuario.usuema || "Usuario";
            
            // Redirigir si el usuario está en login.html o registro.html
            const currentPath = window.location.pathname;
            if (currentPath.includes("/login.html") || currentPath.includes("/registro.html")) {
                window.location.href = "/index.html";
            }
        } catch (error) {
            console.error("Error al parsear usuario:", error);
            sessionStorage.removeItem("usuarioConectado");
            localStorage.removeItem("usuarioConectado");
            localStorage.removeItem("authToken");
        }
    } else {
        // No hay usuario conectado
        if (loginIcon) loginIcon.style.display = "block";
        if (userDropdown) userDropdown.style.display = "none";
    }

    // Manejar el logout
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (event) {
            event.preventDefault();
            
            // Limpiar localStorage (usuario y token)
            sessionStorage.removeItem("usuarioConectado");
            localStorage.removeItem("usuarioConectado");
            localStorage.removeItem("authToken");
            
            // Verificar si existe el modal
            const successModalElement = document.getElementById('successModal');
            
            if (successModalElement) {
                // Mostrar modal de éxito
                document.getElementById('successModalBody').textContent = "Sesión cerrada exitosamente";
                const successModal = new bootstrap.Modal(successModalElement);
                successModal.show();
                
                // Redirigir al login después de cerrar el modal
                successModalElement.addEventListener('hidden.bs.modal', function () {
                    window.location.href = "/views/login.html";
                }, { once: true });
            } else {
                // Si no hay modal, redirigir directamente
                window.location.href = "/views/login.html";
            }
        });
    }
});
