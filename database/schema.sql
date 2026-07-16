-- ================================================================
-- FOODLOOP · ESQUEMA DE BASE DE DATOS (POSTGRESQL)
-- ================================================================

-- ================================================================
-- 1. TABLA: USUARIOS
-- ================================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    tipo_usuario VARCHAR(20) CHECK (tipo_usuario IN ('consumidor', 'restaurante')) NOT NULL,
    telefono VARCHAR(20),
    foto_perfil TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- ================================================================
-- 2. TABLA: PREFERENCIAS (del usuario)
-- ================================================================
CREATE TABLE IF NOT EXISTS preferencias (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    modo_daltonico BOOLEAN DEFAULT FALSE,
    texto_grande BOOLEAN DEFAULT FALSE,
    notificaciones_email BOOLEAN DEFAULT TRUE,
    notificaciones_whatsapp BOOLEAN DEFAULT FALSE,
    idioma VARCHAR(5) DEFAULT 'es',
    actualizado TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- 3. TABLA: RESTAURANTES (solo para usuarios tipo restaurante)
-- ================================================================
CREATE TABLE IF NOT EXISTS restaurantes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre_comercial VARCHAR(200) NOT NULL,
    region VARCHAR(50) NOT NULL,
    calle VARCHAR(200) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    colonia VARCHAR(100) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(10) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    categoria_otro VARCHAR(100),
    horario_apertura TIME NOT NULL,
    horario_cierre TIME NOT NULL,
    telefono_local VARCHAR(20) NOT NULL,
    whatsapp VARCHAR(20),
    foto_local TEXT,
    calificacion DECIMAL(3,2) DEFAULT 0,
    verificado BOOLEAN DEFAULT FALSE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- ================================================================
-- 4. TABLA: PLATILLOS
-- ================================================================
CREATE TABLE IF NOT EXISTS platillos (
    id SERIAL PRIMARY KEY,
    restaurante_id INTEGER REFERENCES restaurantes(id) ON DELETE CASCADE,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    tipo_oferta VARCHAR(20) CHECK (tipo_oferta IN ('venta', 'subasta', 'donacion')) DEFAULT 'venta',
    imagen TEXT,
    disponible BOOLEAN DEFAULT TRUE,
    stock INTEGER DEFAULT 1,
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP
);

-- ================================================================
-- 5. TABLA: RESERVACIONES / PEDIDOS
-- ================================================================
CREATE TABLE IF NOT EXISTS reservaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    platillo_id INTEGER REFERENCES platillos(id) ON DELETE CASCADE,
    cantidad INTEGER DEFAULT 1,
    precio_total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('pendiente', 'confirmada', 'completada', 'cancelada')) DEFAULT 'pendiente',
    fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_confirmacion TIMESTAMP,
    fecha_completada TIMESTAMP,
    fecha_cancelacion TIMESTAMP,
    notas TEXT
);

-- ================================================================
-- 6. TABLA: FAVORITOS (relación usuario - restaurante)
-- ================================================================
CREATE TABLE IF NOT EXISTS favoritos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    restaurante_id INTEGER REFERENCES restaurantes(id) ON DELETE CASCADE,
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, restaurante_id)
);

-- ================================================================
-- 7. TABLA: NOTIFICACIONES
-- ================================================================
CREATE TABLE IF NOT EXISTS notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(50) CHECK (tipo IN ('recordatorio', 'confirmacion', 'cancelacion', 'promocion', 'general')) DEFAULT 'general',
    leida BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura TIMESTAMP,
    enlace TEXT
);

-- ================================================================
-- 8. TABLA: SESIONES (para manejar tokens)
-- ================================================================
CREATE TABLE IF NOT EXISTS sesiones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    dispositivo TEXT,
    ip TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP,
    activa BOOLEAN DEFAULT TRUE
);

-- ================================================================
-- ÍNDICES PARA MEJORAR EL RENDIMIENTO
-- ================================================================
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_restaurantes_usuario ON restaurantes(usuario_id);
CREATE INDEX idx_platillos_restaurante ON platillos(restaurante_id);
CREATE INDEX idx_reservaciones_usuario ON reservaciones(usuario_id);
CREATE INDEX idx_reservaciones_estado ON reservaciones(estado);
CREATE INDEX idx_favoritos_usuario ON favoritos(usuario_id);
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX idx_sesiones_token ON sesiones(token);

-- ================================================================
-- DATOS DE PRUEBA (opcional, para desarrollo)
-- ================================================================

-- Insertar un usuario de prueba (contraseña: 123456)
-- INSERT INTO usuarios (nombre, apellido, email, password_hash, tipo_usuario)
-- VALUES ('Admin', 'FoodLoop', 'admin@foodloop.com', 'hash_aqui', 'consumidor');