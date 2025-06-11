-- Script para configurar las tablas de servicios con datos iniciales

-- Insertar tipos de servicios principales
INSERT INTO service_types (name, description) VALUES 
('DDD (Desinsectación, Desinfección, Desratización)', 'Servicios de control de plagas urbanas'),
('Legionela', 'Prevención y control de legionela'),
('Desatascos', 'Servicios de limpieza y desatascos'),
('Servicio de cubas', 'Servicios de alquiler de cubas'),
('Poda de Palmeras', 'Servicios de poda de palmeras y árboles'),
('Tratamientos fitosanitarios', 'Tratamientos para el control de plagas en plantas'),
('Servicio de maquinaria', 'Alquiler de maquinaria especializada'),
('Tratamiento de choque', 'Servicios de tratamiento intensivo para infestaciones graves');

-- Insertar subcategorías para DDD
INSERT INTO service_subcategories (service_type_id, name, description)
SELECT id, 'Cucaracha Americana (Periplaneta Americana)', 'Control de cucarachas americanas'
FROM service_types WHERE name = 'DDD (Desinsectación, Desinfección, Desratización)';

INSERT INTO service_subcategories (service_type_id, name, description)
SELECT id, 'Cucaracha Alemana (Blatella Germanica)', 'Control de cucarachas alemanas'
FROM service_types WHERE name = 'DDD (Desinsectación, Desinfección, Desratización)';

INSERT INTO service_subcategories (service_type_id, name, description)
SELECT id, 'Rata Campo (Rattus Rattus)', 'Control de ratas de campo'
FROM service_types WHERE name = 'DDD (Desinsectación, Desinfección, Desratización)';

INSERT INTO service_subcategories (service_type_id, name, description)
SELECT id, 'Rata Alcantarilla (Rattus Norvegicus)', 'Control de ratas de alcantarilla'
FROM service_types WHERE name = 'DDD (Desinsectación, Desinfección, Desratización)';

INSERT INTO service_subcategories (service_type_id, name, description)
SELECT id, 'Ratón Común (Mus Musculus)', 'Control de ratones comunes'
FROM service_types WHERE name = 'DDD (Desinsectación, Desinfección, Desratización)';

INSERT INTO service_subcategories (service_type_id, name, description)
SELECT id, 'Hormiga Común (Lasius Niger)', 'Control de hormigas comunes'
FROM service_types WHERE name = 'DDD (Desinsectación, Desinfección, Desratización)';

INSERT INTO service_subcategories (service_type_id, name, description)
SELECT id, 'Chinche Cama (Cimex Lectularius)', 'Control de chinches de cama'
FROM service_types WHERE name = 'DDD (Desinsectación, Desinfección, Desratización)';

INSERT INTO service_subcategories (service_type_id, name, description)
SELECT id, 'Moscas, Mosquitos (Dípteros)', 'Control de moscas y mosquitos'
FROM service_types WHERE name = 'DDD (Desinsectación, Desinfección, Desratización)';

INSERT INTO service_subcategories (service_type_id, name, description)
SELECT id, 'Otros - Desinfección', 'Otros servicios de desinfección general'
FROM service_types WHERE name = 'DDD (Desinsectación, Desinfección, Desratización)';

INSERT INTO service_subcategories (service_type_id, name, description)
SELECT id, 'Otros - Desratización', 'Otros servicios de desratización general'
FROM service_types WHERE name = 'DDD (Desinsectación, Desinfección, Desratización)';

-- Insertar subcategorías para Desatascos
INSERT INTO service_subcategories (service_type_id, name, description)
SELECT id, 'Limpieza', 'Limpieza de tuberías y sistemas de desagüe'
FROM service_types WHERE name = 'Desatascos';

INSERT INTO service_subcategories (service_type_id, name, description)
SELECT id, 'Desatranque', 'Eliminación de obstrucciones en tuberías'
FROM service_types WHERE name = 'Desatascos';

INSERT INTO service_subcategories (service_type_id, name, description)
SELECT id, 'Vaciado de fosa', 'Vaciado y limpieza de fosas sépticas'
FROM service_types WHERE name = 'Desatascos';

-- Insertar subcategorías para Servicio de cubas
INSERT INTO service_subcategories (service_type_id, name, description)
SELECT id, 'Cuba de escombro', 'Contenedores para recogida de escombros'
FROM service_types WHERE name = 'Servicio de cubas';

INSERT INTO service_subcategories (service_type_id, name, description)
SELECT id, 'Residuos vegetales', 'Contenedores para recogida de residuos vegetales'
FROM service_types WHERE name = 'Servicio de cubas';

INSERT INTO service_subcategories (service_type_id, name, description)
SELECT id, 'Cuba de aguas', 'Contenedores para aguas residuales'
FROM service_types WHERE name = 'Servicio de cubas';

-- Insertar subcategorías para Tratamientos fitosanitarios
INSERT INTO service_subcategories (service_type_id, name, description)
SELECT id, 'Herbicidas', 'Tratamiento con herbicidas para control de malas hierbas'
FROM service_types WHERE name = 'Tratamientos fitosanitarios';

INSERT INTO service_subcategories (service_type_id, name, description)
SELECT id, 'Picudo Rojo', 'Tratamiento específico contra el picudo rojo'
FROM service_types WHERE name = 'Tratamientos fitosanitarios';
