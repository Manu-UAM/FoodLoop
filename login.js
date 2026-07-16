// ================================================================
// LOGIN · CON PREFERENCES.JS
// ================================================================

// ===== ELEMENTOS =====
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const modoDaltonico = document.getElementById('modoDaltonico');
const textoGrande = document.getElementById('textoGrande');
const body = document.body;
const modoCSS = document.getElementById('modoCSS');

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
        // Usar preferences.js para guardar
        actualizarPreferencia('modoDaltonico', this.checked);
        
        // Cambiar el CSS específico del login
        if (this.checked) {
            modoCSS.href = 'login-daltonico.css';
        } else {
            modoCSS.href = 'login-normal.css';
        }
    });
}

// ===== TEXTO GRANDE =====
if (textoGrande) {
    textoGrande.addEventListener('change', function() {
        // Usar preferences.js para guardar
        actualizarPreferencia('textoGrande', this.checked);
    });
}

// ===== CARGAR PREFERENCIAS GUARDADAS =====
function cargarPreferencias() {
    // Usar preferences.js para obtener las preferencias
    const prefs = obtenerPreferencias();
    
    // Modo daltónico
    if (modoDaltonico) {
        modoDaltonico.checked = prefs.modoDaltonico || false;
        if (prefs.modoDaltonico) {
            modoCSS.href = 'login-daltonico.css';
        } else {
            modoCSS.href = 'login-normal.css';
        }
    }
    
    // Texto grande
    if (textoGrande) {
        textoGrande.checked = prefs.textoGrande || false;
        if (prefs.textoGrande) {
            body.classList.add('texto-grande');
        } else {
            body.classList.remove('texto-grande');
        }
    }
    
    console.log('🎨 Preferencias cargadas en login:', prefs);
}

// ===== ENVÍO DEL FORMULARIO =====
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    
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
    
    console.log('📧 Email:', email.value);
    console.log('🔑 Contraseña:', password.value);
    alert('✅ ¡Inicio de sesión exitoso! 🍽️ ¡Juntos reducimos el desperdicio!');
});

// ===== ELIMINAR ERROR AL ESCRIBIR =====
document.querySelectorAll('.form-group input').forEach(input => {
    input.addEventListener('input', function() {
        this.classList.remove('error');
    });
});

// ===== INICIALIZAR =====
document.addEventListener('DOMContentLoaded', function() {
    // Aplicar preferencias desde preferences.js
    aplicarPreferencias();
    // Cargar preferencias en los switches
    cargarPreferencias();
});