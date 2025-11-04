import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import PrivateLayout from "./layouts/PrivateLayout";
import Inicio from "./pages/public/Inicio";
import Acerca from "./pages/public/Acerca";
import Login from "./pages/public/Login";
import Dashboard from "./pages/private/Dashboard";
import Inventario from "./pages/private/Inventario";
import Eventos from "./pages/private/Eventos";
import Predicciones from "./pages/private/Predicciones";
import Perfil from "./pages/private/Perfil";

export default function App() {
  const isAuthenticated = localStorage.getItem("token"); // simulación de login

  return (
    <Router>
      <Routes>
        {/* PUBLIC */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/acerca" element={<Acerca />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* PRIVATE */}
        {isAuthenticated && (
          <Route element={<PrivateLayout />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/inventario" element={<Inventario />} />
  <Route path="/eventos" element={<Eventos />} />
  <Route path="/predicciones" element={<Predicciones />} />
  <Route path="/perfil" element={<Perfil />} />
</Route>
        )}
      </Routes>
    </Router>
  );
}
