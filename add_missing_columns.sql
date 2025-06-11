-- Script para añadir las columnas necesarias para el sistema de presupuestos

-- Crear tabla service_types
CREATE TABLE IF NOT EXISTS service_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla service_subcategories
CREATE TABLE IF NOT EXISTS service_subcategories (
    id SERIAL PRIMARY KEY,
    service_type_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_type_id) REFERENCES service_types(id)
);

-- Crear tabla maintenance_plans
CREATE TABLE IF NOT EXISTS maintenance_plans (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    duration INTEGER,
    start_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- Añadir columnas a la tabla jobs
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS service_type_id INTEGER,
ADD COLUMN IF NOT EXISTS service_subcategories VARCHAR(500),
ADD COLUMN IF NOT EXISTS has_maintenance BOOLEAN DEFAULT FALSE;

-- Añadir clave foránea
ALTER TABLE jobs
ADD CONSTRAINT jobs_service_type_id_fkey 
FOREIGN KEY (service_type_id) REFERENCES service_types(id);
