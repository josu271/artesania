import { Outlet } from "react-router-dom";
import NavbarPublic from "../components/public/NavbarPublic";

export default function PublicLayout() {
  return (
    <>
      <NavbarPublic />
      <main className="container py-5">
        <Outlet />
      </main>
    </>
  );
}
