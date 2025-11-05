// src/services/authService.js
const API_URL = "http://127.0.0.1:8000/api";

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Error en la autenticación");
    }

    return data; // Contiene token o info del artesano
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return { error: error.message };
  }
};
