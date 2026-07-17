// ================================================================
// DASHBOARD RESTAURANTE · CONTROL PRINCIPAL
// ================================================================

document.addEventListener('DOMContentLoaded', function() {

    // ================================================================
    // 1. VERIFICAR AUTENTICACIÓN
    // ================================================================
    const usuario = obtenerUsuarioLogueado();
    if (!usuario) {
        window.location.href = '../login.html';
        return;
    } else if (usuario.tipo !== 'restaurante') {
        alert('Acceso no autorizado. Esta página es solo para restaurantes.');
        window.location.href = '../login.html';
        return;
    }

    // ================================================================
    // 2. ELEMENTOS DEL DOM
    // ================================================================
    const nombreRestaurante = document.getElementById('nombreRestaurante');
    const modoDaltonico = document.getElementById('modoDaltonico');
    const textoGrande = document.getElementById('textoGrande');
    const logoLink = document.getElementById('logoLink');
    const navItems = document.querySelectorAll('.nav-item');
    const btnFilters = document.querySelectorAll('.btn-filter');
    const formPublicar = document.getElementById('formPublicar');
    const formPerfil = document.getElementById('formPerfil');

    const sections = {
        dashboard: document.getElementById('section-dashboard'),
        publicar: document.getElementById('section-publicar'),
        'mis-platillos': document.getElementById('section-mis-platillos'),
        reservas: document.getElementById('section-reservas'),
        perfil: document.getElementById('section-perfil')
    };

    // ================================================================
    // 3. MOSTRAR NOMBRE DEL RESTAURANTE
    // ================================================================
    if (nombreRestaurante) {
        nombreRestaurante.textContent = usuario.nombre || 'Restaurante';
    }

    // ================================================================
    // 4. PREFERENCIAS (Modo Daltónico y Texto Grande)
    // ================================================================
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

    // ================================================================
    // 5. LOGO REDIRIGE A INICIO
    // ================================================================
    if (logoLink) {
        logoLink.addEventListener('click', function() {
            navItems.forEach(n => n.classList.remove('active'));
            document.querySelector('.nav-item[data-section="dashboard"]').classList.add('active');
            Object.keys(sections).forEach(key => {
                sections[key].classList.toggle('active', key === 'dashboard');
            });
        });
    }

    // ================================================================
    // 6. NAVEGACIÓN POR PESTAÑAS
    // ================================================================
    if (navItems.length > 0) {
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                navItems.forEach(n => n.classList.remove('active'));
                this.classList.add('active');
                const section = this.dataset.section;
                Object.keys(sections).forEach(key => {
                    sections[key].classList.toggle('active', key === section);
                });
                if (section === 'mis-platillos') cargarPlatillos();
                if (section === 'reservas') cargarReservas();
                if (section === 'dashboard') cargarDashboard();
            });
        });
    }

    // ================================================================
    // 7. FILTROS DE RESERVAS
    // ================================================================
    let filtroReservas = 'todas';

    if (btnFilters.length > 0) {
        btnFilters.forEach(btn => {
            btn.addEventListener('click', function() {
                btnFilters.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                filtroReservas = this.dataset.filter;
                cargarReservas();
            });
        });
        // Establecer "Todas" como activo por defecto
        const primerFiltro = document.querySelector('.btn-filter[data-filter="todas"]');
        if (primerFiltro) primerFiltro.classList.add('active');
    }

    // ================================================================
    // 8. FUNCIONES DE API
    // ================================================================

    function getAuthHeaders() {
        const token = obtenerToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    // ================================================================
    // 9. CARGAR DASHBOARD
    // ================================================================
    async function cargarDashboard() {
        console.log('🔄 Cargando dashboard...');
        try {
            const response = await fetch(`${API_BASE_URL}/restaurante/dashboard`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 401) {
                    cerrarSesion();
                    return;
                }
                throw new Error('Error al cargar estadísticas');
            }

            const data = await response.json();
            if (data.success) {
                document.getElementById('countPlatillos').textContent = data.estadisticas.platillosActivos;
                document.getElementById('countReservasHoy').textContent = data.estadisticas.reservasHoy;
                document.getElementById('gananciasHoy').textContent = `$${data.estadisticas.ganancias}`;
                document.getElementById('notificaciones').textContent = data.estadisticas.notificaciones;
            }

            await cargarUltimasReservas();
        } catch (error) {
            console.error('Error en dashboard:', error);
        }
    }

    async function cargarUltimasReservas() {
        try {
            const response = await fetch(`${API_BASE_URL}/restaurante/reservas`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) throw new Error('Error al cargar reservas');

            const data = await response.json();
            const tbody = document.getElementById('tablaReservasDash');
            const reservas = data.reservas || [];

            if (reservas.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No hay reservas recientes</td></tr>`;
            } else {
                const ultimas = reservas.slice(0, 5);
                tbody.innerHTML = ultimas.map(r => `
                    <tr>
                        <td>${r.cliente}</td>
                        <td>${r.platillo}</td>
                        <td>$${r.total}</td>
                        <td><span class="badge badge-${r.estado}">${r.estado}</span></td>
                        <td>
                            ${r.estado === 'pendiente' ? `<button class="btn-action confirm" onclick="confirmarReserva('${r.id}')"><i class="fas fa-check"></i></button>` : ''}
                            ${r.estado === 'pendiente' || r.estado === 'confirmada' ? `<button class="btn-action cancel" onclick="cancelarReserva('${r.id}')"><i class="fas fa-times"></i></button>` : ''}
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error('Error cargando últimas reservas:', error);
        }
    }

    // ================================================================
    // 10. CARGAR PLATILLOS (con columna de categoría)
    // ================================================================
    async function cargarPlatillos() {
        const tbody = document.getElementById('tablaMisPlatillos');
        try {
            const response = await fetch(`${API_BASE_URL}/restaurante/platillos`, {
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
            const platillos = data.platillos || [];

            const search = document.getElementById('searchPlatillo').value.toLowerCase();
            const filterCat = document.getElementById('filterCategoria').value;
            const filtrados = platillos.filter(p => {
                const matchNombre = p.nombre.toLowerCase().includes(search);
                const matchCat = filterCat ? p.categoria === filterCat : true;
                return matchNombre && matchCat;
            });

            // Mapeo de categorías para mostrar nombres legibles
            const categoriaMap = {
                'rapida': 'Comida rápida',
                'mexicana': 'Mexicana',
                'italiana': 'Italiana',
                'asiatica': 'Asiática',
                'vegetariana': 'Vegetariana/Vegana',
                'otro': 'Otro'
            };

            if (filtrados.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">No se encontraron platillos</td></tr>`;
            } else {
                tbody.innerHTML = filtrados.map(p => {
                    const precioMostrar = p.tipo_oferta === 'venta' ? p.precio_oferta || p.precio : p.precio;
                    const categoriaNombre = categoriaMap[p.categoria] || p.categoria || 'Sin categoría';
                    return `
                        <tr>
                            <td>${p.nombre}</td>
                            <td><span class="badge-categoria">${categoriaNombre}</span></td>
                            <td>$${parseFloat(precioMostrar).toFixed(2)}</td>
                            <td>${p.stock}</td>
                            <td>${p.tipo_oferta}</td>
                            <td>
                                <button class="btn-action edit" onclick="editarPlatillo('${p.id}')"><i class="fas fa-edit"></i></button>
                                <button class="btn-action delete" onclick="eliminarPlatillo('${p.id}')"><i class="fas fa-trash-alt"></i></button>
                            </td>
                        </tr>
                    `;
                }).join('');
            }
        } catch (error) {
            console.error('Error cargando platillos:', error);
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--color-error);">Error al cargar platillos</td></tr>`;
        }
    }

    // ================================================================
    // 11. CARGAR RESERVAS
    // ================================================================
    async function cargarReservas() {
        const tbody = document.getElementById('tablaReservas');
        try {
            const response = await fetch(`${API_BASE_URL}/restaurante/reservas`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) throw new Error('Error al cargar reservas');

            const data = await response.json();
            const todas = data.reservas || [];
            const filtradas = filtroReservas === 'todas' ? todas : todas.filter(r => r.estado === filtroReservas);

            if (filtradas.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">No hay reservas</td></tr>`;
            } else {
                tbody.innerHTML = filtradas.map(r => `
                    <tr>
                        <td><strong>${r.codigo || 'N/A'}</strong></td>
                        <td>${r.cliente}</td>
                        <td>${r.platillo}</td>
                        <td>$${r.total}</td>
                        <td>${new Date(r.fecha).toLocaleString()}</td>
                        <td><span class="badge badge-${r.estado}">${r.estado}</span></td>
                        <td>
                            ${r.estado === 'pendiente' ? `<button class="btn-action confirm" onclick="confirmarReserva('${r.id}')"><i class="fas fa-check"></i></button>` : ''}
                            ${r.estado === 'pendiente' || r.estado === 'confirmada' ? `<button class="btn-action cancel" onclick="cancelarReserva('${r.id}')"><i class="fas fa-times"></i></button>` : ''}
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error('Error cargando reservas:', error);
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--color-error);">Error al cargar reservas</td></tr>`;
        }
    }

    // ================================================================
    // 12. ACCIONES DE PLATILLOS
    // ================================================================
    window.editarPlatillo = function(id) {
        alert(`🛠️ Editar platillo ID: ${id}\n(Redirigir a página de edición o abrir modal)`);
    };

    window.eliminarPlatillo = async function(id) {
        if (!confirm('¿Eliminar este platillo?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/restaurante/platillo/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (!response.ok) throw new Error('Error al eliminar');

            const data = await response.json();
            alert(data.message || 'Platillo eliminado correctamente');
            cargarPlatillos();
            cargarDashboard();
        } catch (error) {
            console.error('Error eliminando platillo:', error);
            alert('❌ Error al eliminar el platillo');
        }
    };

    // ================================================================
    // 13. ACCIONES DE RESERVAS
    // ================================================================
    window.confirmarReserva = async function(id) {
        if (!confirm('¿Confirmar esta reserva?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/restaurante/reserva/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ estado: 'confirmada' })
            });

            if (!response.ok) throw new Error('Error al confirmar');

            const data = await response.json();
            alert(data.message || 'Reserva confirmada');
            cargarReservas();
            cargarDashboard();
        } catch (error) {
            console.error('Error confirmando reserva:', error);
            alert('❌ Error al confirmar la reserva');
        }
    };

    window.cancelarReserva = async function(id) {
        if (!confirm('¿Cancelar esta reserva?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/restaurante/reserva/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ estado: 'cancelada' })
            });

            if (!response.ok) throw new Error('Error al cancelar');

            const data = await response.json();
            alert(data.message || 'Reserva cancelada');
            cargarReservas();
            cargarDashboard();
        } catch (error) {
            console.error('Error cancelando reserva:', error);
            alert('❌ Error al cancelar la reserva');
        }
    };

    // ================================================================
    // 14. BÚSQUEDA Y FILTROS EN TIEMPO REAL
    // ================================================================
    const searchPlatillo = document.getElementById('searchPlatillo');
    const filterCategoria = document.getElementById('filterCategoria');

    if (searchPlatillo) {
        searchPlatillo.addEventListener('input', cargarPlatillos);
    }
    if (filterCategoria) {
        filterCategoria.addEventListener('change', cargarPlatillos);
    }

    // ================================================================
    // 15. TIPOS DE OFERTA DINÁMICOS (Venta / Subasta / Donación)
    // ================================================================
    const tipoOferta = document.getElementById('tipoOferta');
    const camposVenta = document.getElementById('camposVenta');
    const camposSubasta = document.getElementById('camposSubasta');
    const camposDonacion = document.getElementById('camposDonacion');

    if (tipoOferta) {
        function toggleCamposOferta() {
            const tipo = tipoOferta.value;
            if (camposVenta) camposVenta.style.display = tipo === 'venta' ? 'block' : 'none';
            if (camposSubasta) camposSubasta.style.display = tipo === 'subasta' ? 'block' : 'none';
            if (camposDonacion) camposDonacion.style.display = tipo === 'donacion' ? 'block' : 'none';
        }
        tipoOferta.addEventListener('change', toggleCamposOferta);
        toggleCamposOferta();
    }

    // ================================================================
    // 16. FORMULARIO DE PUBLICACIÓN (CON MANEJO DE ERRORES MEJORADO)
    // ================================================================
    if (formPublicar) {
        formPublicar.addEventListener('submit', async function(e) {
            e.preventDefault();

            // === OBTENER TODOS LOS ELEMENTOS DEL FORMULARIO ===
            const nombreEl = document.getElementById('nombrePlatillo');
            const descripcionEl = document.getElementById('descripcionPlatillo');
            const tipoOfertaEl = document.getElementById('tipoOferta');
            const stockEl = document.getElementById('stockPlatillo');
            const categoriaEl = document.getElementById('categoriaPlatillo');

            // Validar que todos los elementos existan
            const elementosRequeridos = {
                nombre: nombreEl,
                descripcion: descripcionEl,
                tipoOferta: tipoOfertaEl,
                stock: stockEl,
                categoria: categoriaEl
            };

            let hasMissingElement = false;
            Object.keys(elementosRequeridos).forEach(key => {
                if (!elementosRequeridos[key]) {
                    console.error(`❌ Elemento faltante: ${key}`);
                    hasMissingElement = true;
                }
            });

            if (hasMissingElement) {
                alert('❌ Error en el formulario. Algunos campos no existen. Revisa la consola.');
                return;
            }

            const tipo = tipoOfertaEl.value;

            // === VALIDAR CAMPOS OBLIGATORIOS ===
            let hasError = false;

            // Limpiar errores previos
            [nombreEl, descripcionEl, stockEl, categoriaEl].forEach(el => {
                if (el) el.classList.remove('error');
            });

            if (!nombreEl.value.trim()) {
                nombreEl.classList.add('error');
                hasError = true;
            }
            if (!descripcionEl.value.trim() || descripcionEl.value.trim().length < 10) {
                descripcionEl.classList.add('error');
                hasError = true;
            }
            if (!stockEl.value || parseInt(stockEl.value) < 1) {
                stockEl.classList.add('error');
                hasError = true;
            }
            if (!categoriaEl.value) {
                categoriaEl.classList.add('error');
                hasError = true;
            }

            // === VALIDAR CAMPOS SEGÚN TIPO DE OFERTA ===
            if (tipo === 'venta') {
                const precioOrig = document.getElementById('precioOriginalVenta');
                const precioOfer = document.getElementById('precioOfertaVenta');
                [precioOrig, precioOfer].forEach(el => {
                    if (el) el.classList.remove('error');
                });
                if (!precioOrig || !precioOrig.value || parseFloat(precioOrig.value) <= 0) {
                    if (precioOrig) precioOrig.classList.add('error');
                    hasError = true;
                }
                if (!precioOfer || !precioOfer.value || parseFloat(precioOfer.value) <= 0) {
                    if (precioOfer) precioOfer.classList.add('error');
                    hasError = true;
                }
                if (precioOrig && precioOfer && precioOrig.value && precioOfer.value && 
                    parseFloat(precioOfer.value) >= parseFloat(precioOrig.value)) {
                    if (precioOfer) precioOfer.classList.add('error');
                    alert('⚠️ El precio en oferta debe ser menor que el precio original.');
                    hasError = true;
                }
            } else if (tipo === 'subasta') {
                const precioOrig = document.getElementById('precioOriginalSubasta');
                const precioInicio = document.getElementById('precioInicioSubasta');
                const limiteMin = document.getElementById('limiteMinimoSubasta');
                const tiempoEspera = document.getElementById('tiempoEsperaSubasta');
                [precioOrig, precioInicio, limiteMin, tiempoEspera].forEach(el => {
                    if (el) el.classList.remove('error');
                });
                if (!precioOrig || !precioOrig.value || parseFloat(precioOrig.value) <= 0) {
                    if (precioOrig) precioOrig.classList.add('error');
                    hasError = true;
                }
                if (!precioInicio || !precioInicio.value || parseFloat(precioInicio.value) <= 0) {
                    if (precioInicio) precioInicio.classList.add('error');
                    hasError = true;
                }
                if (!limiteMin || !limiteMin.value || parseFloat(limiteMin.value) <= 0) {
                    if (limiteMin) limiteMin.classList.add('error');
                    hasError = true;
                }
                if (precioInicio && limiteMin && precioInicio.value && limiteMin.value &&
                    parseFloat(limiteMin.value) >= parseFloat(precioInicio.value)) {
                    if (limiteMin) limiteMin.classList.add('error');
                    alert('⚠️ El límite mínimo debe ser menor que el precio de inicio.');
                    hasError = true;
                }
                if (!tiempoEspera || !tiempoEspera.value || parseInt(tiempoEspera.value) < 1) {
                    if (tiempoEspera) tiempoEspera.classList.add('error');
                    hasError = true;
                }
            }

            // ===== VALIDAR FOTO CON MENSAJES ESPECÍFICOS =====
            const status = document.getElementById('fotoStatus');
            if (!fotoBase64) {
                if (status) {
                    status.innerHTML = '❌ Debes tomar una foto.';
                    status.style.color = 'var(--color-error)';
                }
                hasError = true;
                alert('📸 Debes tomar una foto del platillo con la cámara.');
            } else {
                // Verificar que la foto no esté corrupta o sea demasiado grande
                try {
                    // Intentar crear un objeto Image para validar que la imagen es válida
                    const img = new Image();
                    img.src = fotoBase64;
                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = () => reject(new Error('La imagen está corrupta'));
                    });
                    
                    // Verificar tamaño (máximo 5MB en base64)
                    const sizeInBytes = Math.round((fotoBase64.length * 3) / 4);
                    const sizeInMB = sizeInBytes / (1024 * 1024);
                    if (sizeInMB > 5) {
                        if (status) {
                            status.innerHTML = `⚠️ La foto pesa ${sizeInMB.toFixed(1)}MB (máximo 5MB)`;
                            status.style.color = 'var(--color-error)';
                        }
                        hasError = true;
                        alert(`⚠️ La foto es demasiado grande (${sizeInMB.toFixed(1)}MB). Máximo 5MB.`);
                    } else if (status) {
                        status.innerHTML = `✅ Foto lista (${sizeInMB.toFixed(1)}MB)`;
                        status.style.color = 'var(--color-success)';
                    }
                } catch (imgError) {
                    if (status) {
                        status.innerHTML = '❌ La foto está corrupta. Toma otra.';
                        status.style.color = 'var(--color-error)';
                    }
                    hasError = true;
                    alert('❌ La foto no es válida. Toma otra foto.');
                    fotoBase64 = null;
                    fotoPreview.style.display = 'none';
                }
            }

            if (hasError) {
                alert('⚠️ Completa todos los campos obligatorios correctamente.');
                return;
            }

            // === CONSTRUIR PAYLOAD ===
            const payload = {
                nombre: nombreEl.value.trim(),
                descripcion: descripcionEl.value.trim(),
                tipoOferta: tipo,
                stock: parseInt(stockEl.value),
                categoria: categoriaEl.value,
                imagen: fotoBase64
            };

            if (tipo === 'venta') {
                payload.precioOriginalVenta = parseFloat(document.getElementById('precioOriginalVenta').value);
                payload.precioOfertaVenta = parseFloat(document.getElementById('precioOfertaVenta').value);
            } else if (tipo === 'subasta') {
                payload.precioOriginalSubasta = parseFloat(document.getElementById('precioOriginalSubasta').value);
                payload.precioInicioSubasta = parseFloat(document.getElementById('precioInicioSubasta').value);
                payload.intervaloSubasta = document.getElementById('intervaloSubasta').value;
                payload.disminucionSubasta = document.getElementById('disminucionSubasta').value;
                payload.limiteMinimoSubasta = parseFloat(document.getElementById('limiteMinimoSubasta').value);
                payload.tiempoEsperaSubasta = parseInt(document.getElementById('tiempoEsperaSubasta').value);
            } else if (tipo === 'donacion') {
                payload.precioDonacion = parseFloat(document.getElementById('precioDonacion').value) || 0;
            }

            // Mostrar spinner
            if (typeof showLoading === 'function') {
                showLoading('#btnPublicar', 'Publicando...');
            }

            try {
                console.log('📤 Enviando platillo:', payload);
                
                const response = await fetch(`${API_BASE_URL}/restaurante/platillo`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(payload)
                });

                // Intentar obtener el cuerpo de la respuesta (incluso si es error)
                let data;
                const responseText = await response.text();
                try {
                    data = JSON.parse(responseText);
                } catch (parseError) {
                    console.error('❌ Error al parsear respuesta:', responseText);
                    throw new Error(`El servidor respondió con: ${responseText.substring(0, 100)}...`);
                }

                if (!response.ok) {
                    // Mostrar mensaje detallado del error
                    const errorMsg = data.message || data.error || 'Error desconocido del servidor';
                    console.error('❌ Error del servidor:', errorMsg);
                    console.error('📄 Detalles:', data);
                    throw new Error(`Error: ${errorMsg}`);
                }

                alert('✅ Platillo publicado correctamente.');
                formPublicar.reset();
                fotoBase64 = null;
                if (fotoPreview) fotoPreview.style.display = 'none';
                if (status) status.innerHTML = '📷 (obligatoria)';

                // Cerrar cámara si está abierta
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                    stream = null;
                    video.style.display = 'none';
                    video.srcObject = null;
                    btnAbrir.style.display = 'inline-flex';
                    btnTomar.style.display = 'none';
                    btnRetomar.style.display = 'none';
                    btnEliminar.style.display = 'none';
                    btnCerrar.style.display = 'none';
                }

                cargarPlatillos();
                cargarDashboard();

            } catch (error) {
                console.error('❌ Error publicando:', error);
                alert(`❌ ${error.message}`);
            } finally {
                if (typeof hideLoading === 'function') {
                    hideLoading('#btnPublicar');
                }
            }
        });
    }

    // ================================================================
    // 17. CÁMARA PARA FOTO DEL PLATILLO
    // ================================================================
    let stream = null;
    let fotoBase64 = null;

    const video = document.getElementById('videoCamara');
    const canvas = document.createElement('canvas');
    const fotoPreview = document.getElementById('fotoPreview');
    const fotoCapturada = document.getElementById('fotoCapturada');
    const fotoStatus = document.getElementById('fotoStatus');
    const btnAbrir = document.getElementById('btnAbrirCamara');
    const btnTomar = document.getElementById('btnTomarFoto');
    const btnRetomar = document.getElementById('btnRetomarFoto');
    const btnEliminar = document.getElementById('btnEliminarFoto');
    const btnCerrar = document.getElementById('btnCerrarCamara');

    if (btnAbrir) {
        btnAbrir.addEventListener('click', async function() {
            try {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    fotoStatus.innerHTML = '❌ Tu navegador no soporta la cámara.';
                    fotoStatus.style.color = 'var(--color-error)';
                    return;
                }

                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
                    audio: false
                });

                video.srcObject = stream;
                video.style.display = 'block';
                await video.play();

                btnAbrir.style.display = 'none';
                btnTomar.style.display = 'inline-flex';
                btnCerrar.style.display = 'inline-flex';
                btnRetomar.style.display = 'none';
                btnEliminar.style.display = 'none';
                fotoPreview.style.display = 'none';
                fotoStatus.innerHTML = '📸 Cámara activa. Presiona "Tomar foto".';
                fotoStatus.style.color = 'var(--color-primary)';

            } catch (error) {
                console.error('Error al abrir cámara:', error);
                let msg = 'No se pudo acceder a la cámara. ';
                if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                    msg += 'Permite el acceso en tu navegador.';
                } else if (error.name === 'NotFoundError') {
                    msg += 'No se encontró una cámara.';
                } else {
                    msg += 'Error: ' + error.message;
                }
                fotoStatus.innerHTML = '❌ ' + msg;
                fotoStatus.style.color = 'var(--color-error)';
            }
        });
    }

    if (btnTomar) {
        btnTomar.addEventListener('click', function() {
            if (!stream) return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            fotoBase64 = canvas.toDataURL('image/jpeg', 0.8);

            fotoCapturada.src = fotoBase64;
            fotoPreview.style.display = 'block';
            fotoStatus.innerHTML = '✅ Foto tomada correctamente.';
            fotoStatus.style.color = 'var(--color-success)';

            btnTomar.style.display = 'none';
            btnRetomar.style.display = 'inline-flex';
            btnEliminar.style.display = 'inline-flex';
        });
    }

    if (btnRetomar) {
        btnRetomar.addEventListener('click', function() {
            fotoBase64 = null;
            fotoPreview.style.display = 'none';
            fotoStatus.innerHTML = '📸 Toma una nueva foto.';
            fotoStatus.style.color = 'var(--color-primary)';
            btnRetomar.style.display = 'none';
            btnEliminar.style.display = 'none';
            btnTomar.style.display = 'inline-flex';
            if (!stream) {
                btnAbrir.click();
            }
        });
    }

    if (btnEliminar) {
        btnEliminar.addEventListener('click', function() {
            fotoBase64 = null;
            fotoPreview.style.display = 'none';
            fotoStatus.innerHTML = '📷 Foto eliminada. Toma una nueva.';
            fotoStatus.style.color = 'var(--text-secondary)';
            btnEliminar.style.display = 'none';
            btnTomar.style.display = 'inline-flex';
            btnRetomar.style.display = 'none';
        });
    }

    if (btnCerrar) {
        btnCerrar.addEventListener('click', function() {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
            }
            video.style.display = 'none';
            video.srcObject = null;
            btnAbrir.style.display = 'inline-flex';
            btnTomar.style.display = 'none';
            btnRetomar.style.display = 'none';
            btnEliminar.style.display = 'none';
            btnCerrar.style.display = 'none';
            fotoStatus.innerHTML = '📷 (obligatoria)';
            fotoStatus.style.color = 'var(--text-secondary)';
        });
    }

    // ================================================================
    // 18. PERFIL - CARGAR DATOS DESDE LA API
    // ================================================================
    async function cargarPerfil() {
        try {
            const response = await fetch(`${API_BASE_URL}/restaurante/perfil`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 401) {
                    cerrarSesion();
                    return;
                }
                throw new Error('Error al cargar perfil');
            }

            const data = await response.json();
            if (data.success) {
                const perfil = data.perfil;
                
                // Mapear datos a los campos del formulario
                document.getElementById('perfilNombre').value = perfil.nombre_comercial || '';
                document.getElementById('perfilTelefono').value = perfil.telefono_local || perfil.telefono || '';
                document.getElementById('perfilEmail').value = perfil.email || '';
                
                // Construir dirección a partir de los campos
                const direccion = [
                    perfil.calle || '',
                    perfil.numero || '',
                    perfil.colonia || '',
                    perfil.ciudad || '',
                    perfil.codigo_postal || ''
                ].filter(p => p).join(', ');
                document.getElementById('perfilDireccion').value = direccion;
                
                document.getElementById('perfilHorarioApertura').value = perfil.horario_apertura || '10:00';
                document.getElementById('perfilHorarioCierre').value = perfil.horario_cierre || '22:00';
                
                // Mostrar logo si existe
                if (perfil.foto_local) {
                    const preview = document.getElementById('previewLogo');
                    if (preview) {
                        preview.innerHTML = `<img src="${perfil.foto_local}" style="width:100%; height:100%; object-fit:cover;" />`;
                    }
                }
            }
        } catch (error) {
            console.error('Error cargando perfil:', error);
            alert('❌ Error al cargar los datos del perfil');
        }
    }

    // ================================================================
    // 19. PERFIL - GUARDAR CAMBIOS
    // ================================================================
    if (formPerfil) {
        formPerfil.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Obtener datos del formulario
            const nombre = document.getElementById('perfilNombre').value.trim();
            const telefono = document.getElementById('perfilTelefono').value.trim();
            const email = document.getElementById('perfilEmail').value.trim();
            const direccion = document.getElementById('perfilDireccion').value.trim();
            const horarioApertura = document.getElementById('perfilHorarioApertura').value;
            const horarioCierre = document.getElementById('perfilHorarioCierre').value;
            const password = document.getElementById('perfilPassword').value.trim();

            // Validar campos obligatorios
            if (!nombre || !telefono || !email) {
                alert('⚠️ Nombre, teléfono y email son obligatorios.');
                return;
            }

            if (!email.includes('@')) {
                alert('⚠️ Ingresa un correo electrónico válido.');
                return;
            }

            // Mostrar spinner
            if (typeof showLoading === 'function') {
                showLoading('#btnGuardarPerfil', 'Guardando...');
            }

            try {
                const payload = {
                    nombre,
                    telefono,
                    email,
                    direccion,
                    horarioApertura,
                    horarioCierre,
                    password: password || ''
                };

                const response = await fetch(`${API_BASE_URL}/restaurante/perfil`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Error al guardar perfil');
                }

                alert('✅ Perfil actualizado correctamente.');
                
                // Actualizar el nombre en el header
                const nombreRestaurante = document.getElementById('nombreRestaurante');
                if (nombreRestaurante) {
                    nombreRestaurante.textContent = nombre;
                }

                // Recargar datos del perfil
                await cargarPerfil();

            } catch (error) {
                console.error('Error guardando perfil:', error);
                alert('❌ ' + error.message);
            } finally {
                if (typeof hideLoading === 'function') {
                    hideLoading('#btnGuardarPerfil');
                }
            }
        });
    }

    // ================================================================
    // 20. PERFIL - PREVIEW DEL LOGO
    // ================================================================
    const perfilLogo = document.getElementById('perfilLogo');
    if (perfilLogo) {
        perfilLogo.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    const preview = document.getElementById('previewLogo');
                    if (preview) {
                        preview.innerHTML = `<img src="${ev.target.result}" style="width:100%; height:100%; object-fit:cover;" />`;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // ================================================================
    // 21. INICIALIZAR
    // ================================================================
    cargarDashboard();
    cargarPlatillos();
    cargarReservas();
    cargarPerfil();

    console.log('✅ Dashboard del restaurante inicializado correctamente.');

});