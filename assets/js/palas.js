// CRUD de Palas - Frontend

let esAdmin = false;

function isAdminFromUser(usuario) {
    if (!usuario) return false;
    if (Array.isArray(usuario.roles)) {
        return usuario.roles.includes('ADMIN') || usuario.roles.includes('ROLE_ADMIN');
    }
    if (typeof usuario.role === 'string') {
        const r = usuario.role.toUpperCase();
        return r === 'ADMIN' || r === 'ROLE_ADMIN';
    }
    if (usuario.isAdmin === true) return true;
    return false;
}

// Comprobar sesión y roles al cargar la página
document.addEventListener("DOMContentLoaded", async function () {
    // Preferimos sessionStorage (se borra al cerrar pestaña), fallback a localStorage
    let usuarioConectadoStr = sessionStorage.getItem("usuarioConectado");
    if (!usuarioConectadoStr) usuarioConectadoStr = localStorage.getItem("usuarioConectado");

    let usuario = null;
    if (usuarioConectadoStr) {
        try {
            usuario = JSON.parse(usuarioConectadoStr);
        } catch (e) {
            console.error('Error parseando usuarioConectado', e);
            // limpiar si está corrupto
            sessionStorage.removeItem('usuarioConectado');
            localStorage.removeItem('usuarioConectado');
        }
    }

    esAdmin = isAdminFromUser(usuario);

    // Mostrar/ocultar botón de crear pala según rol admin
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
        col.className = "col d-flex";
        
        // Construir URL de la imagen
        const imagenUrl = pala.imagen 
            ? `http://localhost:8080${pala.imagen}` 
            : '/assets/images/palas/default.jpg';
        
        col.innerHTML = `
            <div class="card h-100 shadow-sm flex-fill">
                 <img src="${imagenUrl}" 
                     class="img-fluid card-img-top" 
                     alt="${pala.modelo}">
                                 <div class="card-body d-flex flex-column">
                                        <h5 class="card-title" style="min-height:3.6rem; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">${pala.marca} ${pala.modelo}</h5>
                                        <div class="card-text mb-1 pala-attrs" style="min-height:3.2rem;">
                                            <p class="mb-1"><small class="text-muted">Forma: ${pala.forma} | Peso: ${pala.peso}g</small></p>
                                            <p class="mb-0"><small class="text-muted">Dureza: ${pala.dureza} | Balance: ${pala.balance}</small></p>
                                        </div>
                                        <div class="mt-2 mt-auto d-flex justify-content-between align-items-center">
                                                ${pala.urlCompra ? `<a href="${pala.urlCompra}" target="_blank" class="text-primary fw-bold text-decoration-none">${pala.precio}€</a>` : `<p class="text-primary fw-bold mb-0">${pala.precio}€</p>`}
                                                <div class="d-flex align-items-center gap-2">
                                                        ${pala.urlCompra ? `` : ''}
                            ${esAdmin ? `
                                <button class="btn btn-warning btn-sm" onclick="editarPala(${pala.id})">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="mostrarConfirmEliminar(${pala.id}, '${pala.modelo}')">
                                    <i class="bi bi-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
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
    if (!ensureAdmin()) return;
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
    if (!ensureAdmin()) return;
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

// Mostrar modal de confirmación y ejecutar eliminación si confirman
function mostrarConfirmEliminar(id, nombre) {
    const body = document.getElementById('confirmModalBody');
    body.textContent = `¿Estás seguro de que deseas eliminar la pala "${nombre}"?`;

    const modalEl = document.getElementById('confirmModal');
    const confirmModal = new bootstrap.Modal(modalEl);
    const btn = document.getElementById('confirmModalBtnConfirm');

    const onConfirm = async () => {
        btn.removeEventListener('click', onConfirm);
        try {
            await eliminarPala(id);
        } catch (e) {
            console.error(e);
        }
        confirmModal.hide();
    };

    // Si cierran el modal de cualquier otra forma, quitar el listener para evitar fugas
    modalEl.addEventListener('hidden.bs.modal', () => {
        btn.removeEventListener('click', onConfirm);
    }, { once: true });

    btn.addEventListener('click', onConfirm);
    confirmModal.show();
}

// Eliminar pala (hace la petición al servidor)
async function eliminarPala(id) {
    if (!ensureAdmin()) return;
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

function ensureAdmin() {
    if (!esAdmin) {
        mostrarError('No tienes permisos para realizar esta acción');
        return false;
    }
    return true;
}
