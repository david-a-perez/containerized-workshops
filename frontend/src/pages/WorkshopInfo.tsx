import classes from "./WorkshopInfo.module.css";
import { Container, Row, Col } from "react-bootstrap";
import { WorkshopDict } from "./WorkshopsList";
import { useParams } from "react-router-dom";

import axios from "axios";
import { useEffect, useState } from "react";

import { Button } from "react-bootstrap";
import { UserDataInterface } from "../App";
import { string } from "prop-types";

import { generateKeyPair } from "web-ssh-keygen";

import JSZip from "jszip";

import { saveAs } from "file-saver";
import adjust_ssh_powershell from "../resources/scripts/adjust_ssh_config.ps1";
import adjust_ssh_bash from "../resources/scripts/adjust_ssh_config.sh";
import copy_files_out_bash from "../resources/scripts/copy_files_out.sh";

import text_file from "../resources/test.txt";

import { renderFile, render } from "template-file";
import { ExportDeclaration } from "typescript";

/**
 * Steps:
 * 1) Get Info about workshop
 * 2) Check if user has container started
 * 3) Start/Stop a container
 * 	Start:
 * 		1) Generate ssh key
 * 		2) Send an API request w/ public key to create the container
 * 		3) delay
 * 		4) Get the port number by re-requesting
 * 		5) Generate Commands
 * 			- automatically ssh
 * 			- ssh tunneling (not a snippet) ssh -L client_port:localhost:container_port -- in workshop model
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
  container_port: Number;
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
  const [containerCreateButtonDisable, setContainerCreateButtonDisable] =
    useState(false);
  const [privKey, setPrivKey] = useState("");

  const containerCreateSleep: number = 2000;

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

    if (response.data.length !== 0) {
      setContainer(response.data[0]);
      setContainerCreated(true);
    } else {
      setContainerCreated(false);
    }

    setContainerCreateButtonDisable(false);
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

  async function createContainer() {
    if (props.userData?.id == undefined) {
      console.log("User Id is undefined in generate Keys");
    }

    setContainerCreateButtonDisable(true);

    const { privateKey, publicKey } = await generateKeyPair({
      alg: "RSASSA-PKCS1-v1_5",
      size: 4096,
      hash: "SHA-512",
      name: "",
    });

    const response = await axios.post("/api/containers/", {
      public_key: publicKey,
      user_id: props.userData?.id,
      workshop_id: workshop?.id,
    });

    if (response.status !== 200) {
      console.log("Create Container Error status:", response.status);
      setContainerCreateButtonDisable(false);
      throw new Error(`Error! status: ${response.status}`);
    }

    setPrivKey(privateKey);

    await new Promise((f) => setTimeout(f, containerCreateSleep));

    await fetchContainerData();
  }

  async function test_save_file() {
    let zip = new JSZip();
    //let test_folder = zip.folder(`test_folder`);

    let privKeyFile = new Blob([privKey], { type: "text/plain" });

    // set the data for the workshop
    const host_name = workshop?.title.replaceAll(" ", "_") + "-" + workshop?.id;

    // map the exposed ports in the container to their host port
    const exposed_ports_dict: { [key: string]: Number } = {};
    container?.exposed_ports.forEach((value : ExposedPort) => {
      exposed_ports_dict[value.container_port.toString()] = value.host_port;
    });

    // map the tunneled ports in the container to their host port
    const tunneled_ports_dict: {[key: string]: Number } = {};
    workshop?.tunneled_ports.forEach((value: TunneledPortsDict) => {
      tunneled_ports_dict[value.container_port.toString()] = value.client_port;
    });

    // the replace data for the files
    const data = {
      host: {
        name: host_name,
        ip: "129.114.25.151",
      },
      WorkshopPort: "32778",
      exposedPort: exposed_ports_dict,
      tunneledPort: tunneled_ports_dict,
    };

    //console.log(data);

    // create the private key file
    zip.file(host_name + "-workshop.pem", privKeyFile);

    // create the command files
    zip.file("adjust_ssh_config.ps1", await format_file(adjust_ssh_powershell, data));
    zip.file("adjust_ssh_config.sh", await format_file(adjust_ssh_bash, data));
    zip.file("copy_files_out.sh", await format_file(copy_files_out_bash, data));

    // create the snippet files
    workshop?.snippets.forEach((value : SnippetDict) => {
      zip.file(value.title.replaceAll(" ", "_"), format_string(value.format, data));
    });

    // create and download the zip folder
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, host_name + ".zip");
    });
  }

  async function format_file(file_name : string, format_data: any) : Promise<Blob>{
    const new_file = fetch(file_name)
    .then((r) => r.text())
    .then((text) => render(text, format_data)
    ).then((rendered) => {
      let formatted_file = new Blob([rendered], { type: "text/plain" });
      return formatted_file;
    });

    return new_file;
  }

  function format_string(command : string, format_data : any) : Blob {
    return new Blob([render(command, format_data)], { type: "text/plain" });
  }

  async function test_func() {
    console.log(container);
  }

  return (
    <Container>
      <h1>Info for {workshop?.title}</h1>
      <h4>Docker tag: {workshop?.docker_tag}</h4>
      <p>Description: {workshop?.description}</p>
      {!containerCreated ? (
        <Button
          variant="outline-light"
          className={classes.createButton}
          disabled={containerCreateButtonDisable}
          onClick={createContainer}
        >
          Create Container
        </Button>
      ) : (
        <Button variant="dark" onClick={test_save_file}>
        Download Files
      </Button>
      )}

    </Container>
  );
}

export default WorkshopInfo;
