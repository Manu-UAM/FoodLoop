// ================================================================
// AUTH · GESTIÓN DE AUTENTICACIÓN Y SESIÓN
// ================================================================

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

// ===== GUARDAR SESIÓN =====
function guardarSesion(token, usuario, recordarme = false) {
    const storage = recordarme ? localStorage : sessionStorage;
    storage.setItem(AUTH_TOKEN_KEY, token);
    storage.setItem(USER_DATA_KEY, JSON.stringify(usuario));
}

// ===== OBTENER TOKEN =====
function obtenerToken() {
    // Buscar primero en localStorage, luego en sessionStorage
    let token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
        token = sessionStorage.getItem(AUTH_TOKEN_KEY);
    }
    return token;
}

// ===== OBTENER USUARIO LOGUEADO =====
function obtenerUsuarioLogueado() {
    let userData = localStorage.getItem(USER_DATA_KEY);
    if (!userData) {
        userData = sessionStorage.getItem(USER_DATA_KEY);
    }
    if (userData) {
        try {
            return JSON.parse(userData);
        } catch (e) {
            return null;
        }
    }
    return null;
}

// ===== CERRAR SESIÓN =====
function cerrarSesion() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(USER_DATA_KEY);
    // Redirige a login.html en la raíz
    window.location.href = '../login.html'; // O usa '../login.html' según estructura, pero '/' es la raíz del servidor
}

// ===== VERIFICAR SI EL USUARIO ESTÁ AUTENTICADO =====
function estaAutenticado() {
    return obtenerToken() !== null;
}

// ===== REDIRIGIR SEGÚN TIPO DE USUARIO =====
function redirigirSegunTipo(usuario) {
    if (!usuario) {
        window.location.href = 'login.html';
        return;
    }
    // Ocultar spinner antes de redirigir (por si acaso)
    if (typeof hideLoading === 'function') {
        hideLoading('#btnLogin');
    }
    if (usuario.tipo === 'consumidor') {
        window.location.href = 'consumidores/menu.html';
    } else if (usuario.tipo === 'restaurante') {
        window.location.href = 'restaurantes/dashboard-restaurante.html';
    } else {
        window.location.href = 'login.html';
    }
}

// ===== EXPORTAR PARA USO GLOBAL =====
window.guardarSesion = guardarSesion;
window.obtenerToken = obtenerToken;
window.obtenerUsuarioLogueado = obtenerUsuarioLogueado;
window.cerrarSesion = cerrarSesion;
window.estaAutenticado = estaAutenticado;
window.redirigirSegunTipo = redirigirSegunTipo;