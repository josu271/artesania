import { Outlet, useNavigate } from "react-router-dom";
import SidebarPrivate from "../components/private/SidebarPrivate";
import "../assets/styles/private/PrivateLayout.scss";

export default function PrivateLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="private-layout d-flex">
      <SidebarPrivate onLogout={handleLogout} />
      <div className="content flex-grow-1 p-4">
        <Outlet />
      </div>
    </div>
  );
}
