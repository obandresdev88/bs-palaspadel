// RECOMENDADOR DE PALAS - Frontend

let currentStep = 1;
const totalSteps = 6;

// Actualizar progress bar
function updateProgressBar() {
    // El paso 1 (bienvenida) es 0%, los demás pasos avanzan normalmente
    const progress = currentStep === 1 ? 0 : ((currentStep - 1) / (totalSteps - 1)) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('progressBar').setAttribute('aria-valuenow', progress);
}

// Navegar a un paso
function goToStep(step) {
    // Validar antes de pasar al siguiente paso
    if (step > currentStep && !validateCurrentStep()) {
        return;
    }

    // Ocultar paso actual
    document.getElementById(`step-${currentStep}`).classList.add('d-none');

    // Mostrar nuevo paso
    currentStep = step;
    document.getElementById(`step-${currentStep}`).classList.remove('d-none');
    
    updateProgressBar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Validar campos del paso actual
function validateCurrentStep() {
    switch (currentStep) {
        case 2: // Nivel
            const nivel = document.getElementById('nivel').value;
            if (!nivel) {
                showValidationError('nivel', 'Por favor, selecciona tu nivel');
                return false;
            }
            clearValidationError('nivel');
            return true;

        case 3: // Estilo
            const estilo = document.querySelector('input[name="estilo"]:checked');
            if (!estilo) {
                showValidationError('estilo', 'Por favor, selecciona tu estilo de juego');
                return false;
            }
            clearValidationError('estilo');
            return true;

        case 4: // Lesiones
            // Lesiones siempre tiene valor por defecto, no es obligatorio
            return true;

        case 5: // Forma
            // Forma es opcional, permite vacío
            return true;

        case 6: // Presupuesto
            // Presupuesto siempre tiene valor (range input)
            return true;

        default:
            return true;
    }
}

// Mostrar error de validación
function showValidationError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.add('is-invalid');
        
        // Crear o actualizar mensaje de error inline
        let feedback = field.nextElementSibling;
        if (!feedback || !feedback.classList.contains('invalid-feedback')) {
            feedback = document.createElement('div');
            feedback.className = 'invalid-feedback d-block';
            field.parentNode.appendChild(feedback);
        }
        feedback.textContent = message;
        feedback.style.display = 'block';
    } else {
        // Para radio buttons, buscar el primer input del grupo
        const radioGroup = document.querySelector(`input[name="${fieldId}"]`);
        if (radioGroup) {
            const container = radioGroup.closest('.mb-3') || radioGroup.parentNode;
            container.classList.add('border', 'border-danger', 'rounded', 'p-2');
            
            let feedback = container.querySelector('.invalid-feedback');
            if (!feedback) {
                feedback = document.createElement('div');
                feedback.className = 'invalid-feedback d-block mt-2';
                container.appendChild(feedback);
            }
            feedback.textContent = message;
        }
    }
}

// Limpiar error de validación
function clearValidationError(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.remove('is-invalid');
        const feedback = field.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.style.display = 'none';
        }
    } else {
        // Para radio buttons
        const radioGroup = document.querySelector(`input[name="${fieldId}"]`);
        if (radioGroup) {
            const container = radioGroup.closest('.mb-3') || radioGroup.parentNode;
            container.classList.remove('border', 'border-danger', 'rounded', 'p-2');
            const feedback = container.querySelector('.invalid-feedback');
            if (feedback) {
                feedback.remove();
            }
        }
    }
}

// Actualizar display de presupuesto en tiempo real
document.addEventListener('DOMContentLoaded', function () {
    const presupuestoInput = document.getElementById('presupuesto');
    const presupuestoDisplay = document.getElementById('presupuesto-display');

    if (presupuestoInput) {
        presupuestoInput.addEventListener('input', function () {
            presupuestoDisplay.textContent = this.value + '€';
        });
    }

    updateProgressBar();
});

// Enviar formulario y obtener recomendación
async function submitRecommendation() {
    if (!validateCurrentStep()) {
        return;
    }

    // Recopilar datos del formulario
    const formData = {
        nivel: document.getElementById('nivel').value,
        estilo: document.querySelector('input[name="estilo"]:checked').value,
        lesionesPadel: document.querySelector('input[name="lesiones"]:checked').value === 'true',
        formaPreferida: document.getElementById('forma').value || null,
        presupuesto: parseFloat(document.getElementById('presupuesto').value)
    };

    console.log('Enviando recomendación:', formData);

    try {
        const response = await fetch('http://localhost:8080/api/recomendador', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const palas = await response.json();
            mostrarResultados(palas);
        } else if (response.status === 400) {
            const errorData = await response.json();
            alert('Error: ' + (errorData.message || 'Datos inválidos'));
        } else {
            alert('Error al obtener la recomendación. Por favor, intenta de nuevo.');
        }
    } catch (error) {
        console.error('Error en la petición:', error);
        alert('Hubo un error al conectar con el servidor');
    }
}

// Mostrar resultados
function mostrarResultados(palas) {
    // Ocultar formulario
    document.getElementById('recommendationForm').classList.add('d-none');

    // Mostrar contenedor de resultados
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.classList.remove('d-none');

    // Renderizar palas
    const container = document.getElementById('palasRecomendadas');
    container.innerHTML = '';

    // Ordenar palas por puntuación (descendente) si viene en la respuesta
    const palasOrdenadas = palas.sort((a, b) => {
        const puntuacionA = a.puntuacion || 0;
        const puntuacionB = b.puntuacion || 0;
        return puntuacionB - puntuacionA;
    });

    palasOrdenadas.forEach((pala, index) => {
        const imagenUrl = pala.imagen 
            ? `http://localhost:8080${pala.imagen}` 
            : '/assets/images/palas/default.jpg';

        const badgeColor = index === 0 ? '#FFD700' : (index === 1 ? '#C0C0C0' : '#CD7F32');
        const badgeText = index === 0 ? '1' : (index === 1 ? '2' : '3');

        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4';
        col.innerHTML = `
            <div class="card h-100 shadow-sm position-relative">
                <!-- Badge de ranking -->
                <div style="position: absolute; top: 10px; right: 10px; background-color: ${badgeColor}; 
                            color: white; width: 40px; height: 40px; border-radius: 50%; 
                            display: flex; align-items: center; justify-content: center; 
                            font-weight: bold; font-size: 1.2rem; z-index: 10;">
                    ${badgeText}
                </div>

                <img src="${imagenUrl}" 
                     class="img-fluid card-img-top" 
                     alt="${pala.modelo}"
                     style="height: 250px; object-fit: contain;">
                
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title" style="min-height:3.6rem; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">
                        ${pala.marca} ${pala.modelo}
                    </h5>
                    
                    <div class="card-text mb-1 pala-attrs" style="min-height:3.2rem;">
                        <p class="mb-1"><small class="text-muted">Forma: ${pala.forma} | Peso: ${pala.peso}g</small></p>
                        <p class="mb-0"><small class="text-muted">Dureza: ${pala.dureza} | Balance: ${pala.balance}</small></p>
                    </div>

                    ${pala.puntuacion ? `
                        <div class="mt-2 mb-2">
                            <small class="text-success fw-bold">Compatibilidad: ${Math.round(pala.puntuacion)}%</small>
                        </div>
                    ` : ''}

                    <div class="mt-auto d-flex justify-content-between align-items-center">
                        ${pala.urlCompra ? `<a href="${pala.urlCompra}" target="_blank" class="text-primary fw-bold text-decoration-none">${pala.precio}€</a>` : `<p class="text-primary fw-bold mb-0">${pala.precio}€</p>`}
                        <div class="d-flex align-items-center gap-2">
                            ${pala.urlCompra ? `<a href="${pala.urlCompra}" target="_blank" class="btn btn-primary btn-sm">Comprar</a>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(col);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Reiniciar wizard
function resetWizard() {
    // Limpiar formulario
    document.getElementById('nivel').value = '';
    document.querySelectorAll('input[name="estilo"]').forEach(el => el.checked = false);
    document.querySelectorAll('input[name="lesiones"]').forEach((el, i) => el.checked = i === 0);
    document.getElementById('forma').value = '';
    document.getElementById('presupuesto').value = '250';
    document.getElementById('presupuesto-display').textContent = '250€';

    // Mostrar formulario, ocultar resultados
    document.getElementById('recommendationForm').classList.remove('d-none');
    document.getElementById('resultsContainer').classList.add('d-none');

    // Volver al paso 1
    document.querySelectorAll('.step-content').forEach(el => el.classList.add('d-none'));
    currentStep = 1;
    document.getElementById('step-1').classList.remove('d-none');
    updateProgressBar();
}
