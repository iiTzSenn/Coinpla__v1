"""
Script para añadir las columnas y tablas necesarias para el sistema de presupuestos.
"""
import os
import sys
from pathlib import Path
from sqlalchemy import text

# Agregar el directorio raíz del proyecto al sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app import create_app, db

def add_missing_columns():
    """
    Añade las columnas y tablas necesarias para el sistema de presupuestos
    """
    app = create_app()
    
    with app.app_context():
        print("Conectando a la base de datos...")
        # Leer el archivo SQL
        with open('add_missing_columns.sql', 'r') as f:
            sql = f.read()
        
        # Ejecutar las sentencias SQL
        conn = db.engine.connect()
        try:
            # Dividir el script SQL por ';' para ejecutar cada sentencia por separado
            statements = sql.split(';')
            for statement in statements:
                statement = statement.strip()
                if statement:
                    print(f"Ejecutando: {statement[:50]}...")
                    conn.execute(text(statement))
            
            conn.commit()
            print("Columnas y tablas añadidas correctamente.")
        except Exception as e:
            print(f"Error al ejecutar el script SQL: {str(e)}")
            conn.rollback()
        finally:
            conn.close()
            
        # Verificar que las tablas existen
        try:
            print("Verificando tablas creadas:")
            tables = ["service_types", "service_subcategories", "maintenance_plans"]
            for table in tables:
                result = db.session.execute(text(f"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '{table}')")).scalar()
                print(f"- Tabla {table}: {'EXISTE' if result else 'NO EXISTE'}")
                
            # Verificar columnas en jobs
            cols = ["service_type_id", "service_subcategories", "has_maintenance"]
            print("Verificando columnas añadidas a la tabla jobs:")
            for col in cols:
                result = db.session.execute(text(f"SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = '{col}')")).scalar()
                print(f"- Columna {col}: {'EXISTE' if result else 'NO EXISTE'}")
        except Exception as e:
            print(f"Error al verificar tablas: {str(e)}")

if __name__ == "__main__":
    add_missing_columns()
