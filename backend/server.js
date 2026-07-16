// ================================================================
// SERVER · EXPRESS + POSTGRESQL
// ================================================================

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

// Cargar variables de entorno
dotenv.config();

// ===== CONFIGURACIÓN DE LA BASE DE DATOS =====
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

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
        const result = await pool.query(
            `INSERT INTO usuarios 
             (nombre, apellido, email, password_hash, tipo_usuario, telefono)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, uuid, nombre, apellido, email, tipo_usuario`,
            [
                nombre, 
                apellido, 
                email, 
                password, // En producción, usar bcrypt
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