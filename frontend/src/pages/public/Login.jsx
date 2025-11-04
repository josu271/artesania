import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/public/Login.scss";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulación de login (reemplazar con API real)
    if (form.email === "artesano@test.com" && form.password === "123456") {
      localStorage.setItem("token", "fakeToken123");
      navigate("/dashboard");
    } else {
      alert("Credenciales inválidas");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Iniciar Sesión</h2>
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit" className="btn btn-primary w-100">
          Entrar
        </button>
        <p className="mt-3">
          ¿No tienes cuenta? <a href="#">Regístrate aquí</a>
        </p>
      </form>
    </div>
  );
}
