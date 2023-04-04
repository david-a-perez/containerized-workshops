import classes from "./Homepage.module.css";
import { Container, Image, Row, Col } from "react-bootstrap";
import image_path from "../resources/MainImage.png";

function Homepage() {
  return (
    <Container className={classes.mainContainer}>
      <Row>
        <Col>
					<h1>About</h1>
					<text> This webpage...</text>
        </Col>
        <Col>
          <Image fluid src={image_path} className={classes.mainImage}></Image>
        </Col>
      </Row>
    </Container>
  );
}

export default Homepage;
