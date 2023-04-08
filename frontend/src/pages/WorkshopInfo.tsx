import classes from "./WorkshopInfo.module.css";
import { Container } from "react-bootstrap";
import { WorkshopDict } from "./WorkshopsList";
import { useParams } from "react-router-dom";

import axios from "axios";
import { useEffect, useState } from "react";

import { Button } from "react-bootstrap";
import { UserDataInterface } from "../App";
import { string } from "prop-types";

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

interface SnippetDict {
  id: Number;
  title: string;
  format: string;
}

interface TunneledPortsDict {
  id: Number;
  title: string;
  continer_port: Number;
  client_port: Number;
}

interface WorkshopVerbose {
  id: string;
  snippets: [SnippetDict];
  tunneled_ports: [TunneledPortsDict];
  title: string;
  description: string;
  docker_tag: string;
  working_directory: string;
  participants: [Number];
}

interface WorkshopInfoProps {
  userData?: UserDataInterface;
}

interface ExposedPort {
  protocol: string;
  host_port: Number;
  container_port: Number;
}

interface ContainerVerbose {
  id: string;
  workshop_id: string;
  user_id: Number;
  status: string;
  public_ip: string;
  exposed_ports: [ExposedPort];
  public_key: string;
  jupyter_token: string;
}

function WorkshopInfo(props: WorkshopInfoProps) {
  const [workshop, setWorkshop] = useState<WorkshopVerbose>();
  const [container, setContainer] = useState<ContainerVerbose>();
  const [containerCreated, setContainerCreated] = useState(false);

  let { workshop_id } = useParams();

  async function fetchWorkshopData() {
    if (workshop_id === undefined) {
      return;
    }

    const response = await axios.get("/api/workshop/" + workshop_id);

    if (response.status !== 200) {
      console.log("Error status:", response.status);
      throw new Error(`Error! status: ${response.status}`);
    }

    setWorkshop(response.data);
  }

  async function fetchContainerData() {
    if (workshop === undefined) {
      return;
    }
    const response = await axios.get("/api/containers/", {
      params: {
        workshop_id: workshop?.id,
        user_id: props.userData?.id,
      },
    });

    if (response.status !== 200) {
      console.log("Error status:", response.status);
      throw new Error(`Error! status: ${response.status}`);
    }

    if (response.data.size !== 0) {
      setContainer(response.data[0]);
      setContainerCreated(true);
    }

    setContainerCreated(false);
  }

  useEffect(() => {
    fetchContainerData().catch((err) => {
      console.log(err.message);
    });
  }, [workshop?.id, props.userData?.id]);

  useEffect(() => {
    fetchWorkshopData().catch((err) => {
      console.log(err.message);
    });
  }, [workshop?.id]);

  function createContainer() {}

  return (
    <Container>
      <h1>Info for {workshop?.title}</h1>
      <h4>Docker tag: {workshop?.docker_tag}</h4>
      <p>Description: {workshop?.description}</p>
      {!containerCreated ? (
        <Button variant="outline-light" className={classes.createButton}>
          Create Container
        </Button>
      ) : (
        <></>
      )}

      
    </Container>
  );
}

export default WorkshopInfo;
