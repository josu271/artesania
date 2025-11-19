from django.db import models
from api.models import Usuario

# Modelo para Ventas (usando la tabla existente)
class Venta(models.Model):
    idVenta = models.AutoField(primary_key=True)
    fecha = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    metodo_pago = models.CharField(max_length=50)
    artesano = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='ventas_artesano')
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='ventas_usuario')
    
    class Meta:
        db_table = 'ventas'

# Modelo para Detalle de Venta
class DetalleVenta(models.Model):
    idDetalle = models.AutoField(primary_key=True)
    venta = models.ForeignKey(Venta, on_delete=models.CASCADE)
    producto_id = models.IntegerField()  # Usamos IntegerField para evitar dependencias complejas
    cantidad = models.IntegerField()
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        db_table = 'detalle_venta'

# Modelo para Productos (simplificado para el dashboard)
class Producto(models.Model):
    idProducto = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=150)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'productos'