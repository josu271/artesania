from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db import connection
import json
import jwt
from django.conf import settings
from .ml_service import MLPredictor
from datetime import datetime

def get_user_from_token(request):
    """Extrae el usuario del token JWT"""
    try:
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        return payload
    except Exception as e:
        print(f"Error decoding token: {e}")
        return None

@csrf_exempt
@require_http_methods(["GET"])
def obtener_predicciones(request):
    try:
        user_data = get_user_from_token(request)
        if not user_data:
            return JsonResponse({'error': 'Token inválido o expirado'}, status=401)
        
        user_id = user_data.get('user_id')
        
        # Obtener predicciones recientes para los productos del usuario
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    p.idPrediccion,
                    p.producto_id,
                    pr.nombre as producto_nombre,
                    p.demanda_predicha,
                    p.precision_modelo,
                    p.modelo_usado,
                    p.fecha_prediccion,
                    p.observaciones,
                    pr.stock as stock_actual,
                    CASE 
                        WHEN p.demanda_predicha > pr.stock + 10 THEN 'Aumentar producción'
                        WHEN p.demanda_predicha > pr.stock THEN 'Mantener producción'
                        WHEN p.demanda_predicha > pr.stock - 5 THEN 'Reducir producción'
                        ELSE 'Disminuir producción'
                    END as recomendacion
                FROM predicciones p
                JOIN productos pr ON p.producto_id = pr.idProducto
                WHERE pr.usuario_id = %s
                AND p.fecha_prediccion >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                ORDER BY p.fecha_prediccion DESC
            """, [user_id])
            
            columns = [col[0] for col in cursor.description]
            predicciones = [dict(zip(columns, row)) for row in cursor.fetchall()]
            
            # Convertir decimal a float
            for pred in predicciones:
                if pred.get('precision_modelo'):
                    pred['precision_modelo'] = float(pred['precision_modelo'])
                if pred.get('fecha_prediccion'):
                    pred['fecha_prediccion'] = pred['fecha_prediccion'].isoformat()
        
        return JsonResponse({'predicciones': predicciones})
        
    except Exception as e:
        print(f"Error obteniendo predicciones: {e}")
        return JsonResponse({'error': 'Error del servidor'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def generar_predicciones_automaticas(request):
    try:
        user_data = get_user_from_token(request)
        if not user_data:
            return JsonResponse({'error': 'Token inválido o expirado'}, status=401)
        
        print("🔄 Solicitando generación automática de predicciones...")
        
        ml_predictor = MLPredictor()
        resultados = ml_predictor.generar_predicciones_automaticas()
        
        if resultados:
            return JsonResponse({
                'message': f'Predicciones generadas exitosamente para {len(resultados)} productos',
                'predicciones_generadas': resultados
            })
        else:
            return JsonResponse({
                'error': 'No se pudieron generar predicciones. Puede que no haya suficientes datos históricos.'
            }, status=400)
            
    except Exception as e:
        print(f"Error generando predicciones automáticas: {e}")
        return JsonResponse({'error': 'Error del servidor'}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def estadisticas_predicciones(request):
    try:
        user_data = get_user_from_token(request)
        if not user_data:
            return JsonResponse({'error': 'Token inválido o expirado'}, status=401)
        
        user_id = user_data.get('user_id')
        
        with connection.cursor() as cursor:
            # Estadísticas generales
            cursor.execute("""
                SELECT 
                    COUNT(DISTINCT p.producto_id) as total_productos_analizados,
                    AVG(p.precision_modelo) as precision_promedio,
                    MAX(p.fecha_prediccion) as ultima_actualizacion
                FROM predicciones p
                JOIN productos pr ON p.producto_id = pr.idProducto
                WHERE pr.usuario_id = %s
                AND p.fecha_prediccion >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            """, [user_id])
            
            stats = cursor.fetchone()
            
            # Productos con mayor demanda predicha
            cursor.execute("""
                SELECT 
                    pr.nombre as producto,
                    p.demanda_predicha,
                    pr.stock as stock_actual,
                    (p.demanda_predicha - pr.stock) as diferencia
                FROM predicciones p
                JOIN productos pr ON p.producto_id = pr.idProducto
                WHERE pr.usuario_id = %s
                AND p.fecha_prediccion = (
                    SELECT MAX(fecha_prediccion) 
                    FROM predicciones 
                    WHERE producto_id = p.producto_id
                )
                ORDER BY p.demanda_predicha DESC
                LIMIT 5
            """, [user_id])
            
            productos_populares = [
                {
                    'producto': row[0],
                    'demanda_predicha': row[1],
                    'stock_actual': row[2],
                    'diferencia': row[3]
                }
                for row in cursor.fetchall()
            ]
        
        estadisticas = {
            'total_productos_analizados': stats[0] or 0,
            'precision_promedio': float(stats[1] or 0),
            'ultima_actualizacion': stats[2].isoformat() if stats[2] else None,
            'productos_populares': productos_populares
        }
        
        return JsonResponse({'estadisticas': estadisticas})
        
    except Exception as e:
        print(f"Error obteniendo estadísticas: {e}")
        return JsonResponse({'error': 'Error del servidor'}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def predecir_producto_especifico(request, producto_id):
    try:
        user_data = get_user_from_token(request)
        if not user_data:
            return JsonResponse({'error': 'Token inválido o expirado'}, status=401)
        
        user_id = user_data.get('user_id')
        
        # Verificar que el producto pertenece al usuario
        with connection.cursor() as cursor:
            cursor.execute("SELECT usuario_id FROM productos WHERE idProducto = %s", [producto_id])
            result = cursor.fetchone()
            
            if not result or result[0] != user_id:
                return JsonResponse({'error': 'Producto no encontrado o no autorizado'}, status=404)
        
        ml_predictor = MLPredictor()
        mes_actual = datetime.now().month
        demanda_predicha = ml_predictor.predecir_demanda(producto_id, mes_actual)
        
        if demanda_predicha is not None:
            # Obtener información del producto
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT nombre, stock FROM productos WHERE idProducto = %s
                """, [producto_id])
                producto_info = cursor.fetchone()
                
                recomendacion = ml_predictor.generar_recomendacion(
                    producto_info[1], demanda_predicha
                )
            
            return JsonResponse({
                'producto_id': producto_id,
                'producto_nombre': producto_info[0],
                'demanda_predicha': demanda_predicha,
                'stock_actual': producto_info[1],
                'recomendacion': recomendacion,
                'mes_prediccion': mes_actual
            })
        else:
            return JsonResponse({
                'error': 'No se pudo generar la predicción para este producto'
            }, status=400)
            
    except Exception as e:
        print(f"Error prediciendo producto específico: {e}")
        return JsonResponse({'error': 'Error del servidor'}, status=500)