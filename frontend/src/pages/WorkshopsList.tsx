import classes from "./WorkshopsList.module.css";
import CardList from "../components/UI/CardList";
import WorkshopItem from "../components/workshops/WorkshopItem";
import { Container, Row, Col, Modal, Button } from "react-bootstrap";
import { useState, useRef, useEffect } from "react";

const test_workshop_data = [
  { header: "Header Text 1", title: "Title Text 1", desc: "Body Text 1" },
  { header: "Header Text 2", title: "Title Text 2", desc: "Body Text 2" },
  { header: "Header Text 3", title: "Title Text 3", desc: "Body Text 3" },
  { header: "Header Text 4", title: "Title Text 4", desc: "Body Text 4" },
  { header: "Header Text 5", title: "Title Text 5", desc: "Body Text 5" },
  { header: "Header Text 6", title: "Title Text 6", desc: "Body Text 6" },
];

function WorkshopsList() {
	const [joinModal, setJoinModal] = useState(false);

	function joinWorkshopOnClick(){
		setJoinModal(true);
	}

  return (
    <div>
      <Container>
        <h3>Welcome to the Containerized Workshops web page</h3>
        <body>More things yayyayayay</body>
      </Container>

      <Container>
        <Row>
          <Col md={10}>
            <h4>List of Current Workshops:</h4>
          </Col>
          <Col md={2}>
            <Button variant="primary" className={classes.joinWorkshopButton} onClick={joinWorkshopOnClick}>Join Workshop</Button>
          </Col>
        </Row>
      </Container>

      <Container fluid className={classes.cardContainer}>
        <CardList>
          {test_workshop_data.map((dict: {}) => (
            <Col>
              <WorkshopItem workshop={dict}></WorkshopItem>
            </Col>
          ))}
        </CardList>
      </Container>

			<Modal show={joinModal}
        onHide={() => setJoinModal(false)}
				size="lg" 
				aria-labelledby="contained-modal-title-vcenter" 
				centered>
					
			</Modal>
    </div>
  );
}

export default WorkshopsList;
