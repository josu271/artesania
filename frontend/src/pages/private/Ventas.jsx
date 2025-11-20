import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal, Alert, Badge } from 'react-bootstrap';
import { ventasService } from '../../services/ventasService';

const Ventas = () => {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [ventaEditando, setVentaEditando] = useState(null);
  const [carritoEdicion, setCarritoEdicion] = useState([]);
  const [metodoPagoEdicion, setMetodoPagoEdicion] = useState('efectivo');

  useEffect(() => {
    cargarProductos();
    cargarHistorial();
  }, []);

  const cargarProductos = async () => {
    try {
      const data = await ventasService.getProductos();
      setProductos(data.productos);
    } catch (error) {
      showAlert('Error cargando productos', 'danger');
    }
  };

  const cargarHistorial = async () => {
    try {
      const data = await ventasService.getHistorial();
      setHistorial(data.ventas);
    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  };

  const agregarAlCarrito = (producto) => {
    const existe = carrito.find(item => item.producto_id === producto.idProducto);
    
    if (existe) {
      setCarrito(carrito.map(item =>
        item.producto_id === producto.idProducto
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([
        ...carrito,
        {
          producto_id: producto.idProducto,
          nombre: producto.nombre,
          precio_unitario: parseFloat(producto.precio),
          cantidad: 1
        }
      ]);
    }
  };

  const eliminarDelCarrito = (productoId) => {
    setCarrito(carrito.filter(item => item.producto_id !== productoId));
  };

  const actualizarCantidad = (productoId, nuevaCantidad) => {
    if (nuevaCantidad < 1) {
      eliminarDelCarrito(productoId);
      return;
    }
    
    setCarrito(carrito.map(item =>
      item.producto_id === productoId
        ? { ...item, cantidad: nuevaCantidad }
        : item
    ));
  };

  const getTotalCarrito = () => {
    return carrito.reduce((total, item) => total + (item.precio_unitario * item.cantidad), 0);
  };

  const realizarVenta = async () => {
    if (carrito.length === 0) {
      showAlert('El carrito está vacío', 'warning');
      return;
    }

    setLoading(true);
    try {
      const detalles = carrito.map(item => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario
      }));

      await ventasService.crearVenta({
        metodo_pago: metodoPago,
        detalles: detalles
      });

      showAlert('Venta realizada exitosamente', 'success');
      setCarrito([]);
      setMetodoPago('efectivo');
      cargarProductos();
      cargarHistorial();
    } catch (error) {
      showAlert('Error realizando venta: ' + error.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const editarVenta = async (ventaId) => {
    try {
      setLoading(true);
      const data = await ventasService.obtenerVenta(ventaId);
      
      setVentaEditando(data.venta);
      setCarritoEdicion(data.detalles.map(detalle => ({
        producto_id: detalle.producto_id,
        nombre: detalle.nombre,
        precio_unitario: detalle.precio,
        cantidad: detalle.cantidad
      })));
      setMetodoPagoEdicion(data.venta.metodo_pago);
      setShowEditModal(true);
      
    } catch (error) {
      showAlert('Error cargando venta para editar: ' + error.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const guardarEdicion = async () => {
    if (carritoEdicion.length === 0) {
      showAlert('El carrito está vacío', 'warning');
      return;
    }

    setLoading(true);
    try {
      const detalles = carritoEdicion.map(item => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario
      }));

      await ventasService.editarVenta(ventaEditando.idVenta, {
        metodo_pago: metodoPagoEdicion,
        detalles: detalles
      });

      showAlert('Venta actualizada exitosamente', 'success');
      setShowEditModal(false);
      cargarProductos();
      cargarHistorial();
    } catch (error) {
      showAlert('Error actualizando venta: ' + error.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const eliminarVenta = async (ventaId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta venta?')) {
      return;
    }

    try {
      await ventasService.eliminarVenta(ventaId);
      showAlert('Venta eliminada exitosamente', 'success');
      cargarProductos();
      cargarHistorial();
    } catch (error) {
      showAlert('Error eliminando venta: ' + error.message, 'danger');
    }
  };

  // Funciones para el carrito de edición
  const agregarAlCarritoEdicion = (producto) => {
    const existe = carritoEdicion.find(item => item.producto_id === producto.idProducto);
    
    if (existe) {
      setCarritoEdicion(carritoEdicion.map(item =>
        item.producto_id === producto.idProducto
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarritoEdicion([
        ...carritoEdicion,
        {
          producto_id: producto.idProducto,
          nombre: producto.nombre,
          precio_unitario: parseFloat(producto.precio),
          cantidad: 1
        }
      ]);
    }
  };

  const eliminarDelCarritoEdicion = (productoId) => {
    setCarritoEdicion(carritoEdicion.filter(item => item.producto_id !== productoId));
  };

  const actualizarCantidadEdicion = (productoId, nuevaCantidad) => {
    if (nuevaCantidad < 1) {
      eliminarDelCarritoEdicion(productoId);
      return;
    }
    
    setCarritoEdicion(carritoEdicion.map(item =>
      item.producto_id === productoId
        ? { ...item, cantidad: nuevaCantidad }
        : item
    ));
  };

  const getTotalCarritoEdicion = () => {
    return carritoEdicion.reduce((total, item) => total + (item.precio_unitario * item.cantidad), 0);
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
  };

  return (
    <Container fluid className="mt-4">
      {alert.show && (
        <Alert variant={alert.type} className="mb-3">
          {alert.message}
        </Alert>
      )}

      <Row>
        {/* Lista de Productos */}
        <Col md={6}>
          <Card>
            <Card.Header>
              <h4>Productos Disponibles</h4>
            </Card.Header>
            <Card.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map(producto => (
                    <tr key={producto.idProducto}>
                      <td>{producto.nombre}</td>
                      <td>S/ {parseFloat(producto.precio).toFixed(2)}</td>
                      <td>{producto.stock}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => agregarAlCarrito(producto)}
                          disabled={producto.stock === 0}
                        >
                          Agregar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Carrito de Compras */}
        <Col md={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4>Carrito de Venta</h4>
              <Button variant="info" onClick={() => setShowModal(true)}>
                Ver Historial
              </Button>
            </Card.Header>
            <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {carrito.length === 0 ? (
                <p className="text-muted text-center">El carrito está vacío</p>
              ) : (
                <Table striped>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio</th>
                      <th>Subtotal</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carrito.map(item => (
                      <tr key={item.producto_id}>
                        <td>{item.nombre}</td>
                        <td>
                          <Form.Control
                            type="number"
                            min="1"
                            value={item.cantidad}
                            onChange={(e) => actualizarCantidad(item.producto_id, parseInt(e.target.value))}
                            style={{ width: '80px' }}
                          />
                        </td>
                        <td>S/ {item.precio_unitario.toFixed(2)}</td>
                        <td>S/ {(item.precio_unitario * item.cantidad).toFixed(2)}</td>
                        <td>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => eliminarDelCarrito(item.producto_id)}
                          >
                            ✕
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
            <Card.Footer>
              <Row>
                <Col>
                  <Form.Group>
                    <Form.Label>Método de Pago</Form.Label>
                    <Form.Select
                      value={metodoPago}
                      onChange={(e) => setMetodoPago(e.target.value)}
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="tarjeta">Tarjeta</option>
                      <option value="transferencia">Transferencia</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col className="text-end">
                  <h5>Total: S/ {getTotalCarrito().toFixed(2)}</h5>
                  <Button
                    variant="success"
                    size="lg"
                    onClick={realizarVenta}
                    disabled={carrito.length === 0 || loading}
                  >
                    {loading ? 'Procesando...' : 'Realizar Venta'}
                  </Button>
                </Col>
              </Row>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      {/* Modal de Historial */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Historial de Ventas</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <Table striped hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Método Pago</th>
                <th>Productos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {historial.map(venta => (
                <tr key={venta.idVenta}>
                  <td>#{venta.idVenta}</td>
                  <td>{new Date(venta.fecha).toLocaleDateString()}</td>
                  <td>S/ {venta.total.toFixed(2)}</td>
                  <td>
                    <Badge bg="secondary">{venta.metodo_pago}</Badge>
                  </td>
                  <td>{venta.total_productos}</td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-1"
                      onClick={() => editarVenta(venta.idVenta)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => eliminarVenta(venta.idVenta)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>

      {/* Modal de Edición */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Editar Venta #{ventaEditando?.idVenta}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h5>Productos Disponibles</h5>
                </Card.Header>
                <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <Table striped hover size="sm">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productos.map(producto => (
                        <tr key={producto.idProducto}>
                          <td>{producto.nombre}</td>
                          <td>S/ {parseFloat(producto.precio).toFixed(2)}</td>
                          <td>{producto.stock}</td>
                          <td>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => agregarAlCarritoEdicion(producto)}
                              disabled={producto.stock === 0}
                            >
                              +
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h5>Productos en Venta</h5>
                </Card.Header>
                <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {carritoEdicion.length === 0 ? (
                    <p className="text-muted text-center">No hay productos</p>
                  ) : (
                    <Table striped size="sm">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {carritoEdicion.map(item => (
                          <tr key={item.producto_id}>
                            <td>{item.nombre}</td>
                            <td>
                              <Form.Control
                                type="number"
                                min="1"
                                value={item.cantidad}
                                onChange={(e) => actualizarCantidadEdicion(item.producto_id, parseInt(e.target.value))}
                                style={{ width: '70px' }}
                                size="sm"
                              />
                            </td>
                            <td>S/ {item.precio_unitario.toFixed(2)}</td>
                            <td>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => eliminarDelCarritoEdicion(item.producto_id)}
                              >
                                ✕
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
                <Card.Footer>
                  <Row>
                    <Col>
                      <Form.Group>
                        <Form.Label>Método de Pago</Form.Label>
                        <Form.Select
                          value={metodoPagoEdicion}
                          onChange={(e) => setMetodoPagoEdicion(e.target.value)}
                          size="sm"
                        >
                          <option value="efectivo">Efectivo</option>
                          <option value="tarjeta">Tarjeta</option>
                          <option value="transferencia">Transferencia</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col className="text-end">
                      <h6>Total: S/ {getTotalCarritoEdicion().toFixed(2)}</h6>
                    </Col>
                  </Row>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={guardarEdicion}
            disabled={carritoEdicion.length === 0 || loading}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Ventas;