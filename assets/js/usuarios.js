
document.addEventListener("DOMContentLoaded", function () {
    fetch("http://localhost:8080/usuarios")
        .then(response => response.json())
        .then(data => mostrarUsuarios(data))
        .catch(error => console.error("Error al obtener usuarios:", error));
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
