

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("importarForm");

    form.addEventListener("submit", async function (event) {
        event.preventDefault(); // Evita que el formulario se envíe por defecto

        const formData = new FormData(form);

        try {
            const response = await fetch("http://localhost:8080/palas/importar", {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                alert("Archivo importado con éxito");
                // Puedes agregar lógica adicional aquí, como redirigir a otra página
            } else {
                const errorData = await response.json();
                alert("Error: " + errorData.message);
            }
        } catch (error) {
            console.error("Error en la petición:", error);
            alert("Hubo un error al importar el archivo");
        }
    });
});
