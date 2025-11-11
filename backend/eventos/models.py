from django.db import models

class Evento(models.Model):
    idEvento = models.AutoField(primary_key=True)  # 👈 Especifica la columna correcta
    nombre = models.CharField(max_length=150)
    fecha = models.DateField()
    ubicacion = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'eventos'  # Usa tu tabla existente
        app_label = 'eventos'

    def __str__(self):
        return self.nombre