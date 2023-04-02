from rest_framework import serializers
from .models import Workshop, Participant
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')


class WorkshopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workshop
        fields = ('__all__')
        read_only_fields = ('id',)


class ParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participant
        fields = ('__all__')


class ParticipantReadSerializer(serializers.ModelSerializer):
    workshop = WorkshopSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Participant
        fields = ('__all__')


class PortSerializer(serializers.Serializer):
    protocol = serializers.CharField(max_length=5)
    host_port = serializers.IntegerField()
    container_port = serializers.IntegerField(required=False)


class ContainerSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    participant = serializers.PrimaryKeyRelatedField(
        queryset=Participant.objects.all())
    public_ip = serializers.IPAddressField(read_only=True)
    exposed_ports = PortSerializer(read_only=True, many=True)
    status = serializers.CharField(read_only=True)
    public_key = serializers.CharField()
