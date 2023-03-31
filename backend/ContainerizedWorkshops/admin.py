from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as AuthUserAdmin
from django.contrib import admin
from .models import Workshop, Participant

# Register your models here.


@admin.register(Workshop)
class WorkshopAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Workshop._meta.fields]
    actions = ['remove_containers']

    def remove_containers(self, request, queryset):
        for workshop in queryset:
            # TODO: remove all containers that belong to workshop
            pass

    remove_containers.short_description = "Remove all containers from selected workshops"


@admin.register(Participant)
class ParticipantAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Participant._meta.fields]
    actions = ['remove_containers']

    def remove_containers(self, request, queryset):
        for participant in queryset:
            # TODO: remove all containers that belong to participant
            pass

    remove_containers.short_description = "Remove all containers from selected participants"


class UserAdmin(AuthUserAdmin):
    actions = ['activate_user', 'deactivate_user', 'remove_containers']

    def activate_user(self, request, queryset):
        queryset.update(is_active=True)

    def deactivate_user(self, request, queryset):
        queryset.update(is_active=False)

    def remove_containers(self, request, queryset):
        for user in queryset:
            # TODO: remove all containers that belong to user
            pass

    activate_user.short_description = "Activate selected users"
    deactivate_user.short_description = "Deactivate selected users"
    remove_containers.short_description = "Remove all containers from selected users"


admin.site.unregister(User)
admin.site.register(User, UserAdmin)
