import { Button } from "react-bootstrap";

import axios from "axios";

const axiosInstance = axios.create({});

function BasicButton(){

	async function test_button_onClick(){

		try {
			const { data } = await axiosInstance.get("/api/workshop");
			console.log(data);

		} catch {
			console.log("API Button Test error");
		}
	}

	return (<div>
		<Button variant="primary" onClick={test_button_onClick}>
			Test API
		</Button>
	</div>);

}

export default BasicButton;