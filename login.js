// ===== ELEMENTOS =====
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const modoDaltonico = document.getElementById('modoDaltonico');
const textoGrande = document.getElementById('textoGrande');
const body = document.body;
const modoCSS = document.getElementById('modoCSS');

// ===== MOSTRAR/OCULTAR CONTRASEÑA =====
togglePassword.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    const icon = this.querySelector('i');
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
});

// ===== MODO DALTÓNICO (Cambia el CSS) =====
modoDaltonico.addEventListener('change', function() {
    if (this.checked) {
        modoCSS.href = 'login-daltonico.css';
        localStorage.setItem('modoDaltonico', 'true');
    } else {
        modoCSS.href = 'login-normal.css';
        localStorage.setItem('modoDaltonico', 'false');
    }
});

// ===== TEXTO GRANDE =====
textoGrande.addEventListener('change', function() {
    if (this.checked) {
        body.classList.add('texto-grande');
        localStorage.setItem('textoGrande', 'true');
    } else {
        body.classList.remove('texto-grande');
        localStorage.setItem('textoGrande', 'false');
    }
});

// ===== CARGAR PREFERENCIAS GUARDADAS =====
function cargarPreferencias() {
    // Modo daltónico
    const daltonicoGuardado = localStorage.getItem('modoDaltonico');
    if (daltonicoGuardado === 'true') {
        modoDaltonico.checked = true;
        modoCSS.href = 'login-daltonico.css';
    } else {
        modoCSS.href = 'login-normal.css';
    }
    
    // Texto grande
    const textoGuardado = localStorage.getItem('textoGrande');
    if (textoGuardado === 'true') {
        textoGrande.checked = true;
        body.classList.add('texto-grande');
    }
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
    
    console.log('Email:', email.value);
    console.log('Contraseña:', password.value);
    alert('✅ ¡Inicio de sesión exitoso! 🍽️ ¡Juntos reducimos el desperdicio!');
});

// ===== ELIMINAR ERROR AL ESCRIBIR =====
document.querySelectorAll('.form-group input').forEach(input => {
    input.addEventListener('input', function() {
        this.classList.remove('error');
    });
});

// ===== INICIALIZAR =====
cargarPreferencias();