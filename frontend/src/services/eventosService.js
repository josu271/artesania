// src/services/eventosService.js
const API_URL = "http://127.0.0.1:8000/api";

export const eventosService = {
  // Obtener todos los eventos
  getEventos: async (token) => {
    try {
      const response = await fetch(`${API_URL}/eventos/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error en getEventos:", error);
      throw new Error(`No se pudo conectar al servidor: ${error.message}`);
    }
  },

  // Obtener un evento por ID
  getEvento: async (id, token) => {
    try {
      const response = await fetch(`${API_URL}/eventos/${id}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error en getEvento:", error);
      throw error;
    }
  },

  // Crear un nuevo evento
  createEvento: async (eventoData, token) => {
    try {
      const response = await fetch(`${API_URL}/eventos/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(eventoData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Error ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error en createEvento:", error);
      throw error;
    }
  },

  // Actualizar un evento
  updateEvento: async (id, eventoData, token) => {
    try {
      const response = await fetch(`${API_URL}/eventos/${id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(eventoData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Error ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error en updateEvento:", error);
      throw error;
    }
  },

  // Eliminar un evento
  deleteEvento: async (id, token) => {
    try {
      const response = await fetch(`${API_URL}/eventos/${id}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error("Error en deleteEvento:", error);
      throw error;
    }
  }
};