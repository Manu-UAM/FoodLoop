// ================================================================
// REGISTRO · JAVASCRIPT COMPLETO (CORREGIDO - SIN ERRORES)
// ================================================================

// ===== ELEMENTOS =====
const togglePassword = document.getElementById('togglePassword');
const togglePasswordConfirm = document.getElementById('togglePasswordConfirm');
const passwordInput = document.getElementById('password');
const passwordConfirmInput = document.getElementById('password_confirm');
const modoDaltonico = document.getElementById('modoDaltonico');
const textoGrande = document.getElementById('textoGrande');
const body = document.body;

// ===== PASOS =====
let currentStep = 1;
let tipoUsuario = null;
let fotoSubida = false;
let codigoVerificado = false;
let codigoRestauranteVerificado = false;
let contadorRedireccion = 5;

const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');
const step4 = document.getElementById('step4');
const step1Indicator = document.getElementById('step1Indicator');
const step2Indicator = document.getElementById('step2Indicator');
const step3Indicator = document.getElementById('step3Indicator');
const step4Indicator = document.getElementById('step4Indicator');
const stepTitle = document.getElementById('stepTitle');
const stepSubtitle = document.getElementById('stepSubtitle');

// ===== TIPO DE USUARIO =====
const tipoCards = document.querySelectorAll('.tipo-usuario-card');

// ===== ELEMENTOS DE VERIFICACIÓN WHATSAPP (CONSUMIDOR) =====
const verificacionContainer = document.getElementById('verificacionWhatsappContainer');
const telefonoMostrado = document.getElementById('telefonoMostrado');
const codigoInput = document.getElementById('codigoVerificacion');
const codigoError = document.getElementById('codigoError');
const btnReenviar = document.getElementById('btnReenviar');
const reenviarMensaje = document.getElementById('reenviarMensaje');
const CODIGO_SIMULADO = '123456';

// ===== ELEMENTOS DE VERIFICACIÓN WHATSAPP (RESTAURANTE) =====
const verificacionRestauranteContainer = document.getElementById('verificacionWhatsappRestauranteContainer');
const telefonoRestauranteMostrado = document.getElementById('telefonoRestauranteMostrado');
const codigoRestauranteInput = document.getElementById('codigoVerificacionRestaurante');
const codigoRestauranteError = document.getElementById('codigoErrorRestaurante');
const btnReenviarRestaurante = document.getElementById('btnReenviarCodigoRestaurante');
const reenviarMensajeRestaurante = document.getElementById('reenviarMensajeRestaurante');
const CODIGO_SIMULADO_RESTAURANTE = '123456';

// ===== ELEMENTOS DE WHATSAPP RESTAURANTE (para mostrar/ocultar) =====
const whatsappRestaurante = document.getElementById('whatsappRestaurante');
const whatsappRestauranteField = document.getElementById('whatsappRestauranteField');
const telefonoWhatsappRestaurante = document.getElementById('telefonoWhatsappRestaurante');

// ===== ELEMENTOS DE NOTIFICACIONES (CONSUMIDOR) =====
const notificacionWhatsapp = document.getElementById('notificacionWhatsapp');
const whatsappField = document.getElementById('whatsappField');
const telefonoWhatsapp = document.getElementById('telefonoWhatsapp');

// ===== CATEGORÍA "OTRO" =====
const categoriaSelect = document.getElementById('categoria');
const otroCategoriaField = document.getElementById('otroCategoriaField');

// ===== SUBIR FOTO =====
const btnTomarFoto = document.getElementById('btnTomarFoto');

// ===== MODAL DE NIVELES =====
const modalNiveles = document.getElementById('modalNiveles');
const btnInfoNiveles = document.getElementById('btnInfoNiveles');
const modalClose = document.getElementById('modalClose');

// ===== MODAL DE ÉXITO =====
const modalExito = document.getElementById('modalExito');
const contadorElemento = document.getElementById('contadorRedireccion');
const btnIrLogin = document.getElementById('btnIrLogin');

// ===== TÉRMINOS =====
const terminosCheck = document.getElementById('terminos');
const privacidadCheck = document.getElementById('privacidad');
const veridicidadCheck = document.getElementById('veridicidad');
const btnSubmit = document.getElementById('btnSubmit');

// ================================================================
// MOSTRAR/OCULTAR CONTRASEÑA
// ================================================================
if (togglePassword) {
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        const icon = this.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });
}

if (togglePasswordConfirm) {
    togglePasswordConfirm.addEventListener('click', function() {
        const type = passwordConfirmInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordConfirmInput.setAttribute('type', type);
        const icon = this.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });
}

// ================================================================
// PREFERENCIAS (MODO DALTÓNICO Y TEXTO GRANDE)
// ================================================================
if (modoDaltonico) {
    modoDaltonico.addEventListener('change', function() {
        actualizarPreferencia('modoDaltonico', this.checked);
        setTimeout(forzarActualizacionCompleta, 100);
    });
}

if (textoGrande) {
    textoGrande.addEventListener('change', function() {
        actualizarPreferencia('textoGrande', this.checked);
        setTimeout(forzarActualizacionCompleta, 100);
    });
}

// ================================================================
// BOTONES "REGRESAR AL LOGIN"
// ================================================================
document.querySelectorAll('[id^="btnBackLogin"]').forEach(btn => {
    btn.addEventListener('click', function() {
        if (confirm('¿Seguro que quieres salir? Perderás el progreso del registro.')) {
            window.location.href = '../login.html';
        }
    });
});

// ================================================================
// MODAL DE NIVELES
// ================================================================
if (btnInfoNiveles && modalNiveles) {
    btnInfoNiveles.addEventListener('click', function() {
        modalNiveles.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
}

if (modalClose && modalNiveles) {
    modalClose.addEventListener('click', function() {
        modalNiveles.classList.remove('active');
        document.body.style.overflow = '';
    });
}

if (modalNiveles) {
    modalNiveles.addEventListener('click', function(e) {
        if (e.target === this) {
            modalNiveles.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    modalNiveles.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modalNiveles.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// ================================================================
// FUNCIONES DE NAVEGACIÓN PRINCIPALES
// ================================================================
function goToStep(step) {
    if (step < 1 || step > 4) return;
    currentStep = step;
    updateStepUI();
    setTimeout(function() {
        forzarActualizacionCompleta();
    }, 100);
}

function updateStepUI() {
    // Activar/desactivar pasos
    if (step1) step1.classList.toggle('active', currentStep === 1);
    if (step2) step2.classList.toggle('active', currentStep === 2);
    if (step3) step3.classList.toggle('active', currentStep === 3);
    if (step4) step4.classList.toggle('active', currentStep === 4);

    // Actualizar indicadores
    if (step1Indicator) step1Indicator.classList.toggle('active', currentStep === 1);
    if (step2Indicator) step2Indicator.classList.toggle('active', currentStep === 2);
    if (step3Indicator) step3Indicator.classList.toggle('active', currentStep === 3);
    if (step4Indicator) step4Indicator.classList.toggle('active', currentStep === 4);

    const lines = document.querySelectorAll('.step-line');
    lines.forEach((line, index) => {
        line.classList.toggle('active', index < currentStep - 1);
    });

    // Títulos de los pasos
    const titles = {
        1: { title: 'Tipo de Usuario', sub: 'Cuéntanos quién eres' },
        2: {
            title: tipoUsuario === 'consumidor' ? 'Datos Personales' : 'Datos del Restaurante',
            sub: tipoUsuario === 'consumidor' ? 'Ingresa tus datos' : 'Completa los datos de tu negocio'
        },
        3: {
            title: tipoUsuario === 'consumidor' ? 'Preferencias' : 'Verifica tu restaurante',
            sub: tipoUsuario === 'consumidor' ? 'Elige tu región y notificaciones' : 'Sube una foto y verifica tu WhatsApp'
        },
        4: { title: 'Confirmación', sub: 'Revisa y acepta los términos' }
    };

    const current = titles[currentStep] || titles[1];
    if (stepTitle) stepTitle.textContent = current.title;
    if (stepSubtitle) stepSubtitle.textContent = current.sub;

    // Cambiar label del paso 3 en el indicador
    const step3Label = document.getElementById('step3Label');
    if (step3Label) {
        if (tipoUsuario === 'consumidor') {
            step3Label.textContent = 'Preferencias';
        } else {
            step3Label.textContent = 'Verifica';
        }
    }

    // Mostrar contenido según paso y rol
    mostrarContenidoPorPaso();

    // Botones: ocultar todos y mostrar los del paso actual
    document.querySelectorAll('.step-buttons, .sub-step-buttons, .step1-buttons, .step3a-buttons').forEach(el => {
        if (el) el.style.display = 'none';
    });

    if (currentStep === 1) {
        const el = document.querySelector('#step1 .step-buttons');
        if (el) el.style.display = 'flex';
    } else if (currentStep === 2) {
        if (tipoUsuario === 'consumidor') {
            const el = document.querySelector('#datos-consumidor .step-buttons');
            if (el) el.style.display = 'flex';
        } else if (tipoUsuario === 'restaurante') {
            const el = document.querySelector('.sub-step-buttons');
            if (el) el.style.display = 'flex';
        }
    } else if (currentStep === 3) {
        if (tipoUsuario === 'consumidor') {
            const el = document.querySelector('#step3-buttons-consumidor');
            if (el) el.style.display = 'flex';
        } else {
            const el = document.querySelector('#step3-buttons-restaurante');
            if (el) el.style.display = 'flex';
        }
    } else if (currentStep === 4) {
        const el = document.querySelector('#step4-buttons');
        if (el) el.style.display = 'flex';
    }

    actualizarBotonSubmit();

    setTimeout(() => {
        const primerInput = document.querySelector('.step-content.active input:not([type="hidden"]), .step-content.active select');
        if (primerInput) primerInput.focus();
    }, 100);

    setTimeout(forzarActualizacionCompleta, 100);
}

function mostrarContenidoPorPaso() {
    const datosConsumidor = document.getElementById('datos-consumidor');
    const datosRestaurante = document.getElementById('datos-restaurante');
    const step3ConsumidorContent = document.getElementById('step3-consumidor-content');
    const step3RestauranteContent = document.getElementById('step3-restaurante-content');

    // Ocultar todo
    if (datosConsumidor) datosConsumidor.style.display = 'none';
    if (datosRestaurante) datosRestaurante.style.display = 'none';
    if (step3ConsumidorContent) step3ConsumidorContent.style.display = 'none';
    if (step3RestauranteContent) step3RestauranteContent.style.display = 'none';

    if (currentStep === 2) {
        if (tipoUsuario === 'consumidor') {
            if (datosConsumidor) datosConsumidor.style.display = 'block';
        } else if (tipoUsuario === 'restaurante') {
            if (datosRestaurante) datosRestaurante.style.display = 'block';
        }
    } else if (currentStep === 3) {
        if (tipoUsuario === 'consumidor') {
            if (step3ConsumidorContent) step3ConsumidorContent.style.display = 'block';
            // Mostrar verificación WhatsApp si aplica
            const whatsappCheck = document.getElementById('notificacionWhatsapp');
            if (whatsappCheck && whatsappCheck.checked) {
                const container = document.getElementById('verificacionWhatsappContainer');
                if (container) container.style.display = 'block';
            }
        } else if (tipoUsuario === 'restaurante') {
            if (step3RestauranteContent) step3RestauranteContent.style.display = 'block';
            // Mostrar verificación WhatsApp si aplica
            const whatsappCheck = document.getElementById('whatsappRestaurante');
            if (whatsappCheck && whatsappCheck.checked) {
                const container = document.getElementById('verificacionWhatsappRestauranteContainer');
                if (container) container.style.display = 'block';
            }
        }
    }
}

// ================================================================
// VALIDACIONES
// ================================================================
function mostrarErrorCampo(input, mensaje) {
    input.classList.add('error');
    const existingError = input.parentElement.querySelector('.error-message');
    if (existingError) existingError.remove();
    const errorMsg = document.createElement('span');
    errorMsg.className = 'error-message';
    errorMsg.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${mensaje}`;
    input.parentElement.appendChild(errorMsg);
}

function limpiarErrorCampo(input) {
    input.classList.remove('error');
    const existingError = input.parentElement.querySelector('.error-message');
    if (existingError) existingError.remove();
}

function validateStep2Consumidor() {
    const nombre = document.getElementById('nombre');
    const apellido = document.getElementById('apellido');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const passwordConfirm = document.getElementById('password_confirm');
    let hasError = false;

    [nombre, apellido, email, password, passwordConfirm].forEach(limpiarErrorCampo);

    if (!nombre.value || nombre.value.trim().length < 2) {
        mostrarErrorCampo(nombre, 'El nombre debe tener al menos 2 caracteres');
        hasError = true;
    }
    if (!apellido.value || apellido.value.trim().length < 2) {
        mostrarErrorCampo(apellido, 'El apellido debe tener al menos 2 caracteres');
        hasError = true;
    }
    if (!email.value || !email.value.includes('@')) {
        mostrarErrorCampo(email, 'Ingresa un correo electrónico válido');
        hasError = true;
    }
    if (!password.value || password.value.length < 6) {
        mostrarErrorCampo(password, 'La contraseña debe tener al menos 6 caracteres');
        hasError = true;
    }
    if (!passwordConfirm.value || passwordConfirm.value !== password.value) {
        mostrarErrorCampo(passwordConfirm, 'Las contraseñas no coinciden');
        hasError = true;
    }

    if (hasError) {
        const primerError = document.querySelector('.form-group input.error');
        if (primerError) primerError.focus();
        return false;
    }
    return true;
}

// ================================================================
// SUB-PASOS PARA RESTAURANTE (dentro del paso 2)
// ================================================================
let currentSubStep = 0;
const totalSubSteps = 5;

function mostrarSubPaso(index) {
    const subContents = document.querySelectorAll('.sub-step-content');
    const subSteps = document.querySelectorAll('.sub-step');
    const subLines = document.querySelectorAll('.sub-step-line');

    subContents.forEach(el => el.style.display = 'none');
    const target = document.querySelector(`.sub-step-content[data-sub="${index}"]`);
    if (target) target.style.display = 'block';

    subSteps.forEach((el, i) => {
        el.classList.toggle('active', i === index);
    });
    subLines.forEach((el, i) => {
        el.classList.toggle('active', i < index);
    });

    const btnPrevSub = document.getElementById('btnPrevSub');
    if (btnPrevSub) {
        btnPrevSub.style.display = index === 0 ? 'none' : 'inline-flex';
    }

    const btnNextSub = document.getElementById('btnNextSub');
    if (btnNextSub) {
        btnNextSub.innerHTML = index === totalSubSteps - 1
            ? 'Finalizar <i class="fas fa-check" aria-hidden="true"></i>'
            : 'Siguiente <i class="fas fa-arrow-right" aria-hidden="true"></i>';
    }

    currentSubStep = index;
}

function validateCurrentSubStep() {
    const currentContent = document.querySelector(`.sub-step-content[data-sub="${currentSubStep}"]`);
    if (!currentContent) return true;

    const inputs = currentContent.querySelectorAll('input[required], select[required]');
    let hasError = false;

    inputs.forEach(input => {
        limpiarErrorCampo(input);
        if (!input.value || input.value.trim() === '') {
            mostrarErrorCampo(input, 'Este campo es obligatorio');
            hasError = true;
        }
    });

    if (hasError) {
        const firstError = currentContent.querySelector('.error');
        if (firstError) firstError.focus();
        return false;
    }
    return true;
}

function nextSubStep() {
    if (!validateCurrentSubStep()) return;

    if (currentSubStep < totalSubSteps - 1) {
        mostrarSubPaso(currentSubStep + 1);
    } else {
        // Último sub-paso: ir al paso 3
        goToStep(3);
    }
}

function prevSubStep() {
    if (currentSubStep > 0) {
        mostrarSubPaso(currentSubStep - 1);
    } else {
        goToStep(1);
    }
}

// ================================================================
// FUNCIONES DE NAVEGACIÓN (NEXT / PREV / SKIP)
// ================================================================
function nextStep() {
    console.log('🔍 nextStep() - Paso actual:', currentStep, 'Tipo:', tipoUsuario);

    if (currentStep === 1) {
        if (!tipoUsuario) {
            alert('⚠️ Por favor, selecciona un tipo de usuario.');
            return;
        }
        // Limpiar campos del tipo contrario al cambiar
        if (tipoUsuario === 'consumidor') {
            // Limpiar campos de restaurante (por si acaso)
            document.getElementById('nombreRestaurante').value = '';
            document.getElementById('emailRestaurante').value = '';
            document.getElementById('passwordRestaurante').value = '';
            document.getElementById('passwordConfirmRestaurante').value = '';
            // reset sub-paso
            currentSubStep = 0;
        } else {
            // Limpiar campos de consumidor
            document.getElementById('nombre').value = '';
            document.getElementById('apellido').value = '';
            document.getElementById('email').value = '';
            document.getElementById('password').value = '';
            document.getElementById('password_confirm').value = '';
        }
        mostrarContenidoPorPaso();
        goToStep(2);
        return;
    }

    if (currentStep === 2) {
        if (tipoUsuario === 'consumidor') {
            if (!validateStep2Consumidor()) return;
            goToStep(3);
            return;
        } else if (tipoUsuario === 'restaurante') {
            // Los sub-pasos manejan la navegación
            return;
        }
    }

    if (currentStep === 3) {
        if (tipoUsuario === 'consumidor') {
            const whatsappCheck = document.getElementById('notificacionWhatsapp');
            if (whatsappCheck && whatsappCheck.checked) {
                if (!codigoVerificado) {
                    alert('⚠️ Debes verificar tu número de WhatsApp con el código enviado.');
                    if (codigoInput) codigoInput.focus();
                    return;
                }
            }
            goToStep(4);
            return;
        } else if (tipoUsuario === 'restaurante') {
            if (!fotoSubida) {
                if (!confirm('⚠️ No has subido foto de tu local.\n\n¿Continuar sin foto?')) {
                    return;
                }
            }
            const whatsappCheck = document.getElementById('whatsappRestaurante');
            if (whatsappCheck && whatsappCheck.checked) {
                if (!codigoRestauranteVerificado) {
                    alert('⚠️ Debes verificar tu número de WhatsApp con el código enviado.');
                    if (codigoRestauranteInput) codigoRestauranteInput.focus();
                    return;
                }
            }
            goToStep(4);
            return;
        }
    }

    if (currentStep === 4) {
        console.log('ℹ️ Ya estás en el último paso');
        return;
    }

    if (currentStep < 4) {
        goToStep(currentStep + 1);
    }
}

function prevStep() {
    if (currentStep === 2 && tipoUsuario === 'restaurante') {
        if (currentSubStep > 0) {
            prevSubStep();
            return;
        }
        goToStep(1);
        return;
    }

    if (currentStep === 3) {
        if (tipoUsuario === 'restaurante') {
            goToStep(2);
            setTimeout(() => mostrarSubPaso(totalSubSteps - 1), 100);
            return;
        } else {
            goToStep(2);
            return;
        }
    }

    if (currentStep === 4) {
        goToStep(3);
        return;
    }

    if (currentStep > 1) {
        goToStep(currentStep - 1);
    }
}

function omitirStep3() {
    // Saltar al paso 4 sin validar WhatsApp
    goToStep(4);
}

// ================================================================
// SELECCIÓN DE TIPO DE USUARIO
// ================================================================
if (tipoCards) {
    tipoCards.forEach(card => {
        card.addEventListener('click', function() {
            seleccionarTipoUsuario(this);
        });
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                seleccionarTipoUsuario(this);
            }
        });
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'radio');
    });
}

function seleccionarTipoUsuario(card) {
    tipoCards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    tipoUsuario = card.dataset.tipo;

    tipoCards.forEach(c => c.setAttribute('aria-checked', 'false'));
    card.setAttribute('aria-checked', 'true');

    // Limpiar campos del tipo contrario
    if (tipoUsuario === 'restaurante') {
        // Limpiar consumidor
        document.getElementById('nombre').value = '';
        document.getElementById('apellido').value = '';
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password_confirm').value = '';
        const wpp = document.getElementById('notificacionWhatsapp');
        if (wpp) wpp.checked = false;
        document.getElementById('whatsappField').style.display = 'none';
        document.getElementById('telefonoWhatsapp').value = '';
        document.getElementById('telefonoWhatsapp').required = false;
        if (verificacionContainer) verificacionContainer.style.display = 'none';
        codigoVerificado = false;
    } else {
        // Limpiar restaurante
        document.getElementById('nombreRestaurante').value = '';
        document.getElementById('emailRestaurante').value = '';
        document.getElementById('passwordRestaurante').value = '';
        document.getElementById('passwordConfirmRestaurante').value = '';
        document.getElementById('regionRestaurante').value = '';
        document.getElementById('calle').value = '';
        document.getElementById('numero').value = '';
        document.getElementById('colonia').value = '';
        document.getElementById('ciudad').value = '';
        document.getElementById('codigoPostal').value = '';
        document.getElementById('categoria').value = '';
        document.getElementById('horarioApertura').value = '';
        document.getElementById('horarioCierre').value = '';
        document.getElementById('telefonoLocal').value = '';
        document.getElementById('telefonoWhatsappRestaurante').value = '';
        document.getElementById('whatsappRestaurante').checked = false;
        document.getElementById('whatsappRestauranteField').style.display = 'none';
        if (verificacionRestauranteContainer) verificacionRestauranteContainer.style.display = 'none';
        codigoRestauranteVerificado = false;
        fotoSubida = false;
        document.getElementById('fotoStatus').textContent = '📷 Sin foto';
        document.getElementById('fotoStatus').classList.remove('tiene-foto');
        currentSubStep = 0;
        // Reset sub-pasos
        const subContents = document.querySelectorAll('.sub-step-content');
        subContents.forEach((el, i) => {
            el.style.display = i === 0 ? 'block' : 'none';
        });
        const subSteps = document.querySelectorAll('.sub-step');
        subSteps.forEach((el, i) => {
            el.classList.toggle('active', i === 0);
        });
        const subLines = document.querySelectorAll('.sub-step-line');
        subLines.forEach(el => el.classList.remove('active'));
        const btnPrevSub = document.getElementById('btnPrevSub');
        if (btnPrevSub) btnPrevSub.style.display = 'none';
        const btnNextSub = document.getElementById('btnNextSub');
        if (btnNextSub) btnNextSub.innerHTML = 'Siguiente <i class="fas fa-arrow-right" aria-hidden="true"></i>';
    }

    // Actualizar label del paso 3
    const step3Label = document.getElementById('step3Label');
    if (step3Label) {
        if (tipoUsuario === 'consumidor') {
            step3Label.textContent = 'Preferencias';
        } else {
            step3Label.textContent = 'Verifica';
        }
    }

    actualizarBotonSubmit();
}

// ================================================================
// NOTIFICACIONES: Mostrar campo de WhatsApp (CONSUMIDOR)
// ================================================================
if (notificacionWhatsapp) {
    notificacionWhatsapp.addEventListener('change', function() {
        if (this.checked) {
            if (whatsappField) whatsappField.style.display = 'block';
            if (telefonoWhatsapp) {
                telefonoWhatsapp.required = true;
                setTimeout(() => telefonoWhatsapp.focus(), 300);
            }
        } else {
            if (whatsappField) whatsappField.style.display = 'none';
            if (telefonoWhatsapp) {
                telefonoWhatsapp.required = false;
                telefonoWhatsapp.value = '';
                limpiarErrorCampo(telefonoWhatsapp);
            }
            if (verificacionContainer) verificacionContainer.style.display = 'none';
            if (codigoInput) {
                codigoInput.value = '';
                codigoInput.classList.remove('verificado');
                codigoInput.style.borderColor = '';
                codigoInput.style.outline = '';
            }
            if (codigoError) codigoError.style.display = 'none';
            codigoVerificado = false;
            actualizarBotonSubmit();
        }
    });
}

// ================================================================
// CATEGORÍA "OTRO"
// ================================================================
if (categoriaSelect) {
    categoriaSelect.addEventListener('change', function() {
        if (this.value === 'otro') {
            if (otroCategoriaField) otroCategoriaField.style.display = 'block';
            const otroText = document.getElementById('otroCategoriaTexto');
            if (otroText) otroText.required = true;
            setTimeout(() => otroText.focus(), 300);
        } else {
            if (otroCategoriaField) otroCategoriaField.style.display = 'none';
            const otroText = document.getElementById('otroCategoriaTexto');
            if (otroText) {
                otroText.required = false;
                limpiarErrorCampo(otroText);
            }
        }
    });
}

// ================================================================
// WHATSAPP RESTAURANTE - Actualizar número mostrado
// ================================================================
if (telefonoWhatsappRestaurante) {
    telefonoWhatsappRestaurante.addEventListener('input', function() {
        const telefonoRestauranteMostrado = document.getElementById('telefonoRestauranteMostrado');
        if (telefonoRestauranteMostrado && this.value.trim().length >= 10) {
            telefonoRestauranteMostrado.textContent = this.value.trim();
        }
    });
}

// ================================================================
// SUBIR FOTO
// ================================================================
if (btnTomarFoto) {
    btnTomarFoto.addEventListener('click', function() {
        const status = document.getElementById('fotoStatus');
        if (status) {
            status.textContent = '✅ Foto tomada';
            status.classList.add('tiene-foto');
        }
        fotoSubida = true;
        this.innerHTML = '<i class="fas fa-check"></i> Foto tomada';
        this.style.background = 'var(--color-primary-dark)';
        const box = this.closest('.foto-local-box');
        if (box) {
            box.style.borderColor = 'var(--color-primary)';
            box.style.background = 'rgba(88, 129, 87, 0.1)';
            setTimeout(() => {
                box.style.background = 'rgba(255, 255, 255, 0.5)';
            }, 500);
        }
    });
}

// ================================================================
// VERIFICACIÓN WHATSAPP (CONSUMIDOR)
// ================================================================
function mostrarVerificacionWhatsApp() {
    const whatsappActivado = document.getElementById('notificacionWhatsapp');
    const telefono = document.getElementById('telefonoWhatsapp');

    if (whatsappActivado && whatsappActivado.checked && telefono && telefono.value.trim().length >= 10) {
        if (verificacionContainer) verificacionContainer.style.display = 'block';
        if (telefonoMostrado) telefonoMostrado.textContent = telefono.value.trim();
        if (codigoInput) {
            codigoInput.value = '';
            codigoInput.classList.remove('verificado');
            codigoInput.style.borderColor = '';
            codigoInput.style.outline = '';
            limpiarErrorCampo(codigoInput);
        }
        if (codigoError) codigoError.style.display = 'none';
        codigoVerificado = false;
        actualizarBotonSubmit();
    } else {
        if (verificacionContainer) verificacionContainer.style.display = 'none';
        codigoVerificado = false;
    }
}

if (telefonoWhatsapp) {
    telefonoWhatsapp.addEventListener('input', function() {
        limpiarErrorCampo(this);
        if (this.value.trim().length >= 10) {
            mostrarVerificacionWhatsApp();
        } else {
            if (verificacionContainer) verificacionContainer.style.display = 'none';
            codigoVerificado = false;
            actualizarBotonSubmit();
        }
    });
}

if (codigoInput) {
    codigoInput.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '');
        limpiarErrorCampo(this);
        this.classList.remove('verificado');
        if (codigoError) codigoError.style.display = 'none';

        if (this.value.length === 6) {
            if (this.value === CODIGO_SIMULADO) {
                this.classList.add('verificado');
                codigoVerificado = true;
                if (codigoError) codigoError.style.display = 'none';
                console.log('✅ Código WhatsApp consumidor verificado');
                actualizarBotonSubmit();
            } else {
                mostrarErrorCampo(this, 'Código incorrecto. Intenta nuevamente.');
                codigoVerificado = false;
                actualizarBotonSubmit();
            }
        } else {
            codigoVerificado = false;
            actualizarBotonSubmit();
        }
    });
}

if (btnReenviar) {
    btnReenviar.addEventListener('click', function() {
        this.disabled = true;
        if (reenviarMensaje) reenviarMensaje.style.display = 'block';
        if (codigoInput) {
            codigoInput.value = '';
            codigoInput.classList.remove('verificado');
            codigoInput.style.borderColor = '';
            codigoInput.style.outline = '';
            limpiarErrorCampo(codigoInput);
            codigoInput.focus();
        }
        if (codigoError) codigoError.style.display = 'none';
        codigoVerificado = false;
        actualizarBotonSubmit();

        setTimeout(() => {
            this.disabled = false;
            setTimeout(() => {
                if (reenviarMensaje) reenviarMensaje.style.display = 'none';
            }, 3000);
        }, 2000);
    });
}

// ================================================================
// VERIFICACIÓN WHATSAPP (RESTAURANTE)
// ================================================================
function mostrarVerificacionWhatsAppRestaurante() {
    const whatsappCheck = document.getElementById('whatsappRestaurante');
    const telefonoInput = document.getElementById('telefonoWhatsappRestaurante');

    if (whatsappCheck && whatsappCheck.checked && telefonoInput && telefonoInput.value.trim().length >= 10) {
        if (verificacionRestauranteContainer) verificacionRestauranteContainer.style.display = 'block';
        if (telefonoRestauranteMostrado) telefonoRestauranteMostrado.textContent = telefonoInput.value.trim();
        if (codigoRestauranteInput) {
            codigoRestauranteInput.value = '';
            codigoRestauranteInput.classList.remove('verificado');
            codigoRestauranteInput.style.borderColor = '';
            codigoRestauranteInput.style.outline = '';
            limpiarErrorCampo(codigoRestauranteInput);
        }
        if (codigoRestauranteError) codigoRestauranteError.style.display = 'none';
        codigoRestauranteVerificado = false;
        actualizarBotonSubmit();
    } else {
        if (verificacionRestauranteContainer) verificacionRestauranteContainer.style.display = 'none';
        codigoRestauranteVerificado = false;
    }
}

if (codigoRestauranteInput) {
    codigoRestauranteInput.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '');
        limpiarErrorCampo(this);
        this.classList.remove('verificado');
        if (codigoRestauranteError) codigoRestauranteError.style.display = 'none';

        if (this.value.length === 6) {
            if (this.value === CODIGO_SIMULADO_RESTAURANTE) {
                this.classList.add('verificado');
                codigoRestauranteVerificado = true;
                if (codigoRestauranteError) codigoRestauranteError.style.display = 'none';
                console.log('✅ Código WhatsApp restaurante verificado');
                actualizarBotonSubmit();
            } else {
                mostrarErrorCampo(this, 'Código incorrecto. Intenta nuevamente.');
                codigoRestauranteVerificado = false;
                actualizarBotonSubmit();
            }
        } else {
            codigoRestauranteVerificado = false;
            actualizarBotonSubmit();
        }
    });
}

if (btnReenviarRestaurante) {
    btnReenviarRestaurante.addEventListener('click', function() {
        this.disabled = true;
        if (reenviarMensajeRestaurante) reenviarMensajeRestaurante.style.display = 'block';
        if (codigoRestauranteInput) {
            codigoRestauranteInput.value = '';
            codigoRestauranteInput.classList.remove('verificado');
            codigoRestauranteInput.style.borderColor = '';
            codigoRestauranteInput.style.outline = '';
            limpiarErrorCampo(codigoRestauranteInput);
            codigoRestauranteInput.focus();
        }
        if (codigoRestauranteError) codigoRestauranteError.style.display = 'none';
        codigoRestauranteVerificado = false;
        actualizarBotonSubmit();

        setTimeout(() => {
            this.disabled = false;
            setTimeout(() => {
                if (reenviarMensajeRestaurante) reenviarMensajeRestaurante.style.display = 'none';
            }, 3000);
        }, 2000);
    });
}

// ================================================================
// WHATSAPP PARA RESTAURANTES (mostrar/ocultar campo)
// ================================================================
if (whatsappRestaurante) {
    whatsappRestaurante.addEventListener('change', function() {
        if (this.checked) {
            if (whatsappRestauranteField) whatsappRestauranteField.style.display = 'block';
            if (telefonoWhatsappRestaurante) {
                telefonoWhatsappRestaurante.required = true;
                setTimeout(() => telefonoWhatsappRestaurante.focus(), 300);
            }
        } else {
            if (whatsappRestauranteField) whatsappRestauranteField.style.display = 'none';
            if (telefonoWhatsappRestaurante) {
                telefonoWhatsappRestaurante.required = false;
                telefonoWhatsappRestaurante.value = '';
                limpiarErrorCampo(telefonoWhatsappRestaurante);
            }
            if (verificacionRestauranteContainer) verificacionRestauranteContainer.style.display = 'none';
            codigoRestauranteVerificado = false;
            actualizarBotonSubmit();
        }
    });
}

// ================================================================
// BOTÓN "CREAR CUENTA" HABILITADO
// ================================================================
function actualizarBotonSubmit() {
    if (currentStep === 4 && btnSubmit) {
        const terminosOk = terminosCheck && terminosCheck.checked && privacidadCheck && privacidadCheck.checked && veridicidadCheck && veridicidadCheck.checked;

        let codigoOk = true;
        const whatsappActivado = document.getElementById('notificacionWhatsapp');
        if (whatsappActivado && whatsappActivado.checked && telefonoWhatsapp && telefonoWhatsapp.value.trim().length >= 10) {
            codigoOk = codigoVerificado;
        }

        if (tipoUsuario === 'restaurante') {
            const whatsappRestCheck = document.getElementById('whatsappRestaurante');
            const telefonoWhatsappRest = document.getElementById('telefonoWhatsappRestaurante');
            if (whatsappRestCheck && whatsappRestCheck.checked && telefonoWhatsappRest && telefonoWhatsappRest.value.trim().length >= 10) {
                codigoOk = codigoRestauranteVerificado;
            }
        }

        const todosOk = terminosOk && codigoOk;
        btnSubmit.disabled = !todosOk;

        document.querySelectorAll('.terminos-check').forEach(el => {
            const checkbox = el.querySelector('input[type="checkbox"]');
            if (checkbox && checkbox.checked) {
                el.classList.add('checked');
            } else {
                el.classList.remove('checked');
            }
        });
    }
}

if (terminosCheck) terminosCheck.addEventListener('change', actualizarBotonSubmit);
if (privacidadCheck) privacidadCheck.addEventListener('change', actualizarBotonSubmit);
if (veridicidadCheck) veridicidadCheck.addEventListener('change', actualizarBotonSubmit);

// ================================================================
// MODAL DE REGISTRO EXITOSO
// ================================================================
function mostrarModalExito(tipoTexto, email) {
    const modal = document.getElementById('modalExito');
    const mensajePersonalizado = document.getElementById('mensajePersonalizado');

    if (mensajePersonalizado) {
        if (tipoUsuario === 'consumidor') {
            mensajePersonalizado.textContent = '🎯 Comienza a descubrir ofertas cerca de ti';
        } else {
            mensajePersonalizado.textContent = '🍽️ Comienza a publicar tus ofertas y reduce el desperdicio';
        }
    }

    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        contadorRedireccion = 30;
        if (contadorElemento) {
            contadorElemento.textContent = `Redirigiendo en ${contadorRedireccion} segundos...`;
        }

        const intervalo = setInterval(() => {
            contadorRedireccion--;
            if (contadorElemento) {
                contadorElemento.textContent = `Redirigiendo en ${contadorRedireccion} segundos...`;
            }
            if (contadorRedireccion <= 0) {
                clearInterval(intervalo);
                const emailInput = document.getElementById('email');
                const emailValue = emailInput ? encodeURIComponent(emailInput.value) : '';
                window.location.href = `../login.html?email=${emailValue}`;
            }
        }, 1000);

        window._intervaloRedireccion = intervalo;
    }
}

function cerrarModalExitoYRedirigir() {
    if (window._intervaloRedireccion) {
        clearInterval(window._intervaloRedireccion);
    }
    const emailInput = document.getElementById('email');
    if (emailInput) {
        window.location.href = `../login.html?email=${encodeURIComponent(emailInput.value)}`;
    } else {
        window.location.href = '../login.html';
    }
}

if (btnIrLogin) {
    btnIrLogin.addEventListener('click', cerrarModalExitoYRedirigir);
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('modalExito');
        if (modal && modal.classList.contains('active')) {
            cerrarModalExitoYRedirigir();
        }
    }
});

// ================================================================
// FORZAR ACTUALIZACIÓN COMPLETA DE UI
// ================================================================
function forzarActualizacionCompleta() {
    document.querySelectorAll('.step-buttons, .sub-step-buttons, .step1-buttons, .step3a-buttons').forEach(el => {
        if (el) {
            el.style.display = 'flex';
            el.style.visibility = 'visible';
            el.style.opacity = '1';
        }
    });

    document.querySelectorAll('.btn-step').forEach(el => {
        el.style.display = 'inline-flex';
        el.style.visibility = 'visible';
        el.style.opacity = '1';
    });

    document.querySelectorAll('.switch-group').forEach(el => {
        el.style.display = 'flex';
        el.style.visibility = 'visible';
        el.style.opacity = '1';
    });

    document.querySelectorAll('.checkbox-moderno').forEach(el => {
        el.style.display = 'flex';
        el.style.visibility = 'visible';
        el.style.opacity = '1';
    });

    document.querySelectorAll('.terminos-container, .terminos-check').forEach(el => {
        el.style.display = 'flex';
        el.style.visibility = 'visible';
        el.style.opacity = '1';
    });

    document.querySelectorAll('.notificaciones-grid, .notificacion-card').forEach(el => {
        el.style.display = 'flex';
        el.style.visibility = 'visible';
        el.style.opacity = '1';
    });

    const wpp = document.getElementById('notificacionWhatsapp');
    if (wpp && wpp.checked) {
        const field = document.getElementById('whatsappField');
        if (field) field.style.display = 'block';
    }
}

// ================================================================
// ASIGNAR EVENTOS A LOS BOTONES
// ================================================================
function asignarEventosBotones() {
    console.log('🔧 asignarEventosBotones() ejecutada');

    // PASO 1
    const btnNext1 = document.getElementById('btnNext1');
    if (btnNext1) {
        btnNext1.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('✅ Click en btnNext1');
            nextStep();
        });
    }

    // PASO 2 (CONSUMIDOR)
    const btnPrev2 = document.getElementById('btnPrev2');
    const btnNext2 = document.getElementById('btnNext2');
    if (btnPrev2) {
        btnPrev2.addEventListener('click', function(e) {
            e.preventDefault();
            if (currentStep === 2) {
                goToStep(1);
            } else {
                prevStep();
            }
        });
    }
    if (btnNext2) {
        btnNext2.addEventListener('click', function(e) {
            e.preventDefault();
            nextStep();
        });
    }

    // PASO 3 (CONSUMIDOR)
    const btnPrev3a = document.getElementById('btnPrev3a');
    const btnNext3a = document.getElementById('btnNext3a');
    const btnOmitir3a = document.getElementById('btnOmitir3a');

    if (btnPrev3a) {
        btnPrev3a.addEventListener('click', function(e) {
            e.preventDefault();
            prevStep();
        });
    }
    if (btnNext3a) {
        btnNext3a.addEventListener('click', function(e) {
            e.preventDefault();
            nextStep();
        });
    }
    if (btnOmitir3a) {
        btnOmitir3a.addEventListener('click', function(e) {
            e.preventDefault();
            omitirStep3();
        });
    }

    // PASO 3 (RESTAURANTE)
    const btnPrev3b = document.getElementById('btnPrev3b');
    const btnNext3b = document.getElementById('btnNext3b');
    if (btnPrev3b) {
        btnPrev3b.addEventListener('click', function(e) {
            e.preventDefault();
            prevStep();
        });
    }
    if (btnNext3b) {
        btnNext3b.addEventListener('click', function(e) {
            e.preventDefault();
            nextStep();
        });
    }

    // PASO 4
    const btnPrev4 = document.getElementById('btnPrev4');
    if (btnPrev4) {
        btnPrev4.addEventListener('click', function(e) {
            e.preventDefault();
            prevStep();
        });
    }

    // SUB-PASOS (RESTAURANTE EN PASO 2)
    const btnPrevSub = document.getElementById('btnPrevSub');
    const btnNextSub = document.getElementById('btnNextSub');
    if (btnPrevSub) {
        btnPrevSub.addEventListener('click', function(e) {
            e.preventDefault();
            if (currentSubStep > 0) {
                prevSubStep();
            } else {
                goToStep(1);
            }
        });
    }
    if (btnNextSub) {
        btnNextSub.addEventListener('click', function(e) {
            e.preventDefault();
            nextSubStep();
        });
    }

    console.log('✅ Eventos de botones asignados correctamente');
}

// ================================================================
// INICIALIZACIÓN
// ================================================================
function inicializarRegistro() {
    aplicarPreferencias();

    const prefs = obtenerPreferencias();
    if (modoDaltonico) modoDaltonico.checked = prefs.modoDaltonico || false;
    if (textoGrande) textoGrande.checked = prefs.textoGrande || false;

    // Ocultar contenido dinámico al inicio
    const datosConsumidor = document.getElementById('datos-consumidor');
    const datosRestaurante = document.getElementById('datos-restaurante');
    if (datosConsumidor) datosConsumidor.style.display = 'none';
    if (datosRestaurante) datosRestaurante.style.display = 'none';

    const step3ConsumidorContent = document.getElementById('step3-consumidor-content');
    const step3RestauranteContent = document.getElementById('step3-restaurante-content');
    if (step3ConsumidorContent) step3ConsumidorContent.style.display = 'none';
    if (step3RestauranteContent) step3RestauranteContent.style.display = 'none';

    updateStepUI();
    asignarEventosBotones();
    actualizarBotonSubmit();

    setTimeout(function() {
        forzarActualizacionCompleta();
    }, 300);
}

// ================================================================
// ENVÍO DEL FORMULARIO
// ================================================================
const registroForm = document.getElementById('registroForm');
if (registroForm) {
    registroForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        showLoading('#btnSubmit', 'Validando datos...');

        let datos = null;
        let tipoTexto = '';

        try {
            console.log('✅ Formulario enviado - Iniciando proceso...');

            if (!terminosCheck || !terminosCheck.checked || !privacidadCheck || !privacidadCheck.checked || !veridicidadCheck || !veridicidadCheck.checked) {
                hideLoading('#btnSubmit');
                alert('⚠️ Debes aceptar todos los términos para continuar.');
                return;
            }

            // Validar WhatsApp consumidor
            if (notificacionWhatsapp && notificacionWhatsapp.checked) {
                if (!telefonoWhatsapp || !telefonoWhatsapp.value || telefonoWhatsapp.value.trim().length < 10) {
                    if (telefonoWhatsapp) mostrarErrorCampo(telefonoWhatsapp, 'Ingresa un número de teléfono válido (mínimo 10 dígitos)');
                    hideLoading('#btnSubmit');
                    alert('⚠️ Ingresa un número de teléfono válido (mínimo 10 dígitos) para WhatsApp.');
                    return;
                }
                if (telefonoWhatsapp) limpiarErrorCampo(telefonoWhatsapp);
                if (!codigoVerificado) {
                    if (codigoInput) mostrarErrorCampo(codigoInput, 'Verifica el código enviado a tu WhatsApp');
                    if (codigoError) codigoError.style.display = 'block';
                    hideLoading('#btnSubmit');
                    alert('⚠️ Debes verificar tu número de WhatsApp con el código enviado.');
                    return;
                }
            }

            // Validar WhatsApp restaurante
            if (tipoUsuario === 'restaurante') {
                const whatsappCheck = document.getElementById('whatsappRestaurante');
                const telefonoWhatsappRest = document.getElementById('telefonoWhatsappRestaurante');
                if (whatsappCheck && whatsappCheck.checked) {
                    if (!telefonoWhatsappRest || !telefonoWhatsappRest.value || telefonoWhatsappRest.value.trim().length < 10) {
                        hideLoading('#btnSubmit');
                        alert('⚠️ Para recibir notificaciones por WhatsApp, debes ingresar un número de teléfono válido (mínimo 10 dígitos).');
                        if (telefonoWhatsappRest) {
                            telefonoWhatsappRest.focus();
                            mostrarErrorCampo(telefonoWhatsappRest, 'Ingresa un número de WhatsApp válido (mínimo 10 dígitos)');
                        }
                        return;
                    }
                    if (!codigoRestauranteVerificado) {
                        hideLoading('#btnSubmit');
                        alert('⚠️ Debes verificar tu número de WhatsApp con el código enviado.');
                        if (codigoRestauranteInput) {
                            codigoRestauranteInput.focus();
                            mostrarErrorCampo(codigoRestauranteInput, 'Verifica el código enviado a tu WhatsApp');
                        }
                        if (codigoRestauranteError) codigoRestauranteError.style.display = 'block';
                        return;
                    }
                }
            }

            // Construir objeto datos según tipo de usuario
            if (tipoUsuario === 'consumidor') {
                datos = {
                    nombre: document.getElementById('nombre').value,
                    apellido: document.getElementById('apellido').value,
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value,
                    tipoUsuario: 'consumidor',
                    region: document.getElementById('region').value || 'No especificada',
                    notificaciones: {
                        email: document.getElementById('notificacionEmail').checked,
                        whatsapp: notificacionWhatsapp ? notificacionWhatsapp.checked : false,
                        telefonoWhatsapp: telefonoWhatsapp ? telefonoWhatsapp.value || '' : '',
                    },
                    terminos: terminosCheck.checked,
                    privacidad: privacidadCheck.checked,
                    veridicidad: veridicidadCheck.checked,
                    fotoSubida: fotoSubida
                };
            } else {
                datos = {
                    nombre: document.getElementById('nombreRestaurante').value,
                    apellido: '',
                    email: document.getElementById('emailRestaurante').value,
                    password: document.getElementById('passwordRestaurante').value,
                    tipoUsuario: 'restaurante',
                    nombreRestaurante: document.getElementById('nombreRestaurante').value,
                    regionRestaurante: document.getElementById('regionRestaurante').value,
                    direccion: {
                        calle: document.getElementById('calle').value,
                        numero: document.getElementById('numero').value,
                        colonia: document.getElementById('colonia').value || '',
                        ciudad: document.getElementById('ciudad').value,
                        codigoPostal: document.getElementById('codigoPostal').value || ''
                    },
                    categoria: document.getElementById('categoria').value,
                    categoriaOtro: document.getElementById('otroCategoriaTexto').value || '',
                    horarioApertura: document.getElementById('horarioApertura').value,
                    horarioCierre: document.getElementById('horarioCierre').value,
                    telefonoLocal: document.getElementById('telefonoLocal').value,
                    whatsappRestaurante: (whatsappRestaurante && whatsappRestaurante.checked) ? document.getElementById('telefonoWhatsappRestaurante').value : '',
                    terminos: terminosCheck.checked,
                    privacidad: privacidadCheck.checked,
                    veridicidad: veridicidadCheck.checked,
                    fotoSubida: fotoSubida
                };
            }

            console.log('=== REGISTRO COMPLETO ===');
            console.log(JSON.stringify(datos, null, 2));

            const resultado = await registrarUsuario(datos);

            if (!resultado.success) {
                hideLoading('#btnSubmit');
                alert('❌ ' + resultado.message);
                return;
            }

            console.log('✅ Usuario guardado en PostgreSQL');
            localStorage.setItem('usuario_sesion', JSON.stringify(resultado.data.usuario));

            // ================================================================
            // ENVIAR CORREO DE BIENVENIDA
            // ================================================================
            if (datos.email && datos.email.includes('@')) {
            
                try {
                const nombreCompleto = `${datos.nombre} ${datos.apellido}`;
                
                let telefono = 'No especificado';
                let whatsapp = 'No especificado';
                
                if (tipoUsuario === 'restaurante') {
                    const telefonoLocal = document.getElementById('telefonoLocal');
                    const telefonoWhatsappRest = document.getElementById('telefonoWhatsappRestaurante');
                    const whatsappCheck = document.getElementById('whatsappRestaurante');
                    
                    if (telefonoLocal) telefono = telefonoLocal.value || 'No especificado';
                    if (whatsappCheck && whatsappCheck.checked && telefonoWhatsappRest) {
                        whatsapp = telefonoWhatsappRest.value || 'No especificado';
                    }
                }
                
                const emailEnviado = await enviarCorreoBienvenida(
                    nombreCompleto,
                    datos.email,
                    datos.tipoUsuario,
                    telefono,
                    whatsapp
                );
                
                if (emailEnviado) {
                    console.log('✅ Correo de bienvenida enviado a:', datos.email);
                } else {
                    console.warn('⚠️ No se pudo enviar el correo de bienvenida');
                }
            } catch (error) {
                console.error('❌ Error en el envío del correo:', error);
            }
                
            console.log('📧 Simulación de correo enviado. API deshabilitado.');
        } else {
            console.warn('⚠️ Correo no válido, no se envió mensaje');
        }


            hideLoading('#btnSubmit');
            tipoTexto = tipoUsuario === 'consumidor' ? 'Consumidor' : 'Restaurante';
            mostrarModalExito(tipoTexto, datos.email || datos.emailRestaurante);

        } catch (error) {
            console.error('❌ Error en el proceso:', error);
            hideLoading('#btnSubmit');
            alert('❌ Ocurrió un error: ' + (error.message || 'Error desconocido'));
        }
    });
}

// ================================================================
// ELIMINAR ERROR AL ESCRIBIR
// ================================================================
document.querySelectorAll('.form-group input, .form-group select').forEach(input => {
    input.addEventListener('input', function() {
        limpiarErrorCampo(this);
    });
    input.addEventListener('change', function() {
        limpiarErrorCampo(this);
    });
});

document.querySelectorAll('.checkbox-moderno input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', function() {
        const parent = this.closest('.checkbox-moderno');
        if (parent) parent.style.borderColor = '';
    });
});

// ================================================================
// INICIAR CUANDO EL DOM ESTÉ LISTO
// ================================================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarRegistro);
} else {
    inicializarRegistro();
}