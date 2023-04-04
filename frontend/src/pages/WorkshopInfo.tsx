import classes from "./WorkshopInfo.module.css";
import { Container } from "react-bootstrap";

/**
 * Steps:
 * 1) Get Info about workshop
 * 2) Check if user has container started
 * 3) Start/Stop a container
 * 	Start:
 * 		1) Generate ssh key
 * 		2) Send an API request w/ public key
 * 		3) delay
 * 		4) Get the port number by re-requesting
 * 		5) Generate Commands
 * 			- automatically ssh
 * 			- ssh tunneling
 * 			- copy stuff out of container
 *		6) Download zip file (also need to zip the files)
 *			- private key (maybe also public key)
 *			- scripts for ssh config, install vscode extension, open vscode remote
 *					Port Tunneling, Download files from container
 */

function WorkshopInfo(){

	return (<Container>
		<h1>Example Page</h1>
	</Container>);

}

export default WorkshopInfo;