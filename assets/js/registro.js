
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
                alert("Usuario registrado con éxito");
                window.location.href = "/views/login.html"; // Redirige al login
            } else {
                const errorData = await response.json();
                alert("Error: " + errorData.message);
            }
        } catch (error) {
            console.error("Error en la petición:", error);
            alert("Hubo un error al registrar el usuario");
        }
    });
});

