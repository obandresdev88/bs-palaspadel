

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
                const responseText = await response.text();
                document.getElementById('successModalBody').textContent = "Archivo importado con éxito. " + responseText;
                const successModal = new bootstrap.Modal(document.getElementById('successModal'));
                successModal.show();
            } else {
                const errorData = await response.json();
                document.getElementById('errorModalBody').textContent = "Error: " + errorData.message;
                const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
                errorModal.show();
            }   
        } catch (error) {
            console.error("Error en la petición:", error);
            document.getElementById('errorModalBody').textContent = "Hubo un error al importar el archivo";
            const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
            errorModal.show();
        }
    });
});
