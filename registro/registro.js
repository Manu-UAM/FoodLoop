// ================================================================
// REGISTRO · JAVASCRIPT COMPLETO (CORREGIDO)
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
let contadorRedireccion = 5;

const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3Consumidor = document.getElementById('step3-consumidor');
const step3Restaurante = document.getElementById('step3-restaurante');
const step4 = document.getElementById('step4');
const step1Indicator = document.getElementById('step1Indicator');
const step2Indicator = document.getElementById('step2Indicator');
const step3Indicator = document.getElementById('step3Indicator');
const step4Indicator = document.getElementById('step4Indicator');
const stepTitle = document.getElementById('stepTitle');
const stepSubtitle = document.getElementById('stepSubtitle');
const fotoLocalContainer = document.getElementById('fotoLocalContainer');

// ===== TIPO DE USUARIO =====
const tipoCards = document.querySelectorAll('.tipo-usuario-card');

// ===== ELEMENTOS DE VERIFICACIÓN WHATSAPP =====
const verificacionContainer = document.getElementById('verificacionWhatsappContainer');
const telefonoMostrado = document.getElementById('telefonoMostrado');
const codigoInput = document.getElementById('codigoVerificacion');
const codigoError = document.getElementById('codigoError');
const btnReenviar = document.getElementById('btnReenviar');
const reenviarMensaje = document.getElementById('reenviarMensaje');
const CODIGO_SIMULADO = '123456';

// ===== MODAL DE ÉXITO =====
const modalExito = document.getElementById('modalExito');
const contadorElemento = document.getElementById('contadorRedireccion');
const btnIrLogin = document.getElementById('btnIrLogin');

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
// MODO DALTÓNICO
// ================================================================
if (modoDaltonico) {
    modoDaltonico.addEventListener('change', function() {
        if (this.checked) {
            body.classList.add('modo-daltonico');
            localStorage.setItem('modoDaltonico', 'true');
        } else {
            body.classList.remove('modo-daltonico');
            localStorage.setItem('modoDaltonico', 'false');
        }
        setTimeout(forzarActualizacionCompleta, 100);
    });
}

// ================================================================
// TEXTO GRANDE
// ================================================================
if (textoGrande) {
    textoGrande.addEventListener('change', function() {
        if (this.checked) {
            body.classList.add('texto-grande');
            localStorage.setItem('textoGrande', 'true');
        } else {
            body.classList.remove('texto-grande');
            localStorage.setItem('textoGrande', 'false');
        }
        setTimeout(forzarActualizacionCompleta, 100);
    });
}

// ================================================================
// CARGAR PREFERENCIAS GUARDADAS
// ================================================================
function cargarPreferencias() {
    const daltonicoGuardado = localStorage.getItem('modoDaltonico');
    if (daltonicoGuardado === 'true') {
        if (modoDaltonico) modoDaltonico.checked = true;
        body.classList.add('modo-daltonico');
    } else {
        if (modoDaltonico) modoDaltonico.checked = false;
        body.classList.remove('modo-daltonico');
    }

    const textoGuardado = localStorage.getItem('textoGrande');
    if (textoGuardado === 'true') {
        if (textoGrande) textoGrande.checked = true;
        body.classList.add('texto-grande');
    } else {
        if (textoGrande) textoGrande.checked = false;
        body.classList.remove('texto-grande');
    }
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
// FUNCIONES DE NAVEGACIÓN
// ================================================================
function getStep3Content() {
    if (tipoUsuario === 'consumidor') {
        return step3Consumidor;
    } else if (tipoUsuario === 'restaurante') {
        return step3Restaurante;
    }
    return null;
}

function updateStepUI() {
    if (step1) step1.classList.toggle('active', currentStep === 1);
    if (step2) step2.classList.toggle('active', currentStep === 2);

    const step3Content = getStep3Content();
    if (step3Content) {
        step3Content.classList.toggle('active', currentStep === 3);
    }

    if (step4) step4.classList.toggle('active', currentStep === 4);

    if (step1Indicator) step1Indicator.classList.toggle('active', currentStep === 1);
    if (step2Indicator) step2Indicator.classList.toggle('active', currentStep === 2);
    if (step3Indicator) step3Indicator.classList.toggle('active', currentStep === 3);
    if (step4Indicator) step4Indicator.classList.toggle('active', currentStep === 4);

    const lines = document.querySelectorAll('.step-line');
    lines.forEach((line, index) => {
        line.classList.toggle('active', index < currentStep - 1);
    });

    const titles = {
        1: { title: 'Crear Cuenta', sub: 'Únete a la revolución contra el desperdicio' },
        2: { title: 'Tipo de Usuario', sub: 'Cuéntanos quién eres' },
        3: {
            title: tipoUsuario === 'consumidor' ? 'Preferencias' : 'Datos del Restaurante',
            sub: tipoUsuario === 'consumidor' ? 'Personaliza tu experiencia' : 'Cuéntanos sobre tu negocio'
        },
        4: { title: 'Confirmación', sub: 'Revisa y acepta los términos' }
    };

    const current = titles[currentStep] || titles[1];
    if (stepTitle) stepTitle.textContent = current.title;
    if (stepSubtitle) stepSubtitle.textContent = current.sub;

    if (fotoLocalContainer) {
        if (currentStep === 4 && tipoUsuario === 'restaurante') {
            fotoLocalContainer.style.display = 'block';
        } else {
            fotoLocalContainer.style.display = 'none';
        }
    }

    document.querySelectorAll('.step-buttons, .step1-buttons, .step3a-buttons').forEach(el => {
        el.style.display = 'none';
    });

    if (currentStep === 1) {
        const el = document.querySelector('.step1-buttons');
        if (el) el.style.display = 'flex';
    } else {
        const currentStepId = currentStep === 3 ?
            (tipoUsuario === 'consumidor' ? 'step3-consumidor' : 'step3-restaurante') :
            `step${currentStep}`;
        const currentButtons = document.querySelector(`#${currentStepId} .step-buttons`);
        if (currentButtons) {
            currentButtons.style.display = 'flex';
        }
    }

    actualizarBotonSubmit();

    // Mover el foco al primer campo del paso
    setTimeout(() => {
        const primerInput = document.querySelector(`.step-content.active input:not([type="hidden"]), .step-content.active select`);
        if (primerInput) {
            primerInput.focus();
        }
    }, 100);

    setTimeout(forzarActualizacionCompleta, 100);
}

function goToStep(step) {
    if (step < 1 || step > 4) return;
    currentStep = step;
    updateStepUI();
}

// ================================================================
// VALIDACIONES
// ================================================================
function mostrarErrorCampo(input, mensaje) {
    input.classList.add('error');
    // Eliminar mensaje de error previo
    const existingError = input.parentElement.querySelector('.error-message');
    if (existingError) existingError.remove();
    // Crear nuevo mensaje
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

function validateStep1() {
    const nombre = document.getElementById('nombre');
    const apellido = document.getElementById('apellido');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const passwordConfirm = document.getElementById('password_confirm');
    let hasError = false;

    // Limpiar errores previos
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
        // Encontrar el primer campo con error y enfocarlo
        const primerError = document.querySelector('.form-group input.error');
        if (primerError) primerError.focus();
        return false;
    }
    return true;
}

function validateStep2() {
    if (!tipoUsuario) {
        alert('⚠️ Por favor, selecciona un tipo de usuario.');
        return false;
    }
    return true;
}

function validateStep3Restaurante() {
    const nombreRest = document.getElementById('nombreRestaurante');
    const regionRest = document.getElementById('regionRestaurante');
    const calle = document.getElementById('calle');
    const numero = document.getElementById('numero');
    const ciudad = document.getElementById('ciudad');
    const categoria = document.getElementById('categoria');
    const horarioApertura = document.getElementById('horarioApertura');
    const horarioCierre = document.getElementById('horarioCierre');
    let hasError = false;

    // Limpiar errores previos
    [nombreRest, regionRest, calle, numero, ciudad, categoria, horarioApertura, horarioCierre].forEach(limpiarErrorCampo);

    if (!nombreRest.value || nombreRest.value.trim().length < 2) {
        mostrarErrorCampo(nombreRest, 'El nombre del restaurante es obligatorio');
        hasError = true;
    }

    if (!regionRest.value) {
        mostrarErrorCampo(regionRest, 'Selecciona una región');
        hasError = true;
    }

    if (!calle.value || calle.value.trim().length < 2) {
        mostrarErrorCampo(calle, 'La calle es obligatoria');
        hasError = true;
    }

    if (!numero.value || numero.value.trim().length < 1) {
        mostrarErrorCampo(numero, 'El número es obligatorio');
        hasError = true;
    }

    if (!ciudad.value || ciudad.value.trim().length < 2) {
        mostrarErrorCampo(ciudad, 'La ciudad es obligatoria');
        hasError = true;
    }

    if (!categoria.value) {
        mostrarErrorCampo(categoria, 'Selecciona una categoría');
        hasError = true;
    }

    if (categoria.value === 'otro') {
        const otroTexto = document.getElementById('otroCategoriaTexto');
        limpiarErrorCampo(otroTexto);
        if (!otroTexto.value || otroTexto.value.trim().length < 2) {
            mostrarErrorCampo(otroTexto, 'Especifica tu categoría');
            hasError = true;
        }
    }

    if (!horarioApertura.value) {
        mostrarErrorCampo(horarioApertura, 'La hora de apertura es obligatoria');
        hasError = true;
    }

    if (!horarioCierre.value) {
        mostrarErrorCampo(horarioCierre, 'La hora de cierre es obligatoria');
        hasError = true;
    }

    if (hasError) {
        const primerError = document.querySelector('.form-group input.error, .form-group select.error');
        if (primerError) primerError.focus();
        return false;
    }
    return true;
}

// ================================================================
// FUNCIONES DE NAVEGACIÓN (NEXT / PREV / SKIP)
// ================================================================
function nextStep() {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && tipoUsuario === 'restaurante' && !validateStep3Restaurante()) return;

    if (currentStep < 4) {
        goToStep(currentStep + 1);
    }
}

function prevStep() {
    if (currentStep > 1) {
        goToStep(currentStep - 1);
    }
}

function omitirStep3() {
    if (currentStep === 3 && tipoUsuario === 'consumidor') {
        goToStep(4);
    }
}

// ================================================================
// SELECCIÓN DE TIPO DE USUARIO (CON ACCESIBILIDAD)
// ================================================================
if (tipoCards) {
    tipoCards.forEach(card => {
        // Click
        card.addEventListener('click', function() {
            seleccionarTipoUsuario(this);
        });

        // Teclado (Enter/Space)
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                seleccionarTipoUsuario(this);
            }
        });

        // Hacer focusable
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'radio');
    });
}

function seleccionarTipoUsuario(card) {
    tipoCards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    tipoUsuario = card.dataset.tipo;

    // Actualizar atributo ARIA
    tipoCards.forEach(c => c.setAttribute('aria-checked', 'false'));
    card.setAttribute('aria-checked', 'true');

    const step3Label = document.querySelector('#step3Indicator .step-label');
    if (step3Label) {
        if (tipoUsuario === 'consumidor') {
            step3Label.textContent = 'Preferencias';
        } else {
            step3Label.textContent = 'Restaurante';
        }
    }
}

// ================================================================
// NOTIFICACIONES: Mostrar campo de WhatsApp
// ================================================================
const notificacionWhatsapp = document.getElementById('notificacionWhatsapp');
const whatsappField = document.getElementById('whatsappField');
const telefonoWhatsapp = document.getElementById('telefonoWhatsapp');

if (notificacionWhatsapp) {
    notificacionWhatsapp.addEventListener('change', function() {
        if (this.checked) {
            if (whatsappField) whatsappField.style.display = 'block';
            if (telefonoWhatsapp) telefonoWhatsapp.required = true;
            // Enfocar el campo de teléfono
            setTimeout(() => {
                if (telefonoWhatsapp) telefonoWhatsapp.focus();
            }, 300);
        } else {
            if (whatsappField) whatsappField.style.display = 'none';
            if (telefonoWhatsapp) {
                telefonoWhatsapp.required = false;
                limpiarErrorCampo(telefonoWhatsapp);
            }
            if (verificacionContainer) verificacionContainer.style.display = 'none';
            if (codigoInput) {
                codigoInput.value = '';
                limpiarErrorCampo(codigoInput);
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
// CATEGORÍA "OTRO": Mostrar campo de texto
// ================================================================
const categoriaSelect = document.getElementById('categoria');
const otroCategoriaField = document.getElementById('otroCategoriaField');

if (categoriaSelect) {
    categoriaSelect.addEventListener('change', function() {
        if (this.value === 'otro') {
            if (otroCategoriaField) otroCategoriaField.style.display = 'block';
            const otroText = document.getElementById('otroCategoriaTexto');
            if (otroText) otroText.required = true;
            setTimeout(() => {
                if (otroText) otroText.focus();
            }, 300);
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
// SUBIR FOTO
// ================================================================
const btnTomarFoto = document.getElementById('btnTomarFoto');
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
// MODAL DE NIVELES
// ================================================================
const modal = document.getElementById('modalNiveles');
const btnInfo = document.getElementById('btnInfoNiveles');
const btnClose = document.getElementById('modalClose');

if (btnInfo && modal) {
    btnInfo.addEventListener('click', function() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Enfocar el botón de cerrar
        setTimeout(() => {
            if (btnClose) btnClose.focus();
        }, 100);
    });
}

if (btnClose && modal) {
    btnClose.addEventListener('click', function() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        // Volver el foco al botón de información
        if (btnInfo) btnInfo.focus();
    });
}

if (modal) {
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            if (btnInfo) btnInfo.focus();
        }
    });

    // Cerrar con Escape
    modal.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            if (btnInfo) btnInfo.focus();
        }
    });
}

// ================================================================
// VERIFICACIÓN WHATSAPP
// ================================================================

function mostrarVerificacionWhatsApp() {
    const whatsappActivado = document.getElementById('notificacionWhatsapp');
    const telefono = document.getElementById('telefonoWhatsapp');

    if (whatsappActivado && whatsappActivado.checked && telefono && telefono.value.trim().length >= 6) {
        if (verificacionContainer) verificacionContainer.style.display = 'block';
        if (telefonoMostrado) telefonoMostrado.textContent = telefono.value.trim();
        if (codigoInput) {
            codigoInput.value = '';
            limpiarErrorCampo(codigoInput);
            codigoInput.style.borderColor = '';
            codigoInput.style.outline = '';
            codigoInput.classList.remove('verificado');
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
        // Limpiar error al escribir
        limpiarErrorCampo(this);

        if (this.value.trim().length >= 6) {
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
        // Solo permitir dígitos
        this.value = this.value.replace(/\D/g, '');

        // Limpiar estado previo
        limpiarErrorCampo(this);
        this.classList.remove('verificado');
        if (codigoError) codigoError.style.display = 'none';

        if (this.value.length === 6) {
            if (this.value === CODIGO_SIMULADO) {
                this.classList.add('verificado');
                codigoVerificado = true;
                if (codigoError) codigoError.style.display = 'none';
            } else {
                mostrarErrorCampo(this, 'Código incorrecto. Intenta nuevamente.');
                codigoVerificado = false;
            }
        } else {
            codigoVerificado = false;
        }
        actualizarBotonSubmit();
    });
}

if (btnReenviar) {
    btnReenviar.addEventListener('click', function() {
        this.disabled = true;
        if (reenviarMensaje) reenviarMensaje.style.display = 'block';

        // Limpiar código anterior
        if (codigoInput) {
            codigoInput.value = '';
            limpiarErrorCampo(codigoInput);
            codigoInput.classList.remove('verificado');
            codigoInput.style.borderColor = '';
            codigoInput.style.outline = '';
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
// BOTÓN "CREAR CUENTA" HABILITADO
// ================================================================
const terminosCheck = document.getElementById('terminos');
const privacidadCheck = document.getElementById('privacidad');
const veridicidadCheck = document.getElementById('veridicidad');
const btnSubmit = document.getElementById('btnSubmit');

function actualizarBotonSubmit() {
    if (currentStep === 4 && btnSubmit) {
        const terminosOk = terminosCheck && terminosCheck.checked && privacidadCheck && privacidadCheck.checked && veridicidadCheck && veridicidadCheck.checked;

        let codigoOk = true;
        const whatsappActivado = document.getElementById('notificacionWhatsapp');

        if (whatsappActivado && whatsappActivado.checked && telefonoWhatsapp && telefonoWhatsapp.value.trim().length >= 6) {
            codigoOk = codigoVerificado;
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

        // Iniciar contador
        contadorRedireccion = 5;
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
                // Redirigir al login con el email prellenado
                const emailInput = document.getElementById('email');
                if (emailInput) {
                    window.location.href = `../login.html?email=${encodeURIComponent(emailInput.value)}`;
                } else {
                    window.location.href = '../login.html';
                }
            }
        }, 1000);

        // Guardar el intervalo para limpiarlo si el usuario hace clic en el botón
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

// Cerrar modal con Escape
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
    document.querySelectorAll('.step-buttons, .step1-buttons, .step3a-buttons').forEach(el => {
        el.style.display = 'flex';
        el.style.visibility = 'visible';
        el.style.opacity = '1';
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
    const btnNext1 = document.getElementById('btnNext1');
    if (btnNext1) {
        btnNext1.onclick = function(e) {
            e.preventDefault();
            nextStep();
        };
    }

    const btnPrev2 = document.getElementById('btnPrev2');
    const btnNext2 = document.getElementById('btnNext2');
    if (btnPrev2) {
        btnPrev2.onclick = function(e) {
            e.preventDefault();
            prevStep();
        };
    }
    if (btnNext2) {
        btnNext2.onclick = function(e) {
            e.preventDefault();
            nextStep();
        };
    }

    const btnPrev3a = document.getElementById('btnPrev3a');
    const btnNext3a = document.getElementById('btnNext3a');
    const btnOmitir3a = document.getElementById('btnOmitir3a');
    if (btnPrev3a) {
        btnPrev3a.onclick = function(e) {
            e.preventDefault();
            prevStep();
        };
    }
    if (btnNext3a) {
        btnNext3a.onclick = function(e) {
            e.preventDefault();
            nextStep();
        };
    }
    if (btnOmitir3a) {
        btnOmitir3a.onclick = function(e) {
            e.preventDefault();
            omitirStep3();
        };
    }

    const btnPrev3b = document.getElementById('btnPrev3b');
    const btnNext3b = document.getElementById('btnNext3b');
    if (btnPrev3b) {
        btnPrev3b.onclick = function(e) {
            e.preventDefault();
            prevStep();
        };
    }
    if (btnNext3b) {
        btnNext3b.onclick = function(e) {
            e.preventDefault();
            nextStep();
        };
    }

    const btnPrev4 = document.getElementById('btnPrev4');
    if (btnPrev4) {
        btnPrev4.onclick = function(e) {
            e.preventDefault();
            prevStep();
        };
    }
}

// ================================================================
// INICIALIZACIÓN
// ================================================================
function inicializarRegistro() {
    cargarPreferencias();
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
    registroForm.addEventListener('submit', function(e) {
        e.preventDefault();

        if (!terminosCheck || !terminosCheck.checked || !privacidadCheck || !privacidadCheck.checked || !veridicidadCheck || !veridicidadCheck.checked) {
            alert('⚠️ Debes aceptar todos los términos para continuar.');
            return;
        }

        if (notificacionWhatsapp && notificacionWhatsapp.checked) {
            if (!telefonoWhatsapp || !telefonoWhatsapp.value || telefonoWhatsapp.value.trim().length < 6) {
                if (telefonoWhatsapp) mostrarErrorCampo(telefonoWhatsapp, 'Ingresa un número de teléfono válido');
                return;
            }
            if (telefonoWhatsapp) limpiarErrorCampo(telefonoWhatsapp);

            if (!codigoVerificado) {
                if (codigoInput) mostrarErrorCampo(codigoInput, 'Verifica el código enviado a tu WhatsApp');
                if (codigoError) codigoError.style.display = 'block';
                return;
            }
        }

        if (tipoUsuario === 'restaurante' && !fotoSubida) {
            if (!confirm('⚠️ No has subido foto de tu local.\n\n¿Continuar sin foto? (Te registrarás como nivel 0 o 1)')) {
                return;
            }
        }

        const datos = {
            nombre: document.getElementById('nombre') ? document.getElementById('nombre').value : '',
            apellido: document.getElementById('apellido') ? document.getElementById('apellido').value : '',
            email: document.getElementById('email') ? document.getElementById('email').value : '',
            tipoUsuario: tipoUsuario,
            terminos: terminosCheck ? terminosCheck.checked : false,
            privacidad: privacidadCheck ? privacidadCheck.checked : false,
            veridicidad: veridicidadCheck ? veridicidadCheck.checked : false,
            fotoSubida: fotoSubida
        };

        if (tipoUsuario === 'consumidor') {
            datos.region = document.getElementById('region') ? document.getElementById('region').value || 'No especificada' : 'No especificada';
            datos.notificaciones = {
                email: document.getElementById('notificacionEmail') ? document.getElementById('notificacionEmail').checked : false,
                whatsapp: notificacionWhatsapp ? notificacionWhatsapp.checked : false,
                telefonoWhatsapp: telefonoWhatsapp ? telefonoWhatsapp.value || '' : '',
                verificado: notificacionWhatsapp ? notificacionWhatsapp.checked : false
            };
        } else {
            datos.nombreRestaurante = document.getElementById('nombreRestaurante') ? document.getElementById('nombreRestaurante').value : '';
            datos.regionRestaurante = document.getElementById('regionRestaurante') ? document.getElementById('regionRestaurante').value : '';
            datos.direccion = {
                calle: document.getElementById('calle') ? document.getElementById('calle').value : '',
                numero: document.getElementById('numero') ? document.getElementById('numero').value : '',
                colonia: document.getElementById('colonia') ? document.getElementById('colonia').value || '' : '',
                ciudad: document.getElementById('ciudad') ? document.getElementById('ciudad').value : '',
                codigoPostal: document.getElementById('codigoPostal') ? document.getElementById('codigoPostal').value || '' : ''
            };
            datos.categoria = document.getElementById('categoria') ? document.getElementById('categoria').value : '';
            if (datos.categoria === 'otro') {
                datos.categoriaOtro = document.getElementById('otroCategoriaTexto') ? document.getElementById('otroCategoriaTexto').value : '';
            }
            datos.horarioApertura = document.getElementById('horarioApertura') ? document.getElementById('horarioApertura').value : '';
            datos.horarioCierre = document.getElementById('horarioCierre') ? document.getElementById('horarioCierre').value : '';
        }

        console.log('=== REGISTRO COMPLETO ===');
        console.log(JSON.stringify(datos, null, 2));

        const tipoTexto = tipoUsuario === 'consumidor' ? 'Consumidor' : 'Restaurante';

        // Mostrar modal de éxito en lugar de alert
        mostrarModalExito(tipoTexto, datos.email);
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