const API_URL = "http://127.0.0.1:8000/api";

export const ventasService = {
  // Obtener productos disponibles
  getProductos: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/ventas/productos/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error obteniendo productos');
    }

    return await response.json();
  },

  // Crear nueva venta
  crearVenta: async (ventaData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/ventas/crear/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(ventaData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error creando venta');
    }

    return await response.json();
  },

  // Obtener historial de ventas
  getHistorial: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/ventas/historial/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error obteniendo historial');
    }

    return await response.json();
  },

  // Obtener venta específica
  obtenerVenta: async (ventaId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/ventas/obtener/${ventaId}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error obteniendo venta');
    }

    return await response.json();
  },

  // Editar venta existente
  editarVenta: async (ventaId, ventaData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/ventas/editar/${ventaId}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(ventaData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error editando venta');
    }

    return await response.json();
  },

  // Eliminar venta
  eliminarVenta: async (ventaId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/ventas/eliminar/${ventaId}/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error eliminando venta');
    }

    return await response.json();
  }
};