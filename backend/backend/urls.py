from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/', include('perfil.urls')),  # Agregar URLs de perfil
    path('api/', include('eventos.urls')),
    path('dashboard/', include('dashboard.urls')),
    path('api/inventario/', include('inventario.urls')),
]