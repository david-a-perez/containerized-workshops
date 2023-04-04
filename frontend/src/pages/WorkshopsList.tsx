import classes from "./WorkshopsList.module.css";
import CardList from "../components/UI/CardList";
import WorkshopItem from "../components/workshops/WorkshopItem";
import { Container, Row, Col, Modal, Button } from "react-bootstrap";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { UserDataInterface } from "../App";
import { Form, InputGroup } from "react-bootstrap";

const test_workshop_data = [
  {
    id: "1",
    docker_tag: "Header Text 1",
    title: "Title Text 1",
    description: "Body Text 1",
    internal_ports: "80",
    participants: [1],
  },
  {
    id: "2",
    docker_tag: "Header Text 2",
    title: "Title Text 2",
    description: "Body Text 2",
    internal_ports: "80",
    participants: [2],
  },
  {
    id: "3",
    docker_tag: "Header Text 3",
    title: "Title Text 3",
    description: "Body Text 3",
    internal_ports: "80",
    participants: [3],
  },
  {
    id: "4",
    docker_tag: "Header Text 4",
    title: "Title Text 4",
    description: "Body Text 4",
    internal_ports: "80",
    participants: [4],
  },
  {
    id: "5",
    docker_tag: "Header Text 5",
    title: "Title Text 5",
    description: "Body Text 5",
    internal_ports: "80",
    participants: [5],
  },
  {
    id: "6",
    docker_tag: "Header Text 6",
    title: "Title Text 6",
    description: "Body Text 6",
    internal_ports: "80",
    participants: [6],
  },
];

interface WorkshopListProps {
  userData?: UserDataInterface;
}

function WorkshopsList(props: WorkshopListProps) {
  const [joinModal, setJoinModal] = useState(false);
  const [userWorkshops, setUserWorkshops] = useState([]);
  const [validated, setValidated] = useState(false);
  const [formCode, setFormCode] = useState("");

  function joinWorkshopOnClick() {
    setJoinModal(true);
  }

  const joinModalSubmit = (event: any) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      // TODO: Change If we need to wait for request
      setJoinModal(false);
    }
    setValidated(true);
    console.log(formCode);
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(
        "/api/workshop/?participants=" + props.userData?.id?.toString()
      );

      if (response.status !== 200) {
        console.log("Error status:", response.status);
        throw new Error(`Error! status: ${response.status}`);
      }

      setUserWorkshops(response.data);
      console.log(response.data);
    };

    fetchData().catch((err) => {
      console.log(err.message);
    });
  }, [props.userData]);

  return (
    <div>
      <Container>
        <h3>Welcome to the Containerized Workshops web page</h3>
        <text>More things...</text>
      </Container>

      <Container>
        <Row>
          <Col md={10}>
            <h4>List of Current Workshops:</h4>
          </Col>
          <Col md={2}>
            <Button
              variant="dark"
              className={classes.joinWorkshopButton}
              onClick={joinWorkshopOnClick}
            >
              Join Workshop
            </Button>
          </Col>
        </Row>
      </Container>

      <Container fluid className={classes.cardContainer}>
        <CardList>
          {userWorkshops.map(
            (dict: { ["id"]: string; [key: string]: string | number }) => (
              <Col>
                <WorkshopItem workshop={dict}></WorkshopItem>
              </Col>
            )
          )}
        </CardList>
      </Container>

      <Modal
        show={joinModal}
        onHide={() => setJoinModal(false)}
        // size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Join a Workshop</Modal.Title>
        </Modal.Header>
        <Container className={classes.modalContainer}>
          <Form noValidate validated={validated} onSubmit={joinModalSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>6 Digit Workshop Code</Form.Label>
              <Form.Control
                type="text"
                placeholder="6 Digit Code"
                name="code"
                pattern="^[0-9A-Za-z]{6,6}$"
                className={classes.modalCodeInput}
                required
                onChange={(event) => {
                  setFormCode(event.target.value);
                }}
              />
              <Form.Control.Feedback type="invalid">
                Please enter a 6 Alphanumeric Code.
              </Form.Control.Feedback>
              <Button
                variant="primary"
                type="submit"
                className={classes.modalJoinButton}
              >
                Submit Code
              </Button>
            </Form.Group>
          </Form>
        </Container>
      </Modal>
    </div>
  );
}

export default WorkshopsList;
