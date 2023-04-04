import classes from "CardList.module.css";
import WorkshopItem from "../workshops/WorkshopItem";

import { Card, Container, Row } from "react-bootstrap";


interface CardProps {
	children: any
}

function CardList (props : CardProps){
	return (<div>
		<Container>
			<Row xs={1} md={2} lg={3} className="g-4">
				{props.children}
			</Row>
		</Container>
	</div>);
}

export default CardList;