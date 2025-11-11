# backend/eventos/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.eventos_list, name='eventos-list'),
    path('<int:pk>/', views.evento_detail, name='evento-detail'),
]