# backend/api/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login, name='login'),  # <-- apunta al nuevo login
]
