// ================================================================
// PREFERENCES · GESTIÓN DE PREFERENCIAS DEL USUARIO
// ================================================================

const PREFERENCES_KEY = 'user_preferences';

// ===== OBTENER PREFERENCIAS =====
function obtenerPreferencias() {
    try {
        const data = localStorage.getItem(PREFERENCES_KEY);
        return data ? JSON.parse(data) : {
            modoDaltonico: false,
            textoGrande: false,
            notificaciones: true,
            idioma: 'es'
        };
    } catch (error) {
        console.error('❌ Error al leer preferencias:', error);
        return { modoDaltonico: false, textoGrande: false };
    }
}

// ===== GUARDAR PREFERENCIAS =====
function guardarPreferencias(preferencias) {
    try {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferencias));
        console.log('✅ Preferencias guardadas:', preferencias);
        return true;
    } catch (error) {
        console.error('❌ Error al guardar preferencias:', error);
        return false;
    }
}

// ===== APLICAR PREFERENCIAS A LA PÁGINA =====
function aplicarPreferencias() {
    const prefs = obtenerPreferencias();
    const body = document.body;
    
    // Modo daltónico
    if (prefs.modoDaltonico) {
        body.classList.add('modo-daltonico');
    } else {
        body.classList.remove('modo-daltonico');
    }
    
    // Texto grande
    if (prefs.textoGrande) {
        body.classList.add('texto-grande');
    } else {
        body.classList.remove('texto-grande');
    }
    
    // ===== SINCRONIZAR SWITCHES =====
    const modoDaltonicoSwitch = document.getElementById('modoDaltonico');
    const textoGrandeSwitch = document.getElementById('textoGrande');
    
    if (modoDaltonicoSwitch) {
        modoDaltonicoSwitch.checked = prefs.modoDaltonico || false;
    }
    if (textoGrandeSwitch) {
        textoGrandeSwitch.checked = prefs.textoGrande || false;
    }
    
    // Cambiar el CSS si existe el elemento (para login y registro)
    const modoCSS = document.getElementById('modoCSS');
    if (modoCSS) {
        const currentPath = window.location.pathname;
        if (currentPath.includes('registro')) {
            modoCSS.href = prefs.modoDaltonico ? 'registro-daltonico.css' : 'registro-normal.css';
        } else if (currentPath.includes('login')) {
            modoCSS.href = prefs.modoDaltonico ? 'login-daltonico.css' : 'login-normal.css';
        }
    }
    
    console.log('🎨 Preferencias aplicadas:', prefs);
}

// ===== ACTUALIZAR PREFERENCIA ESPECÍFICA =====
function actualizarPreferencia(clave, valor) {
    const prefs = obtenerPreferencias();
    prefs[clave] = valor;
    guardarPreferencias(prefs);
    aplicarPreferencias();
}

// ===== SINCRONIZAR CON SERVIDOR (opcional) =====
function sincronizarPreferencias() {
    const prefs = obtenerPreferencias();
    const usuario = localStorage.getItem('usuario_sesion');
    
    if (!usuario) {
        console.log('ℹ️ Usuario no autenticado, no se sincroniza');
        return;
    }
    
    try {
        const usuarioData = JSON.parse(usuario);
        console.log('🔄 Sincronizando preferencias con servidor...');
        // TODO: Llamar a API cuando esté lista
    } catch (error) {
        console.error('❌ Error al sincronizar:', error);
    }
}

// ===== INICIALIZAR AL CARGAR LA PÁGINA =====
document.addEventListener('DOMContentLoaded', function() {
    aplicarPreferencias();
});

// ===== EXPORTAR PARA USAR EN OTROS SCRIPTS =====
window.obtenerPreferencias = obtenerPreferencias;
window.guardarPreferencias = guardarPreferencias;
window.aplicarPreferencias = aplicarPreferencias;
window.actualizarPreferencia = actualizarPreferencia;
window.sincronizarPreferencias = sincronizarPreferencias;