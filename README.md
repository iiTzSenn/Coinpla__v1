<div align="center">

# 🔧 COINPLA
### Sistema Integral de Gestión Empresarial

*Plataforma completa para empresas de reparación, instalación y servicios técnicos*

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-2.2.5-green.svg)](https://flask.palletsprojects.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-orange.svg)](https://postgresql.org)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

---

</div>

## 🎯 **Descripción**

**COINPLA** es un sistema de gestión empresarial especializado en optimizar las operaciones de empresas de servicios técnicos. Diseñado para maximizar la eficiencia operativa mediante la automatización de procesos clave y el seguimiento integral de trabajos, técnicos y clientes.

### ✨ **Características Principales**

🏢 **Gestión Empresarial Completa**
- Dashboard administrativo con métricas en tiempo real
- Control total de usuarios y permisos
- Gestión de técnicos y asignaciones

👷 **Gestión de Técnicos**
- Perfiles detallados de técnicos
- Seguimiento de trabajos asignados
- Historial de rendimiento

📋 **Sistema de Trabajos**
- Creación y seguimiento de trabajos
- Estados personalizables (Pendiente, En Progreso, Completado)
- Asignación automática de técnicos

💰 **Facturación y Presupuestos**
- Generación automática de presupuestos
- Facturas profesionales en PDF
- Comprobantes de pago

📧 **Comunicaciones**
- Envío automático de documentos por email
- Notificaciones del sistema
- Integración con Gmail

📊 **Reportes y Analytics**
- Dashboards interactivos
- Métricas de rendimiento
- Exportación de datos

---

## 🚀 **Instalación y Configuración**

### **Requisitos Previos**
- Python 3.8 o superior
- PostgreSQL 12+
- Node.js (para assets frontend)

### **1. Clonar el Repositorio**
```bash
git clone [repository-url]
cd Coinpla__v1
```

### **2. Configurar Entorno Virtual**
```bash
# Crear entorno virtual
python -m venv coinpla_env

# Activar entorno virtual
# Windows:
coinpla_env\Scripts\activate
# Linux/Mac:
source coinpla_env/bin/activate
```

### **3. Instalar Dependencias**
```bash
# Dependencias Python
pip install -r requirements.txt

# Dependencias Node.js (si es necesario)
npm install
```

### **4. Configurar Variables de Entorno**
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales
# Ver sección de Configuración para detalles
```

### **5. Configurar Base de Datos**
```bash
# Aplicar migraciones
flask db upgrade

# Inicializar datos (opcional)
python -c "from app import create_app; app = create_app(); app.app_context().push(); from app.extensions import db; db.create_all()"
```

### **6. Ejecutar la Aplicación**
```bash
python run.py
```

🌐 **Accede a la aplicación en:** `http://localhost:5000`

---

## ⚙️ **Configuración**

### **Variables de Entorno (.env)**

```bash
# Configuración de Flask
SECRET_KEY=tu_clave_secreta_muy_segura
FLASK_ENV=production
DEBUG=False

# Base de Datos PostgreSQL
DATABASE_URL=postgresql://usuario:password@host:puerto/database
DB_HOST=localhost
DB_NAME=coinpla_db
DB_USER=coinpla_user
DB_PASSWORD=tu_password_seguro
DB_PORT=5432

# Configuración de Email (Gmail)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=tu_email@gmail.com
MAIL_PASSWORD=tu_app_password_gmail

# Configuración adicional
UPLOAD_FOLDER=app/static/uploads
MAX_CONTENT_LENGTH=16777216  # 16MB
```

### **🔐 Seguridad**
- Generar `SECRET_KEY` única: `python -c "import secrets; print(secrets.token_hex(32))"`
- Usar App Passwords para Gmail (no contraseña principal)
- Configurar HTTPS en producción
- Mantener `.env` fuera del control de versiones

---

## 📁 **Estructura del Proyecto**

```
COINPLA/
├── 📁 app/                     # Aplicación principal
│   ├── 📁 models/              # Modelos de datos
│   │   ├── comprobante.py      # Modelo de comprobantes
│   │   ├── factura.py          # Modelo de facturas
│   │   ├── presupuesto.py      # Modelo de presupuestos
│   │   ├── service.py          # Modelo de servicios
│   │   └── models.py           # Modelos principales
│   ├── 📁 routes/              # Controladores y rutas
│   │   ├── admin.py            # Rutas administrativas
│   │   ├── api.py              # API endpoints
│   │   ├── auth.py             # Autenticación
│   │   ├── jobs.py             # Gestión de trabajos
│   │   ├── presupuestos.py     # Gestión de presupuestos
│   │   ├── technicians.py      # Gestión de técnicos
│   │   └── users.py            # Gestión de usuarios
│   ├── 📁 services/            # Servicios de negocio
│   │   ├── email_service.py    # Servicio de email
│   │   └── pdf_generator.py    # Generación de PDFs
│   ├── 📁 static/              # Recursos estáticos
│   │   ├── 📁 css/             # Hojas de estilo
│   │   ├── 📁 js/              # Scripts JavaScript
│   │   └── 📁 img/             # Imágenes
│   ├── 📁 templates/           # Plantillas HTML
│   │   ├── 📁 components/      # Componentes reutilizables
│   │   ├── 📁 facturas/        # Templates de facturas
│   │   └── 📁 presupuestos/    # Templates de presupuestos
│   └── 📁 utils/               # Utilidades
├── 📁 migrations/              # Migraciones de BD
├── 📄 requirements.txt         # Dependencias Python
├── 📄 run.py                   # Punto de entrada
├── 📄 .env.example             # Plantilla de configuración
└── 📄 README.md                # Este archivo
```

---

## 🛠️ **Tecnologías Utilizadas**

### **Backend**
- **Flask 2.2.5** - Framework web principal
- **SQLAlchemy** - ORM para base de datos
- **PostgreSQL** - Base de datos principal
- **Flask-Login** - Gestión de sesiones
- **Flask-Mail** - Envío de emails
- **ReportLab** - Generación de PDFs

### **Frontend**
- **HTML5/CSS3** - Estructura y estilos
- **JavaScript ES6+** - Funcionalidad del cliente
- **Bootstrap** - Framework CSS responsive
- **Chart.js** - Gráficos y visualizaciones

### **Herramientas**
- **Flask-Migrate** - Migraciones de BD
- **Flask-Caching** - Sistema de caché
- **Flask-WTF** - Formularios y CSRF
- **python-dotenv** - Variables de entorno

---

## 🔧 **Comandos Útiles**

### **Base de Datos**
```bash
# Crear nueva migración
flask db migrate -m "Descripción del cambio"

# Aplicar migraciones
flask db upgrade

# Revertir migración
flask db downgrade
```

### **Desarrollo**
```bash
# Modo desarrollo
export FLASK_ENV=development
python run.py

# Ejecutar tests (si existen)
python -m pytest

# Limpiar caché
flask cache clear
```

---

## 📊 **Funcionalidades Principales**

### **🏠 Dashboard**
- Métricas en tiempo real
- Gráficos de rendimiento
- Resumen de trabajos pendientes
- Indicadores clave de rendimiento (KPIs)

### **👥 Gestión de Usuarios**
- Roles y permisos
- Perfiles de usuario
- Historial de actividades
- Control de acceso granular

### **📋 Gestión de Trabajos**
- Creación rápida de trabajos
- Seguimiento de estados
- Asignación de técnicos
- Calendario de trabajos

### **💼 Facturación**
- Generación automática de presupuestos
- Facturas profesionales
- Comprobantes de pago
- Historial de transacciones

---

## 🚨 **Consideraciones de Seguridad**

⚠️ **IMPORTANTE**
- **NUNCA** expongas credenciales en el código
- Mantén el archivo `.env` privado y seguro
- Usa HTTPS en producción
- Actualiza dependencias regularmente
- Implementa backups regulares de la base de datos

🔒 **Medidas de Seguridad Implementadas**
- ✅ Protección CSRF en formularios
- ✅ Variables de entorno seguras
- ✅ Validación de entrada de datos
- ✅ Autenticación robusta
- ✅ Control de acceso basado en roles

---

## 🚀 **Próximas Funcionalidades**

- [ ] API REST completa
- [ ] Aplicación móvil
- [ ] Integración con sistemas de pago
- [ ] Dashboard avanzado con IA
- [ ] Geolocalización de técnicos
- [ ] Notificaciones push
- [ ] Integración con WhatsApp

---

## 📞 **Soporte**

¿Necesitas ayuda? ¿Encontraste un bug? ¿Tienes una sugerencia?

- 📧 **Email:** [soporte@coinpla.com]
- 🐛 **Bugs:** Crea un issue en el repositorio
- 💡 **Sugerencias:** Contacta al equipo de desarrollo

---

<div align="center">

**COINPLA** - *Optimizando tu gestión empresarial*

Made with ❤️ for service companies

---

*Copyright © 2024 COINPLA. Todos los derechos reservados.*

</div>

