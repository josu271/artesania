# backend/api/urls.py
from django.urls import path, include
from . import views

urlpatterns = [
    path('login/', views.login, name='login'),
    path('eventos/', include('eventos.urls')),  # Incluye URLs de eventos
]