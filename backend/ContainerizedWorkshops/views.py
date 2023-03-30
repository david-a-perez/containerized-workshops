from enum import Enum, unique
from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import APIException

import docker
from docker.models.containers import Container
import shortuuid
from .serializers import WorkshopSerializer, ParticipantSerializer, ContainerSerializer
from .models import Workshop, Participant

import paramiko

# TODO: reminder to use get_serializer_class to have seperate read and write serializers
# TODO: reminder to use permissions
# TODO: reminder to add filterset_fields to other views


# Create your views here.
class WorkshopView(viewsets.ModelViewSet):
    serializer_class = WorkshopSerializer
    queryset = Workshop.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    # TODO: filter probably not necessary
    filterset_fields = ['title']


class ParticipantView(viewsets.ModelViewSet):
    serializer_class = ParticipantSerializer
    queryset = Participant.objects.all()
    permission_classes = [permissions.IsAuthenticated]


class NotInWorkshop(APIException):
    status_code = 400
    default_detail = "You are not currently in the workshop"
    default_code = "not_in_workshop"


@unique
class Labels(str, Enum):
    workshop_id = 'com.containerized-workshops.workshop-id'
    user_id = 'com.containerized-workshops.user-id'
    participant_id = 'com.containerized-workshops.participant-id'


def serialize_container(container: Container):
    ports = container.attrs["NetworkSettings"]["Ports"]  # type: ignore
    ports = [{"protocol": port.split("/")[1], "container_port": port.split("/")[0], "host_port": host_ports[0]
              ['HostPort'] if host_ports and len(host_ports) > 0 else None} for port, host_ports in ports.items()]
    return {"id": container.id, "participant": Participant.objects.filter(
        pk=container.labels[Labels.participant_id.value]).first(), "exposed_ports": ports, "public_ip": "127.0.0.1"}


class ContainerViewSet(viewsets.ViewSet):
    serializer_class = ContainerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        client = docker.from_env()
        containers: "list[Container]" = client.containers.list(all=True, filters={
            "label": [f"{Labels.user_id.value}={request.user.id}"]})  # type: ignore
        serializer = ContainerSerializer([serialize_container(
            container) for container in containers], many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        if not pk:
            raise APIException()
        client = docker.from_env() # TODO: replace with DockerClient
        container: Container = client.containers.get(pk)  # type: ignore
        serializer = ContainerSerializer(serialize_container(container))
        return Response(serializer.data)

    def create(self, request):
        # TODO: verify participant does not already have container running
        if not request.data['participant']:
            raise APIException()
        participant = Participant.objects.filter(
            pk=request.data['participant']).first()
        if not participant:
            raise NotInWorkshop()
        client = docker.DockerClient(base_url = "ssh://cc@cham-worker2") # TODO: from environment variable (implement basic scheduling algorithm)
        container: Container = client.containers.run(
            participant.workshop.docker_tag, auto_remove=True, detach=True,
            environment={"SSH_PUBLIC_KEY": "ABCD"},
            ports={'80/tcp': None},
            labels={Labels.workshop_id.value: str(participant.workshop.pk),
                    Labels.user_id.value: str(participant.user.pk),
                    Labels.participant_id.value: str(participant.pk)})  # type: ignore
        serializer = ContainerSerializer(serialize_container(container))
        return Response(serializer.data)
