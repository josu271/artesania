-- =========================================
-- BASE DE DATOS: Sistema de Artesanía con Machine Learning
-- =========================================

DROP DATABASE IF EXISTS artesania;
CREATE DATABASE artesania
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;
USE artesania;

-- =========================================
-- TABLA: usuarios
-- =========================================
CREATE TABLE usuarios (
  idUsuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100),
  correo VARCHAR(150) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  rol ENUM('administrador','gestor','artesano') NOT NULL
);

-- =========================================
-- TABLA: categorias
-- =========================================
CREATE TABLE categorias (
  idCategoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT
);

-- =========================================
-- TABLA: productos
-- =========================================
CREATE TABLE productos (
  idProducto INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  categoria_id INT,
  usuario_id INT,
  imagen_url VARCHAR(255),
  FOREIGN KEY (categoria_id) REFERENCES categorias(idCategoria),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(idUsuario)
);

-- =========================================
-- TABLA: inventario
-- =========================================
CREATE TABLE inventario (
  idInventario INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  cantidad_actual INT DEFAULT 0,
  cantidad_minima INT DEFAULT 0,
  cantidad_maxima INT DEFAULT 0,
  ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(idProducto)
);

-- =========================================
-- TABLA: eventos
-- =========================================
CREATE TABLE eventos (
  idEvento INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  fecha DATE,
  ubicacion VARCHAR(255),
  descripcion TEXT
);

-- =========================================
-- TABLA: productos_eventos
-- =========================================
CREATE TABLE productos_eventos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT,
  evento_id INT,
  FOREIGN KEY (producto_id) REFERENCES productos(idProducto),
  FOREIGN KEY (evento_id) REFERENCES eventos(idEvento)
);

-- =========================================
-- TABLA: ventas
-- =========================================
CREATE TABLE ventas (
  idVenta INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(10,2) NOT NULL,
  metodo_pago VARCHAR(50),
  artesano_id INT,
  usuario_id INT,
  FOREIGN KEY (artesano_id) REFERENCES usuarios(idUsuario),
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
-- TABLA: predicciones
-- =========================================
CREATE TABLE predicciones (
  idPrediccion INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT,
  fecha_prediccion DATETIME DEFAULT CURRENT_TIMESTAMP,
  demanda_predicha INT,
  precision_modelo DECIMAL(5,2),
  modelo_usado VARCHAR(100),
  observaciones TEXT,
  FOREIGN KEY (producto_id) REFERENCES productos(idProducto)
);

-- =========================================
-- TABLA: logs_sistema
-- =========================================
CREATE TABLE logs_sistema (
  idLog INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  accion VARCHAR(255),
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_usuario VARCHAR(45),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(idUsuario)
);
