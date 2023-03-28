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


class Workshop(models.Model):
    id = models.CharField(max_length=10, primary_key=True,
                          default=create_new_id)
    title = models.CharField(max_length=120)
    description = models.TextField()
    docker_tag = models.CharField(max_length=100)
    internal_ports = models.CharField(
        validators=[(int_list_validator())], max_length=100)
    participants = models.ManyToManyField(User, through='Participant')

    def __str__(self):
        return self.title


class Participant(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    workshop = models.ForeignKey(Workshop, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('user', 'workshop')
