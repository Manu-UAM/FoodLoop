// ================================================================
// EMAILJS - CONFIGURACIÓN
// ================================================================

// Inicializar EmailJS con tu Public Key
emailjs.init('NUeNWLT_mmwIf0ky0');

// ================================================================
// ENVIAR CORREO DE BIENVENIDA
// ================================================================
async function enviarCorreoBienvenida(nombre, email, tipo) {
    try {
        const templateParams = {
            nombre: nombre,
            tipo: tipo === 'consumidor' ? 'Consumidor' : 'Restaurante',
            to_email: email   // ← ¡Esta línea es la que faltaba!
        };

        const response = await emailjs.send(
            'service_8lvfo8k',
            'template_dt1qcfw',
            templateParams
        );

        console.log('✅ Correo de bienvenida enviado a:', email);
        console.log('Respuesta:', response);
        return true;
    } catch (error) {
        console.error('❌ Error al enviar correo:', error);
        console.error('Detalle:', error.text);
        return false;
    }
}