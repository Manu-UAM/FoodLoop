// ================================================================
// CARRITO · CONTROL PRINCIPAL (CON STOCK, SPINNER Y CONFIRMACIONES)
// ================================================================

document.addEventListener('DOMContentLoaded', function() {

    // ===== VERIFICAR AUTENTICACIÓN =====
    const usuario = obtenerUsuarioLogueado();
    if (!usuario) {
        window.location.href = '../login.html';
        return;
    }

    // ===== PREFERENCIAS =====
    const modoDaltonico = document.getElementById('modoDaltonico');
    const textoGrande = document.getElementById('textoGrande');
    if (modoDaltonico) {
        modoDaltonico.addEventListener('change', function() {
            actualizarPreferencia('modoDaltonico', this.checked);
        });
    }
    if (textoGrande) {
        textoGrande.addEventListener('change', function() {
            actualizarPreferencia('textoGrande', this.checked);
        });
    }
    (function cargarPreferenciasInicio() {
        const prefs = obtenerPreferencias();
        if (modoDaltonico) modoDaltonico.checked = prefs.modoDaltonico || false;
        if (textoGrande) textoGrande.checked = prefs.textoGrande || false;
        aplicarPreferencias();
    })();

    // ===== FUNCIONES DE API =====
    function getAuthHeaders() {
        const token = obtenerToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    // ===== CARRITO EN LOCALSTORAGE =====
    const CART_KEY = 'foodloop_cart';
    const CART_TIMEOUT = 10 * 60 * 1000;

    function obtenerCarrito() {
        try {
            const data = localStorage.getItem(CART_KEY);
            if (!data) return [];
            const items = JSON.parse(data);
            const ahora = Date.now();
            const validos = items.filter(item => (ahora - item.timestamp) < CART_TIMEOUT);
            if (validos.length !== items.length) {
                guardarCarrito(validos);
            }
            return validos;
        } catch { return []; }
    }

    function guardarCarrito(items) {
        localStorage.setItem(CART_KEY, JSON.stringify(items));
        actualizarBadge();
        return items;
    }

    function actualizarBadge() {
        const items = obtenerCarrito();
        const total = items.reduce((sum, item) => sum + item.cantidad, 0);
        const badges = document.querySelectorAll('.badge-carrito');
        badges.forEach(b => b.textContent = total);
    }

    // ===== OBTENER STOCK DESDE EL BACKEND =====
    async function obtenerStock(platilloId) {
        try {
            const response = await fetch(`${API_BASE_URL}/platillos/${platilloId}/stock`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Error al obtener stock');
            const data = await response.json();
            return data.stock || 0;
        } catch (error) {
            console.error('Error obteniendo stock:', error);
            return 0;
        }
    }

    // ===== RENDERIZAR CARRITO =====
    async function renderizarCarrito() {
        const container = document.getElementById('cartContainer');
        const items = obtenerCarrito();

        if (items.length === 0) {
            container.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-cart" aria-hidden="true"></i>
                    <p style="color: #FFFFFF; text-shadow: 0 1px 3px rgba(0,0,0,0.3);">Tu carrito está vacío</p>
                    <a href="menu.html" class="btn-continuar">Ver platillos</a>
                </div>
            `;
            actualizarBadge();
            return;
        }

        // Obtener stock actualizado para cada item
        const itemsConStock = await Promise.all(items.map(async (item) => {
            const stock = await obtenerStock(item.id);
            return { ...item, stock };
        }));

        let html = '';
        let subtotal = 0;

        itemsConStock.forEach((item, index) => {
            const precio = item.precio || 0;
            const cantidad = item.cantidad || 0;
            const totalItem = precio * cantidad;
            subtotal += totalItem;
            const stockDisponible = item.stock || 0;

            html += `
                <div class="cart-item" data-index="${index}">
                    <img src="${item.imagen || '../images/placeholder.jpg'}" alt="${item.nombre}" />
                    <div class="item-info">
                        <div class="item-name">${item.nombre}</div>
                        <div class="item-restaurante"><i class="fas fa-store" aria-hidden="true"></i> ${item.restaurante_nombre || 'Restaurante'}</div>
                        <div class="item-price">$${precio.toFixed(2)}</div>
                        <div class="item-stock">Stock disponible: ${stockDisponible} unidades</div>
                    </div>
                    <div class="item-actions">
                        <div class="cantidad-wrapper">
                            <button class="btn-cantidad" data-index="${index}" data-action="decrement" ${cantidad <= 0 ? 'disabled' : ''}>−</button>
                            <span class="cantidad-input" id="cantidad-${index}">${cantidad}</span>
                            <button class="btn-cantidad" data-index="${index}" data-action="increment" ${cantidad >= stockDisponible ? 'disabled' : ''}>+</button>
                        </div>
                        <button class="btn-remove" data-index="${index}" data-tooltip="Eliminar del carrito">
                            <i class="fas fa-trash-alt" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        const envio = subtotal > 0 ? (subtotal * 0.05) : 0;
        const total = subtotal + envio;

        html += `
            <div class="cart-summary">
                <div class="summary-row">
                    <span class="label">Subtotal</span>
                    <span class="value">$${subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span class="label">Envío</span>
                    <span class="value">$${envio.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span class="label">Total</span>
                    <span class="value">$${total.toFixed(2)}</span>
                </div>
                <button class="btn-checkout" id="btnCheckout" data-tooltip="Confirmar reserva">
                    <i class="fas fa-check-circle" aria-hidden="true"></i> Reservar ahora
                </button>
                <button class="btn-checkout" id="btnVaciarCarrito" style="background: var(--color-error); margin-top: 8px;" data-tooltip="Vaciar carrito">
                    <i class="fas fa-trash" aria-hidden="true"></i> Vaciar carrito
                </button>
            </div>
        `;

        container.innerHTML = html;
        actualizarBadge();

        // ===== EVENTOS DE CANTIDAD (SPINNER) =====
        container.querySelectorAll('.btn-cantidad').forEach(btn => {
            btn.addEventListener('click', async function(e) {
                e.preventDefault();
                const idx = parseInt(this.dataset.index);
                const action = this.dataset.action;
                const carrito = obtenerCarrito();
                if (!carrito[idx]) return;
                const item = carrito[idx];
                const stockDisponible = await obtenerStock(item.id);
                item.stock = stockDisponible;

                if (action === 'increment') {
                    if (item.cantidad < stockDisponible) {
                        item.cantidad++;
                    } else {
                        alert(`⚠️ Solo hay ${stockDisponible} unidades disponibles.`);
                        return;
                    }
                } else if (action === 'decrement') {
                    if (item.cantidad > 1) {
                        item.cantidad--;
                    } else {
                        if (confirm(`¿Eliminar "${item.nombre}" del carrito?`)) {
                            carrito.splice(idx, 1);
                        } else {
                            return;
                        }
                    }
                }
                guardarCarrito(carrito);
                renderizarCarrito();
            });
        });

        // ===== ELIMINAR ITEM =====
        container.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.dataset.index);
                const carrito = obtenerCarrito();
                const item = carrito[idx];
                if (confirm(`¿Eliminar "${item.nombre}" del carrito?`)) {
                    carrito.splice(idx, 1);
                    guardarCarrito(carrito);
                    renderizarCarrito();
                }
            });
        });

        // ===== VACIAR CARRITO =====
        document.getElementById('btnVaciarCarrito')?.addEventListener('click', function() {
            if (confirm('¿Vaciar todo el carrito?')) {
                guardarCarrito([]);
                renderizarCarrito();
            }
        });

        // ===== CHECKOUT =====
        document.getElementById('btnCheckout')?.addEventListener('click', function() {
            alert('✅ Funcionalidad de reserva en construcción. Pronto podrás confirmar tu pedido.');
        });
    }

    // ===== INICIALIZAR =====
    renderizarCarrito();

});