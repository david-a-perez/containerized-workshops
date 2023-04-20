import classes from "./WorkshopInfo.module.css";
import { Container, Row, Col } from "react-bootstrap";
import { WorkshopDict } from "./WorkshopsList";
import { useParams } from "react-router-dom";

import axios from "axios";
import { useEffect, useState } from "react";

import { Button, Image } from "react-bootstrap";
import { UserDataInterface } from "../App";
import { string } from "prop-types";

import { generateKeyPair } from "web-ssh-keygen";

import JSZip from "jszip";

import { saveAs } from "file-saver";
import adjust_ssh_powershell from "../resources/scripts/adjust_ssh_config.ps1";
import adjust_ssh_bash from "../resources/scripts/adjust_ssh_config.sh";
import copy_files_out_powershell from "../resources/scripts/copy_files_out.ps1";
import copy_files_out_bash from "../resources/scripts/copy_files_out.sh";


import bash_snippet_file from "../resources/scripts/snippet.sh";
import powershell_snippet_file from "../resources/scripts/snippet.ps1";

import { renderFile, render } from "template-file";

import instruct_image_1 from "../resources/images/ZipFile.png";

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
  bash_commands: string;
  powershell_commands: string;
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
  const [activatePage, setActivatePage] = useState(false);
  const [deleteContainerButtonDisable, setDeleteContainerButtonDisable] =
    useState(false);

  const containerCreateSleep: number = 1000;

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

  async function fetchNewContainerData() {
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
      setContainerCreateButtonDisable(false);
      setDeleteContainerButtonDisable(false);
      throw new Error(`Error! status: ${response.status}`);
    }

    return response;
  }

  async function waitForNewContainer() {
    const timeout = 10;
    let count = 1;

    let response = await fetchNewContainerData();

    while (response?.data.length === 0 && count < timeout) {
      await new Promise((f) => setTimeout(f, containerCreateSleep));
      response = await fetchNewContainerData();
      ++count;
    }

    if (count === timeout) {
      setContainerCreated(false);
      setContainerCreateButtonDisable(false);
      setDeleteContainerButtonDisable(false);
      throw new Error(`Error! fetching new container timed out`);
    }

    setContainer(response?.data[0]);
    setContainerCreated(true);

    return response?.data[0];
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
      setContainerCreateButtonDisable(false);
      setDeleteContainerButtonDisable(false);
      throw new Error(`Error! status: ${response.status}`);
    }

    if (response.data.length !== 0) {
      setContainer(response.data[0]);
      setContainerCreated(true);
    } else {
      setContainerCreated(false);
    }

    setActivatePage(true);
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

  /***
   * Create a Container
   *
   */
  async function createContainer() {
    if (props.userData?.id === undefined) {
      console.log("User Id is undefined in generate Keys");
      return;
    }

    if (workshop == undefined) {
      console.log("Workshop is undefined");
      return;
    }

    setContainerCreateButtonDisable(true);

    // create the public and private key
    const { privateKey, publicKey } = await generateKeyPair({
      alg: "RSASSA-PKCS1-v1_5",
      size: 4096,
      hash: "SHA-512",
      name: "",
    });

    // send the request to the container
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

    const cur_container: ContainerVerbose = await waitForNewContainer();

    // create the stuff to zip it all.
    let zip = new JSZip();
    //let test_folder = zip.folder(`commands`);

    let privKeyFile = new Blob([privateKey], { type: "text/plain" });

    // set the data for the workshop
    const host_name = workshop?.title.replaceAll(" ", "_") + "-" + workshop?.id;

    // map the exposed ports in the container to their host port
    const exposed_ports_dict: { [key: string]: Number } = {};
    cur_container.exposed_ports.forEach((value: ExposedPort) => {
      exposed_ports_dict[value.container_port.toString()] = value.host_port;
    });

    // map the tunneled ports in the container to their host port
    const tunneled_ports_dict: { [key: string]: Number } = {};

    // add the tunneling file if applicable
    let tunnel_commands = "ssh " + host_name + "-workshop -N ";
    let tunneled = false;
    workshop?.tunneled_ports.forEach((value: TunneledPortsDict) => {
      tunnel_commands += `-L ${value.client_port}:localhost:${value.container_port} `;
      tunneled_ports_dict[value.container_port.toString()] = value.client_port;
      tunneled = true;
    });

    // the replace data for the files
    const data = {
      host: {
        name: host_name,
        ip: cur_container.public_ip,
        directory: workshop?.working_directory,
      },
      exposedPort: exposed_ports_dict,
      tunneledPort: tunneled_ports_dict,
      jupyter_token: cur_container.jupyter_token,
    };

    // create the private key file
    zip.file(host_name + "-workshop.pem", privKeyFile);

    // create the command files
    zip.file(
      "adjust_ssh_config.ps1",
      await format_file(adjust_ssh_powershell, data)
    );
    zip.file("adjust_ssh_config.sh", await format_file(adjust_ssh_bash, data));
    zip.file("copy_files_out.ps1", await format_file(copy_files_out_powershell, data));
    zip.file("copy_files_out.sh", await format_file(copy_files_out_bash, data));

    if (tunneled) {
      const snippet_data = {
        snippet: {
          title: "Tunnel Ports",
          bash_commands: tunnel_commands,
          powershell_commands: tunnel_commands,
        },
      };

      const tunnel_bash = await get_snippet_string(
        bash_snippet_file,
        snippet_data
      );

      const tunnel_powershell = await get_snippet_string(
        powershell_snippet_file,
        snippet_data
      );

      // powershell command
      zip.file("tunnel_ports.sh", format_string(tunnel_bash, data));

      // bash command
      zip.file("tunnel_ports.ps1", format_string(tunnel_powershell, data));
    }

    // determine number of snippets
    let snip_num = 0;
    if (workshop?.snippets !== undefined) {
      snip_num = workshop.snippets.length;
    }

    // create the snippets
    for (let i = 0; i < snip_num; i++) {
      let value = workshop?.snippets[i];

      const snippet_data = {
        snippet: {
          title: value?.title,
          bash_commands: value?.bash_commands,
          powershell_commands: value?.powershell_commands,
        },
      };

      const bash_snippet = await get_snippet_string(
        bash_snippet_file,
        snippet_data
      );
      const powershell_snippet = await get_snippet_string(
        powershell_snippet_file,
        snippet_data
      );

      // powershell command
      zip.file(
        value?.title.replaceAll(" ", "_") + ".ps1",
        format_string(powershell_snippet, data)
      );

      // bash command
      zip.file(
        value?.title.replaceAll(" ", "_") + ".sh",
        format_string(bash_snippet, data)
      );
    }

    // create and download the zip folder
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, host_name + ".zip");
    });

    setContainerCreateButtonDisable(false);
  }

  async function format_file(
    file_name: string,
    format_data: any
  ): Promise<Blob> {
    const new_file = fetch(file_name)
      .then((r) => r.text())
      .then((text) => render(text, format_data))
      .then((rendered) => {
        let formatted_file = new Blob([rendered], { type: "text/plain" });
        return formatted_file;
      });

    return new_file;
  }

  async function get_snippet_string(
    file_name: string,
    format_data: any
  ): Promise<string> {
    const file_string = fetch(file_name)
      .then((r) => r.text())
      .then((text) => {
        return render(text, format_data);
      });

    return file_string;
  }

  function format_string(command: string, format_data: any): Blob {
    return new Blob([render(command, format_data)], { type: "text/plain" });
  }

  async function deleteContainer() {
    setDeleteContainerButtonDisable(true);

    const response = await axios.post("/api/containers/clear/", {
      user_id: props.userData?.id,
      workshop_id: workshop?.id,
    });

    if (response.status !== 200) {
      console.log("Create Deleting Container:", response.status);
      setDeleteContainerButtonDisable(false);
      throw new Error(`Error! status: ${response.status}`);
    }

    await fetchContainerData();

    setDeleteContainerButtonDisable(false);
  }

  function display_buttons() {
    return (
      <div>
        {!containerCreated ? (
          <Button
            variant="outline-light btn-lg"
            className={classes.createButton}
            disabled={containerCreateButtonDisable}
            onClick={createContainer}
          >
            Create Container
          </Button>
        ) : (
          <Button
            variant="dark btn-lg"
            className={classes.deleteButton}
            onClick={deleteContainer}
            disabled={deleteContainerButtonDisable}
          >
            Delete Container
          </Button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className={classes.mainContainerDiv}>
        <Container className={classes.mainContainer}>
          <h1 className={classes.workshopTitle}>
            "{workshop?.title}" Workshop
          </h1>
          <Row>{activatePage ? display_buttons() : <></>}</Row>
        </Container>
      </div>
      <div className={classes.worskopInstructions}>
        <Container>
          <h3>
            {" "}
            <a
              className={classes.workshopLink}
              href={"https://hub.docker.com/r/" + workshop?.docker_tag}
            >
              Link to Docker Container
            </a>
          </h3>
          <p className={classes.workshopDesc}>{workshop?.description}</p>

          <h3>Instructions:</h3>
          <p>
            Start by clicking on the <b>Create Container</b> Button.{" "}
          </p>
          <p>
            After a few seconds, a zip file will be downloaded. Please unzip
            that file into a easy to access folder. You should see similar files as below:
          </p>
          <Image
            fluid
            src={instruct_image_1}
            className={classes.image_1}
          ></Image>
          <p>
            If you are on windows, from now one only use the <b>.ps1</b> files.
            If you are on Mac or Linux, use the <b>.sh</b> files.
          </p>
          <p>First, run the adjust_ssh_config file</p>
          <p>
            Second, run any "snippet" files that the workshop leader created.
          </p>
          <p className={classes.lastPara}>
            At the end of the workshop, you may run the copy_files_out scipt to
            save any work to your computer.
          </p>
        </Container>
      </div>
    </div>
  );
}

export default WorkshopInfo;
