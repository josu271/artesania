from django.db import models
import bcrypt
import jwt
from datetime import datetime, timedelta
from django.conf import settings

class UsuarioManager(models.Manager):
    def create_user(self, correo, password=None, **extra_fields):
        if not correo:
            raise ValueError('El correo es obligatorio')
        user = self.model(correo=correo, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

class Usuario(models.Model):
    idUsuario = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100, blank=True, null=True)
    correo = models.CharField(max_length=150, unique=True)
    contrasena = models.CharField(max_length=255)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    rol = models.CharField(
        max_length=20, 
        choices=[
            ('administrador', 'Administrador'),
            ('gestor', 'Gestor'),
            ('artesano', 'Artesano')
        ],
        default='artesano'
    )
    
    objects = UsuarioManager()
    
    class Meta:
        db_table = 'usuarios'
    
    def __str__(self):
        return f"{self.nombre} {self.apellido or ''} - {self.correo}"
    
    def set_password(self, raw_password):
        # Hashear la contraseña con bcrypt
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(raw_password.encode('utf-8'), salt)
        self.contrasena = hashed.decode('utf-8')
    
    def check_password(self, raw_password):
        # Verificar contraseña con bcrypt
        try:
            if not self.contrasena:
                return False
                
            stored_password = self.contrasena.encode('utf-8') if isinstance(self.contrasena, str) else self.contrasena
            return bcrypt.checkpw(raw_password.encode('utf-8'), stored_password)
        except Exception as e:
            print(f"Error verificando contraseña: {e}")
            return False
    
    def generate_jwt_token(self):
        """Generar token JWT para el usuario"""
        payload = {
            'user_id': self.idUsuario,
            'correo': self.correo,
            'rol': self.rol,
            'exp': datetime.utcnow() + timedelta(days=7),
            'iat': datetime.utcnow()
        }
        
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        if isinstance(token, bytes):
            token = token.decode('utf-8')
        return token