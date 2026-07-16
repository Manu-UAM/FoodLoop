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
        actualizarPreferencia('modoDaltonico', this.checked);
        // Cambiar CSS específico del login
        modoCSS.href = this.checked ? 'login-daltonico.css' : 'login-normal.css';
    });
}

// ===== TEXTO GRANDE =====
if (textoGrande) {
    textoGrande.addEventListener('change', function() {
        actualizarPreferencia('textoGrande', this.checked);
    });
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
    aplicarPreferencias();
});