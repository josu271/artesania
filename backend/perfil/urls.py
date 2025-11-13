from django.urls import path
from . import views

urlpatterns = [
    path('perfil/', views.obtener_perfil, name='obtener_perfil'),
    path('perfil/actualizar/', views.actualizar_perfil, name='actualizar_perfil'),
    path('perfil/cambiar-password/', views.cambiar_password, name='cambiar_password'),
]