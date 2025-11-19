import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Spinner, Alert } from 'react-bootstrap';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { dashboardService } from '../../services/dashboardService';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Obtener usuario del localStorage de manera segura
      const userData = localStorage.getItem('user');
      console.log('User data from localStorage:', userData);
      
      if (!userData) {
        throw new Error('No se encontró información del usuario');
      }
      
      const user = JSON.parse(userData);
      console.log('Parsed user:', user);
      
      // Usar idUsuario en lugar de id
      const userId = user.idUsuario || user.id;
      console.log('User ID to use:', userId);
      
      if (!userId) {
        throw new Error('ID de usuario no disponible');
      }
      
      console.log('Loading dashboard data for user ID:', userId);
      const data = await dashboardService.getDashboardData(userId);
      setDashboardData(data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(err.message || 'Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger">
          <h5>Error</h5>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadDashboardData}>
            Reintentar
          </button>
        </Alert>
      </Container>
    );
  }

  if (!dashboardData) {
    return (
      <Container>
        <Alert variant="warning">
          No hay datos disponibles para mostrar
          <button className="btn btn-primary ms-2" onClick={loadDashboardData}>
            Reintentar
          </button>
        </Alert>
      </Container>
    );
  }

  const { estadisticas_ventas, productos_populares, ventas_ultima_semana, estadisticas_inventario } = dashboardData;

  // Datos para gráfico de ventas de la última semana
  const ventasSemanaData = {
    labels: ventas_ultima_semana && ventas_ultima_semana.length > 0 
      ? ventas_ultima_semana.map(v => v.dia) 
      : ['Sin datos'],
    datasets: [
      {
        label: 'Ventas por día',
        data: ventas_ultima_semana && ventas_ultima_semana.length > 0 
          ? ventas_ultima_semana.map(v => v.ventas) 
          : [0],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  // Datos para gráfico de productos populares
  const productosPopularesData = {
    labels: productos_populares && productos_populares.length > 0 
      ? productos_populares.map(p => p.nombre) 
      : ['Sin productos'],
    datasets: [
      {
        label: 'Unidades Vendidas',
        data: productos_populares && productos_populares.length > 0 
          ? productos_populares.map(p => p.vendidos) 
          : [0],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  return (
    <Container fluid>
      <h1 className="my-4">Dashboard</h1>
      
      {/* Tarjetas de estadísticas */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Ventas del Mes</Card.Title>
              <Card.Text className="h3 text-primary">
                {estadisticas_ventas?.total_ventas_mes || 0}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Ingresos Totales</Card.Title>
              <Card.Text className="h3 text-success">
                S/ {(estadisticas_ventas?.ingresos_totales || 0).toFixed(2)}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Promedio por Venta</Card.Title>
              <Card.Text className="h3 text-info">
                S/ {(estadisticas_ventas?.promedio_venta || 0).toFixed(2)}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Productos en Stock</Card.Title>
              <Card.Text className="h3 text-warning">
                {estadisticas_inventario?.total_productos || 0}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gráficos */}
      <Row className="mb-4">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5>Ventas de la Última Semana</h5>
            </Card.Header>
            <Card.Body>
              <Line data={ventasSemanaData} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Header>
              <h5>Productos Más Populares</h5>
            </Card.Header>
            <Card.Body>
              <Bar data={productosPopularesData} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabla de productos populares */}
      <Row>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>Top Productos Vendidos</h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Unidades Vendidas</th>
                  </tr>
                </thead>
                <tbody>
                  {productos_populares && productos_populares.length > 0 ? (
                    productos_populares.map((producto, index) => (
                      <tr key={index}>
                        <td>{producto.nombre}</td>
                        <td>{producto.vendidos}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="text-center">No hay datos de productos</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>Resumen de Inventario</h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover>
                <tbody>
                  <tr>
                    <td><strong>Total de Productos</strong></td>
                    <td>{estadisticas_inventario?.total_productos || 0}</td>
                  </tr>
                  <tr>
                    <td><strong>Stock Total</strong></td>
                    <td>{estadisticas_inventario?.stock_total || 0}</td>
                  </tr>
                  <tr>
                    <td><strong>Precio Promedio</strong></td>
                    <td>S/ {(estadisticas_inventario?.precio_promedio || 0).toFixed(2)}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;