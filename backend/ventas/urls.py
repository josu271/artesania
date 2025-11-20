from django.urls import path
from . import views

urlpatterns = [
    path('productos/', views.listar_productos, name='listar_productos'),
    path('crear/', views.crear_venta, name='crear_venta'),
    path('historial/', views.historial_ventas, name='historial_ventas'),
    path('obtener/<int:venta_id>/', views.obtener_venta, name='obtener_venta'),
    path('editar/<int:venta_id>/', views.editar_venta, name='editar_venta'),
    path('eliminar/<int:venta_id>/', views.eliminar_venta, name='eliminar_venta'),
]