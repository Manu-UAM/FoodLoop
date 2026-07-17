const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();


// Conexión a PostgreSQL (remotamente remoto jajaja)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
});
 

/*
// Conexión a PostgreSQL (localmente local xD)
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '123456', // ← Tu contraseña local
    database: 'foodloop'
});
*/

// Probar conexión a la base de datos
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error al conectar a PostgreSQL:', err.message);
    } else {
        console.log('✅ Conectado a PostgreSQL');
        release();
    }
});

// ===== CONFIGURACIÓN DEL SERVIDOR =====
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ===== RUTAS =====

// Ruta de prueba (para verificar que el servidor funciona)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Servidor FoodLoop funcionando 🚀',
        timestamp: new Date().toISOString()
    });
});

// ===== RUTA DE REGISTRO =====
app.post('/api/registro', async (req, res) => {
    try {
        
        const { 
            nombre, 
            apellido, 
            email, 
            password,
            tipoUsuario,
            region,
            notificaciones,
            nombreRestaurante,
            direccion,
            categoria,
            categoriaOtro,
            horarioApertura,
            horarioCierre,
            telefonoLocal,
            whatsappRestaurante,
            fotoSubida
        } = req.body;

        // Verificar si el email ya existe
        const emailCheck = await pool.query(
            'SELECT id FROM usuarios WHERE email = $1',
            [email]
        );

        if (emailCheck.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Este correo electrónico ya está registrado'
            });
        }

        // Guardar usuario en la base de datos
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const result = await pool.query(
            `INSERT INTO usuarios 
             (nombre, apellido, email, password_hash, tipo_usuario, telefono)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, uuid, nombre, apellido, email, tipo_usuario`,
            [
                nombre, 
                apellido, 
                email, 
                hashedPassword, // En producción, usar bcrypt
                tipoUsuario,
                notificaciones?.telefonoWhatsapp || null
            ]
        );

        const usuario = result.rows[0];

        // Si es restaurante, guardar datos del restaurante
        if (tipoUsuario === 'restaurante' && nombreRestaurante) {
            // Asegurar que los campos de dirección tengan valores
            const direccion = req.body.direccion || {};
            
            await pool.query(
                `INSERT INTO restaurantes 
                (usuario_id, nombre_comercial, region, calle, numero, 
                colonia, ciudad, codigo_postal, categoria, categoria_otro,
                horario_apertura, horario_cierre, telefono_local, whatsapp)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
                [
                    usuario.id,
                    nombreRestaurante,
                    region || 'No especificada',
                    direccion.calle || '',
                    direccion.numero || '',
                    direccion.colonia || '',
                    direccion.ciudad || '',
                    direccion.codigoPostal || '',
                    categoria || 'otro',
                    categoriaOtro || null,
                    horarioApertura || null,
                    horarioCierre || null,
                    telefonoLocal || null,
                    whatsappRestaurante || null
                ]
            );
            console.log('✅ Restaurante guardado con dirección:', direccion);
        }

        // Si el usuario tiene preferencias, guardarlas
        if (notificaciones) {
            await pool.query(
                `INSERT INTO preferencias 
                 (usuario_id, notificaciones_email, notificaciones_whatsapp)
                 VALUES ($1, $2, $3)`,
                [
                    usuario.id,
                    notificaciones.email || false,
                    notificaciones.whatsapp || false
                ]
            );
        }

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            usuario: {
                id: usuario.uuid,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                tipo: usuario.tipo_usuario
            }
        });

    } catch (error) {
        console.error('❌ Error en registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar usuario',
            error: error.message
        });
    }
});

// ===== INICIAR SERVIDOR =====
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📊 API de registro: http://localhost:${PORT}/api/registro`);
    console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
});

// ================================================================
// LOGIN
// ================================================================
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar que se envíen email y password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email y contraseña son obligatorios'
            });
        }

        // Buscar usuario por email
        const result = await pool.query(
            'SELECT id, uuid, nombre, apellido, email, password_hash, tipo_usuario FROM usuarios WHERE email = $1',
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas'
            });
        }

        const usuario = result.rows[0];

        // Verificar contraseña con bcrypt
        const passwordMatch = await bcrypt.compare(password, usuario.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas'
            });
        }

        // Generar JWT (expira en 7 días)
        const token = jwt.sign(
            {
                id: usuario.id,
                uuid: usuario.uuid,
                email: usuario.email,
                tipo: usuario.tipo_usuario
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Responder con token y datos del usuario (sin password_hash)
        res.json({
            success: true,
            token,
            usuario: {
                id: usuario.uuid,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                tipo: usuario.tipo_usuario
            }
        });

    } catch (error) {
        console.error('❌ Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
});

// ================================================================
// MIDDLEWARE: VERIFICAR TOKEN JWT
// ================================================================
function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Token requerido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Token inválido o expirado' });
    }
}

// ================================================================
// OBTENER PLATILLOS DEL RESTAURANTE
// ================================================================
app.get('/api/restaurante/platillos', verificarToken, async (req, res) => {
    try {
        const usuarioId = req.usuario.id;

        // Obtener el restaurante asociado al usuario
        const restauranteResult = await pool.query(
            'SELECT id FROM restaurantes WHERE usuario_id = $1',
            [usuarioId]
        );

        if (restauranteResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado'
            });
        }

        const restauranteId = restauranteResult.rows[0].id;

        // Obtener platillos del restaurante
        const platillosResult = await pool.query(
            `SELECT id, nombre, descripcion, precio, precio_original, precio_oferta, 
                    precio_actual, tipo_oferta, stock, disponible, imagen, categoria,
                    subasta_intervalo, subasta_disminucion, subasta_limite, subasta_tiempo_espera
             FROM platillos 
             WHERE restaurante_id = $1 
             ORDER BY id DESC`,
            [restauranteId]
        );

        res.json({
            success: true,
            platillos: platillosResult.rows
        });

    } catch (error) {
        console.error('❌ Error al obtener platillos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener platillos'
        });
    }
});

function generarCodigoReserva() {
    const fecha = new Date();
    const fechaStr = fecha.toISOString().split('T')[0]; // YYYY-MM-DD
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `FL-${fechaStr}-${random}`;
}

// ================================================================
// PUBLICAR PLATILLO
// ================================================================
app.post('/api/restaurante/platillo', verificarToken, async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const {
            nombre,
            descripcion,
            tipoOferta,
            stock,
            categoria,
            imagen, // Base64
            precioOriginalVenta,
            precioOfertaVenta,
            precioOriginalSubasta,
            precioInicioSubasta,
            intervaloSubasta,
            disminucionSubasta,
            limiteMinimoSubasta,
            tiempoEsperaSubasta,
            precioDonacion
        } = req.body;

        // Obtener restaurante del usuario
        const restauranteResult = await pool.query(
            'SELECT id FROM restaurantes WHERE usuario_id = $1',
            [usuarioId]
        );

        if (restauranteResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado'
            });
        }

        const restauranteId = restauranteResult.rows[0].id;

        // Calcular precios según tipo de oferta
        let precio = 0;
        let precioOriginal = null;
        let precioOferta = null;
        let precioActual = null;
        let subastaIntervalo = null;
        let subastaDisminucion = null;
        let subastaLimite = null;
        let subastaTiempoEspera = null;

        if (tipoOferta === 'venta') {
            precio = parseFloat(precioOfertaVenta) || 0;
            precioOriginal = parseFloat(precioOriginalVenta) || 0;
            precioOferta = parseFloat(precioOfertaVenta) || 0;
            precioActual = precio;
        } else if (tipoOferta === 'subasta') {
            precio = parseFloat(precioInicioSubasta) || 0;
            precioOriginal = parseFloat(precioOriginalSubasta) || 0;
            precioActual = parseFloat(precioInicioSubasta) || 0;
            subastaIntervalo = parseInt(intervaloSubasta) || 10;
            subastaDisminucion = parseFloat(disminucionSubasta) || 10;
            subastaLimite = parseFloat(limiteMinimoSubasta) || 0;
            subastaTiempoEspera = parseInt(tiempoEsperaSubasta) || 30;
        } else if (tipoOferta === 'donacion') {
            precio = 0;
            precioOriginal = parseFloat(precioDonacion) || 0;
            precioActual = 0;
        }

        // Insertar platillo
        const result = await pool.query(
            `INSERT INTO platillos 
             (restaurante_id, nombre, descripcion, precio, precio_original, precio_oferta, 
              precio_actual, tipo_oferta, stock, disponible, imagen, categoria,
              subasta_intervalo, subasta_disminucion, subasta_limite, subasta_tiempo_espera)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
             RETURNING id`,
            [
                restauranteId,
                nombre,
                descripcion || '',
                precio,
                precioOriginal,
                precioOferta,
                precioActual,
                tipoOferta,
                parseInt(stock) || 1,
                true, // disponible
                imagen || null,
                categoria || 'otro',
                subastaIntervalo,
                subastaDisminucion,
                subastaLimite,
                subastaTiempoEspera
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Platillo publicado correctamente',
            platilloId: result.rows[0].id
        });

    } catch (error) {
        console.error('❌ Error al publicar platillo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al publicar platillo'
        });
    }
});

// ================================================================
// ELIMINAR PLATILLO
// ================================================================
app.delete('/api/restaurante/platillo/:id', verificarToken, async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const platilloId = parseInt(req.params.id);

        // Verificar que el platillo pertenece al restaurante del usuario
        const checkResult = await pool.query(
            `SELECT p.id FROM platillos p
             JOIN restaurantes r ON p.restaurante_id = r.id
             WHERE p.id = $1 AND r.usuario_id = $2`,
            [platilloId, usuarioId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Platillo no encontrado o no autorizado'
            });
        }

        await pool.query('DELETE FROM platillos WHERE id = $1', [platilloId]);

        res.json({
            success: true,
            message: 'Platillo eliminado correctamente'
        });

    } catch (error) {
        console.error('❌ Error al eliminar platillo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar platillo'
        });
    }
});

// ================================================================
// OBTENER RESERVAS DEL RESTAURANTE
// ================================================================
app.get('/api/restaurante/reservas', verificarToken, async (req, res) => {
    try {
        const usuarioId = req.usuario.id;

        const restauranteResult = await pool.query(
            'SELECT id FROM restaurantes WHERE usuario_id = $1',
            [usuarioId]
        );

        if (restauranteResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado'
            });
        }

        const restauranteId = restauranteResult.rows[0].id;

        const reservasResult = await pool.query(
            `SELECT r.id, r.codigo, r.total, r.estado, r.fecha_reserva,
                    u.nombre as cliente_nombre, u.apellido as cliente_apellido,
                    p.nombre as platillo_nombre
             FROM reservaciones r
             JOIN usuarios u ON r.usuario_id = u.id
             JOIN platillos p ON r.platillo_id = p.id
             WHERE r.restaurante_id = $1
             ORDER BY r.fecha_reserva DESC`,
            [restauranteId]
        );

        const reservas = reservasResult.rows.map(row => ({
            id: row.id,
            codigo: row.codigo,
            cliente: `${row.cliente_nombre} ${row.cliente_apellido}`,
            platillo: row.platillo_nombre,
            total: parseFloat(row.total),
            fecha: row.fecha_reserva.toISOString(),
            estado: row.estado
        }));

        res.json({
            success: true,
            reservas
        });

    } catch (error) {
        console.error('❌ Error al obtener reservas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener reservas'
        });
    }
});

// ================================================================
// ACTUALIZAR ESTADO DE RESERVA
// ================================================================
app.put('/api/restaurante/reserva/:id', verificarToken, async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const reservaId = parseInt(req.params.id);
        const { estado } = req.body;

        if (!['confirmada', 'cancelada', 'completada'].includes(estado)) {
            return res.status(400).json({
                success: false,
                message: 'Estado no válido'
            });
        }

        // Verificar que la reserva pertenece al restaurante
        const checkResult = await pool.query(
            `SELECT r.id FROM reservaciones r
             JOIN restaurantes res ON r.restaurante_id = res.id
             WHERE r.id = $1 AND res.usuario_id = $2`,
            [reservaId, usuarioId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Reserva no encontrada o no autorizada'
            });
        }

        // Actualizar estado y fechas según el estado
        let fechaConfirmacion = null;
        let fechaCompletada = null;
        let fechaCancelacion = null;

        if (estado === 'confirmada') fechaConfirmacion = new Date();
        else if (estado === 'completada') fechaCompletada = new Date();
        else if (estado === 'cancelada') fechaCancelacion = new Date();

        await pool.query(
            `UPDATE reservaciones 
             SET estado = $1, fecha_confirmacion = $2, fecha_completada = $3, fecha_cancelacion = $4
             WHERE id = $5`,
            [estado, fechaConfirmacion, fechaCompletada, fechaCancelacion, reservaId]
        );

        // Si se confirma una reserva, actualizar stock del platillo
        if (estado === 'confirmada') {
            await pool.query(
                `UPDATE platillos 
                 SET stock = stock - 1,
                     disponible = CASE WHEN stock - 1 <= 0 THEN false ELSE true END
                 WHERE id = (SELECT platillo_id FROM reservaciones WHERE id = $1)`,
                [reservaId]
            );
        }

        // Si se cancela, devolver stock
        if (estado === 'cancelada') {
            await pool.query(
                `UPDATE platillos 
                 SET stock = stock + 1,
                     disponible = true
                 WHERE id = (SELECT platillo_id FROM reservaciones WHERE id = $1)`,
                [reservaId]
            );
        }

        res.json({
            success: true,
            message: `Reserva ${estado} correctamente`
        });

    } catch (error) {
        console.error('❌ Error al actualizar reserva:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar reserva'
        });
    }
});

// ================================================================
// ESTADÍSTICAS DEL DASHBOARD
// ================================================================
app.get('/api/restaurante/dashboard', verificarToken, async (req, res) => {
    try {
        const usuarioId = req.usuario.id;

        const restauranteResult = await pool.query(
            'SELECT id FROM restaurantes WHERE usuario_id = $1',
            [usuarioId]
        );

        if (restauranteResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado'
            });
        }

        const restauranteId = restauranteResult.rows[0].id;

        // Platillos activos
        const platillosResult = await pool.query(
            'SELECT COUNT(*) FROM platillos WHERE restaurante_id = $1 AND disponible = true',
            [restauranteId]
        );
        const platillosActivos = parseInt(platillosResult.rows[0].count);

        // Reservas de hoy
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const manana = new Date(hoy);
        manana.setDate(manana.getDate() + 1);

        const reservasHoyResult = await pool.query(
            `SELECT COUNT(*) FROM reservaciones 
             WHERE restaurante_id = $1 AND fecha_reserva >= $2 AND fecha_reserva < $3`,
            [restauranteId, hoy, manana]
        );
        const reservasHoy = parseInt(reservasHoyResult.rows[0].count);

        // Ganancias de hoy (reservas completadas)
        const gananciasResult = await pool.query(
            `SELECT COALESCE(SUM(total), 0) FROM reservaciones 
             WHERE restaurante_id = $1 AND estado = 'completada' AND fecha_reserva >= $2 AND fecha_reserva < $3`,
            [restauranteId, hoy, manana]
        );
        const ganancias = parseFloat(gananciasResult.rows[0].coalesce);

        // Notificaciones (reservas pendientes)
        const notificacionesResult = await pool.query(
            'SELECT COUNT(*) FROM reservaciones WHERE restaurante_id = $1 AND estado = \'pendiente\'',
            [restauranteId]
        );
        const notificaciones = parseInt(notificacionesResult.rows[0].count);

        res.json({
            success: true,
            estadisticas: {
                platillosActivos,
                reservasHoy,
                ganancias,
                notificaciones
            }
        });

    } catch (error) {
        console.error('❌ Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas'
        });
    }
});

// ================================================================
// OBTENER PERFIL DEL RESTAURANTE
// ================================================================
app.get('/api/restaurante/perfil', verificarToken, async (req, res) => {
    try {
        const usuarioId = req.usuario.id;

        console.log('📥 Solicitando perfil para usuario:', usuarioId);

        // Obtener el restaurante del usuario junto con datos del usuario
        const result = await pool.query(
            `SELECT 
                r.id as restaurante_id,
                r.nombre_comercial,
                r.region,
                r.calle,
                r.numero,
                r.colonia,
                r.ciudad,
                r.codigo_postal,
                r.categoria,
                r.horario_apertura,
                r.horario_cierre,
                r.telefono_local,
                r.whatsapp,
                r.foto_local,
                u.email,
                u.telefono
             FROM restaurantes r
             JOIN usuarios u ON r.usuario_id = u.id
             WHERE r.usuario_id = $1`,
            [usuarioId]
        );

        if (result.rows.length === 0) {
            console.log('⚠️ Restaurante no encontrado para usuario:', usuarioId);
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado'
            });
        }

        const perfil = result.rows[0];
        console.log('✅ Perfil cargado para:', perfil.nombre_comercial);

        res.json({
            success: true,
            perfil: perfil
        });

    } catch (error) {
        console.error('❌ Error al obtener perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener perfil',
            error: error.message
        });
    }
});

// ================================================================
// ACTUALIZAR PERFIL DEL RESTAURANTE
// ================================================================
app.put('/api/restaurante/perfil', verificarToken, async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const {
            nombre,
            telefono,
            email,
            direccion,
            horarioApertura,
            horarioCierre,
            password,
            fotoLocal
        } = req.body;

        console.log('📝 Actualizando perfil para usuario:', usuarioId);
        console.log('📝 Datos recibidos:', { nombre, telefono, email, horarioApertura, horarioCierre });

        // Validar campos obligatorios
        if (!nombre || !telefono || !email) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, teléfono y email son obligatorios'
            });
        }

        if (!email.includes('@')) {
            return res.status(400).json({
                success: false,
                message: 'Correo electrónico inválido'
            });
        }

        // Verificar que el restaurante existe
        const checkResult = await pool.query(
            'SELECT id FROM restaurantes WHERE usuario_id = $1',
            [usuarioId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado'
            });
        }

        const restauranteId = checkResult.rows[0].id;

        // Iniciar transacción
        await pool.query('BEGIN');

        // Actualizar usuario (email, teléfono, contraseña)
        let updateUserQuery = 'UPDATE usuarios SET email = $1, telefono = $2 WHERE id = $3';
        let updateUserParams = [email, telefono, usuarioId];

        // Si se proporciona una nueva contraseña (mínimo 6 caracteres)
        if (password && password.trim().length >= 6) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            updateUserQuery = 'UPDATE usuarios SET email = $1, telefono = $2, password_hash = $3 WHERE id = $4';
            updateUserParams = [email, telefono, hashedPassword, usuarioId];
            console.log('🔑 Contraseña actualizada');
        }

        await pool.query(updateUserQuery, updateUserParams);

        // Extraer datos de dirección si se proporciona como string
        let calle = '';
        let numero = '';
        let colonia = '';
        let ciudad = '';
        let codigoPostal = '';

        if (direccion) {
            const partes = direccion.split(',').map(p => p.trim());
            if (partes.length >= 1) calle = partes[0] || '';
            if (partes.length >= 2) numero = partes[1] || '';
            if (partes.length >= 3) colonia = partes[2] || '';
            if (partes.length >= 4) ciudad = partes[3] || '';
            if (partes.length >= 5) codigoPostal = partes[4] || '';
        }

        // Actualizar restaurante
        await pool.query(
            `UPDATE restaurantes 
             SET nombre_comercial = $1, 
                 calle = $2, 
                 numero = $3, 
                 colonia = $4, 
                 ciudad = $5, 
                 codigo_postal = $6,
                 horario_apertura = $7, 
                 horario_cierre = $8,
                 telefono_local = $9,
                 foto_local = $10
             WHERE usuario_id = $11`,
            [
                nombre,
                calle || 'No especificada',
                numero || 'S/N',
                colonia || 'No especificada',
                ciudad || 'No especificada',
                codigoPostal || '00000',
                horarioApertura || '10:00',
                horarioCierre || '22:00',
                telefono,
                fotoLocal || null,
                usuarioId
            ]
        );

        await pool.query('COMMIT');

        console.log('✅ Perfil actualizado para usuario:', usuarioId);

        // Obtener el perfil actualizado
        const result = await pool.query(
            `SELECT r.id, r.nombre_comercial, r.telefono_local, r.foto_local,
                    u.email, u.telefono
             FROM restaurantes r
             JOIN usuarios u ON r.usuario_id = u.id
             WHERE r.usuario_id = $1`,
            [usuarioId]
        );

        res.json({
            success: true,
            message: 'Perfil actualizado correctamente',
            perfil: result.rows[0]
        });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('❌ Error al actualizar perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar perfil',
            error: error.message
        });
    }
});

// ================================================================
// OBTENER PLATILLOS PARA CONSUMIDORES (con precio_oferta)
// ================================================================
app.get('/api/platillos', verificarToken, async (req, res) => {
    try {
        console.log('📥 Solicitando platillos para consumidor');

        // Obtener todos los platillos disponibles con información del restaurante
        const result = await pool.query(
            `SELECT 
                p.id,
                p.nombre,
                p.descripcion,
                p.precio,
                p.precio_original,
                p.precio_oferta,
                p.precio_actual,
                p.tipo_oferta,
                p.stock,
                p.disponible,
                p.imagen,
                p.categoria,
                r.nombre_comercial as restaurante_nombre,
                r.region,
                r.ciudad
             FROM platillos p
             JOIN restaurantes r ON p.restaurante_id = r.id
             WHERE p.disponible = true AND p.stock > 0
             ORDER BY p.fecha_publicacion DESC`
        );

        // Transformar datos para asegurar que precio_oferta y precio_original sean números
        const platillos = result.rows.map(p => ({
            ...p,
            precio: parseFloat(p.precio),
            precio_original: p.precio_original ? parseFloat(p.precio_original) : null,
            precio_oferta: p.precio_oferta ? parseFloat(p.precio_oferta) : null,
            precio_actual: p.precio_actual ? parseFloat(p.precio_actual) : null,
            stock: parseInt(p.stock)
        }));

        console.log(`✅ ${platillos.length} platillos disponibles`);
        res.json({
            success: true,
            platillos
        });

    } catch (error) {
        console.error('❌ Error al obtener platillos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener platillos'
        });
    }
});

// ================================================================
// OBTENER STOCK ACTUAL DE UN PLATILLO (para el carrito)
// ================================================================
app.get('/api/platillos/:id/stock', verificarToken, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const result = await pool.query(
            'SELECT stock FROM platillos WHERE id = $1',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Platillo no encontrado'
            });
        }
        res.json({
            success: true,
            stock: parseInt(result.rows[0].stock)
        });
    } catch (error) {
        console.error('❌ Error al obtener stock:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener stock'
        });
    }
});

// ================================================================
// CARRITO DE COMPRAS
// ================================================================

// Obtener carrito del consumidor
app.get('/api/carrito', verificarToken, async (req, res) => {
    try {
        const usuarioId = req.usuario.id;

        const result = await pool.query(
            `SELECT c.id, c.platillo_id, c.cantidad, 
                    p.nombre, p.precio, p.precio_oferta, p.tipo_oferta, p.imagen,
                    r.nombre_comercial as restaurante_nombre
             FROM carrito c
             JOIN platillos p ON c.platillo_id = p.id
             JOIN restaurantes r ON p.restaurante_id = r.id
             WHERE c.usuario_id = $1`,
            [usuarioId]
        );

        // Calcular total
        let total = 0;
        const items = result.rows.map(item => {
            const precio = item.tipo_oferta === 'venta' ? (item.precio_oferta || item.precio) : item.precio;
            const subtotal = parseFloat(precio) * item.cantidad;
            total += subtotal;
            return {
                ...item,
                precio_unitario: parseFloat(precio),
                subtotal: subtotal
            };
        });

        res.json({
            success: true,
            carrito: {
                items,
                total: total,
                cantidad: items.length
            }
        });

    } catch (error) {
        console.error('❌ Error al obtener carrito:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener carrito'
        });
    }
});

// Agregar al carrito
app.post('/api/carrito', verificarToken, async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const { platillo_id, cantidad } = req.body;

        if (!platillo_id) {
            return res.status(400).json({
                success: false,
                message: 'ID de platillo requerido'
            });
        }

        // Verificar que el platillo existe y está disponible
        const platilloResult = await pool.query(
            'SELECT id, stock, disponible FROM platillos WHERE id = $1',
            [platillo_id]
        );

        if (platilloResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Platillo no encontrado'
            });
        }

        const platillo = platilloResult.rows[0];
        if (!platillo.disponible || platillo.stock <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Platillo no disponible'
            });
        }

        // Verificar si ya está en el carrito
        const existResult = await pool.query(
            'SELECT id, cantidad FROM carrito WHERE usuario_id = $1 AND platillo_id = $2',
            [usuarioId, platillo_id]
        );

        if (existResult.rows.length > 0) {
            // Actualizar cantidad
            const nuevaCantidad = existResult.rows[0].cantidad + (cantidad || 1);
            await pool.query(
                'UPDATE carrito SET cantidad = $1 WHERE id = $2',
                [nuevaCantidad, existResult.rows[0].id]
            );
        } else {
            // Insertar nuevo
            await pool.query(
                'INSERT INTO carrito (usuario_id, platillo_id, cantidad) VALUES ($1, $2, $3)',
                [usuarioId, platillo_id, cantidad || 1]
            );
        }

        res.json({
            success: true,
            message: 'Platillo agregado al carrito'
        });

    } catch (error) {
        console.error('❌ Error al agregar al carrito:', error);
        res.status(500).json({
            success: false,
            message: 'Error al agregar al carrito'
        });
    }
});

// Actualizar cantidad en el carrito
app.put('/api/carrito/:id', verificarToken, async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const carritoId = parseInt(req.params.id);
        const { cantidad } = req.body;

        if (!cantidad || cantidad < 1) {
            return res.status(400).json({
                success: false,
                message: 'Cantidad inválida'
            });
        }

        const result = await pool.query(
            'UPDATE carrito SET cantidad = $1 WHERE id = $2 AND usuario_id = $3 RETURNING id',
            [cantidad, carritoId, usuarioId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Cantidad actualizada'
        });

    } catch (error) {
        console.error('❌ Error al actualizar carrito:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar carrito'
        });
    }
});

// Eliminar del carrito
app.delete('/api/carrito/:id', verificarToken, async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const carritoId = parseInt(req.params.id);

        const result = await pool.query(
            'DELETE FROM carrito WHERE id = $1 AND usuario_id = $2 RETURNING id',
            [carritoId, usuarioId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Item eliminado del carrito'
        });

    } catch (error) {
        console.error('❌ Error al eliminar del carrito:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar del carrito'
        });
    }
});

// Vaciar carrito
app.delete('/api/carrito', verificarToken, async (req, res) => {
    try {
        const usuarioId = req.usuario.id;

        await pool.query(
            'DELETE FROM carrito WHERE usuario_id = $1',
            [usuarioId]
        );

        res.json({
            success: true,
            message: 'Carrito vaciado'
        });

    } catch (error) {
        console.error('❌ Error al vaciar carrito:', error);
        res.status(500).json({
            success: false,
            message: 'Error al vaciar carrito'
        });
    }
});

// ================================================================
// RESERVAS DEL CONSUMIDOR
// ================================================================

// Generar código alfanumérico
function generarCodigoReserva() {
    const fecha = new Date();
    const fechaStr = fecha.toISOString().split('T')[0]; // YYYY-MM-DD
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `FL-${fechaStr}-${random}`;
}

// Crear reserva (checkout)
app.post('/api/reservas', verificarToken, async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const { items, metodo_pago, notas } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Carrito vacío'
            });
        }

        // Iniciar transacción
        await pool.query('BEGIN');

        let totalGeneral = 0;
        const reservasCreadas = [];

        for (const item of items) {
            // Obtener info del platillo
            const platilloResult = await pool.query(
                `SELECT p.id, p.nombre, p.precio, p.precio_oferta, p.tipo_oferta, p.stock, 
                        r.id as restaurante_id, r.nombre_comercial
                 FROM platillos p
                 JOIN restaurantes r ON p.restaurante_id = r.id
                 WHERE p.id = $1`,
                [item.platillo_id]
            );

            if (platilloResult.rows.length === 0) {
                throw new Error(`Platillo ${item.platillo_id} no encontrado`);
            }

            const platillo = platilloResult.rows[0];
            const precioUnitario = platillo.tipo_oferta === 'venta' 
                ? (platillo.precio_oferta || platillo.precio) 
                : platillo.precio;
            const subtotal = parseFloat(precioUnitario) * item.cantidad;
            totalGeneral += subtotal;

            // Generar código de reserva
            const codigo = generarCodigoReserva();

            // Insertar reserva
            const reservaResult = await pool.query(
                `INSERT INTO reservaciones 
                 (usuario_id, platillo_id, restaurante_id, codigo, cantidad, total, estado, notas)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 RETURNING id, codigo`,
                [
                    usuarioId,
                    platillo.id,
                    platillo.restaurante_id,
                    codigo,
                    item.cantidad,
                    subtotal,
                    'pendiente',
                    notas || ''
                ]
            );

            reservasCreadas.push({
                id: reservaResult.rows[0].id,
                codigo: reservaResult.rows[0].codigo,
                platillo_nombre: platillo.nombre,
                restaurante_nombre: platillo.nombre_comercial,
                cantidad: item.cantidad,
                subtotal: subtotal,
                estado: 'pendiente'
            });

            // Actualizar stock del platillo
            await pool.query(
                'UPDATE platillos SET stock = stock - $1, disponible = CASE WHEN stock - $1 <= 0 THEN false ELSE true END WHERE id = $2',
                [item.cantidad, platillo.id]
            );
        }

        // Limpiar carrito
        await pool.query('DELETE FROM carrito WHERE usuario_id = $1', [usuarioId]);

        await pool.query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Reserva creada exitosamente',
            reservas: reservasCreadas,
            total: totalGeneral,
            codigos: reservasCreadas.map(r => r.codigo)
        });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('❌ Error al crear reserva:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear reserva: ' + error.message
        });
    }
});

// Obtener reservas del consumidor
app.get('/api/reservas', verificarToken, async (req, res) => {
    try {
        const usuarioId = req.usuario.id;

        const result = await pool.query(
            `SELECT r.id, r.codigo, r.cantidad, r.total, r.estado, r.fecha_reserva,
                    r.fecha_confirmacion, r.fecha_completada, r.fecha_cancelacion, r.notas,
                    p.nombre as platillo_nombre, p.imagen,
                    res.nombre_comercial as restaurante_nombre
             FROM reservaciones r
             JOIN platillos p ON r.platillo_id = p.id
             JOIN restaurantes res ON r.restaurante_id = res.id
             WHERE r.usuario_id = $1
             ORDER BY r.fecha_reserva DESC`,
            [usuarioId]
        );

        res.json({
            success: true,
            reservas: result.rows
        });

    } catch (error) {
        console.error('❌ Error al obtener reservas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener reservas'
        });
    }
});

// Cancelar reserva
app.put('/api/reservas/:id/cancelar', verificarToken, async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const reservaId = parseInt(req.params.id);

        // Verificar que la reserva pertenece al usuario y está pendiente
        const checkResult = await pool.query(
            'SELECT id, platillo_id, cantidad, estado FROM reservaciones WHERE id = $1 AND usuario_id = $2',
            [reservaId, usuarioId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Reserva no encontrada'
            });
        }

        const reserva = checkResult.rows[0];
        if (reserva.estado === 'completada') {
            return res.status(400).json({
                success: false,
                message: 'No se puede cancelar una reserva completada'
            });
        }

        if (reserva.estado === 'cancelada') {
            return res.status(400).json({
                success: false,
                message: 'La reserva ya está cancelada'
            });
        }

        // Iniciar transacción
        await pool.query('BEGIN');

        // Actualizar estado
        await pool.query(
            'UPDATE reservaciones SET estado = $1, fecha_cancelacion = CURRENT_TIMESTAMP WHERE id = $2',
            ['cancelada', reservaId]
        );

        // Devolver stock al platillo
        await pool.query(
            'UPDATE platillos SET stock = stock + $1, disponible = true WHERE id = $2',
            [reserva.cantidad, reserva.platillo_id]
        );

        await pool.query('COMMIT');

        res.json({
            success: true,
            message: 'Reserva cancelada correctamente'
        });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('❌ Error al cancelar reserva:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cancelar reserva'
        });
    }
});

// Obtener detalle de una reserva
app.get('/api/reservas/:id', verificarToken, async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const reservaId = parseInt(req.params.id);

        const result = await pool.query(
            `SELECT r.id, r.codigo, r.cantidad, r.total, r.estado, r.fecha_reserva,
                    r.fecha_confirmacion, r.fecha_completada, r.fecha_cancelacion, r.notas,
                    p.id as platillo_id, p.nombre as platillo_nombre, p.descripcion, p.imagen,
                    res.id as restaurante_id, res.nombre_comercial as restaurante_nombre,
                    res.calle, res.numero, res.colonia, res.ciudad,
                    res.telefono_local
             FROM reservaciones r
             JOIN platillos p ON r.platillo_id = p.id
             JOIN restaurantes res ON r.restaurante_id = res.id
             WHERE r.id = $1 AND r.usuario_id = $2`,
            [reservaId, usuarioId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Reserva no encontrada'
            });
        }

        res.json({
            success: true,
            reserva: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Error al obtener detalle de reserva:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener detalle de reserva'
        });
    }
});

// ================================================================
// FAVORITOS
// ================================================================

// Agregar restaurante a favoritos
app.post('/api/favoritos', verificarToken, async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const { restaurante_id } = req.body;

        if (!restaurante_id) {
            return res.status(400).json({
                success: false,
                message: 'ID de restaurante requerido'
            });
        }

        // Verificar que el restaurante existe
        const checkResult = await pool.query(
            'SELECT id FROM restaurantes WHERE id = $1',
            [restaurante_id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado'
            });
        }

        // Verificar si ya está en favoritos
        const existResult = await pool.query(
            'SELECT id FROM favoritos WHERE usuario_id = $1 AND restaurante_id = $2',
            [usuarioId, restaurante_id]
        );

        if (existResult.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Restaurante ya está en favoritos'
            });
        }

        await pool.query(
            'INSERT INTO favoritos (usuario_id, restaurante_id) VALUES ($1, $2)',
            [usuarioId, restaurante_id]
        );

        res.status(201).json({
            success: true,
            message: 'Restaurante agregado a favoritos'
        });

    } catch (error) {
        console.error('❌ Error al agregar favorito:', error);
        res.status(500).json({
            success: false,
            message: 'Error al agregar favorito'
        });
    }
});

// Eliminar restaurante de favoritos
app.delete('/api/favoritos/:restaurante_id', verificarToken, async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const restauranteId = parseInt(req.params.restaurante_id);

        const result = await pool.query(
            'DELETE FROM favoritos WHERE usuario_id = $1 AND restaurante_id = $2 RETURNING id',
            [usuarioId, restauranteId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Favorito no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Restaurante eliminado de favoritos'
        });

    } catch (error) {
        console.error('❌ Error al eliminar favorito:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar favorito'
        });
    }
});

// Obtener favoritos del consumidor
app.get('/api/favoritos', verificarToken, async (req, res) => {
    try {
        const usuarioId = req.usuario.id;

        const result = await pool.query(
            `SELECT f.restaurante_id, r.nombre_comercial, r.region, r.ciudad, r.calificacion
             FROM favoritos f
             JOIN restaurantes r ON f.restaurante_id = r.id
             WHERE f.usuario_id = $1
             ORDER BY f.fecha_agregado DESC`,
            [usuarioId]
        );

        res.json({
            success: true,
            favoritos: result.rows
        });

    } catch (error) {
        console.error('❌ Error al obtener favoritos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener favoritos'
        });
    }
});
