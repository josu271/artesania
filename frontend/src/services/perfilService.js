const API_URL = "http://127.0.0.1:8000/api";

export const perfilService = {
  // Obtener perfil del usuario
  obtenerPerfil: async (token) => {
    try {
      const response = await fetch(`${API_URL}/perfil/`, {
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
      console.error("Error en obtenerPerfil:", error);
      throw error;
    }
  },

  // Actualizar perfil
  actualizarPerfil: async (perfilData, token) => {
    try {
      const response = await fetch(`${API_URL}/perfil/actualizar/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(perfilData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error en actualizarPerfil:", error);
      throw error;
    }
  },

  // Cambiar contraseña
  cambiarPassword: async (passwordData, token) => {
    try {
      const response = await fetch(`${API_URL}/perfil/cambiar-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(passwordData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error en cambiarPassword:", error);
      throw error;
    }
  }
};