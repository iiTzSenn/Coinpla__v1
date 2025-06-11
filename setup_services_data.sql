-- Script para inicializar los tipos de servicios y subcategorías
-- Ejecutar este script después de crear las tablas

-- Insertar tipos de servicios principales
INSERT INTO service_types (id, name, description, created_at, updated_at) VALUES
(1, 'DDD (Desinsectación, Desinfección, Desratización)', 'Servicios de control de plagas y desinfección', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Legionela', 'Tratamientos contra la legionela', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Desatascos', 'Servicios de desatascos y limpieza', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Servicio de cubas', 'Servicios de contenedores y cubas', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'Poda de Palmeras', 'Servicios de poda y mantenimiento de palmeras', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'Tratamientos fitosanitarios', 'Tratamientos para plantas y árboles', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 'Servicio de maquinaria', 'Alquiler y servicio de maquinaria', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 'Tratamiento de choque', 'Tratamientos intensivos para problemas graves', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insertar subcategorías para DDD
INSERT INTO service_subcategories (service_type_id, name, description, created_at, updated_at) VALUES
(1, 'Cucaracha Americana (Periplaneta Americana)', 'Control de cucaracha americana', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Cucaracha Alemana (Blatella Germanica)', 'Control de cucaracha alemana', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Rata Campo (Rattus Rattus)', 'Control de ratas de campo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Rata Alcantarilla (Rattus Norvegicus)', 'Control de ratas de alcantarilla', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Ratón Común (Mus Musculus)', 'Control de ratones', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Hormiga Común (Lasius Niger)', 'Control de hormigas', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Chinche Cama (Cimex Lectularius)', 'Control de chinches de cama', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Moscas, Mosquitos (Dípteros)', 'Control de insectos voladores', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Otros - Desinfección', 'Otros servicios de desinfección', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Otros - Desratización', 'Otros servicios de desratización', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insertar subcategorías para Desatascos
INSERT INTO service_subcategories (service_type_id, name, description, created_at, updated_at) VALUES
(3, 'Limpieza', 'Servicio de limpieza de tuberías y desagües', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Desatranque', 'Eliminación de atascos en tuberías', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Vaciado de fosa', 'Limpieza y vaciado de fosas sépticas', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insertar subcategorías para Servicio de cubas
INSERT INTO service_subcategories (service_type_id, name, description, created_at, updated_at) VALUES
(4, 'Cuba de escombro', 'Contenedores para escombros y materiales de construcción', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Residuos vegetales', 'Contenedores para residuos de jardinería', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Cuba de aguas', 'Contenedores para agua o líquidos', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insertar subcategorías para Tratamientos fitosanitarios
INSERT INTO service_subcategories (service_type_id, name, description, created_at, updated_at) VALUES
(6, 'Herbicidas', 'Tratamientos con herbicidas', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'Picudo Rojo', 'Tratamiento específico para el picudo rojo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
