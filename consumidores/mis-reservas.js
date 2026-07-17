// ================================================================
// MIS RESERVAS · CONTROL PRINCIPAL
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

    // ===== DATOS MOCK (simulación) =====
    // En producción, esto vendría del backend
    const reservasMock = [
        {
            id: 1,
            codigo: 'FL-2026-07-17-A8B3',
            restaurante: 'Burger King',
            platillo: 'Hamburguesa Doble',
            total: 180.00,
            fecha: '2026-07-17T12:30:00',
            estado: 'confirmada',
            metodo_pago: 'Tarjeta de crédito',
            hora_recoleccion: '13:00',
            notas: 'Sin cebolla'
        },
        {
            id: 2,
            codigo: 'FL-2026-07-16-X9Z2',
            restaurante: 'Taquería El Tío',
            platillo: 'Tacos al Pastor (3 pzas)',
            total: 90.00,
            fecha: '2026-07-16T14:00:00',
            estado: 'completada',
            metodo_pago: 'Efectivo',
            hora_recoleccion: '14:30',
            notas: ''
        },
        {
            id: 3,
            codigo: 'FL-2026-07-17-Q4W7',
            restaurante: 'Pizza Hut',
            platillo: 'Pizza Pepperoni',
            total: 150.00,
            fecha: '2026-07-17T10:15:00',
            estado: 'pendiente',
            metodo_pago: 'Tarjeta de débito',
            hora_recoleccion: '11:00',
            notas: 'Con extra queso'
        }
    ];

    let reservasActuales = [...reservasMock];

    // ===== RENDERIZAR RESERVAS =====
    function renderizarReservas() {
        const container = document.getElementById('reservasContainer');

        if (reservasActuales.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <i class="fas fa-clipboard-list" style="font-size: 64px; color: var(--text-muted); margin-bottom: 16px;"></i>
                    <p style="font-size: 18px; color: var(--text-secondary);">No tienes reservas aún</p>
                    <a href="menu.html" style="display: inline-block; margin-top: 16px; padding: 12px 32px; background: var(--color-primary); color: #FFFFFF; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; text-decoration: none;">Explorar platillos</a>
                </div>
            `;
            return;
        }

        container.innerHTML = reservasActuales.map(r => {
            const estadoClass = `estado-${r.estado}`;
            const estadoLabel = r.estado.charAt(0).toUpperCase() + r.estado.slice(1);
            return `
                <div class="reserva-item" data-id="${r.id}">
                    <div class="reserva-header">
                        <span class="reserva-codigo">${r.codigo}</span>
                        <span class="reserva-estado ${estadoClass}">${estadoLabel}</span>
                    </div>
                    <div class="reserva-detalles">
                        <p><strong>Restaurante:</strong> ${r.restaurante}</p>
                        <p><strong>Platillo:</strong> ${r.platillo}</p>
                        <p><strong>Total:</strong> $${r.total.toFixed(2)}</p>
                        <p><strong>Fecha:</strong> ${new Date(r.fecha).toLocaleString()}</p>
                        <p><strong>Hora de recolección:</strong> ${r.hora_recoleccion}</p>
                    </div>
                    <div class="reserva-actions">
                        <button class="btn-ver-detalle" onclick="verDetalle(${r.id})" data-tooltip="Ver detalles de la reserva">
                            <i class="fas fa-eye" aria-hidden="true"></i> Detalles
                        </button>
                        ${r.estado === 'pendiente' ? `<button class="btn-cancelar" onclick="cancelarReserva(${r.id})" data-tooltip="Cancelar esta reserva">Cancelar</button>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    // ===== VER DETALLE (Modal) =====
    window.verDetalle = function(id) {
        const reserva = reservasActuales.find(r => r.id === id);
        if (!reserva) return;

        const modal = document.getElementById('detalleModal');
        document.getElementById('modalCodigo').textContent = reserva.codigo;
        document.getElementById('modalRestaurante').textContent = reserva.restaurante;
        document.getElementById('modalPlatillo').textContent = reserva.platillo;
        document.getElementById('modalTotal').textContent = `$${reserva.total.toFixed(2)}`;
        document.getElementById('modalFecha').textContent = new Date(reserva.fecha).toLocaleString();
        document.getElementById('modalHoraRecoleccion').textContent = reserva.hora_recoleccion;
        document.getElementById('modalMetodoPago').textContent = reserva.metodo_pago || 'No especificado';
        document.getElementById('modalEstado').textContent = reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1);
        document.getElementById('modalNotas').textContent = reserva.notas || 'Sin notas adicionales';
        modal.classList.add('active');
    };

    window.cerrarModal = function() {
        document.getElementById('detalleModal').classList.remove('active');
    };

    window.cancelarReserva = function(id) {
        if (!confirm('¿Cancelar esta reserva?')) return;
        const reserva = reservasActuales.find(r => r.id === id);
        if (reserva) {
            reserva.estado = 'cancelada';
            renderizarReservas();
            alert('✅ Reserva cancelada correctamente.');
        }
    };

    // ===== MODAL HTML (insertado dinámicamente) =====
    function crearModal() {
        const modalHTML = `
            <div class="modal-overlay" id="detalleModal" onclick="if(event.target===this) cerrarModal()">
                <div class="modal-content">
                    <button class="modal-close" onclick="cerrarModal()">&times;</button>
                    <h3>📋 Detalle de reserva</h3>
                    <div class="detalle-row"><span class="label">Código</span><span class="value" id="modalCodigo">---</span></div>
                    <div class="detalle-row"><span class="label">Restaurante</span><span class="value" id="modalRestaurante">---</span></div>
                    <div class="detalle-row"><span class="label">Platillo</span><span class="value" id="modalPlatillo">---</span></div>
                    <div class="detalle-row"><span class="label">Total</span><span class="value" id="modalTotal">---</span></div>
                    <div class="detalle-row"><span class="label">Fecha</span><span class="value" id="modalFecha">---</span></div>
                    <div class="detalle-row"><span class="label">Hora de recolección</span><span class="value" id="modalHoraRecoleccion">---</span></div>
                    <div class="detalle-row"><span class="label">Método de pago</span><span class="value" id="modalMetodoPago">---</span></div>
                    <div class="detalle-row"><span class="label">Estado</span><span class="value" id="modalEstado">---</span></div>
                    <div class="detalle-row"><span class="label">Notas</span><span class="value" id="modalNotas">---</span></div>
                    <div class="mensaje-agradecimiento">
                        <p>🙏 Gracias por tu contribución contra el desperdicio alimentario</p>
                        <p style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">Presenta este código al recoger tu pedido</p>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // ===== INICIALIZAR =====
    crearModal();
    renderizarReservas();

});