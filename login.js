// ================================================================
// LOGIN · CON AUTENTICACIÓN Y SPINNER
// ================================================================

// ===== ELEMENTOS =====
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const modoDaltonico = document.getElementById('modoDaltonico');
const textoGrande = document.getElementById('textoGrande');
const body = document.body;
const modoCSS = document.getElementById('modoCSS');
const loginForm = document.getElementById('loginForm');

// ===== MOSTRAR/OCULTAR CONTRASEÑA =====
if (togglePassword) {
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        const icon = this.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });
}

// ===== MODO DALTÓNICO =====
if (modoDaltonico) {
    modoDaltonico.addEventListener('change', function() {
        actualizarPreferencia('modoDaltonico', this.checked);
        modoCSS.href = this.checked ? 'login-daltonico.css' : 'login-normal.css';
    });
}

// ===== TEXTO GRANDE =====
if (textoGrande) {
    textoGrande.addEventListener('change', function() {
        actualizarPreferencia('textoGrande', this.checked);
    });
}

// ===== CARGAR PREFERENCIAS Y AUTOCOMPLETAR EMAIL =====
function cargarPreferenciasYEmail() {
    aplicarPreferencias();

    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    if (email) {
        const emailInput = document.getElementById('email');
        if (emailInput) emailInput.value = email;
    }

    const prefs = obtenerPreferencias();
    if (modoDaltonico) modoDaltonico.checked = prefs.modoDaltonico || false;
    if (textoGrande) textoGrande.checked = prefs.textoGrande || false;
}

// ===== ENVÍO DEL FORMULARIO CON SPINNER =====
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('email');
        const password = document.getElementById('password');
        const recordarme = document.getElementById('recordarme');

        // Validar campos
        let hasError = false;
        if (!email.value || !email.value.includes('@')) {
            email.classList.add('error');
            hasError = true;
        } else {
            email.classList.remove('error');
        }
        if (!password.value || password.value.length < 6) {
            password.classList.add('error');
            hasError = true;
        } else {
            password.classList.remove('error');
        }

        if (hasError) {
            alert('⚠️ Por favor, revisa los campos marcados.');
            return;
        }

        // ===== MOSTRAR SPINNER =====
        if (typeof showLoading === 'function') {
            showLoading('#btnLogin', 'Iniciando sesión...');
        }

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email.value,
                    password: password.value
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al iniciar sesión');
            }

            // Guardar sesión
            guardarSesion(data.token, data.usuario, recordarme ? recordarme.checked : false);

            // Ocultar spinner antes de redirigir
            if (typeof hideLoading === 'function') {
                hideLoading('#btnLogin');
            }

            // Redirigir según tipo
            redirigirSegunTipo(data.usuario);

        } catch (error) {
            console.error('❌ Error en login:', error);
            alert('❌ ' + error.message);
            // Ocultar spinner en caso de error
            if (typeof hideLoading === 'function') {
                hideLoading('#btnLogin');
            }
        }
    });
}

// ===== ELIMINAR ERROR AL ESCRIBIR =====
document.querySelectorAll('.form-group input').forEach(input => {
    input.addEventListener('input', function() {
        this.classList.remove('error');
    });
});

// ===== INICIALIZAR =====
document.addEventListener('DOMContentLoaded', function() {
    cargarPreferenciasYEmail();
});