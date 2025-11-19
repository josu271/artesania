const API_URL = "http://127.0.0.1:8000/dashboard";

export const dashboardService = {
  getDashboardData: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/data/?user_id=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error en dashboardService:", error);
      throw error;
    }
  },

  getVentasMensuales: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/ventas-mensuales/?user_id=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error obteniendo ventas mensuales:", error);
      throw error;
    }
  }
};