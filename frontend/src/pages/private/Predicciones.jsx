import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Button, 
  Alert,
  Spinner,
  Badge,
  ProgressBar,
  Modal,
  Form
} from 'react-bootstrap';
import { prediccionesService } from '../../services/prediccionesService';
import { inventarioService } from '../../services/inventarioService';

const Predicciones = () => {
  const [predicciones, setPredicciones] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showProductosModal, setShowProductosModal] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [prediccionesRes, estadisticasRes, productosRes] = await Promise.all([
        prediccionesService.getPredicciones(token),
        prediccionesService.getEstadisticas(token),
        inventarioService.getProductos(token)
      ]);
      
      setPredicciones(prediccionesRes.predicciones || []);
      setEstadisticas(estadisticasRes.estadisticas || null);
      setProductos(productosRes.productos || []);
    } catch (err) {
      setError('Error cargando datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerarPredicciones = async () => {
    try {
      setGenerando(true);
      setError('');
      
      const resultado = await prediccionesService.generarPredicciones(token);
      
      setSuccess(resultado.message);
      await cargarDatos(); // Recargar datos después de generar
    } catch (err) {
      setError('Error generando predicciones: ' + err.message);
    } finally {
      setGenerando(false);
    }
  };

  const handlePredecirProducto = async () => {
    if (!productoSeleccionado) {
      setError('Por favor selecciona un producto');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const resultado = await prediccionesService.predecirProducto(productoSeleccionado, token);
      
      setSuccess(`Predicción generada para ${resultado.producto_nombre}`);
      setShowProductosModal(false);
      setProductoSeleccionado('');
      await cargarDatos(); // Recargar datos
    } catch (err) {
      setError('Error prediciendo producto: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRecomendacionColor = (recomendacion) => {
    if (recomendacion?.includes('Aumentar')) return 'success';
    if (recomendacion?.includes('Mantener')) return 'primary';
    if (recomendacion?.includes('Reducir')) return 'warning';
    if (recomendacion?.includes('Disminuir')) return 'danger';
    return 'secondary';
  };

  const getPrecisionColor = (precision) => {
    if (precision >= 85) return 'success';
    if (precision >= 70) return 'warning';
    return 'danger';
  };

  const formatFecha = (fechaString) => {
    if (!fechaString) return '-';
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calcularEstadoStock = (stockActual, demandaPredicha) => {
    const diferencia = demandaPredicha - stockActual;
    
    if (diferencia > 10) return { tipo: 'danger', texto: 'Stock Insuficiente' };
    if (diferencia > 0) return { tipo: 'warning', texto: 'Stock Bajo' };
    if (diferencia > -5) return { tipo: 'info', texto: 'Stock Adecuado' };
    return { tipo: 'success', texto: 'Stock Excedente' };
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Predicciones de Demanda</h2>
          <p className="text-muted">
            Sistema inteligente para predecir demanda y optimizar tu producción
          </p>
        </Col>
        <Col xs="auto" className="d-flex gap-2">
          <Button 
            variant="outline-primary"
            onClick={() => setShowProductosModal(true)}
            disabled={loading}
          >
            Predecir Producto
          </Button>
          <Button 
            variant="primary" 
            onClick={handleGenerarPredicciones}
            disabled={generando || loading}
          >
            {generando ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Generando...
              </>
            ) : (
              'Generar Predicciones Automáticas'
            )}
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

      {/* Estadísticas */}
      {estadisticas && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="h-100">
              <Card.Body className="text-center">
                <h3 className="text-primary">{estadisticas.total_productos_analizados}</h3>
                <p className="text-muted mb-0">Productos Analizados</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="h-100">
              <Card.Body className="text-center">
                <h3 className="text-warning">{estadisticas.precision_promedio?.toFixed(1)}%</h3>
                <p className="text-muted mb-0">Precisión del Modelo</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="h-100">
              <Card.Body>
                <h6>Productos con Mayor Demanda</h6>
                {estadisticas.productos_populares?.length > 0 ? (
                  estadisticas.productos_populares.map((producto, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small">{producto.producto}</span>
                      <Badge bg="primary">{producto.demanda_predicha} und.</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted small mb-0">No hay datos disponibles</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Lista de Predicciones */}
      <Card>
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Predicciones Recientes</h5>
          <Badge bg="light" text="dark">
            {predicciones.length} resultados
          </Badge>
        </Card.Header>
        <Card.Body>
          {loading && predicciones.length === 0 ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status" className="me-2" />
              Cargando predicciones...
            </div>
          ) : predicciones.length > 0 ? (
            <div className="table-responsive">
              <Table striped hover>
                <thead className="table-light">
                  <tr>
                    <th>Producto</th>
                    <th>Demanda Predicha</th>
                    <th>Stock Actual</th>
                    <th>Estado</th>
                    <th>Precisión</th>
                    <th>Recomendación</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {predicciones.map((prediccion) => {
                    const estadoStock = calcularEstadoStock(
                      prediccion.stock_actual, 
                      prediccion.demanda_predicha
                    );
                    
                    return (
                      <tr key={prediccion.idPrediccion}>
                        <td>
                          <strong>{prediccion.producto_nombre}</strong>
                        </td>
                        <td>
                          <Badge bg="primary" className="fs-6">
                            {prediccion.demanda_predicha} und.
                          </Badge>
                        </td>
                        <td>
                          <span className={prediccion.stock_actual < prediccion.demanda_predicha ? 'text-danger fw-bold' : ''}>
                            {prediccion.stock_actual} und.
                          </span>
                        </td>
                        <td>
                          <Badge bg={estadoStock.tipo}>
                            {estadoStock.texto}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <ProgressBar 
                              variant={getPrecisionColor(prediccion.precision_modelo)}
                              now={prediccion.precision_modelo} 
                              style={{ width: '80px' }}
                            />
                            <small>{prediccion.precision_modelo}%</small>
                          </div>
                        </td>
                        <td>
                          <Badge bg={getRecomendacionColor(prediccion.recomendacion)}>
                            {prediccion.recomendacion}
                          </Badge>
                        </td>
                        <td>
                          <small className="text-muted">
                            {formatFecha(prediccion.fecha_prediccion)}
                          </small>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <div className="text-muted">
                <i className="fas fa-chart-line fa-3x mb-3"></i>
                <h5>No hay predicciones disponibles</h5>
                <p className="mb-3">
                  Genera predicciones automáticas para optimizar tu producción
                </p>
                <Button 
                  variant="primary" 
                  onClick={handleGenerarPredicciones}
                  disabled={generando}
                >
                  {generando ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Generando...
                    </>
                  ) : (
                    'Generar Primera Predicción'
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Información del Sistema */}
      <Row className="mt-4">
        <Col md={6}>
          <Card className="bg-light">
            <Card.Body>
              <h6>💡 ¿Cómo funcionan las predicciones?</h6>
              <p className="small mb-0">
                El sistema analiza tus ventas históricas, tendencias estacionales y eventos 
                para predecir la demanda futura. Usa Machine Learning para recomendarte 
                la producción óptima.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="bg-light">
            <Card.Body>
              <h6>🎯 Objetivo del Sistema</h6>
              <p className="small mb-0">
                Evitar la sobreproducción y escasez de productos artesanales, 
                optimizando tus recursos y maximizando tus ganancias.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal para predecir producto específico */}
      <Modal show={showProductosModal} onHide={() => setShowProductosModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Predecir Producto Específico</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Seleccionar Producto</Form.Label>
            <Form.Select
              value={productoSeleccionado}
              onChange={(e) => setProductoSeleccionado(e.target.value)}
            >
              <option value="">Selecciona un producto</option>
              {productos.map((producto) => (
                <option key={producto.idProducto} value={producto.idProducto}>
                  {producto.nombre} (Stock: {producto.stock})
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowProductosModal(false)}
          >
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handlePredecirProducto}
            disabled={!productoSeleccionado || loading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Prediciendo...
              </>
            ) : (
              'Generar Predicción'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Predicciones;