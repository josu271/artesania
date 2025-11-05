# backend/urls.py
from django.urls import path, include

urlpatterns = [
    path('api/', include('api.urls')),  # o el nombre de tu app donde está el login de usuarios
]
