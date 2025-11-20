from django.apps import AppConfig

class PrediccionesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'predicciones'
    label = 'predicciones'
    
    def ready(self):
        # Importar señales aquí si las tienes
        pass