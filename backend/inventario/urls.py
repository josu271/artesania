from django.urls import path
from . import views

urlpatterns = [
    path('productos/', views.listar_productos, name='listar_productos'),
    path('productos/crear/', views.crear_producto, name='crear_producto'),
    path('productos/<int:producto_id>/editar/', views.editar_producto, name='editar_producto'),
    path('productos/<int:producto_id>/eliminar/', views.eliminar_producto, name='eliminar_producto'),
    path('categorias/', views.listar_categorias, name='listar_categorias'),
]