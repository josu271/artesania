from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db import connection
import json

@api_view(['GET', 'POST'])
def eventos_list(request):
    if request.method == 'GET':
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT idEvento, nombre, fecha, ubicacion, descripcion FROM eventos ORDER BY fecha DESC"
                )
                eventos = cursor.fetchall()
            
            eventos_list = []
            for evento in eventos:
                eventos_list.append({
                    'id': evento[0],
                    'nombre': evento[1],
                    'fecha': evento[2],
                    'ubicacion': evento[3],
                    'descripcion': evento[4] or ''
                })
            
            return Response(eventos_list, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    elif request.method == 'POST':
        try:
            nombre = request.data.get('nombre')
            fecha = request.data.get('fecha')
            ubicacion = request.data.get('ubicacion')
            descripcion = request.data.get('descripcion', '')

            if not all([nombre, fecha, ubicacion]):
                return Response({'error': 'Nombre, fecha y ubicación son campos requeridos'}, 
                              status=status.HTTP_400_BAD_REQUEST)

            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO eventos (nombre, fecha, ubicacion, descripcion) VALUES (%s, %s, %s, %s)",
                    [nombre, fecha, ubicacion, descripcion]
                )
                cursor.execute("SELECT LAST_INSERT_ID()")
                evento_id = cursor.fetchone()[0]

            # Recuperar el evento creado
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT idEvento, nombre, fecha, ubicacion, descripcion FROM eventos WHERE idEvento = %s",
                    [evento_id]
                )
                evento = cursor.fetchone()

            evento_data = {
                'id': evento[0],
                'nombre': evento[1],
                'fecha': evento[2],
                'ubicacion': evento[3],
                'descripcion': evento[4] or ''
            }

            return Response(evento_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'PUT', 'DELETE'])
def evento_detail(request, pk):
    try:
        # Verificar si el evento existe
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT idEvento FROM eventos WHERE idEvento = %s",
                [pk]
            )
            if not cursor.fetchone():
                return Response({'error': 'Evento no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'GET':
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT idEvento, nombre, fecha, ubicacion, descripcion FROM eventos WHERE idEvento = %s",
                    [pk]
                )
                evento = cursor.fetchone()

            evento_data = {
                'id': evento[0],
                'nombre': evento[1],
                'fecha': evento[2],
                'ubicacion': evento[3],
                'descripcion': evento[4] or ''
            }
            return Response(evento_data, status=status.HTTP_200_OK)

        elif request.method == 'PUT':
            nombre = request.data.get('nombre')
            fecha = request.data.get('fecha')
            ubicacion = request.data.get('ubicacion')
            descripcion = request.data.get('descripcion', '')

            if not all([nombre, fecha, ubicacion]):
                return Response({'error': 'Nombre, fecha y ubicación son campos requeridos'}, 
                              status=status.HTTP_400_BAD_REQUEST)

            with connection.cursor() as cursor:
                cursor.execute(
                    "UPDATE eventos SET nombre = %s, fecha = %s, ubicacion = %s, descripcion = %s WHERE idEvento = %s",
                    [nombre, fecha, ubicacion, descripcion, pk]
                )

            # Recuperar el evento actualizado
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT idEvento, nombre, fecha, ubicacion, descripcion FROM eventos WHERE idEvento = %s",
                    [pk]
                )
                evento = cursor.fetchone()

            evento_data = {
                'id': evento[0],
                'nombre': evento[1],
                'fecha': evento[2],
                'ubicacion': evento[3],
                'descripcion': evento[4] or ''
            }

            return Response(evento_data, status=status.HTTP_200_OK)

        elif request.method == 'DELETE':
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM eventos WHERE idEvento = %s", [pk])
            
            return Response({'message': 'Evento eliminado correctamente'}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)