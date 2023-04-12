from enum import Enum, unique
import functools
import secrets
import socket
from docker import DockerClient
from docker.models.containers import Container
import docker.transport
import docker.errors
import paramiko.ssh_exception

from ContainerizedWorkshops.models import Workshop

from backend.settings.base import CONTROLLER_ID, DOCKER_HOSTS


class CachedDockerClient(DockerClient):
    def __init__(self, *args, **kwargs):
        self.args = args
        self.kwargs = kwargs

    @functools.cached_property
    def api(self):
        return docker.APIClient(*self.args, **self.kwargs)

    @property
    @functools.wraps(DockerClient.configs.getter)
    def configs(self):
        try:
            return super().configs
        except socket.error as e:
            print("Ignoring error:", e)
            return super().configs
        except paramiko.ssh_exception.SSHException as e:
            print("Ignoring error:", e)
            return super().configs

    @property
    @functools.wraps(DockerClient.containers.getter)
    def containers(self):
        try:
            return super().containers
        except socket.error as e:
            print("Ignoring error:", e)
            return super().containers
        except paramiko.ssh_exception.SSHException as e:
            print("Ignoring error:", e)
            return super().containers

    @property
    @functools.wraps(DockerClient.images.getter)
    def images(self):
        try:
            return super().images
        except socket.error as e:
            print("Ignoring error:", e)
            return super().images
        except paramiko.ssh_exception.SSHException as e:
            print("Ignoring error:", e)
            return super().images

    @property
    @functools.wraps(DockerClient.networks.getter)
    def networks(self):
        try:
            return super().networks
        except socket.error as e:
            print("Ignoring error:", e)
            return super().networks
        except paramiko.ssh_exception.SSHException as e:
            print("Ignoring error:", e)
            return super().networks

    @property
    @functools.wraps(DockerClient.nodes.getter)
    def nodes(self):
        try:
            return super().nodes
        except socket.error as e:
            print("Ignoring error:", e)
            return super().nodes
        except paramiko.ssh_exception.SSHException as e:
            print("Ignoring error:", e)
            return super().nodes

    @property
    @functools.wraps(DockerClient.plugins.getter)
    def plugins(self):
        try:
            return super().plugins
        except socket.error as e:
            print("Ignoring error:", e)
            return super().plugins
        except paramiko.ssh_exception.SSHException as e:
            print("Ignoring error:", e)
            return super().plugins

    @property
    @functools.wraps(DockerClient.secrets.getter)
    def secrets(self):
        try:
            return super().secrets
        except socket.error as e:
            print("Ignoring error:", e)
            return super().secrets
        except paramiko.ssh_exception.SSHException as e:
            print("Ignoring error:", e)
            return super().secrets

    @property
    @functools.wraps(DockerClient.services.getter)
    def services(self):
        try:
            return super().services
        except socket.error as e:
            print("Ignoring error:", e)
            return super().services
        except paramiko.ssh_exception.SSHException as e:
            print("Ignoring error:", e)
            return super().services

    @property
    @functools.wraps(DockerClient.swarm.getter)
    def swarm(self):
        try:
            return super().swarm
        except socket.error as e:
            print("Ignoring error:", e)
            return super().swarm
        except paramiko.ssh_exception.SSHException as e:
            print("Ignoring error:", e)
            return super().swarm

    @property
    @functools.wraps(DockerClient.volumes.getter)
    def volumes(self):
        try:
            return super().volumes
        except socket.error as e:
            print("Ignoring error:", e)
            return super().volumes
        except paramiko.ssh_exception.SSHException as e:
            print("Ignoring error:", e)
            return super().volumes


DOCKER_CLIENTS = [CachedDockerClient(base_url=base_url)
                  for base_url in DOCKER_HOSTS]


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
            for container in client.containers.list(all=True, filters={
                "label": [workshop_id_label, user_id_label, controller_id_label]})]


def create_container(workshop: Workshop, user_id: str, public_key: str) -> Container:
    workshop_id_label = f"{Labels.workshop_id.value}={workshop.pk}"
    user_id_label = f"{Labels.user_id.value}={user_id}"
    controller_id_label = f"{Labels.controller_id.value}={CONTROLLER_ID}"

    for client in DOCKER_CLIENTS:
        containers = client.containers.list(all=True, filters={
            "label": [workshop_id_label, user_id_label, controller_id_label]})
        if containers:
            return containers[0]  # type: ignore

    def get_workload(client: DockerClient):
        info = client.info()
        return info['ContainersRunning'] / info['NCPU']

    client = min(DOCKER_CLIENTS, key=get_workload)

    # TODO: make docker images cloud based

    container = client.containers.run(
        workshop.docker_tag, auto_remove=True, detach=True,
        environment={"SSH_PUBLIC_KEY": public_key,
                     "JUPYTER_TOKEN": secrets.token_hex(24)},
        publish_all_ports=True,
        labels={Labels.workshop_id.value: str(workshop.pk),
                Labels.user_id.value: str(user_id),
                Labels.controller_id.value: CONTROLLER_ID},
        cpu_period=100000,
        cpu_quota=50000,
        mem_limit="1g")
    return container  # type: ignore


def clear_containers(workshop_id: str | None, user_id: str | None):
    workshop_id_label = f"{Labels.workshop_id.value}={workshop_id}" if workshop_id else Labels.workshop_id.value
    user_id_label = f"{Labels.user_id.value}={user_id}" if user_id else Labels.user_id.value
    controller_id_label = f"{Labels.controller_id.value}={CONTROLLER_ID}"

    for client in DOCKER_CLIENTS:
        for container in client.containers.list(all=True, filters={"label": [workshop_id_label, user_id_label, controller_id_label]}):
            container.stop()  # type: ignore
