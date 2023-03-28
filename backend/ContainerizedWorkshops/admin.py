from django.contrib import admin
from .models import Workshop

# Register your models here.
@admin.register(Workshop)
class WorkshopAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Workshop._meta.fields]
