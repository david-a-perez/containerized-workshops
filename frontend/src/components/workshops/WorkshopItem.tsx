import classes from "./WorkshopItem.module.css";

import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { WorkshopDict } from "../../pages/WorkshopsList";

export interface WorkProp {
  workshop: WorkshopDict
	onClick?: (id: string) => any;
}

function WorkshopItem(props: WorkProp) {
  const navigate = useNavigate();

  const onClickViewWorkshop = () => {
    navigate("/workshop/" + props.workshop["id"], { state: props["workshop"]})
  }

  return (
    <Card className={classes.card}>
      <Card.Body>
				<Card.Header as="h2">{props.workshop["title"]}</Card.Header>
				<Card.Title>{props.workshop["docker_tag"]}</Card.Title>
        <Card.Text>
          {props.workshop['description']} 
        </Card.Text>
        <Button variant="outline-dark" className={classes.ViewButton} onClick={onClickViewWorkshop}>View Workshop</Button>
      </Card.Body>
    </Card>
  );
}

export default WorkshopItem;
