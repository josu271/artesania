USE artesania_ml;

-- =========================================
-- 1️⃣ USUARIOS
-- =========================================
INSERT INTO usuarios (nombre, apellido, correo, contrasena, telefono, direccion, fecha_registro, rol) VALUES
('Jose', 'Sulla', 'sulla@gmail.com', '123', '987654321', 'Huancayo, Perú', '2025-01-10', 'artesano'),
('Luis', 'Díaz', 'luis.diaz@example.com', '123', '912345678', 'Huancayo, Perú', '2025-01-12', 'cliente'),
('María', 'Pérez', 'maria.perez@example.com', '123', '976543210', 'Huancayo, Perú', '2025-02-05', 'artesano'),
('Carlos', 'Lopez', 'carlos.lopez@example.com', '123', '998877665', 'Huancayo, Perú', '2025-03-01', 'cliente'),
('Admin', 'Root', 'admin@example.com', '123', '900000000', 'Huancayo, Perú', '2025-01-01', 'administrador');

-- =========================================
-- 2️⃣ ARTESANOS
-- =========================================
INSERT INTO artesanos (usuario_id, nombre_taller, especialidad, descripcion, experiencia, ubicacion) VALUES
(1, 'Manos Andinas', 'Tejido', 'Taller especializado en textiles tradicionales del Cusco.', 8, 'Huancayo'),
(3, 'Cerámica Qori', 'Cerámica', 'Artesanías de arcilla inspiradas en el arte incaico.', 5, 'Huancayo');

-- =========================================
-- 3️⃣ CATEGORÍAS
-- =========================================
INSERT INTO categorias (nombre, descripcion) VALUES
('Tejidos', 'Productos elaborados con lana, hilo o fibras naturales.'),
('Cerámica', 'Objetos modelados y horneados en arcilla.'),
('Madera tallada', 'Esculturas y utensilios tallados en madera.'),
('Joyería', 'Accesorios y piezas ornamentales hechas a mano.');

-- =========================================
-- 4️⃣ PRODUCTOS
-- =========================================
INSERT INTO productos (nombre, descripcion, precio, stock, fecha_creacion, categoria_id, artesano_id, imagen_url) VALUES
('Chal tejido andino', 'Chal de lana de alpaca con diseños tradicionales.', 75.00, 10, '2025-03-10', 1, 1, 'img/chal.jpg'),
('Gorro de alpaca', 'Gorro hecho con lana natural, colores andinos.', 45.00, 15, '2025-03-15', 1, 1, 'img/gorro.jpg'),
('Vasija incaica', 'Vasija de cerámica pintada a mano.', 120.00, 8, '2025-03-12', 2, 2, 'img/vasija.jpg'),
('Taza artesanal', 'Taza de cerámica con motivos tradicionales.', 35.00, 20, '2025-03-20', 2, 2, 'img/taza.jpg');

-- =========================================
-- 5️⃣ INVENTARIO
-- =========================================
INSERT INTO inventario (producto_id, cantidad_actual, cantidad_minima, cantidad_maxima, ultima_actualizacion) VALUES
(1, 10, 2, 20, '2025-03-15'),
(2, 15, 3, 25, '2025-03-15'),
(3, 8, 2, 15, '2025-03-18'),
(4, 20, 5, 30, '2025-03-18');

-- =========================================
-- 6️⃣ VENTAS
-- =========================================
INSERT INTO ventas (fecha, total, metodo_pago, artesano_id, usuario_id) VALUES
('2025-03-25', 120.00, 'Tarjeta', 1, 2),
('2025-03-26', 155.00, 'Efectivo', 2, 4),
('2025-04-02', 75.00, 'Yape', 1, 4);

-- =========================================
-- 7️⃣ DETALLE DE VENTA
-- =========================================
INSERT INTO detalle_venta (venta_id, producto_id, cantidad, subtotal) VALUES
(1, 1, 1, 75.00),
(1, 2, 1, 45.00),
(2, 3, 1, 120.00),
(2, 4, 1, 35.00),
(3, 1, 1, 75.00);

-- =========================================
-- 8️⃣ PREDICCIONES (Machine Learning)
-- =========================================
INSERT INTO predicciones (producto_id, fecha_prediccion, demanda_predicha, precision_modelo, modelo_usado, observaciones) VALUES
(1, '2025-05-01', 40, 92.5, 'RandomForestRegressor', 'Alta demanda esperada por temporada fría.'),
(2, '2025-05-01', 35, 89.7, 'XGBoost', 'Demanda estable.'),
(3, '2025-05-01', 20, 94.1, 'LSTM', 'Demanda decreciente después del festival.'),
(4, '2025-05-01', 25, 90.3, 'LinearRegression', 'Demanda promedio.');

-- =========================================
-- 9️⃣ LOGS DEL SISTEMA
-- =========================================
INSERT INTO logs_sistema (usuario_id, accion, fecha, ip_usuario) VALUES
(1, 'Creó producto Chal tejido andino', '2025-03-10', '192.168.0.10'),
(3, 'Agregó producto Vasija incaica', '2025-03-12', '192.168.0.15'),
(2, 'Realizó compra total 120.00', '2025-03-25', '192.168.0.20'),
(4, 'Realizó compra total 155.00', '2025-03-26', '192.168.0.25'),
(5, 'Ingresó al panel de administración', '2025-04-01', '192.168.0.5');
