from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from django.db import connection
from api.models import Usuario
import jwt
from django.conf import settings

def get_user_from_token(request):
    """Extrae el usuario del token JWT"""
    try:
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        return Usuario.objects.get(idUsuario=payload['user_id'])
    except Exception as e:
        print(f"Error decoding token: {e}")
        return None

@csrf_exempt
@require_http_methods(["GET"])
def listar_productos(request):
    """Lista todos los productos disponibles"""
    try:
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({'error': 'No autorizado'}, status=401)
        
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT p.idProducto, p.nombre, p.descripcion, p.precio, p.stock, 
                       c.nombre as categoria, u.nombre as artesano
                FROM productos p
                LEFT JOIN categorias c ON p.categoria_id = c.idCategoria
                LEFT JOIN usuarios u ON p.usuario_id = u.idUsuario
                WHERE p.stock > 0
                ORDER BY p.nombre
            """)
            columns = [col[0] for col in cursor.description]
            productos = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        return JsonResponse({'productos': productos})
        
    except Exception as e:
        print(f"Error listando productos: {e}")
        return JsonResponse({'error': 'Error del servidor'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def crear_venta(request):
    """Crea una nueva venta con sus detalles"""
    try:
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({'error': 'No autorizado'}, status=401)
        
        data = json.loads(request.body)
        metodo_pago = data.get('metodo_pago')
        detalles = data.get('detalles', [])
        
        if not metodo_pago or not detalles:
            return JsonResponse({'error': 'Método de pago y detalles son requeridos'}, status=400)
        
        # Calcular total
        total = sum(detalle['cantidad'] * detalle['precio_unitario'] for detalle in detalles)
        
        with connection.cursor() as cursor:
            # Insertar venta
            cursor.execute("""
                INSERT INTO ventas (total, metodo_pago, artesano_id, usuario_id)
                VALUES (%s, %s, %s, %s)
            """, [total, metodo_pago, user.idUsuario, user.idUsuario])
            
            venta_id = cursor.lastrowid
            
            # Insertar detalles de venta
            for detalle in detalles:
                cursor.execute("""
                    INSERT INTO detalle_venta (venta_id, producto_id, cantidad, subtotal)
                    VALUES (%s, %s, %s, %s)
                """, [venta_id, detalle['producto_id'], detalle['cantidad'], detalle['cantidad'] * detalle['precio_unitario']])
                
                # Actualizar stock
                cursor.execute("""
                    UPDATE productos 
                    SET stock = stock - %s 
                    WHERE idProducto = %s
                """, [detalle['cantidad'], detalle['producto_id']])
        
        return JsonResponse({
            'mensaje': 'Venta registrada exitosamente',
            'venta_id': venta_id,
            'total': float(total)
        })
        
    except Exception as e:
        print(f"Error creando venta: {e}")
        return JsonResponse({'error': 'Error del servidor'}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def historial_ventas(request):
    """Obtiene el historial de ventas del usuario"""
    try:
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({'error': 'No autorizado'}, status=401)
        
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT v.idVenta, v.fecha, v.total, v.metodo_pago,
                       COUNT(dv.idDetalle) as total_productos
                FROM ventas v
                LEFT JOIN detalle_venta dv ON v.idVenta = dv.venta_id
                WHERE v.usuario_id = %s
                GROUP BY v.idVenta, v.fecha, v.total, v.metodo_pago
                ORDER BY v.fecha DESC
                LIMIT 50
            """, [user.idUsuario])
            
            columns = [col[0] for col in cursor.description]
            ventas = [dict(zip(columns, row)) for row in cursor.fetchall()]
            
            # Convertir decimal a float para JSON
            for venta in ventas:
                venta['total'] = float(venta['total'])
                venta['fecha'] = venta['fecha'].isoformat() if venta['fecha'] else None
        
        return JsonResponse({'ventas': ventas})
        
    except Exception as e:
        print(f"Error obteniendo historial: {e}")
        return JsonResponse({'error': 'Error del servidor'}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def obtener_venta(request, venta_id):
    """Obtiene los detalles de una venta específica"""
    try:
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({'error': 'No autorizado'}, status=401)
        
        with connection.cursor() as cursor:
            # Obtener información de la venta
            cursor.execute("""
                SELECT v.idVenta, v.fecha, v.total, v.metodo_pago, v.artesano_id, v.usuario_id
                FROM ventas v
                WHERE v.idVenta = %s AND v.usuario_id = %s
            """, [venta_id, user.idUsuario])
            
            venta_data = cursor.fetchone()
            if not venta_data:
                return JsonResponse({'error': 'Venta no encontrada'}, status=404)
            
            columns = [col[0] for col in cursor.description]
            venta = dict(zip(columns, venta_data))
            venta['total'] = float(venta['total'])
            venta['fecha'] = venta['fecha'].isoformat() if venta['fecha'] else None
            
            # Obtener detalles de la venta
            cursor.execute("""
                SELECT dv.idDetalle, dv.producto_id, dv.cantidad, dv.subtotal,
                       p.nombre, p.precio, p.stock
                FROM detalle_venta dv
                JOIN productos p ON dv.producto_id = p.idProducto
                WHERE dv.venta_id = %s
            """, [venta_id])
            
            detalles_columns = [col[0] for col in cursor.description]
            detalles = [dict(zip(detalles_columns, row)) for row in cursor.fetchall()]
            
            for detalle in detalles:
                detalle['subtotal'] = float(detalle['subtotal'])
                detalle['precio'] = float(detalle['precio'])
        
        return JsonResponse({
            'venta': venta,
            'detalles': detalles
        })
        
    except Exception as e:
        print(f"Error obteniendo venta: {e}")
        return JsonResponse({'error': 'Error del servidor'}, status=500)

@csrf_exempt
@require_http_methods(["PUT"])
def editar_venta(request, venta_id):
    """Edita una venta existente"""
    try:
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({'error': 'No autorizado'}, status=401)
        
        data = json.loads(request.body)
        metodo_pago = data.get('metodo_pago')
        nuevos_detalles = data.get('detalles', [])
        
        if not metodo_pago or not nuevos_detalles:
            return JsonResponse({'error': 'Método de pago y detalles son requeridos'}, status=400)
        
        with connection.cursor() as cursor:
            # Verificar que la venta existe y pertenece al usuario
            cursor.execute("""
                SELECT idVenta FROM ventas 
                WHERE idVenta = %s AND usuario_id = %s
            """, [venta_id, user.idUsuario])
            
            if not cursor.fetchone():
                return JsonResponse({'error': 'Venta no encontrada'}, status=404)
            
            # Obtener detalles actuales para restaurar stock
            cursor.execute("""
                SELECT producto_id, cantidad 
                FROM detalle_venta 
                WHERE venta_id = %s
            """, [venta_id])
            
            detalles_actuales = cursor.fetchall()
            
            # Restaurar stock de los productos anteriores
            for producto_id, cantidad in detalles_actuales:
                cursor.execute("""
                    UPDATE productos 
                    SET stock = stock + %s 
                    WHERE idProducto = %s
                """, [cantidad, producto_id])
            
            # Eliminar detalles actuales
            cursor.execute("DELETE FROM detalle_venta WHERE venta_id = %s", [venta_id])
            
            # Calcular nuevo total
            nuevo_total = sum(detalle['cantidad'] * detalle['precio_unitario'] for detalle in nuevos_detalles)
            
            # Actualizar venta
            cursor.execute("""
                UPDATE ventas 
                SET total = %s, metodo_pago = %s, fecha = CURRENT_TIMESTAMP
                WHERE idVenta = %s
            """, [nuevo_total, metodo_pago, venta_id])
            
            # Insertar nuevos detalles
            for detalle in nuevos_detalles:
                cursor.execute("""
                    INSERT INTO detalle_venta (venta_id, producto_id, cantidad, subtotal)
                    VALUES (%s, %s, %s, %s)
                """, [venta_id, detalle['producto_id'], detalle['cantidad'], detalle['cantidad'] * detalle['precio_unitario']])
                
                # Actualizar stock con los nuevos valores
                cursor.execute("""
                    UPDATE productos 
                    SET stock = stock - %s 
                    WHERE idProducto = %s
                """, [detalle['cantidad'], detalle['producto_id']])
        
        return JsonResponse({
            'mensaje': 'Venta actualizada exitosamente',
            'venta_id': venta_id,
            'total': float(nuevo_total)
        })
        
    except Exception as e:
        print(f"Error editando venta: {e}")
        return JsonResponse({'error': 'Error del servidor'}, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
def eliminar_venta(request, venta_id):
    """Elimina una venta"""
    try:
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({'error': 'No autorizado'}, status=401)
        
        with connection.cursor() as cursor:
            # Verificar que la venta existe y pertenece al usuario
            cursor.execute("""
                SELECT idVenta FROM ventas 
                WHERE idVenta = %s AND usuario_id = %s
            """, [venta_id, user.idUsuario])
            
            if not cursor.fetchone():
                return JsonResponse({'error': 'Venta no encontrada'}, status=404)
            
            # Obtener detalles para restaurar stock
            cursor.execute("""
                SELECT producto_id, cantidad 
                FROM detalle_venta 
                WHERE venta_id = %s
            """, [venta_id])
            
            detalles = cursor.fetchall()
            
            # Restaurar stock
            for producto_id, cantidad in detalles:
                cursor.execute("""
                    UPDATE productos 
                    SET stock = stock + %s 
                    WHERE idProducto = %s
                """, [cantidad, producto_id])
            
            # Eliminar detalles
            cursor.execute("DELETE FROM detalle_venta WHERE venta_id = %s", [venta_id])
            
            # Eliminar venta
            cursor.execute("DELETE FROM ventas WHERE idVenta = %s", [venta_id])
        
        return JsonResponse({'mensaje': 'Venta eliminada exitosamente'})
        
    except Exception as e:
        print(f"Error eliminando venta: {e}")
        return JsonResponse({'error': 'Error del servidor'}, status=500)