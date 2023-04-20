from enum import Enum, unique
import secrets
import socket
from docker import DockerClient
from docker.models.containers import Container
import paramiko.ssh_exception

from ContainerizedWorkshops.models import Workshop

from backend.settings.base import CONTROLLER_ID, DOCKER_HOSTS


DOCKER_CLIENTS = [DockerClient(base_url=base_url)
                  for base_url in DOCKER_HOSTS]


def redo_on_connection_error(x):
    try:
        return x()
    except socket.error as e:
        print("Socket error ignored:", e)
        return x()
    except paramiko.ssh_exception.SSHException as e:
        print("Socket error ignored:", e)
        return x()


@unique
class Labels(str, Enum):
    workshop_id = 'dev.cloudworkshops.workshop-id'
    user_id = 'dev.cloudworkshops.user-id'
    controller_id = 'dev.cloudworkshops.controller-id'


def list_containers(workshop_id: str | None, user_id: str | None) -> list[Container]:
    workshop_id_label = f"{Labels.workshop_id.value}={workshop_id}" if workshop_id else Labels.workshop_id.value
    user_id_label = f"{Labels.user_id.value}={user_id}" if user_id else Labels.user_id.value
    controller_id_label = f"{Labels.controller_id.value}={CONTROLLER_ID}"

    return [container  # type: ignore
            for client in DOCKER_CLIENTS
            for container in redo_on_connection_error(lambda: client.containers.list(all=True, filters={
                "label": [workshop_id_label, user_id_label, controller_id_label]}))]

def pull_image(workshop: Workshop):
    for client in DOCKER_CLIENTS:
        split_docker_tag = workshop.docker_tag.split(":")

        redo_on_connection_error(lambda: client.images.pull(split_docker_tag[0], split_docker_tag[1] if len(
            split_docker_tag) > 1 else None))

def create_container(workshop: Workshop, user_id: str, public_key: str) -> Container:
    workshop_id_label = f"{Labels.workshop_id.value}={workshop.pk}"
    user_id_label = f"{Labels.user_id.value}={user_id}"
    controller_id_label = f"{Labels.controller_id.value}={CONTROLLER_ID}"

    for client in DOCKER_CLIENTS:
        containers = redo_on_connection_error(lambda: client.containers.list(all=True, filters={
            "label": [workshop_id_label, user_id_label, controller_id_label]}))
        if containers:
            return containers[0]  # type: ignore

    def get_workload(client: DockerClient):
        info = redo_on_connection_error(lambda: client.info())
        return info['ContainersRunning'] / info['NCPU']

    client = min(DOCKER_CLIENTS, key=get_workload)

    split_docker_tag = workshop.docker_tag.split(":")

    redo_on_connection_error(lambda: client.images.pull(split_docker_tag[0], split_docker_tag[1] if len(
        split_docker_tag) > 1 else None))

    container = redo_on_connection_error(lambda: client.containers.run(
        workshop.docker_tag, auto_remove=True, detach=True,
        environment={"SSH_PUBLIC_KEY": public_key,
                     "JUPYTER_TOKEN": secrets.token_hex(24)},
        publish_all_ports=True,
        labels={Labels.workshop_id.value: str(workshop.pk),
                Labels.user_id.value: str(user_id),
                Labels.controller_id.value: CONTROLLER_ID},
        cpu_period=100000,
        cpu_quota=50000,
        mem_limit="1g"))
    return container  # type: ignore


def clear_containers(workshop_id: str | None, user_id: str | None):
    workshop_id_label = f"{Labels.workshop_id.value}={workshop_id}" if workshop_id else Labels.workshop_id.value
    user_id_label = f"{Labels.user_id.value}={user_id}" if user_id else Labels.user_id.value
    controller_id_label = f"{Labels.controller_id.value}={CONTROLLER_ID}"

    for client in DOCKER_CLIENTS:
        for container in redo_on_connection_error(lambda: client.containers.list(all=True, filters={"label": [workshop_id_label, user_id_label, controller_id_label]})):
            container.stop()  # type: ignore
