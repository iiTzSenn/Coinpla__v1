# 🔒 GUÍA DE SEGURIDAD - COINPLA

## ✅ Medidas de Seguridad Implementadas

### 1. **Variables de Entorno**
- ✅ Todas las credenciales están en `.env`
- ✅ `.env` está en `.gitignore`
- ✅ `.env.example` disponible como plantilla
- ✅ No hay credenciales hardcodeadas en el código

### 2. **Archivos Sensibles Protegidos**
- ✅ PDFs de presupuestos excluidos del repositorio
- ✅ Archivos temporales y cache eliminados
- ✅ Archivos de backup eliminados

### 3. **Dependencias Optimizadas**
- ✅ `requirements.txt` limpio con solo dependencias necesarias
- ✅ Paquetes innecesarios eliminados (FastAPI, uvicorn, etc.)

### 4. **Código Limpio**
- ✅ Archivos duplicados eliminados
- ✅ Funciones redundantes consolidadas
- ✅ Scripts de prueba eliminados

## ⚠️ ANTES DE PRODUCCIÓN

### 1. **Configurar Variables de Entorno**
```bash
# Generar nueva SECRET_KEY
python -c "import secrets; print(secrets.token_hex(32))"

# Configurar .env con valores reales:
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/base_datos
SECRET_KEY=nueva_clave_secreta_generada
MAIL_USERNAME=email_real@dominio.com
MAIL_PASSWORD=contraseña_aplicacion_gmail
```

### 2. **Seguridad de Base de Datos**
- Crear usuario específico para la aplicación
- Limitar permisos del usuario de BD
- Usar conexión SSL si es posible

### 3. **Seguridad del Servidor**
- Usar HTTPS en producción
- Configurar firewall apropiado
- Actualizar sistema operativo regularmente

### 4. **Backup y Monitoreo**
- Configurar backups automáticos de BD
- Monitorear logs de aplicación
- Configurar alertas de errores

## 🚨 NUNCA HACER

- ❌ Commitear archivo `.env` con credenciales reales
- ❌ Hardcodear credenciales en el código
- ❌ Exponer datos de clientes en repositorio
- ❌ Usar credenciales por defecto
- ❌ Desactivar HTTPS en producción

## 📞 Contacto de Seguridad

Si encuentras vulnerabilidades, reporta inmediatamente al administrador del sistema.
