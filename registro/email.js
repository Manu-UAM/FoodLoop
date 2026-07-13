emailjs.init('NUeNWLT_mmwIf0ky0');

async function enviarCorreoBienvenida(nombre, email, tipo, telefono, whatsapp) {
    try {
        const templateParams = {
            nombre: nombre,
            tipo: tipo === 'consumidor' ? 'Consumidor' : 'Restaurante',
            to_email: email,
            telefono: telefono || 'No especificado',
            whatsapp: whatsapp || 'No especificado'
        };

        const response = await emailjs.send(
            'service_8lvfo8k',
            'template_dt1qcfw',
            templateParams
        );

        console.log('✅ Correo de bienvenida enviado a:', email);
        console.log('📞 Teléfono:', telefono);
        console.log('📱 WhatsApp:', whatsapp);
        return true;
    } catch (error) {
        console.error('❌ Error al enviar correo:', error);
        return false;
    }
}