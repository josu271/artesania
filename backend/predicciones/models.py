from django.db import models
from api.models import Usuario

class Prediccion(models.Model):
    idPrediccion = models.AutoField(primary_key=True)
    producto = models.ForeignKey('dashboard.Producto', on_delete=models.CASCADE)
    fecha_prediccion = models.DateTimeField(auto_now_add=True)
    demanda_predicha = models.IntegerField()
    precision_modelo = models.DecimalField(max_digits=5, decimal_places=2)
    modelo_usado = models.CharField(max_length=100)
    observaciones = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'predicciones'
        app_label = 'predicciones'

    def __str__(self):
        return f"Predicción {self.producto.nombre} - {self.demanda_predicha} unidades"