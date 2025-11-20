const API_URL = "http://127.0.0.1:8000/api/inventario";

export const inventarioService = {
  // Obtener todos los productos del usuario
  getProductos: async (token) => {
    try {
      const response = await fetch(`${API_URL}/productos/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error obteniendo productos:", error);
      throw error;
    }
  },

  // Crear nuevo producto
  crearProducto: async (producto, token) => {
    try {
      const response = await fetch(`${API_URL}/productos/crear/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(producto)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creando producto:", error);
      throw error;
    }
  },

  // Editar producto existente
  editarProducto: async (productoId, producto, token) => {
    try {
      const response = await fetch(`${API_URL}/productos/${productoId}/editar/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(producto)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error editando producto:", error);
      throw error;
    }
  },

  // Eliminar producto
  eliminarProducto: async (productoId, token) => {
    try {
      const response = await fetch(`${API_URL}/productos/${productoId}/eliminar/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error eliminando producto:", error);
      throw error;
    }
  },

  // Obtener categorías
  getCategorias: async (token) => {
    try {
      const response = await fetch(`${API_URL}/categorias/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error obteniendo categorías:", error);
      throw error;
    }
  }
};