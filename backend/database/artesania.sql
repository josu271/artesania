-- =========================================
-- BASE DE DATOS: Sistema de Artesanía con Machine Learning
-- =========================================

CREATE DATABASE IF NOT EXISTS artesania
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;
USE artesania;

-- =========================================
-- TABLA: usuarios
-- =========================================
CREATE TABLE usuarios (
  idUsuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  apellido VARCHAR(100),
  correo VARCHAR(150) UNIQUE,
  contrasena VARCHAR(255),
  telefono VARCHAR(20),
  direccion VARCHAR(255),
  fecha_registro DATETIME,
  rol VARCHAR(50)
);

-- =========================================
-- TABLA: artesanos
-- =========================================
CREATE TABLE artesanos (
  idArtesano INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  nombre_taller VARCHAR(150),
  especialidad VARCHAR(100),
  descripcion TEXT,
  experiencia INT,
  ubicacion VARCHAR(150),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(idUsuario)
);

-- =========================================
-- TABLA: categorias
-- =========================================
CREATE TABLE categorias (
  idCategoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  descripcion TEXT
);

-- =========================================
-- TABLA: productos
-- =========================================
CREATE TABLE productos (
  idProducto INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150),
  descripcion TEXT,
  precio DECIMAL(10,2),
  stock INT,
  fecha_creacion DATETIME,
  categoria_id INT,
  artesano_id INT,
  imagen_url VARCHAR(255),
  FOREIGN KEY (categoria_id) REFERENCES categorias(idCategoria),
  FOREIGN KEY (artesano_id) REFERENCES artesanos(idArtesano)
);

-- =========================================
-- TABLA: inventario
-- =========================================
CREATE TABLE inventario (
  idInventario INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT,
  cantidad_actual INT,
  cantidad_minima INT,
  cantidad_maxima INT,
  ultima_actualizacion DATETIME,
  FOREIGN KEY (producto_id) REFERENCES productos(idProducto)
);

-- =========================================
-- TABLA: ventas
-- =========================================
CREATE TABLE ventas (
  idVenta INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATETIME,
  total DECIMAL(10,2),
  metodo_pago VARCHAR(50),
  artesano_id INT,
  usuario_id INT,
  FOREIGN KEY (artesano_id) REFERENCES artesanos(idArtesano),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(idUsuario)
);

-- =========================================
-- TABLA: detalle_venta
-- =========================================
CREATE TABLE detalle_venta (
  idDetalle INT AUTO_INCREMENT PRIMARY KEY,
  venta_id INT,
  producto_id INT,
  cantidad INT,
  subtotal DECIMAL(10,2),
  FOREIGN KEY (venta_id) REFERENCES ventas(idVenta),
  FOREIGN KEY (producto_id) REFERENCES productos(idProducto)
);

-- =========================================
-- TABLA: predicciones (Machine Learning)
-- =========================================
CREATE TABLE predicciones (
  idPrediccion INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT,
  fecha_prediccion DATETIME,
  demanda_predicha INT,
  precision_modelo DECIMAL(5,2),
  modelo_usado VARCHAR(100),
  observaciones TEXT,
  FOREIGN KEY (producto_id) REFERENCES productos(idProducto)
);

-- =========================================
-- TABLA: logs_sistema (Auditoría)
-- =========================================
CREATE TABLE logs_sistema (
  idLog INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  accion VARCHAR(255),
  fecha DATETIME,
  ip_usuario VARCHAR(45),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(idUsuario)
);
