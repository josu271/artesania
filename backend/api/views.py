from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .models import Usuario
import traceback

@csrf_exempt
@require_http_methods(["POST"])
def login(request):
    try:
        print("=== INICIANDO LOGIN ===")
        
        data = json.loads(request.body)
        correo = data.get('email')
        password = data.get('password')
        
        print(f"Correo recibido: {correo}")
        
        if not correo or not password:
            return JsonResponse({'error': 'Correo y contraseña son requeridos'}, status=400)
        
        try:
            # Buscar usuario por correo
            usuario = Usuario.objects.get(correo=correo)
            print(f"Usuario encontrado: {usuario.nombre}")
        except Usuario.DoesNotExist:
            print("Usuario no encontrado")
            return JsonResponse({'error': 'Credenciales inválidas'}, status=401)
        
        # Verificar contraseña
        print("Verificando contraseña...")
        password_valido = usuario.check_password(password)
        print(f"Contraseña válida: {password_valido}")
        
        if not password_valido:
            return JsonResponse({'error': 'Credenciales inválidas'}, status=401)
        
        # Generar token JWT usando el método del modelo
        token = usuario.generate_jwt_token()
        
        print("Login exitoso, generando respuesta...")
        
        response_data = {
            'token': token,
            'usuario': {
                'id': usuario.idUsuario,
                'nombre': usuario.nombre,
                'apellido': usuario.apellido or '',
                'correo': usuario.correo,
                'rol': usuario.rol,
                'telefono': usuario.telefono or ''
            }
        }
        
        return JsonResponse(response_data)
        
    except json.JSONDecodeError as e:
        print(f"Error JSON: {e}")
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        print(f"Error general en login: {e}")
        print(traceback.format_exc())
        return JsonResponse({'error': f'Error del servidor: {str(e)}'}, status=500)