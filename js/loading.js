// ================================================================
// LOADING · CONTROL DE SPINNER Y ESTADOS DE CARGA
// ================================================================

/**
 * Muestra el spinner en un botón y cambia su texto
 * @param {string} selector - Selector del botón (ej: '#btnSubmit')
 * @param {string} mensaje - Mensaje a mostrar durante la carga (ej: 'Validando...')
 */
function showLoading(selector, mensaje) {
    const btn = document.querySelector(selector);
    if (!btn) return;

    // Guardar el texto original si no se ha guardado antes
    if (!btn.dataset.textoOriginal) {
        btn.dataset.textoOriginal = btn.innerHTML;
    }

    // Deshabilitar el botón
    btn.disabled = true;
    btn.classList.add('btn-loading');

    // Cambiar el contenido
    btn.innerHTML = `
        <span class="spinner"></span>
        <span class="btn-text">${mensaje}</span>
    `;
}

/**
 * Oculta el spinner y restaura el texto original del botón
 * @param {string} selector - Selector del botón (ej: '#btnSubmit')
 * @param {string} mensajeExito - Mensaje opcional para mostrar después de la carga
 */
function hideLoading(selector, mensajeExito) {
    const btn = document.querySelector(selector);
    if (!btn) return;

    // Restaurar el texto original
    if (btn.dataset.textoOriginal) {
        btn.innerHTML = btn.dataset.textoOriginal;
        delete btn.dataset.textoOriginal;
    }

    // Habilitar el botón
    btn.disabled = false;
    btn.classList.remove('btn-loading');
}

/**
 * Actualiza el texto del botón durante la carga (sin perder el spinner)
 * @param {string} selector - Selector del botón
 * @param {string} mensaje - Nuevo mensaje
 */
function updateLoadingText(selector, mensaje) {
    const btn = document.querySelector(selector);
    if (!btn) return;

    const textSpan = btn.querySelector('.btn-text');
    if (textSpan) {
        textSpan.textContent = mensaje;
    }
}

// ================================================================
// EXPORTAR FUNCIONES PARA USO GLOBAL
// ================================================================
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.updateLoadingText = updateLoadingText;