import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Alert,
  Spinner,
  Badge
} from 'react-bootstrap';
import { inventarioService } from '../../services/inventarioService';

const Inventario = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '0',
    categoria_id: '',
    imagen_url: ''
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [productosRes, categoriasRes] = await Promise.all([
        inventarioService.getProductos(token),
        inventarioService.getCategorias(token)
      ]);
      
      setProductos(productosRes.productos || []);
      setCategorias(categoriasRes.categorias || []);
    } catch (err) {
      setError('Error cargando datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      stock: '0',
      categoria_id: '',
      imagen_url: ''
    });
    setEditingProducto(null);
    setError('');
    setSuccess('');
  };

  const handleShowModal = (producto = null) => {
    if (producto) {
      setEditingProducto(producto);
      setFormData({
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        precio: producto.precio?.toString() || '',
        stock: producto.stock?.toString() || '0',
        categoria_id: producto.idCategoria?.toString() || '',
        imagen_url: producto.imagen_url || ''
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTimeout(() => {
      resetForm();
    }, 300);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const productoData = {
        ...formData,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock) || 0,
        categoria_id: formData.categoria_id || null
      };

      if (editingProducto) {
        await inventarioService.editarProducto(editingProducto.idProducto, productoData, token);
        setSuccess('Producto actualizado exitosamente');
      } else {
        await inventarioService.crearProducto(productoData, token);
        setSuccess('Producto creado exitosamente');
      }

      await cargarDatos();
      handleCloseModal();
    } catch (err) {
      setError('Error guardando producto: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (productoId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        setLoading(true);
        await inventarioService.eliminarProducto(productoId, token);
        setSuccess('Producto eliminado exitosamente');
        await cargarDatos();
      } catch (err) {
        setError('Error eliminando producto: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const getStockBadge = (stock) => {
    if (stock === 0) {
      return <Badge bg="danger">Sin Stock</Badge>;
    } else if (stock < 10) {
      return <Badge bg="warning" text="dark">Bajo Stock</Badge>;
    } else {
      return <Badge bg="success">En Stock</Badge>;
    }
  };

  const formatFecha = (fechaString) => {
    if (!fechaString) return '-';
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES');
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Gestión de Inventario</h2>
          <p className="text-muted">Administra tus productos artesanales</p>
        </Col>
        <Col xs="auto">
          <Button 
            variant="primary" 
            onClick={() => handleShowModal()}
            disabled={loading}
          >
            + Nuevo Producto
          </Button>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Card>
        <Card.Header className="bg-white">
          <h5 className="mb-0">Lista de Productos</h5>
        </Card.Header>
        <Card.Body>
          {loading && productos.length === 0 ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status" className="me-2" />
              Cargando productos...
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped hover>
                <thead className="table-light">
                  <tr>
                    <th>Producto</th>
                    <th>Descripción</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Categoría</th>
                    <th>Fecha Creación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((producto) => (
                    <tr key={producto.idProducto}>
                      <td>
                        <div>
                          <strong>{producto.nombre}</strong>
                          {producto.imagen_url && (
                            <div>
                              <small className="text-muted">Con imagen</small>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        {producto.descripcion ? (
                          <span title={producto.descripcion}>
                            {producto.descripcion.length > 50 
                              ? `${producto.descripcion.substring(0, 50)}...` 
                              : producto.descripcion
                            }
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <strong>S/ {producto.precio}</strong>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span>{producto.stock}</span>
                          {getStockBadge(producto.stock)}
                        </div>
                      </td>
                      <td>
                        {producto.categoria_nombre ? (
                          <Badge bg="secondary">{producto.categoria_nombre}</Badge>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        {formatFecha(producto.fecha_creacion)}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleShowModal(producto)}
                            disabled={loading}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleEliminar(producto.idProducto)}
                            disabled={loading}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {productos.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        <div className="text-muted">
                          <i className="fas fa-box-open fa-2x mb-3"></i>
                          <p>No hay productos registrados</p>
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => handleShowModal()}
                          >
                            Crear primer producto
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal para crear/editar producto */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
          </Modal.Title>
        </Modal.Header>
        
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre del Producto *</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: Poncho de lana de alpaca"
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Precio (S/) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    name="precio"
                    value={formData.precio}
                    onChange={handleInputChange}
                    required
                    placeholder="0.00"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Describe las características de tu producto artesanal..."
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Stock Disponible</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Categoría</Form.Label>
                  <Form.Select
                    name="categoria_id"
                    value={formData.categoria_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map(categoria => (
                      <option key={categoria.idCategoria} value={categoria.idCategoria}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>URL de Imagen (opcional)</Form.Label>
              <Form.Control
                type="url"
                name="imagen_url"
                value={formData.imagen_url}
                onChange={handleInputChange}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              <Form.Text className="text-muted">
                Ingresa la URL de una imagen para tu producto
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={handleCloseModal}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {editingProducto ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                editingProducto ? 'Actualizar Producto' : 'Crear Producto'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Inventario;