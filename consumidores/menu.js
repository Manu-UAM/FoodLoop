// ================================================================
// MENÚ CONSUMIDOR · CONTROL PRINCIPAL
// ================================================================

document.addEventListener('DOMContentLoaded', function() {

    // ===== VERIFICAR AUTENTICACIÓN =====
    const usuario = obtenerUsuarioLogueado();
    if (!usuario) {
        window.location.href = '../login.html';
        return;
    } else if (usuario.tipo !== 'consumidor') {
        alert('Acceso no autorizado. Esta página es solo para consumidores.');
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

    // ===== LOGO REDIRIGE A INICIO =====
    const logoLink = document.getElementById('logoLink');
    if (logoLink) {
        logoLink.addEventListener('click', function() {
            window.location.href = 'menu.html';
        });
    }

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
        actualizarBadgeCarrito();
        return items;
    }

    function actualizarBadgeCarrito() {
        const items = obtenerCarrito();
        const total = items.reduce((sum, item) => sum + item.cantidad, 0);
        const badges = document.querySelectorAll('.badge-carrito');
        badges.forEach(b => b.textContent = total);
    }

    function estaEnCarrito(id) {
        const carrito = obtenerCarrito();
        return carrito.some(item => item.id === id);
    }

    // ===== RENDERIZAR PLATILLOS =====
    const mainContent = document.getElementById('mainContent');
    let filtroActual = 'todos';

    function renderizarPlatillos(platillos) {
        const disponibles = platillos.filter(p => !estaEnCarrito(p.id));

        if (disponibles.length === 0) {
            mainContent.innerHTML = `
                <div class="loading-spinner-container">
                    <i class="fas fa-utensils" style="font-size: 48px; color: var(--text-muted);"></i>
                    <p>No hay platillos disponibles en este momento</p>
                </div>
            `;
            return;
        }

        mainContent.innerHTML = disponibles.map(p => {
            const precioMostrar = p.tipo_oferta === 'venta' ? (p.precio_oferta || p.precio) : p.precio;
            const precioOriginal = p.tipo_oferta === 'venta' ? p.precio_original : null;
            const descuento = precioOriginal ? Math.round(((precioOriginal - precioMostrar) / precioOriginal) * 100) : 0;
            const badge = p.tipo_oferta === 'subasta' ? 'Subasta' : p.tipo_oferta === 'donacion' ? 'Donación' : 'Oferta';
            const stock = p.stock || 0;
            const id = p.id;

            return `
                <div class="card" data-tooltip="Ver detalles del platillo" data-id="${id}">
                    <div style="position: relative;">
                        <img src="${p.imagen || '../images/placeholder.jpg'}" alt="${p.nombre}" class="card-image" />
                        <span class="card-badge">${badge}</span>
                    </div>
                    <div class="card-body">
                        <div class="card-header">
                            <h3 class="card-title">${p.nombre}</h3>
                            <span class="card-meta rating">
                                <i class="fas fa-star" aria-hidden="true"></i> 4.8
                            </span>
                        </div>
                        <p class="card-restaurante">
                            <i class="fas fa-store" aria-hidden="true"></i> ${p.restaurante_nombre || 'Restaurante'}
                        </p>
                        <div class="card-meta">
                            <span><i class="fas fa-map-marker-alt" aria-hidden="true"></i> 1.2 km</span>
                            <span><i class="fas fa-tag" aria-hidden="true"></i> ${p.categoria || 'General'}</span>
                        </div>
                        <div class="card-stock">
                            <i class="fas fa-box" aria-hidden="true"></i> Stock: ${stock} unidades
                        </div>
                        <button class="btn-ver-oferta" onclick="verOferta('${id}')" data-tooltip="Ver oferta y reservar">
                            Ver oferta
                        </button>
                        <div class="card-footer">
                            <div class="card-prices">
                                <span class="price-current">$${parseFloat(precioMostrar).toFixed(2)}</span>
                                ${precioOriginal ? `<span class="price-original">$${parseFloat(precioOriginal).toFixed(2)}</span>` : ''}
                                ${descuento > 0 ? `<span class="price-discount">${descuento}% OFF</span>` : ''}
                            </div>
                            <div class="card-actions-row">
                                <div class="cantidad-wrapper">
                                    <button class="btn-cantidad" data-id="${id}" data-action="decrement" ${stock <= 0 ? 'disabled' : ''}>−</button>
                                    <input type="number" class="cantidad-input" id="cantidad-${id}" value="0" min="0" max="${stock}" data-max="${stock}" readonly />
                                    <button class="btn-cantidad" data-id="${id}" data-action="increment" ${stock <= 0 ? 'disabled' : ''}>+</button>
                                    <button class="btn-add-cart" data-id="${id}" data-nombre="${p.nombre}" data-precio="${precioMostrar}" data-imagen="${p.imagen || ''}" data-restaurante="${p.restaurante_nombre || ''}" disabled>
                                        <i class="fas fa-plus" aria-hidden="true"></i> Carrito
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // ===== ASIGNAR EVENTOS DE SPINNER =====
        document.querySelectorAll('.btn-cantidad').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const id = this.dataset.id;
                const action = this.dataset.action;
                const input = document.getElementById(`cantidad-${id}`);
                const max = parseInt(input.dataset.max) || 0;
                let current = parseInt(input.value) || 0;
                const addBtn = this.parentElement.querySelector('.btn-add-cart');

                if (action === 'increment') {
                    if (current < max) {
                        current++;
                    } else {
                        alert(`⚠️ Solo hay ${max} unidades disponibles.`);
                        return;
                    }
                } else if (action === 'decrement') {
                    if (current > 0) {
                        current--;
                    }
                }
                input.value = current;
                addBtn.disabled = current <= 0;
            });
        });

        // ===== EVENTO PARA AÑADIR AL CARRITO =====
        document.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const id = this.dataset.id;
                const nombre = this.dataset.nombre;
                const precio = parseFloat(this.dataset.precio);
                const imagen = this.dataset.imagen;
                const restaurante = this.dataset.restaurante;
                const input = document.getElementById(`cantidad-${id}`);
                const cantidad = parseInt(input.value) || 0;

                if (cantidad <= 0) {
                    alert('Selecciona una cantidad mayor a 0');
                    return;
                }

                agregarAlCarritoConCantidad(id, nombre, precio, imagen, restaurante, cantidad);
            });
        });
    }

    // Función para agregar con cantidad específica
    window.agregarAlCarritoConCantidad = function(id, nombre, precio, imagen, restaurante, cantidad) {
        let carrito = obtenerCarrito();
        const existente = carrito.find(item => item.id === id);
        if (existente) {
            existente.cantidad += cantidad;
            existente.timestamp = Date.now();
        } else {
            carrito.push({
                id: id,
                nombre: nombre,
                precio: precio,
                imagen: imagen || '../images/placeholder.jpg',
                restaurante_nombre: restaurante || 'Restaurante',
                cantidad: cantidad,
                timestamp: Date.now(),
                stock: 0 // se actualizará al renderizar carrito
            });
        }
        guardarCarrito(carrito);
        alert(`✅ ${cantidad}x ${nombre} añadido al carrito por 10 minutos.`);
        cargarPlatillos(filtroActual);
    };

    // ===== CARGAR PLATILLOS DESDE LA API =====
    async function cargarPlatillos(filtro) {
        mainContent.innerHTML = `
            <div class="loading-spinner-container">
                <div class="spinner"></div>
                <p>Cargando platillos...</p>
            </div>
        `;

        try {
            const response = await fetch(`${API_BASE_URL}/platillos`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 401) {
                    cerrarSesion();
                    return;
                }
                throw new Error('Error al cargar platillos');
            }

            const data = await response.json();
            console.log('📦 Datos recibidos del backend:', data);
            let platillos = data.platillos || [];

            if (filtro && filtro !== 'todos') {
                if (filtro === 'cerca') {
                    platillos = platillos.slice(0, 3);
                } else if (filtro === 'subasta') {
                    platillos = platillos.filter(p => p.tipo_oferta === 'subasta');
                } else if (filtro === 'postres') {
                    platillos = platillos.filter(p => p.categoria === 'postres' || p.categoria === 'dulces');
                } else if (filtro === 'mexicana') {
                    platillos = platillos.filter(p => p.categoria === 'mexicana');
                } else if (filtro === 'rapida') {
                    platillos = platillos.filter(p => p.categoria === 'rapida');
                } else if (filtro === 'italiana') {
                    platillos = platillos.filter(p => p.categoria === 'italiana');
                } else if (filtro === 'asiatica') {
                    platillos = platillos.filter(p => p.categoria === 'asiatica');
                } else if (filtro === 'vegetariana') {
                    platillos = platillos.filter(p => p.categoria === 'vegetariana');
                } else if (filtro === 'donacion') {
                    platillos = platillos.filter(p => p.tipo_oferta === 'donacion');
                } else if (filtro === 'ofertas') {
                    // Filtro de ofertas: tipo venta y precio_oferta EXISTE y es menor que precio
                    platillos = platillos.filter(p => 
                        p.tipo_oferta === 'venta' && 
                        p.precio_oferta !== null && 
                        p.precio !== null && 
                        p.precio_oferta < p.precio
                    );
                    console.log('🔍 Platillos de oferta encontrados:', platillos.length);
                }
            }

            renderizarPlatillos(platillos);

        } catch (error) {
            console.error('Error cargando platillos:', error);
            mainContent.innerHTML = `
                <div class="loading-spinner-container">
                    <i class="fas fa-exclamation-circle" style="font-size: 48px; color: var(--color-error);"></i>
                    <p style="color: var(--color-error);">Error al cargar los platillos</p>
                    <button onclick="cargarPlatillos('${filtroActual}')" style="padding:10px 24px; background:var(--color-primary); color:white; border:none; border-radius:8px; cursor:pointer; font-weight:700; margin-top:8px;">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }

    // ===== FILTROS =====
    const filterBtns = document.querySelectorAll('.filter-btn:not(.dropdown-toggle)');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('dropdownContent')?.classList.remove('show');
            document.getElementById('dropdownToggle')?.classList.remove('active');
            filtroActual = this.dataset.filter;
            cargarPlatillos(filtroActual);
        });
    });

    // ===== DROPDOWN "MÁS" =====
    const dropdownToggle = document.getElementById('dropdownToggle');
    const dropdownContent = document.getElementById('dropdownContent');

    if (dropdownToggle && dropdownContent) {
        dropdownToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            dropdownContent.classList.toggle('show');
            this.classList.toggle('active');
        });

        document.addEventListener('click', function() {
            dropdownContent.classList.remove('show');
            dropdownToggle.classList.remove('active');
        });

        dropdownContent.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const filter = this.dataset.filter;
                filterBtns.forEach(b => b.classList.remove('active'));
                dropdownToggle.classList.add('active');
                dropdownContent.classList.remove('show');
                filtroActual = filter;
                cargarPlatillos(filter);
            });
        });
    }

    // ===== VER OFERTA =====
    window.verOferta = function(id) {
        window.location.href = `detalle-platillo.html?id=${id}`;
    };

    // ===== INICIALIZAR =====
    obtenerCarrito();
    cargarPlatillos('todos');
    actualizarBadgeCarrito();

    console.log('✅ Menú del consumidor inicializado correctamente.');
    window.cargarPlatillos = cargarPlatillos;
});