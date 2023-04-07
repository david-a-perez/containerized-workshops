from enum import Enum, unique
from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import APIException, PermissionDenied

import docker
from docker.models.containers import Container
import secrets
from django.contrib.auth.models import User
from .serializers import WorkshopSerializer, WorkshopReadSerializer, SnippetSerializer, TunneledPortSerializer, ContainerSerializer, UserSerializer
from .models import Workshop, Snippet, TunneledPort

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie

# TODO: reminder to use get_serializer_class to have seperate read and write serializers
# TODO: reminder to use permissions
# TODO: reminder to add filterset_fields to other views
# TODO: exception handling


class IsAdminOrReadOnly(permissions.BasePermission):
    message = 'You are not allowed to modify this unless you are an Admin.'

    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS or (request.user and request.user.is_staff)


class IsAdminOrOwnerParticipant(permissions.BasePermission):
    message = 'You can only access your own data unless you are an Admin.'

    def has_object_permission(self, request, view, obj):
        return request.user and (request.user.is_staff or obj.user == request.user)

    def has_permission(self, request, view):
        return request.user and \
            (request.user.is_staff or
             (view.action == "create" and ("user" not in request.data or request.data["user"] == str(request.user.id))) or
                (view.action == "list" and "user" in request.query_params and request.query_params["user"] == str(request.user.id)))


# Create your views here.


class WorkshopView(viewsets.ModelViewSet):
    queryset = Workshop.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    # TODO: filter probably not necessary
    filterset_fields = ['title', 'participants']

    def get_serializer_class(self):
        if self.action == 'create':
            return WorkshopSerializer
        return WorkshopReadSerializer


class SnippetView(viewsets.ModelViewSet):
    serializer_class = SnippetSerializer
    queryset = Snippet.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]


class TunneledPortView(viewsets.ModelViewSet):
    serializer_class = TunneledPortSerializer
    queryset = TunneledPort.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]


class NotInWorkshop(APIException):
    status_code = 400
    default_detail = "You are not currently in the workshop"
    default_code = "not_in_workshop"


class NotAdminOrParticipant(APIException):
    status_code = 403
    default_detail = "You are not an Admin or the user who owns this container"
    default_code = "not_admin_or_participant"


@unique
class Labels(str, Enum):
    workshop_id = 'com.containerized-workshops.workshop-id'
    user_id = 'com.containerized-workshops.user-id'
    controller_id = 'com.containerized-workshops.controller-id'
    # participant_id = 'com.containerized-workshops.participant-id'


def serialize_container(container: Container):
    ports = container.attrs["NetworkSettings"]["Ports"]  # type: ignore
    env_vars = container.attrs["Config"]["Env"]  # type: ignore
    ports = [{"protocol": port.split("/")[1], "container_port": port.split("/")[0], "host_port": host_ports[0]
              ['HostPort'] if host_ports and len(host_ports) > 0 else None} for port, host_ports in ports.items()]
    return {"id": container.id, "workshop": container.labels[Labels.workshop_id.value], "user": container.labels[Labels.user_id.value],
            "exposed_ports": ports, "public_ip": "127.0.0.1",
            "public_key": next(env.split("=", 1)[1] for env in env_vars if env.startswith("SSH_PUBLIC_KEY=")),
            "jupyter_token": next(env.split("=", 1)[1] for env in env_vars if env.startswith("JUYPTER_TOKEN="))}


class ContainerViewSet(viewsets.ViewSet):
    serializer_class = ContainerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        workshop_id_label = f"{Labels.workshop_id.value}={request.query_params['workshop_id']}" if "workshop_id" in request.query_params else Labels.workshop_id.value
        controller_id_label = f"{Labels.controller_id.value}={1}"

        if request.user.is_superuser:
            user_id_label = f"{Labels.user_id.value}={request.query_params['user_id']}" if "user_id" in request.query_params else Labels.user_id.value
        else:
            user_id_label = f"{Labels.user_id.value}={request.user.pk}"

        client = docker.DockerClient(base_url="ssh://cc@cham-worker2")

        containers: "list[Container]" = client.containers.list(all=True, filters={
            "label": [workshop_id_label, user_id_label, controller_id_label]})  # type: ignore
        serializer = ContainerSerializer([serialize_container(
            container) for container in containers], many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        if not pk:
            raise APIException()
        # client = docker.from_env()  # TODO: replace with DockerClient
        client = docker.DockerClient(base_url="ssh://cc@cham-worker2")
        container: Container = client.containers.get(pk)  # type: ignore
        if not (request.user.is_superuser or container.labels[Labels.user_id.value] == str(request.user.pk)):
            raise PermissionDenied()
        serializer = ContainerSerializer(serialize_container(container))
        return Response(serializer.data)

    def create(self, request):
        # TODO: verify participant does not already have container running
        if not request.data['workshop']:
            raise APIException()

        if not request.data['user']:
            raise APIException()

        if not (request.user.is_superuser or request.data['user'] == str(request.user.pk)):
            raise NotAdminOrParticipant()

        workshop = Workshop.objects.filter(pk=request.data['workshop']).first()

        if not workshop:
            raise APIException()

        if not workshop.participants.filter(pk=request.data['user']).exists():
            raise NotInWorkshop()

        # TODO: from environment variable (implement basic scheduling algorithm)
        client = docker.DockerClient(base_url="ssh://cc@cham-worker2")
        container: Container = client.containers.run(
            workshop.docker_tag, auto_remove=True, detach=True,
            environment={"SSH_PUBLIC_KEY": request.data["public_key"],
                         "JUPYTER_TOKEN": secrets.token_bytes(24)},
            publish_all_ports=True,
            labels={Labels.workshop_id.value: str(workshop.pk),
                    Labels.user_id.value: str(request.data['user']),
                    Labels.controller_id.value: 1},
            cpu_period=100000,
            cpu_quota=50000,
            mem_limit="1g")  # type: ignore
        serializer = ContainerSerializer(serialize_container(container))
        return Response(serializer.data)

    def destroy(self, request, pk=None):
        if not pk:
            raise APIException()
        client = docker.DockerClient(base_url="ssh://cc@cham-worker2")
        container: Container = client.containers.get(pk)  # type: ignore
        if not (request.user.is_superuser or container.labels[Labels.user_id.value] == str(request.user.pk)):
            raise NotAdminOrParticipant()
        container.stop()
        serializer = ContainerSerializer(serialize_container(container))
        return Response(serializer.data)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    This viewset automatically provides `list` and `retrieve` actions.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=['get'], permission_classes=[])
    @method_decorator(ensure_csrf_cookie)
    def get_user_data(self, request):
        return Response({
            "is_logged_in": request.user.is_authenticated,
            "is_admin": request.user.is_staff and request.user.is_superuser,
            "id": request.user.id,
            "email": getattr(request.user, 'email', None),
            "first_name": getattr(request.user, 'first_name', None),
            "last_name": getattr(request.user, 'last_name', None),
        })
