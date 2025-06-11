"""
Script para crear las tablas de servicios manualmente y poblarlas con datos.
Este script es una solución temporal mientras se corrigen los problemas de migración.
"""

import os
import sys
from pathlib import Path

# Agregar el directorio raíz del proyecto al sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app import create_app, db
from sqlalchemy import text

def create_service_tables():
    """
    Crea las tablas de servicios manualmente usando SQL
    """
    app = create_app()
    
    with app.app_context():
        # Crear la tabla service_types
        db.session.execute(text("""
        CREATE TABLE IF NOT EXISTS service_types (
            id INTEGER NOT NULL, 
            name VARCHAR(100) NOT NULL, 
            description TEXT, 
            created_at TIMESTAMP WITHOUT TIME ZONE, 
            updated_at TIMESTAMP WITHOUT TIME ZONE, 
            PRIMARY KEY (id)
        )
        """))
        
        # Crear la tabla service_subcategories
        db.session.execute(text("""
        CREATE TABLE IF NOT EXISTS service_subcategories (
            id SERIAL NOT NULL, 
            service_type_id INTEGER NOT NULL, 
            name VARCHAR(100) NOT NULL, 
            description TEXT, 
            created_at TIMESTAMP WITHOUT TIME ZONE, 
            updated_at TIMESTAMP WITHOUT TIME ZONE, 
            PRIMARY KEY (id), 
            FOREIGN KEY(service_type_id) REFERENCES service_types (id)
        )
        """))
        
        # Crear la tabla maintenance_plans
        db.session.execute(text("""
        CREATE TABLE IF NOT EXISTS maintenance_plans (
            id SERIAL NOT NULL, 
            job_id INTEGER NOT NULL, 
            frequency VARCHAR(50) NOT NULL, 
            duration INTEGER, 
            start_date TIMESTAMP WITHOUT TIME ZONE, 
            created_at TIMESTAMP WITHOUT TIME ZONE, 
            updated_at TIMESTAMP WITHOUT TIME ZONE, 
            PRIMARY KEY (id), 
            FOREIGN KEY(job_id) REFERENCES jobs (id)
        )
        """))
        
        # Añadir columnas a la tabla jobs
        try:
            db.session.execute(text("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS service_type_id INTEGER"))
            db.session.execute(text("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS service_subcategories VARCHAR(500)"))
            db.session.execute(text("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS has_maintenance BOOLEAN DEFAULT FALSE"))
            
            # Agregar la clave foránea
            db.session.execute(text("""
            ALTER TABLE jobs 
            ADD CONSTRAINT jobs_service_type_id_fkey 
            FOREIGN KEY (service_type_id) REFERENCES service_types (id)
            """))
        except Exception as e:
            print(f"Advertencia al añadir columnas o constraints: {str(e)}")
        
        db.session.commit()
        print("Tablas de servicios creadas correctamente.")

def populate_service_data():
    """
    Poblar las tablas con datos iniciales
    """
    from app.models import ServiceType, ServiceSubcategory
    
    app = create_app()
    
    with app.app_context():
        # Verificar si ya existen datos en la tabla de service_types
        existing_services = ServiceType.query.count()
        if existing_services > 0:
            print("Ya existen datos en la tabla de tipos de servicios. No se realizará la carga.")
            return
        
        # Tipos de servicios
        services = [
            {"id": 1, "name": "DDD (Desinsectación, Desinfección, Desratización)", "description": "Servicios de control de plagas y desinfección"},
            {"id": 2, "name": "Legionela", "description": "Tratamientos contra la legionela"},
            {"id": 3, "name": "Desatascos", "description": "Servicios de desatascos y limpieza"},
            {"id": 4, "name": "Servicio de cubas", "description": "Servicios de contenedores y cubas"},
            {"id": 5, "name": "Poda de Palmeras", "description": "Servicios de poda y mantenimiento de palmeras"},
            {"id": 6, "name": "Tratamientos fitosanitarios", "description": "Tratamientos para plantas y árboles"},
            {"id": 7, "name": "Servicio de maquinaria", "description": "Alquiler y servicio de maquinaria"},
            {"id": 8, "name": "Tratamiento de choque", "description": "Tratamientos intensivos para problemas graves"}
        ]
        
        # Subcategorías para diferentes servicios
        subcategories = {
            1: [  # DDD
                {"name": "Cucaracha Americana (Periplaneta Americana)", "description": "Control de cucaracha americana"},
                {"name": "Cucaracha Alemana (Blatella Germanica)", "description": "Control de cucaracha alemana"},
                {"name": "Rata Campo (Rattus Rattus)", "description": "Control de ratas de campo"},
                {"name": "Rata Alcantarilla (Rattus Norvegicus)", "description": "Control de ratas de alcantarilla"},
                {"name": "Ratón Común (Mus Musculus)", "description": "Control de ratones"},
                {"name": "Hormiga Común (Lasius Niger)", "description": "Control de hormigas"},
                {"name": "Chinche Cama (Cimex Lectularius)", "description": "Control de chinches de cama"},
                {"name": "Moscas, Mosquitos (Dípteros)", "description": "Control de insectos voladores"},
                {"name": "Otros - Desinfección", "description": "Otros servicios de desinfección"},
                {"name": "Otros - Desratización", "description": "Otros servicios de desratización"}
            ],
            3: [  # Desatascos
                {"name": "Limpieza", "description": "Servicio de limpieza de tuberías y desagües"},
                {"name": "Desatranque", "description": "Eliminación de atascos en tuberías"},
                {"name": "Vaciado de fosa", "description": "Limpieza y vaciado de fosas sépticas"}
            ],
            4: [  # Servicio de cubas
                {"name": "Cuba de escombro", "description": "Contenedores para escombros y materiales de construcción"},
                {"name": "Residuos vegetales", "description": "Contenedores para residuos de jardinería"},
                {"name": "Cuba de aguas", "description": "Contenedores para agua o líquidos"}
            ],
            6: [  # Tratamientos fitosanitarios
                {"name": "Herbicidas", "description": "Tratamientos con herbicidas"},
                {"name": "Picudo Rojo", "description": "Tratamiento específico para el picudo rojo"}
            ]
        }
        
        # Insertar tipos de servicios
        for service_data in services:
            service = ServiceType(
                id=service_data["id"],
                name=service_data["name"],
                description=service_data["description"]
            )
            db.session.add(service)
        
        # Commit para asegurarnos de que se creen los IDs de los servicios
        db.session.commit()
        
        # Insertar subcategorías
        for service_id, subcats in subcategories.items():
            for subcat_data in subcats:
                subcat = ServiceSubcategory(
                    service_type_id=service_id,
                    name=subcat_data["name"],
                    description=subcat_data["description"]
                )
                db.session.add(subcat)
        
        db.session.commit()
        print(f"Se han cargado {len(services)} tipos de servicios con sus subcategorías.")

if __name__ == "__main__":
    create_service_tables()
    populate_service_data()
