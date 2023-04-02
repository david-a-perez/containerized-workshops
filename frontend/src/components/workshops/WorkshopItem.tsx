import classes from "./WorkshopItem.module.css";

import { Card } from "react-bootstrap";

interface WorkProp {
  workshop: { [key: string]: string | number};
	onClick?: (id: string) => any;
}

function WorkshopItem(props: WorkProp) {
  return (
    <Card>
      <Card.Body>
				<Card.Header as="h2">{props.workshop["header"]}</Card.Header>
				<Card.Title>{props.workshop["title"]}</Card.Title>
        <Card.Text>
          {props.workshop['desc']} 
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default WorkshopItem;
