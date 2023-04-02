import { Link } from "react-router-dom";
import {
  Button,
  Alert,
  Container,
  Navbar,
  NavDropdown,
  Nav,
  Form,
} from "react-bootstrap";

import { CSRFTOKEN } from "../../csrfToken";

/**
 * Link to Homepage
 * Workshop list (for everyone) -- contains modal for workshop code
 * List of containers (admins only)
 * Link to /admin for admins only
 */
interface mainNavProps {
  csrfToken: string | null
}

function MainNavigation(props : mainNavProps) {
  return (
    <Navbar collapseOnSelect bg="info" variant="light" expand="md">
      <Container>
        <Navbar.Brand as={Link} to={"/"}>
          Containerized Workshops
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to={"/workshops"}>
              Workshop List
            </Nav.Link>
            <Nav.Link as={Link} to={"/test"}>
              Container List
            </Nav.Link>
            <Nav.Link as={Link} to={"/"}>
              Django Admin Page
            </Nav.Link>
          </Nav>
          <Nav>
            <Form className="d-flex">
              <CSRFTOKEN csrftoken={props.csrfToken} />
              <Button variant="outline-success">Login</Button>
            </Form>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MainNavigation;
