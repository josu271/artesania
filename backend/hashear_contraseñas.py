import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Usuario
import hashlib
import secrets

def hashear_contraseñas_existentes():
    try:
        # Obtener todos los usuarios
        usuarios = Usuario.objects.all()
        
        print(f"🔍 Encontrados {usuarios.count()} usuarios")
        
        for usuario in usuarios:
            print(f"\n--- Procesando: {usuario.nombre} ({usuario.correo}) ---")
            print(f"Contraseña actual: {usuario.contrasena}")
            
            # Si la contraseña está en texto plano
            if usuario.contrasena and len(usuario.contrasena) < 60:  # bcrypt hashes son más largos
                print("🔐 Contraseña en texto plano, hasheando...")
                
                # Guardar la contraseña original para referencia
                password_original = usuario.contrasena
                
                # Hashear con bcrypt
                import bcrypt
                salt = bcrypt.gensalt()
                hashed = bcrypt.hashpw(password_original.encode('utf-8'), salt)
                usuario.contrasena = hashed.decode('utf-8')
                usuario.save()
                
                print(f"✅ Nueva contraseña hasheada: {usuario.contrasena[:30]}...")
                print(f"📏 Longitud: {len(usuario.contrasena)}")
                
                # Verificar que funciona
                check = usuario.check_password(password_original)
                print(f"🔍 Verificación con bcrypt: {check}")
                
            else:
                print("✅ Contraseña ya parece estar hasheada")
                
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    hashear_contraseñas_existentes()