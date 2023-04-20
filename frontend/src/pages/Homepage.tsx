import classes from "./Homepage.module.css";
import { Container, Image, Row, Col, Card } from "react-bootstrap";
import image_path from "../resources/images/MainImage.png";

function Homepage() {
  return (
    <Container className={classes.mainContainer}>
      <Row>
        <Col>
          <h1>Welcome to the Containerized Workshops Website</h1>
        </Col>
      </Row>
      <Row lg={2} sm={1} xs={1}>
        <Col>
          <div className={classes.aboutCard}>
            <h4 className={classes.cardTitle}>About</h4>
            <p className={classes.cardText}>
              This platform streamlines workshop delivery by addressing problems
              relating to inconsistent setups amongst participants. By hosting
              development environments in the cloud using Docker, we aim to
              ensure a smoother workshop experience.
            </p>
          </div>
        </Col>
        <Col>
          <Image fluid src={image_path} className={classes.mainImage}></Image>
        </Col>
      </Row>
    </Container>
  );
}

export default Homepage;
