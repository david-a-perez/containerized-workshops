from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as AuthUserAdmin
from django.contrib import admin

from ContainerizedWorkshops.container import clear_containers
from .models import Workshop, Snippet, TunneledPort

# Register your models here.


@admin.register(Workshop)
class WorkshopAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Workshop._meta.fields]
    actions = ['remove_containers']

    def remove_containers(self, request, queryset):
        for workshop in queryset:
            clear_containers(workshop.pk, None)

    remove_containers.short_description = "Remove all containers from selected workshops"


@admin.register(Snippet)
class SnippetAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Snippet._meta.fields]


@admin.register(TunneledPort)
class TunneledPortAdmin(admin.ModelAdmin):
    list_display = [field.name for field in TunneledPort._meta.fields]


class UserAdmin(AuthUserAdmin):
    actions = ['activate_user', 'deactivate_user', 'remove_containers']

    def activate_user(self, request, queryset):
        queryset.update(is_active=True)

    def deactivate_user(self, request, queryset):
        queryset.update(is_active=False)

    def remove_containers(self, request, queryset):
        for user in queryset:
            clear_containers(None, str(user.pk))

    activate_user.short_description = "Activate selected users"
    deactivate_user.short_description = "Deactivate selected users"
    remove_containers.short_description = "Remove all containers from selected users"


admin.site.unregister(User)
admin.site.register(User, UserAdmin)
