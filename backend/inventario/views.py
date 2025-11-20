from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db import connection
import json
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
        return payload
    except Exception as e:
        print(f"Error decoding token: {e}")
        return None

@csrf_exempt
@require_http_methods(["GET"])
def listar_productos(request):
    try:
        user_data = get_user_from_token(request)
        if not user_data:
            return JsonResponse({'error': 'Token inválido o expirado'}, status=401)
        
        user_id = user_data.get('user_id')
        
        # Consulta SQL directa usando la tabla productos
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT p.idProducto, p.nombre, p.descripcion, p.precio, p.stock, 
                       p.fecha_creacion, p.imagen_url,
                       c.idCategoria, c.nombre as categoria_nombre
                FROM productos p 
                LEFT JOIN categorias c ON p.categoria_id = c.idCategoria 
                WHERE p.usuario_id = %s
                ORDER BY p.fecha_creacion DESC
            """, [user_id])
            
            columns = [col[0] for col in cursor.description]
            productos = []
            
            for row in cursor.fetchall():
                producto_dict = dict(zip(columns, row))
                # Convertir decimal a float para JSON
                if producto_dict['precio']:
                    producto_dict['precio'] = float(producto_dict['precio'])
                productos.append(producto_dict)
        
        return JsonResponse({'productos': productos})
        
    except Exception as e:
        print(f"Error listando productos: {e}")
        return JsonResponse({'error': 'Error del servidor'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def crear_producto(request):
    try:
        user_data = get_user_from_token(request)
        if not user_data:
            return JsonResponse({'error': 'Token inválido o expirado'}, status=401)
        
        data = json.loads(request.body)
        user_id = user_data.get('user_id')
        
        nombre = data.get('nombre')
        descripcion = data.get('descripcion', '')
        precio = data.get('precio')
        stock = data.get('stock', 0)
        categoria_id = data.get('categoria_id')
        imagen_url = data.get('imagen_url', '')
        
        if not nombre or not precio:
            return JsonResponse({'error': 'Nombre y precio son requeridos'}, status=400)
        
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id, usuario_id, imagen_url)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, [nombre, descripcion, precio, stock, categoria_id, user_id, imagen_url])
            
            producto_id = cursor.lastrowid
            
            # Obtener el producto creado
            cursor.execute("""
                SELECT p.idProducto, p.nombre, p.descripcion, p.precio, p.stock, 
                       p.fecha_creacion, p.imagen_url,
                       c.idCategoria, c.nombre as categoria_nombre
                FROM productos p 
                LEFT JOIN categorias c ON p.categoria_id = c.idCategoria 
                WHERE p.idProducto = %s
            """, [producto_id])
            
            columns = [col[0] for col in cursor.description]
            row = cursor.fetchone()
            producto = dict(zip(columns, row))
            if producto['precio']:
                producto['precio'] = float(producto['precio'])
        
        return JsonResponse({'message': 'Producto creado exitosamente', 'producto': producto})
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        print(f"Error creando producto: {e}")
        return JsonResponse({'error': 'Error del servidor'}, status=500)

@csrf_exempt
@require_http_methods(["PUT"])
def editar_producto(request, producto_id):
    try:
        user_data = get_user_from_token(request)
        if not user_data:
            return JsonResponse({'error': 'Token inválido o expirado'}, status=401)
        
        data = json.loads(request.body)
        user_id = user_data.get('user_id')
        
        # Verificar que el producto pertenece al usuario
        with connection.cursor() as cursor:
            cursor.execute("SELECT usuario_id FROM productos WHERE idProducto = %s", [producto_id])
            result = cursor.fetchone()
            
            if not result or result[0] != user_id:
                return JsonResponse({'error': 'Producto no encontrado o no autorizado'}, status=404)
            
            # Actualizar producto
            cursor.execute("""
                UPDATE productos 
                SET nombre = %s, descripcion = %s, precio = %s, stock = %s, 
                    categoria_id = %s, imagen_url = %s
                WHERE idProducto = %s
            """, [
                data.get('nombre'),
                data.get('descripcion', ''),
                data.get('precio'),
                data.get('stock', 0),
                data.get('categoria_id'),
                data.get('imagen_url', ''),
                producto_id
            ])
            
            # Obtener producto actualizado
            cursor.execute("""
                SELECT p.idProducto, p.nombre, p.descripcion, p.precio, p.stock, 
                       p.fecha_creacion, p.imagen_url,
                       c.idCategoria, c.nombre as categoria_nombre
                FROM productos p 
                LEFT JOIN categorias c ON p.categoria_id = c.idCategoria 
                WHERE p.idProducto = %s
            """, [producto_id])
            
            columns = [col[0] for col in cursor.description]
            row = cursor.fetchone()
            producto = dict(zip(columns, row))
            if producto['precio']:
                producto['precio'] = float(producto['precio'])
        
        return JsonResponse({'message': 'Producto actualizado exitosamente', 'producto': producto})
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        print(f"Error editando producto: {e}")
        return JsonResponse({'error': 'Error del servidor'}, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
def eliminar_producto(request, producto_id):
    try:
        user_data = get_user_from_token(request)
        if not user_data:
            return JsonResponse({'error': 'Token inválido o expirado'}, status=401)
        
        user_id = user_data.get('user_id')
        
        with connection.cursor() as cursor:
            # Verificar que el producto pertenece al usuario
            cursor.execute("SELECT usuario_id FROM productos WHERE idProducto = %s", [producto_id])
            result = cursor.fetchone()
            
            if not result or result[0] != user_id:
                return JsonResponse({'error': 'Producto no encontrado o no autorizado'}, status=404)
            
            # Eliminar producto
            cursor.execute("DELETE FROM productos WHERE idProducto = %s", [producto_id])
        
        return JsonResponse({'message': 'Producto eliminado exitosamente'})
        
    except Exception as e:
        print(f"Error eliminando producto: {e}")
        return JsonResponse({'error': 'Error del servidor'}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def listar_categorias(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT idCategoria, nombre, descripcion FROM categorias ORDER BY nombre")
            
            columns = [col[0] for col in cursor.description]
            categorias = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        return JsonResponse({'categorias': categorias})
        
    except Exception as e:
        print(f"Error listando categorias: {e}")
        return JsonResponse({'error': 'Error del servidor'}, status=500)