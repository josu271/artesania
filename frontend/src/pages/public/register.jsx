
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/public/Register.scss";

export default function Register() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    // 🔹 Simulación de registro (en una app real harías POST a tu API)
    alert(`Usuario ${form.nombre} registrado exitosamente`);
    navigate("/login");
  };

  return (
    <div className="register-container d-flex justify-content-center align-items-center">
      <form className="register-form shadow p-4 rounded" onSubmit={handleSubmit}>
        <h2 className="text-center mb-4">Registro de Artesano</h2>

        <div className="mb-3">
          <label htmlFor="nombre" className="form-label">Nombre completo</label>
          <input
            type="text"
            className="form-control"
            id="nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej. Juana Huanca"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">Correo electrónico</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Ej. artesano@correo.com"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">Contraseña</label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">Confirmar contraseña</label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-danger w-100">
          Registrarme
        </button>

        <p className="text-center mt-3">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-decoration-none text-danger">
            Inicia sesión aquí
          </a>
        </p>
      </form>
    </div>
  );
}
