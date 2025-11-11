USE artesania;

-- =========================================
-- USUARIOS
-- =========================================
INSERT INTO usuarios (nombre, apellido, correo, contrasena, telefono, rol)
VALUES
('Jose', 'Sulla', 'sulla@gmail.com', '123', '906983532', 'administrador'),
('Jordan', 'Vilcahuman', 'vilcahuaman@gmail.com', '123', '912345678', 'artesano'),
('Jhon', 'Flores', 'flores@gmail.com', '123', '987111222', 'artesano');

-- =========================================
-- CATEGORÍAS
-- =========================================
INSERT INTO categorias (nombre, descripcion)
VALUES
('Textil', 'Productos elaborados con lana, algodón u otras fibras.'),
('Cerámica', 'Piezas de barro cocido decoradas artesanalmente.'),
('Madera', 'Tallados, utensilios y esculturas de madera.'),
('Joyas', 'Bisutería y accesorios de metales y piedras naturales.'),
('Cuero', 'Carteras, cinturones y artículos hechos a mano en cuero.');

-- =========================================
-- PRODUCTOS
-- =========================================
INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id, usuario_id, imagen_url)
VALUES
('Chal Andino', 'Chal tejido a mano con lana de alpaca.', 120.00, 15, 1, 3, '/images/chal.jpg'),
('Jarrón Inca', 'Jarrón decorativo con motivos incaicos.', 80.50, 10, 2, 3, '/images/jarron.jpg'),
('Tazón Tallado', 'Tazón de madera de cedro tallado artesanalmente.', 45.00, 8, 3, 3, '/images/tazon.jpg'),
('Pulsera de Plata', 'Pulsera con diseño tradicional de Cusco.', 95.00, 20, 4, 3, '/images/pulsera.jpg'),
('Cartera de Cuero', 'Cartera mediana elaborada con cuero natural.', 150.00, 5, 5, 3, '/images/cartera.jpg');

-- =========================================
-- INVENTARIO
-- =========================================
INSERT INTO inventario (producto_id, cantidad_actual, cantidad_minima, cantidad_maxima)
VALUES
(1, 15, 5, 30),
(2, 10, 3, 25),
(3, 8, 2, 20),
(4, 20, 5, 40),
(5, 5, 2, 15);

-- =========================================
-- EVENTOS
-- =========================================
INSERT INTO eventos (nombre, fecha, ubicacion, descripcion)
VALUES
('Festival de Artesanía Huancayo', '2025-12-10', 'Huancayo', 'Feria anual de artesanos locales.'),
('Expo Arte Andino', '2026-01-15', 'Huancayo', 'Exposición regional de arte popular.'),
('Feria del Cuero', '2025-11-20', 'Huancayo', 'Feria temática dedicada al cuero y calzado.');

-- =========================================
-- PRODUCTOS x EVENTOS
-- =========================================
INSERT INTO productos_eventos (producto_id, evento_id)
VALUES
(1, 1),
(2, 1),
(5, 3);

-- =========================================
-- VENTAS
-- =========================================
INSERT INTO ventas (fecha, total, metodo_pago, artesano_id, usuario_id)
VALUES
('2025-10-20 15:30:00', 240.00, 'Tarjeta', 3, 2),
('2025-11-01 10:15:00', 95.00, 'Efectivo', 3, 2),
('2025-11-03 14:00:00', 150.00, 'Yape', 3, 2);

-- =========================================
-- DETALLE DE VENTA
-- =========================================
INSERT INTO detalle_venta (venta_id, producto_id, cantidad, subtotal)
VALUES
(1, 1, 2, 240.00),
(2, 4, 1, 95.00),
(3, 5, 1, 150.00);

-- =========================================
-- PREDICCIONES (Machine Learning)
-- =========================================
INSERT INTO predicciones (producto_id, fecha_prediccion, demanda_predicha, precision_modelo, modelo_usado, observaciones)
VALUES
(1, '2025-11-01', 25, 90.5, 'DecisionTreeRegressor', 'Alta demanda en temporada navideña.'),
(3, '2025-11-01', 12, 87.3, 'DecisionTreeRegressor', 'Demanda estable en otoño.'),
(5, '2025-11-01', 8, 85.9, 'DecisionTreeRegressor', 'Stock bajo, sugerir producción.');

-- =========================================
-- LOGS DEL SISTEMA
-- =========================================
INSERT INTO logs_sistema (usuario_id, accion, ip_usuario)
VALUES
(1, 'Creación inicial de sistema', '127.0.0.1'),
(2, 'Gestor registró venta #1', '127.0.0.1'),
(3, 'Artesano actualizó stock del producto Chal Andino', '127.0.0.1');
