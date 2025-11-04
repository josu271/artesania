import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../../assets/styles/public/Navbar.scss";

export default function NavbarPublic() {
  return (
    <Navbar expand="lg" className="navbar-public">
      <Container>
        <Navbar.Brand as={Link} to="/">ArtesanIA</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">Inicio</Nav.Link>
            <Nav.Link as={Link} to="/acerca">Acerca de</Nav.Link>
            <Nav.Link as={Link} to="/login">Login</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
