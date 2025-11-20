from django.urls import path
from . import views

urlpatterns = [
    path('predicciones/', views.obtener_predicciones, name='obtener_predicciones'),
    path('predicciones/generar/', views.generar_predicciones_automaticas, name='generar_predicciones'),
    path('predicciones/estadisticas/', views.estadisticas_predicciones, name='estadisticas_predicciones'),
    path('predicciones/producto/<int:producto_id>/', views.predecir_producto_especifico, name='predecir_producto'),
]