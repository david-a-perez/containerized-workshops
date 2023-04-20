from rest_framework import serializers
from .models import Workshop, Snippet, TunneledPort
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')


class SnippetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Snippet
        fields = ('__all__')


class TunneledPortSerializer(serializers.ModelSerializer):
    class Meta:
        model = TunneledPort
        fields = ('__all__')


class WorkshopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workshop
        fields = ('__all__')
        read_only_fields = ('id',)


class WorkshopReadSerializer(serializers.ModelSerializer):
    snippets = SnippetSerializer(read_only=True, many=True)
    tunneled_ports = TunneledPortSerializer(read_only=True, many=True)

    class Meta:
        model = Workshop
        fields = ('__all__')
        read_only_fields = ('id',)


class ExposedPortSerializer(serializers.Serializer):
    protocol = serializers.CharField(max_length=5)
    host_port = serializers.IntegerField()
    container_port = serializers.IntegerField(required=False)


class ContainerSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    workshop_id = serializers.PrimaryKeyRelatedField(
        queryset=Workshop.objects.all())
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all())
    status = serializers.CharField(read_only=True)
    public_ip = serializers.IPAddressField(read_only=True)
    exposed_ports = ExposedPortSerializer(read_only=True, many=True)
    public_key = serializers.CharField()
    jupyter_token = serializers.CharField(read_only=True)
