const API_URL = "http://127.0.0.1:8000/api";

export const loginUser = async (email, password) => {
  try {
    console.log("Enviando solicitud de login...");
    
    const response = await fetch(`${API_URL}/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password
      }),
    });

    console.log("Respuesta recibida:", response.status);
    
    if (!response.ok) {
      // Intentar obtener el mensaje de error
      let errorMessage = `Error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        console.error("Error parseando respuesta:", e);
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("Login exitoso, datos recibidos:", data);
    return data;
    
  } catch (error) {
    console.error("Error completo en loginUser:", error);
    throw new Error(error.message || "Error de conexión con el servidor");
  }
};

export const verifyToken = async (token) => {
  try {
    const response = await fetch(`${API_URL}/perfil/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};