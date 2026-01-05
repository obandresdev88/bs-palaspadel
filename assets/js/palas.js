// CRUD de Palas - Frontend

let esAdmin = false;

document.addEventListener("DOMContentLoaded", async function () {
    // Verificar si el usuario está logueado
    const token = localStorage.getItem("authToken");
    esAdmin = !!token; // Si hay token, mostramos opciones de admin (el backend valida el rol)
    
    // Mostrar/ocultar botón de crear pala según si está logueado
    const btnCrearPala = document.getElementById("btnCrearPala");
    if (btnCrearPala) {
        btnCrearPala.style.display = esAdmin ? "block" : "none";
    }
    
    // Cargar las palas
    await cargarPalas();
    
    // Configurar eventos
    configurarEventos();
});

// Cargar todas las palas
async function cargarPalas() {
    try {
        const response = await fetch("http://localhost:8080/api/palas", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const palas = await response.json();
            mostrarPalas(palas);
        } else {
            document.getElementById('errorModalBody').textContent = "Error al cargar las palas";
            const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
            errorModal.show();
        }
    } catch (error) {
        console.error("Error al cargar palas:", error);
        document.getElementById('errorModalBody').textContent = "Hubo un error al cargar las palas";
        const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
        errorModal.show();
    }
}

// Mostrar las palas en el DOM
function mostrarPalas(palas) {
    const container = document.getElementById("palasContainer");
    container.innerHTML = "";
    
    palas.forEach(pala => {
        const col = document.createElement("div");
        col.className = "col";
        
        // Construir URL de la imagen
        const imagenUrl = pala.imagen 
            ? `http://localhost:8080${pala.imagen}` 
            : '/assets/images/palas/default.jpg';
        
        col.innerHTML = `
            <div class="card h-auto shadow-sm">
                <img src="${imagenUrl}" 
                     class="img-fluid card-img-top" 
                     alt="${pala.modelo}"
                     style="height: 300px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title">${pala.marca} ${pala.modelo}</h5>
                    <p class="card-text mb-1"><small class="text-muted">Forma: ${pala.forma} | Peso: ${pala.peso}g</small></p>
                    <p class="card-text mb-1"><small class="text-muted">Dureza: ${pala.dureza} | Balance: ${pala.balance}</small></p>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <p class="text-primary fw-bold mb-0">${pala.precio}€</p>
                        ${pala.urlCompra ? `<a href="${pala.urlCompra}" target="_blank" class="btn btn-primary btn-sm">Comprar</a>` : ''}
                    </div>
                    ${esAdmin ? `
                        <div class="mt-2 d-flex gap-2">
                            <button class="btn btn-warning btn-sm flex-fill" onclick="editarPala(${pala.id})">
                                <i class="bi bi-pencil"></i> Editar
                            </button>
                            <button class="btn btn-danger btn-sm flex-fill" onclick="eliminarPala(${pala.id}, '${pala.modelo}')">
                                <i class="bi bi-trash"></i> Eliminar
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        container.appendChild(col);
    });
}

// Configurar eventos de los formularios
function configurarEventos() {
    const formCrear = document.getElementById("formCrearPala");
    if (formCrear) {
        formCrear.addEventListener("submit", async function (event) {
            event.preventDefault();
            await crearPala();
        });
    }
    
    const formEditar = document.getElementById("formEditarPala");
    if (formEditar) {
        formEditar.addEventListener("submit", async function (event) {
            event.preventDefault();
            await actualizarPala();
        });
    }
}

// Abrir modal para crear pala
function abrirModalCrear() {
    document.getElementById("formCrearPala").reset();
    const modal = new bootstrap.Modal(document.getElementById('modalCrearPala'));
    modal.show();
}

// Crear nueva pala
async function crearPala() {
    const token = localStorage.getItem("authToken");
    if (!token) {
        mostrarError("Debes iniciar sesión");
        return;
    }
    
    const formData = new FormData();
    formData.append("marca", document.getElementById("crear_marca").value);
    formData.append("modelo", document.getElementById("crear_modelo").value);
    formData.append("peso", document.getElementById("crear_peso").value);
    formData.append("forma", document.getElementById("crear_forma").value);
    formData.append("dureza", document.getElementById("crear_dureza").value);
    formData.append("balance", document.getElementById("crear_balance").value);
    formData.append("precio", document.getElementById("crear_precio").value);
    formData.append("urlCompra", document.getElementById("crear_urlCompra").value);
    
    const imagen = document.getElementById("crear_imagen").files[0];
    if (imagen) {
        formData.append("imagen", imagen);
    }
    
    try {
        const response = await fetch("http://localhost:8080/api/palas", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('modalCrearPala')).hide();
            document.getElementById('successModalBody').textContent = "Pala creada con éxito";
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();
            await cargarPalas();
        } else if (response.status === 403) {
            mostrarError("No tienes permisos para crear palas");
        } else {
            const errorData = await response.json();
            mostrarError(errorData.message || "Error al crear la pala");
        }
    } catch (error) {
        console.error("Error:", error);
        mostrarError("Hubo un error al crear la pala");
    }
}

// Editar pala - Cargar datos en el modal
async function editarPala(id) {
    try {
        const response = await fetch(`http://localhost:8080/api/palas/${id}`);
        
        if (response.ok) {
            const pala = await response.json();
            
            document.getElementById("editar_id").value = pala.id;
            document.getElementById("editar_marca").value = pala.marca;
            document.getElementById("editar_modelo").value = pala.modelo;
            document.getElementById("editar_peso").value = pala.peso;
            document.getElementById("editar_forma").value = pala.forma;
            document.getElementById("editar_dureza").value = pala.dureza;
            document.getElementById("editar_balance").value = pala.balance;
            document.getElementById("editar_precio").value = pala.precio;
            document.getElementById("editar_urlCompra").value = pala.urlCompra || '';
            
            const modal = new bootstrap.Modal(document.getElementById('modalEditarPala'));
            modal.show();
        }
    } catch (error) {
        console.error("Error:", error);
        mostrarError("Error al cargar los datos de la pala");
    }
}

// Actualizar pala existente
async function actualizarPala() {
    const token = localStorage.getItem("authToken");
    if (!token) {
        mostrarError("Debes iniciar sesión");
        return;
    }
    
    const id = document.getElementById("editar_id").value;
    const formData = new FormData();
    formData.append("marca", document.getElementById("editar_marca").value);
    formData.append("modelo", document.getElementById("editar_modelo").value);
    formData.append("peso", document.getElementById("editar_peso").value);
    formData.append("forma", document.getElementById("editar_forma").value);
    formData.append("dureza", document.getElementById("editar_dureza").value);
    formData.append("balance", document.getElementById("editar_balance").value);
    formData.append("precio", document.getElementById("editar_precio").value);
    formData.append("urlCompra", document.getElementById("editar_urlCompra").value);
    
    const imagen = document.getElementById("editar_imagen").files[0];
    if (imagen) {
        formData.append("imagen", imagen);
    }
    
    try {
        const response = await fetch(`http://localhost:8080/api/palas/${id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('modalEditarPala')).hide();
            document.getElementById('successModalBody').textContent = "Pala actualizada con éxito";
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();
            await cargarPalas();
        } else if (response.status === 403) {
            mostrarError("No tienes permisos para actualizar palas");
        } else {
            const errorData = await response.json();
            mostrarError(errorData.message || "Error al actualizar la pala");
        }
    } catch (error) {
        console.error("Error:", error);
        mostrarError("Hubo un error al actualizar la pala");
    }
}

// Eliminar pala
async function eliminarPala(id, nombre) {
    const confirmar = confirm(`¿Estás seguro de que deseas eliminar la pala "${nombre}"?`);
    if (!confirmar) return;
    
    const token = localStorage.getItem("authToken");
    if (!token) {
        mostrarError("Debes iniciar sesión");
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:8080/api/palas/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok || response.status === 204) {
            document.getElementById('successModalBody').textContent = "Pala eliminada con éxito";
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();
            await cargarPalas();
        } else if (response.status === 403) {
            mostrarError("No tienes permisos para eliminar palas");
        } else {
            mostrarError("Error al eliminar la pala");
        }
    } catch (error) {
        console.error("Error:", error);
        mostrarError("Hubo un error al eliminar la pala");
    }
}

// Función auxiliar para mostrar errores
function mostrarError(mensaje) {
    document.getElementById('errorModalBody').textContent = mensaje;
    const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
    errorModal.show();
}
