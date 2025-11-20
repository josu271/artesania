from django.core.management.base import BaseCommand
from predicciones.ml_service import MLPredictor

class Command(BaseCommand):
    help = 'Entrena el modelo de machine learning automáticamente'
    
    def handle(self, *args, **options):
        self.stdout.write('🚀 Iniciando entrenamiento automático del modelo...')
        
        ml_predictor = MLPredictor()
        precision = ml_predictor.entrenar_modelo()
        
        if precision:
            self.stdout.write(
                self.style.SUCCESS(f'✅ Modelo entrenado con {precision:.2f}% de precisión')
            )
        else:
            self.stdout.write(
                self.style.ERROR('❌ No se pudo entrenar el modelo')
            )