from django.db import models
from django.contrib.auth.models import User
from django.core.validators import int_list_validator

import shortuuid

# Create your models here.


def create_new_id():
    while True:
        unique_id = shortuuid.uuid()[:6]
        if not Workshop.objects.filter(pk=unique_id):
            return unique_id


class Snippet(models.Model):
    title = models.CharField(max_length=120)
    format = models.TextField()

    def __str__(self):
        return self.title


class TunneledPort(models.Model):
    title = models.CharField(max_length=120)
    container_port = models.IntegerField()
    client_port = models.IntegerField()

    def __str__(self):
        return self.title


class Workshop(models.Model):
    id = models.CharField(max_length=10, primary_key=True,
                          default=create_new_id)
    title = models.CharField(max_length=120)
    description = models.TextField()
    docker_tag = models.CharField(max_length=100)
    participants = models.ManyToManyField(User, blank=True)
    snippets = models.ManyToManyField(Snippet, blank=True)
    tunneled_ports = models.ManyToManyField(TunneledPort, blank=True)
    working_directory = models.CharField(max_length=120)

    def __str__(self):
        return self.title
