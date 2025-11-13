from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from api.models import Usuario
import jwt
from django.conf import settings
import traceback

def obtener_usuario_desde_token(request):
    """Función auxiliar para obtener usuario desde token"""
    try:
        auth_header = request.headers.get('Authorization', '')
        print(f"🔑 Authorization header: {auth_header}")
        
        if not auth_header.startswith('Bearer '):
            print("❌ Formato de token inválido")
            return None
        
        token = auth_header.split('Bearer ')[1]
        print(f"🔑 Token recibido: {token[:50]}...")
        
        # Decodificar el token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        usuario_id = payload.get('user_id')
        
        print(f"🔑 Payload decodificado - user_id: {usuario_id}")
        
        if not usuario_id:
            print("❌ No user_id en el token")
            return None
            
        usuario = Usuario.objects.get(idUsuario=usuario_id)
        print(f"✅ Usuario encontrado: {usuario.nombre}")
        return usuario
        
    except jwt.ExpiredSignatureError:
        print("❌ Token expirado")
        return None
    except jwt.InvalidTokenError as e:
        print(f"❌ Token inválido: {e}")
        return None
    except Usuario.DoesNotExist:
        print(f"❌ Usuario no encontrado con id: {usuario_id}")
        return None
    except Exception as e:
        print(f"❌ Error obteniendo usuario desde token: {e}")
        return None

@csrf_exempt
@require_http_methods(["GET"])
def obtener_perfil(request):
    try:
        print("=== OBTENIENDO PERFIL ===")
        
        usuario = obtener_usuario_desde_token(request)
        if not usuario:
            return JsonResponse({'error': 'Token inválido o expirado'}, status=401)
        
        # Construir respuesta del perfil
        perfil_data = {
            'id': usuario.idUsuario,
            'nombre': usuario.nombre,
            'apellido': usuario.apellido or '',
            'correo': usuario.correo,
            'telefono': usuario.telefono or '',
            'rol': usuario.rol,
            'fecha_registro': usuario.fecha_registro.strftime('%Y-%m-%d %H:%M:%S') if usuario.fecha_registro else ''
        }
        
        print(f"✅ Perfil enviado: {usuario.nombre}")
        return JsonResponse(perfil_data)
        
    except Exception as e:
        print(f"❌ Error en obtener_perfil: {e}")
        print(traceback.format_exc())
        return JsonResponse({'error': f'Error del servidor: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["PUT"])
def actualizar_perfil(request):
    try:
        print("=== ACTUALIZANDO PERFIL ===")
        
        usuario = obtener_usuario_desde_token(request)
        if not usuario:
            return JsonResponse({'error': 'Token inválido o expirado'}, status=401)
            
        data = json.loads(request.body)
        print(f"📝 Datos recibidos: {data}")
        
        # Actualizar campos permitidos
        campos_actualizados = []
        if 'nombre' in data:
            usuario.nombre = data['nombre']
            campos_actualizados.append('nombre')
        if 'apellido' in data:
            usuario.apellido = data['apellido']
            campos_actualizados.append('apellido')
        if 'telefono' in data:
            usuario.telefono = data['telefono']
            campos_actualizados.append('telefono')
        if 'correo' in data:
            # Verificar que el correo no esté en uso por otro usuario
            if Usuario.objects.filter(correo=data['correo']).exclude(idUsuario=usuario.idUsuario).exists():
                return JsonResponse({'error': 'El correo ya está en uso'}, status=400)
            usuario.correo = data['correo']
            campos_actualizados.append('correo')
        
        if campos_actualizados:
            usuario.save()
            print(f"✅ Campos actualizados: {campos_actualizados}")
        
        perfil_actualizado = {
            'id': usuario.idUsuario,
            'nombre': usuario.nombre,
            'apellido': usuario.apellido or '',
            'correo': usuario.correo,
            'telefono': usuario.telefono or '',
            'rol': usuario.rol,
            'fecha_registro': usuario.fecha_registro.strftime('%Y-%m-%d %H:%M:%S') if usuario.fecha_registro else '',
            'mensaje': 'Perfil actualizado correctamente'
        }
        
        return JsonResponse(perfil_actualizado)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        print(f"❌ Error en actualizar_perfil: {e}")
        print(traceback.format_exc())
        return JsonResponse({'error': f'Error del servidor: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def cambiar_password(request):
    try:
        print("=== CAMBIANDO PASSWORD ===")
        
        usuario = obtener_usuario_desde_token(request)
        if not usuario:
            return JsonResponse({'error': 'Token inválido o expirado'}, status=401)
            
        data = json.loads(request.body)
        password_actual = data.get('password_actual')
        nuevo_password = data.get('nuevo_password')
        
        print(f"🔑 Cambiando password para: {usuario.nombre}")
        
        if not password_actual or not nuevo_password:
            return JsonResponse({'error': 'Todos los campos son requeridos'}, status=400)
        
        # Verificar contraseña actual
        if not usuario.check_password(password_actual):
            return JsonResponse({'error': 'Contraseña actual incorrecta'}, status=400)
        
        # Cambiar contraseña
        usuario.set_password(nuevo_password)
        usuario.save()
        
        print("✅ Password cambiado correctamente")
        return JsonResponse({'mensaje': 'Contraseña cambiada correctamente'})
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        print(f"❌ Error en cambiar_password: {e}")
        print(traceback.format_exc())
        return JsonResponse({'error': f'Error del servidor: {str(e)}'}, status=500)