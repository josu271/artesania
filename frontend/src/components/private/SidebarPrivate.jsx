import { Link, useLocation } from "react-router-dom";
import "../../assets/styles/private/Sidebar.scss";

export default function SidebarPrivate({ onLogout }) {
  const location = useLocation();

  return (
    <div className="sidebar-private">
      <h2>Panel</h2>
      <ul>
        <li className={location.pathname === "/dashboard" ? "active" : ""}><Link to="/dashboard">Dashboard</Link></li>
        <li className={location.pathname === "/inventario" ? "active" : ""}><Link to="/inventario">Inventario</Link></li>
        <li className={location.pathname === "/eventos" ? "active" : ""}><Link to="/eventos">Eventos</Link></li>
        <li className={location.pathname === "/predicciones" ? "active" : ""}><Link to="/predicciones">Predicciones</Link></li>
        <li className={location.pathname === "/perfil" ? "active" : ""}><Link to="/perfil">Perfil</Link></li>
      </ul>
      <button onClick={onLogout} className="btn btn-danger mt-auto">Cerrar sesión</button>
    </div>
  );
}
