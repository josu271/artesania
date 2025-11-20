const API_URL = "http://127.0.0.1:8000/api/predicciones";

export const prediccionesService = {
  // Obtener todas las predicciones del usuario
  getPredicciones: async (token) => {
    try {
      const response = await fetch(`${API_URL}/predicciones/`, {
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
      console.error("Error obteniendo predicciones:", error);
      throw error;
    }
  },

  // Generar predicciones automáticas
  generarPredicciones: async (token) => {
    try {
      const response = await fetch(`${API_URL}/predicciones/generar/`, {
        method: "POST",
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
      console.error("Error generando predicciones:", error);
      throw error;
    }
  },

  // Obtener estadísticas de predicciones
  getEstadisticas: async (token) => {
    try {
      const response = await fetch(`${API_URL}/predicciones/estadisticas/`, {
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
      console.error("Error obteniendo estadísticas:", error);
      throw error;
    }
  },

  // Predecir para un producto específico
  predecirProducto: async (productoId, token) => {
    try {
      const response = await fetch(`${API_URL}/predicciones/producto/${productoId}/`, {
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
      console.error("Error prediciendo producto:", error);
      throw error;
    }
  }
};