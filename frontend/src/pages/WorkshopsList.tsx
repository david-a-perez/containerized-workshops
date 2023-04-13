import classes from "./WorkshopsList.module.css";
import CardList from "../components/UI/CardList";
import WorkshopItem from "../components/workshops/WorkshopItem";
import { Container, Row, Col, Modal, Button } from "react-bootstrap";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { UserDataInterface } from "../App";
import { Form, InputGroup } from "react-bootstrap";


interface WorkshopListProps {
  userData?: UserDataInterface;
}

export interface WorkshopDict {
  id: string;
  participants: number[];
  title: string;
  docker_tag: string;
  description: string;
  internal_ports: string; // may change to a list of numbers
}

function WorkshopsList(props: WorkshopListProps) {

  const [joinModal, setJoinModal] = useState(false);
  const [userWorkshops, setUserWorkshops] = useState([]);
  const [validated, setValidated] = useState(false);
  const [formCode, setFormCode] = useState("");
  const [modalSubmitDisable, setModalSubmitDisable] = useState(false);

  function joinWorkshopOnClick() {
    setJoinModal(true);
  }

  const joinModalSubmit = (event: any) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    }
    setValidated(true);

    if (form.checkValidity() === true) {
      console.log(formCode);
      setModalSubmitDisable(true);
      JoinNewWorkshop();
    }
  };

  async function JoinNewWorkshop() {
    const response = await axios.post("/api/workshop/" + formCode + "/join/");

    setModalSubmitDisable(false);

    if (response.status !== 201 && response.status !== 200) {
      console.log("Error status:", response.status);
      throw new Error(`Error! status: ${response.status}`);
    }

    setJoinModal(false);

    await fetchData();
    // maybe handle errors
    // TODO: maybe navigate to workshop itself
  }

  async function fetchData() {
    if (props.userData?.id === undefined) {
      return;
    }

    const response = await axios.get(
      "/api/workshop/?participants=" + props.userData?.id?.toString()
    );

    if (response.status !== 200) {
      console.log("Error status:", response.status);
      throw new Error(`Error! status: ${response.status}`);
    }

    setUserWorkshops(response.data);
  }

  useEffect(() => {
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
          <Col>
            <h4>List of Current Workshops:</h4>
          </Col>
          <Col>
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

      <Container fluid className={classes.cardContainer} key="3">
        <CardList>
          {userWorkshops.map((dict: WorkshopDict) => (
            <Col key={dict.id}>
              <WorkshopItem workshop={dict}></WorkshopItem>
            </Col>
          ))}
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
                disabled={modalSubmitDisable}
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
