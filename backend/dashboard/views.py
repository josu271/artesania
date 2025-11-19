from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db import connection
import json
from datetime import datetime, timedelta

@csrf_exempt
@require_http_methods(["GET"])
def dashboard_data(request):
    """Obtener datos estadísticos para el dashboard"""
    try:
        user_id = request.GET.get('user_id')
        
        if not user_id:
            return JsonResponse({'error': 'user_id es requerido'}, status=400)
        
        # Datos de ventas del mes actual
        with connection.cursor() as cursor:
            # Ventas del mes actual
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_ventas,
                    COALESCE(SUM(total), 0) as ingresos_totales,
                    AVG(total) as promedio_venta
                FROM ventas 
                WHERE artesano_id = %s 
                AND MONTH(fecha) = MONTH(CURRENT_DATE())
                AND YEAR(fecha) = YEAR(CURRENT_DATE())
            """, [user_id])
            
            ventas_data = cursor.fetchone()
            
            # Productos más vendidos
            cursor.execute("""
                SELECT p.nombre, SUM(dv.cantidad) as total_vendido
                FROM detalle_venta dv
                JOIN ventas v ON dv.venta_id = v.idVenta
                JOIN productos p ON dv.producto_id = p.idProducto
                WHERE v.artesano_id = %s
                AND MONTH(v.fecha) = MONTH(CURRENT_DATE())
                GROUP BY p.idProducto, p.nombre
                ORDER BY total_vendido DESC
                LIMIT 5
            """, [user_id])
            
            productos_populares = [
                {'nombre': row[0], 'vendidos': row[1]} 
                for row in cursor.fetchall()
            ]
            
            # Ventas por día (últimos 7 días)
            cursor.execute("""
                SELECT DATE(fecha) as dia, COUNT(*) as ventas, COALESCE(SUM(total), 0) as ingresos
                FROM ventas 
                WHERE artesano_id = %s 
                AND fecha >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
                GROUP BY DATE(fecha)
                ORDER BY dia
            """, [user_id])
            
            ventas_ultima_semana = [
                {'dia': row[0].strftime('%Y-%m-%d'), 'ventas': row[1], 'ingresos': float(row[2])}
                for row in cursor.fetchall()
            ]
            
            # Estadísticas de inventario
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_productos,
                    SUM(stock) as stock_total,
                    AVG(precio) as precio_promedio
                FROM productos 
                WHERE usuario_id = %s
            """, [user_id])
            
            inventario_data = cursor.fetchone()
        
        response_data = {
            'estadisticas_ventas': {
                'total_ventas_mes': ventas_data[0] or 0,
                'ingresos_totales': float(ventas_data[1] or 0),
                'promedio_venta': float(ventas_data[2] or 0)
            },
            'productos_populares': productos_populares,
            'ventas_ultima_semana': ventas_ultima_semana,
            'estadisticas_inventario': {
                'total_productos': inventario_data[0] or 0,
                'stock_total': inventario_data[1] or 0,
                'precio_promedio': float(inventario_data[2] or 0)
            }
        }
        
        return JsonResponse(response_data)
        
    except Exception as e:
        return JsonResponse({'error': f'Error del servidor: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def ventas_mensuales(request):
    """Obtener ventas mensuales para gráficos"""
    try:
        user_id = request.GET.get('user_id')
        
        if not user_id:
            return JsonResponse({'error': 'user_id es requerido'}, status=400)
        
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    MONTH(fecha) as mes,
                    COUNT(*) as total_ventas,
                    COALESCE(SUM(total), 0) as ingresos
                FROM ventas 
                WHERE artesano_id = %s 
                AND YEAR(fecha) = YEAR(CURRENT_DATE())
                GROUP BY MONTH(fecha)
                ORDER BY mes
            """, [user_id])
            
            ventas_mensuales = [
                {'mes': row[0], 'ventas': row[1], 'ingresos': float(row[2])}
                for row in cursor.fetchall()
            ]
        
        return JsonResponse({'ventas_mensuales': ventas_mensuales})
        
    except Exception as e:
        return JsonResponse({'error': f'Error del servidor: {str(e)}'}, status=500)