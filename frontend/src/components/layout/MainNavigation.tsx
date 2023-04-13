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
import { UserDataInterface } from "../../App";
import classes from "./MainNavigation.module.css";

/**
 * Link to Homepage
 * Workshop list (for everyone) -- contains modal for workshop code
 * List of containers (admins only)
 * Link to /admin for admins only
 */
interface mainNavProps {
  csrfToken: string | null;
  userData?: UserDataInterface;
}

function MainNavigation(props: mainNavProps) {
  return (
    <Navbar collapseOnSelect variant="dark" expand="md" className={classes.navBar}>
      <Container>
        <Navbar.Brand as={Link} to={"/"}>
          Containerized Workshops
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            {props.userData?.is_logged_in ? (
              <Nav.Link as={Link} to={"/workshops"}>
                Workshop List
              </Nav.Link>
            ) : (
              <></>
            )}
            {/* {props.userData?.is_admin ? (
              <Nav.Link as={Link} to={"/test"}>
                Container List
              </Nav.Link>
            ) : (
              <></>
            )} */}

            {props.userData?.is_admin ? (
              <Nav.Link href="/admin">
                Django Admin Page
              </Nav.Link>
            ) : (
              <></>
            )}
          </Nav>
          <Nav>
            {!props.userData?.is_logged_in ? (
              <Form
                className="d-flex"
                action="/accounts/google/login/"
                method="post"
              >
                <CSRFTOKEN csrftoken={props.csrfToken} />
                <Button variant="outline-light" type="submit">
                  Sign In
                </Button>
              </Form>
            ) : (
              <Form className="d-flex" action="/accounts/logout/" method="post">
                <CSRFTOKEN csrftoken={props.csrfToken} />
                <Button variant="outline-light" type="submit">
                  Sign Out
                </Button>
              </Form>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MainNavigation;
