// ================================================================
// API · COMUNICACIÓN CON EL BACKEND
// ================================================================

const API_URL = 'http://localhost:3000/api';

// ================================================================
// REGISTRO DE USUARIO
// ================================================================
async function registrarUsuario(datos) {
    try {
        // Construir el objeto según lo que espera el backend
        const payload = {
            nombre: datos.nombre,
            apellido: datos.apellido,
            email: datos.email,
            password: datos.password || '123456', // Temporal
            tipoUsuario: datos.tipoUsuario,
            region: datos.region || null,
            notificaciones: datos.notificaciones || null,
            nombreRestaurante: datos.nombreRestaurante || null,
            direccion: datos.direccion || null,
            categoria: datos.categoria || null,
            categoriaOtro: datos.categoriaOtro || null,
            horarioApertura: datos.horarioApertura || null,
            horarioCierre: datos.horarioCierre || null,
            telefonoLocal: datos.telefonoLocal || null,
            whatsappRestaurante: datos.whatsappRestaurante || null,
            fotoSubida: datos.fotoSubida || false
        };

        const response = await fetch(`${API_URL}/registro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al registrar usuario');
        }

        console.log('✅ Registro exitoso:', data);
        return {
            success: true,
            data: data
        };

    } catch (error) {
        console.error('❌ Error en registro:', error);
        return {
            success: false,
            message: error.message
        };
    }
}

// ================================================================
// HEALTH CHECK
// ================================================================
async function healthCheck() {
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        console.log('✅ Servidor funcionando:', data);
        return data;
    } catch (error) {
        console.error('❌ Error al conectar con el servidor:', error);
        return null;
    }
}

// ================================================================
// EXPORTAR FUNCIONES
// ================================================================
window.registrarUsuario = registrarUsuario;
window.healthCheck = healthCheck;