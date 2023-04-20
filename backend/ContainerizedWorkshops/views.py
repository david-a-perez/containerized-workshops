from enum import Enum, unique
from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import APIException

import docker
import docker.errors
import docker.transport
from docker.models.containers import Container
from docker import DockerClient
from ContainerizedWorkshops.container import Labels, clear_containers, create_container, list_containers

from .serializers import WorkshopSerializer, WorkshopReadSerializer, SnippetSerializer, TunneledPortSerializer, ContainerSerializer, UserSerializer
from .models import Workshop, Snippet, TunneledPort
from django.contrib.auth.models import User

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

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def join(self, request, pk=None):
        if not pk:
            raise APIException()

        workshop = Workshop.objects.get(pk=pk)
        workshop.participants.add(request.user)

        serializer = WorkshopReadSerializer(workshop)
        return Response(serializer.data)


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


def serialize_container(container: Container):
    if not container.client:
        raise APIException()
    if not container.attrs:
        raise APIException()
    
    client: DockerClient = container.client
    public_ip = client.api._custom_adapter.ssh_params['hostname'] if isinstance(
        client.api._custom_adapter, docker.transport.SSHHTTPAdapter) else "127.0.0.1"

    ports = container.attrs["NetworkSettings"]["Ports"]
    ports = [{"protocol": port.split("/")[1], "container_port": port.split("/")[0], "host_port": host_ports[0]
              ['HostPort'] if host_ports and len(host_ports) > 0 else None} for port, host_ports in ports.items()]

    env_vars = container.attrs["Config"]["Env"]

    return {"id": container.id,
            "workshop_id": Workshop.objects.get(pk=container.labels[Labels.workshop_id.value]),
            "user_id": User.objects.get(pk=container.labels[Labels.user_id.value]),
            "status": container.status,
            "public_ip": public_ip,
            "exposed_ports": ports,
            "public_key": next(env.split("=", 1)[1] for env in env_vars if env.startswith("SSH_PUBLIC_KEY=")),
            "jupyter_token": next(env.split("=", 1)[1] for env in env_vars if env.startswith("JUPYTER_TOKEN="))}


class ContainerViewSet(viewsets.ViewSet):
    serializer_class = ContainerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        containers = list_containers(
            request.query_params['workshop_id'] if 'workshop_id' in request.query_params else None,
            (request.query_params['user_id'] if 'user_id' in request.query_params else None) if request.user.is_superuser else str(request.user.pk))

        serializer = ContainerSerializer([serialize_container(container) for container in containers], many=True)

        return Response(serializer.data)

    def create(self, request):
        if not request.data['workshop_id']:
            raise APIException()

        if not request.data['user_id']:
            raise APIException()

        if not (request.user.is_superuser or str(request.data['user_id']) == str(request.user.pk)):
            raise NotAdminOrParticipant()

        workshop = Workshop.objects.filter(
            pk=request.data['workshop_id']).first()

        if not workshop:
            raise APIException()

        if not workshop.participants.filter(pk=request.data['user_id']).exists():
            raise NotInWorkshop()
        
        container = create_container(workshop, request.data['user_id'], request.data['public_key'])

        serializer = ContainerSerializer(serialize_container(container))
        return Response(serializer.data)

    
    @action(detail=False, methods=['post'])
    def clear(self, request):
        clear_containers(
            request.query_params['workshop_id'] if 'workshop_id' in request.query_params else None,
            (request.query_params['user_id'] if 'user_id' in request.query_params else None) if request.user.is_superuser else str(request.user.pk))
        
        return Response()


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
