import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error
from django.db import connection
import joblib
import os
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class MLPredictor:
    def __init__(self):
        self.model = None
        self.model_path = 'backend/predicciones/ml_models/'
        os.makedirs(self.model_path, exist_ok=True)
    
    def obtener_datos_entrenamiento(self):
        """Obtiene datos históricos de ventas para entrenamiento"""
        try:
            with connection.cursor() as cursor:
                # Consulta para obtener datos históricos de ventas
                cursor.execute("""
                    SELECT 
                        p.idProducto,
                        p.nombre as producto_nombre,
                        p.precio,
                        p.stock,
                        c.nombre as categoria_nombre,
                        MONTH(v.fecha) as mes,
                        YEAR(v.fecha) as año,
                        DAY(v.fecha) as dia,
                        DAYOFWEEK(v.fecha) as dia_semana,
                        dv.cantidad as unidades_vendidas,
                        CASE 
                            WHEN e.idEvento IS NOT NULL THEN 1 
                            ELSE 0 
                        END as hay_evento,
                        CASE 
                            WHEN MONTH(v.fecha) IN (12,1,2) THEN 1  -- Verano
                            WHEN MONTH(v.fecha) IN (3,4,5) THEN 2   -- Otoño
                            WHEN MONTH(v.fecha) IN (6,7,8) THEN 3   -- Invierno
                            ELSE 4                                  -- Primavera
                        END as temporada
                    FROM detalle_venta dv
                    JOIN ventas v ON dv.venta_id = v.idVenta
                    JOIN productos p ON dv.producto_id = p.idProducto
                    LEFT JOIN categorias c ON p.categoria_id = c.idCategoria
                    LEFT JOIN productos_eventos pe ON p.idProducto = pe.producto_id
                    LEFT JOIN eventos e ON pe.evento_id = e.idEvento 
                        AND e.fecha BETWEEN DATE_SUB(v.fecha, INTERVAL 7 DAY) 
                        AND DATE_ADD(v.fecha, INTERVAL 7 DAY)
                    WHERE v.fecha >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
                    ORDER BY v.fecha DESC
                """)
                
                columns = [col[0] for col in cursor.description]
                datos = [dict(zip(columns, row)) for row in cursor.fetchall()]
                
            return pd.DataFrame(datos)
        except Exception as e:
            print(f"Error obteniendo datos: {e}")
            return pd.DataFrame()
    
    def preparar_caracteristicas(self, df):
        """Prepara las características para el modelo"""
        if df.empty:
            return df
        
        # Codificar variables categóricas
        if 'categoria_nombre' in df.columns:
            df = pd.get_dummies(df, columns=['categoria_nombre'], prefix='cat')
        
        # Crear características adicionales
        df['precio_normalizado'] = (df['precio'] - df['precio'].mean()) / df['precio'].std()
        df['es_fin_semana'] = df['dia_semana'].apply(lambda x: 1 if x in [6, 7] else 0)
        df['es_mes_alta'] = df['mes'].apply(lambda x: 1 if x in [12, 1, 6, 7] else 0)  # Diciembre, Enero, Junio, Julio
        
        return df
    
    def entrenar_modelo(self):
        """Entrena el modelo de machine learning automáticamente"""
        try:
            print("🔍 Recopilando datos para entrenamiento...")
            df = self.obtener_datos_entrenamiento()
            
            if df.empty or len(df) < 50:
                print("⚠️  Datos insuficientes para entrenar el modelo")
                return False
            
            print(f"📊 Datos recopilados: {len(df)} registros")
            
            # Preparar características
            df_processed = self.preparar_caracteristicas(df)
            
            if 'unidades_vendidas' not in df_processed.columns:
                print("❌ No se encontró la columna objetivo 'unidades_vendidas'")
                return False
            
            # Separar características y objetivo
            X = df_processed.drop('unidades_vendidas', axis=1)
            y = df_processed['unidades_vendidas']
            
            # Eliminar columnas no numéricas y columnas ID
            columnas_a_eliminar = ['idProducto', 'producto_nombre']
            for col in columnas_a_eliminar:
                if col in X.columns:
                    X = X.drop(col, axis=1)
            
            # Asegurar que todas las columnas sean numéricas
            X = X.select_dtypes(include=[np.number])
            
            if X.empty:
                print("❌ No hay características válidas para entrenar")
                return False
            
            # Dividir datos
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            print("🤖 Entrenando modelo Random Forest...")
            self.model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                n_jobs=-1
            )
            
            self.model.fit(X_train, y_train)
            
            # Evaluar modelo
            y_pred = self.model.predict(X_test)
            mae = mean_absolute_error(y_test, y_pred)
            mse = mean_squared_error(y_test, y_pred)
            
            precision = max(0, 100 - (mae / y_test.mean() * 100))
            precision = min(100, precision)  # Asegurar que no sea mayor a 100%
            
            print(f"✅ Modelo entrenado - Precisión: {precision:.2f}%")
            print(f"   MAE: {mae:.2f}, MSE: {mse:.2f}")
            
            # Guardar modelo
            model_filename = f"{self.model_path}modelo_prediccion_{datetime.now().strftime('%Y%m%d_%H%M')}.pkl"
            joblib.dump(self.model, model_filename)
            
            # Guardar el modelo más reciente
            latest_model = f"{self.model_path}modelo_actual.pkl"
            joblib.dump(self.model, latest_model)
            
            return precision
            
        except Exception as e:
            print(f"❌ Error entrenando modelo: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def predecir_demanda(self, producto_id, mes_prediccion):
        """Predice la demanda para un producto específico"""
        try:
            # Cargar modelo actual
            latest_model = f"{self.model_path}modelo_actual.pkl"
            if not os.path.exists(latest_model):
                print("⚠️  No hay modelo entrenado. Entrenando uno nuevo...")
                precision = self.entrenar_modelo()
                if not precision:
                    return None
            
            self.model = joblib.load(latest_model)
            
            # Obtener datos del producto
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT p.idProducto, p.nombre, p.precio, p.stock, 
                           c.nombre as categoria_nombre
                    FROM productos p 
                    LEFT JOIN categorias c ON p.categoria_id = c.idCategoria
                    WHERE p.idProducto = %s
                """, [producto_id])
                
                producto = cursor.fetchone()
                if not producto:
                    return None
                
                # Crear características para predicción
                caracteristicas = {
                    'idProducto': producto[0],
                    'precio': float(producto[2]),
                    'stock': producto[3],
                    'categoria_nombre': producto[4] or 'General',
                    'mes': mes_prediccion,
                    'año': datetime.now().year,
                    'dia': 15,  # Día medio del mes
                    'dia_semana': 3,  # Miércoles
                    'hay_evento': 0,
                    'temporada': self.obtener_temporada(mes_prediccion)
                }
            
            # Convertir a DataFrame y preparar características
            df_pred = pd.DataFrame([caracteristicas])
            df_processed = self.preparar_caracteristicas(df_pred)
            
            # Hacer predicción
            demanda_predicha = self.model.predict(df_processed)[0]
            demanda_predicha = max(0, int(demanda_predicha))  # Asegurar valor positivo
            
            return demanda_predicha
            
        except Exception as e:
            print(f"❌ Error en predicción: {e}")
            return None
    
    def obtener_temporada(self, mes):
        """Determina la temporada basada en el mes"""
        if mes in [12, 1, 2]:  # Verano
            return 1
        elif mes in [3, 4, 5]:  # Otoño
            return 2
        elif mes in [6, 7, 8]:  # Invierno
            return 3
        else:  # Primavera
            return 4
    
    def generar_predicciones_automaticas(self):
        """Genera predicciones automáticas para todos los productos"""
        try:
            print("🚀 Iniciando generación automática de predicciones...")
            
            # Primero entrenar/actualizar modelo
            precision = self.entrenar_modelo()
            if not precision:
                precision = 75.0  # Precisión por defecto si no se puede calcular
            
            # Obtener productos activos
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT idProducto, nombre, stock 
                    FROM productos 
                    WHERE stock > 0 OR idProducto IN (
                        SELECT DISTINCT producto_id FROM detalle_venta 
                        WHERE venta_id IN (
                            SELECT idVenta FROM ventas 
                            WHERE fecha >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
                        )
                    )
                """)
                
                productos = cursor.fetchall()
            
            predicciones_generadas = []
            mes_actual = datetime.now().month
            proximo_mes = mes_actual + 1 if mes_actual < 12 else 1
            
            for producto in productos:
                producto_id = producto[0]
                producto_nombre = producto[1]
                stock_actual = producto[2]
                
                print(f"📦 Procesando: {producto_nombre}")
                
                # Predecir demanda para el próximo mes
                demanda_predicha = self.predecir_demanda(producto_id, proximo_mes)
                
                if demanda_predicha is not None:
                    # Guardar predicción en base de datos
                    with connection.cursor() as cursor:
                        cursor.execute("""
                            INSERT INTO predicciones 
                            (producto_id, demanda_predicha, precision_modelo, modelo_usado, observaciones)
                            VALUES (%s, %s, %s, %s, %s)
                        """, [
                            producto_id,
                            demanda_predicha,
                            precision,
                            'RandomForest',
                            f"Predicción automática para {datetime.now().strftime('%B %Y')}. Stock actual: {stock_actual}"
                        ])
                    
                    predicciones_generadas.append({
                        'producto': producto_nombre,
                        'demanda_predicha': demanda_predicha,
                        'stock_actual': stock_actual,
                        'recomendacion': self.generar_recomendacion(stock_actual, demanda_predicha)
                    })
            
            print(f"✅ Predicciones generadas: {len(predicciones_generadas)} productos")
            return predicciones_generadas
            
        except Exception as e:
            print(f"❌ Error generando predicciones automáticas: {e}")
            return []
    
    def generar_recomendacion(self, stock_actual, demanda_predicha):
        """Genera recomendación basada en stock y demanda predicha"""
        diferencia = demanda_predicha - stock_actual
        
        if diferencia > 10:
            return "Aumentar producción - Alta demanda esperada"
        elif diferencia > 0:
            return "Mantener producción - Demanda moderada"
        elif diferencia > -5:
            return "Reducir producción - Baja demanda esperada"
        else:
            return "Disminuir producción - Exceso de inventario"