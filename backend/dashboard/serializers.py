from rest_framework import serializers
from .models import Producto, Venta, DetalleVenta, Prediccion, Categoria
from api.models import Usuario

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    
    class Meta:
        model = Producto
        fields = '__all__'

class VentaSerializer(serializers.ModelSerializer):
    artesano_nombre = serializers.CharField(source='artesano.nombre', read_only=True)
    detalles = serializers.SerializerMethodField()

    class Meta:
        model = Venta
        fields = '__all__'

    def get_detalles(self, obj):
        detalles = DetalleVenta.objects.filter(venta=obj)
        return DetalleVentaSerializer(detalles, many=True).data

class DetalleVentaSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    
    class Meta:
        model = DetalleVenta
        fields = '__all__'

class PrediccionSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    
    class Meta:
        model = Prediccion
        fields = '__all__'

class DashboardStatsSerializer(serializers.Serializer):
    total_ventas_mes = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_productos = serializers.IntegerField()
    productos_bajo_stock = serializers.IntegerField()
    ventas_ultimos_6_meses = serializers.DictField()
    productos_mas_vendidos = serializers.ListField()