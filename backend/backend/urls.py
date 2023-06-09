"""backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from rest_framework import routers
from ContainerizedWorkshops import views

router = routers.DefaultRouter()
router.register(r'workshop', views.WorkshopView, 'workshop')
router.register(r'snippet', views.SnippetView, 'snippet')
router.register(r'tunneled_port', views.TunneledPortView, 'tunneled_port')
router.register(r'containers', views.ContainerViewSet, 'container')
router.register(r'user', views.UserViewSet, 'user')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('accounts/', include('allauth.urls')),
    path('', TemplateView.as_view(template_name="index.html")),
]
