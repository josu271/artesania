from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db import connection

@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    # ⚠️ Sin hash (solo para pruebas locales)
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT idUsuario, nombre, rol FROM usuarios WHERE correo=%s AND contrasena=%s",
            [email, password]
        )
        user = cursor.fetchone()

    if user:
        data = {
            "idUsuario": user[0],
            "nombre": user[1],
            "rol": user[2],
            "token": "fakeToken123"
        }
        return Response(data, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)
