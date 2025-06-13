from flask import Blueprint, render_template, redirect, request, url_for, flash, jsonify
from flask_login import login_required, current_user
from app.models import Presupuesto, ServiceType, ServiceSubcategory
from app.extensions import db
import json

presupuestos_bp = Blueprint('presupuestos', __name__, url_prefix='/presupuestos')

@presupuestos_bp.route('/')
@login_required
def index():
    """Página principal de presupuestos con paginación"""
    page = request.args.get('page', 1, type=int)
    page_rech = request.args.get('page_rech', 1, type=int)
    per_page = 15  # Mostrar 15 resultados por página
    # Paginación para pendientes
    presupuestos_pagination = Presupuesto.obtener_paginados(page, per_page)
    presupuestos = presupuestos_pagination.items
    # Paginación para rechazados
    from app.models.models import Job
    presupuestos_rechazados_pagination = Job.query.filter_by(estado='Rechazado').order_by(Job.fecha.desc(), Job.id.desc()).paginate(page=page_rech, per_page=per_page, error_out=False)
    presupuestos_rechazados = presupuestos_rechazados_pagination.items
    return render_template('presupuestos/index.html', 
        presupuestos=presupuestos, 
        presupuestos_pagination=presupuestos_pagination,
        presupuestos_rechazados=presupuestos_rechazados,
        presupuestos_rechazados_pagination=presupuestos_rechazados_pagination)

@presupuestos_bp.route('/crear', methods=['GET', 'POST'])
@login_required
def crear():
    """Formulario para crear un nuevo presupuesto"""
    if request.method == 'POST':
        # Procesar datos del formulario
        try:
            # Obtener datos del cliente
            nombre = request.form['nombre']
            apellido = request.form.get('apellido', '')
            telefono = request.form.get('telefono', '')
            email = request.form.get('email', '')
            direccion = request.form.get('direccion', '')
            codigo_postal = request.form.get('codigo_postal', '')
              # Obtener datos del servicio
            service_type_id = request.form.get('service_type')
            subcategorias = request.form.getlist('subcategories[]')
            descripcion = request.form.get('descripcion', '')
            
            # Obtener datos de mantenimiento
            enable_maintenance = 'enable_maintenance' in request.form
            maintenance_frequency = request.form.get('maintenance_frequency') if enable_maintenance else None
            
            # Obtener fecha y técnico
            fecha = request.form.get('fecha')
            hora = request.form.get('hora', '09:00')
            duracion = request.form.get('duracion', '1h')
            tecnico_id = request.form.get('tecnico_id')
            
            # Buscar el objeto ServiceType si se ha especificado un ID
            service_type_obj = None
            if service_type_id:
                service_type_obj = ServiceType.query.get(service_type_id)
            
            # Crear presupuesto
            presupuesto = Presupuesto.crear(
                nombre_cliente=nombre,
                apellido_cliente=apellido,
                telefono=telefono,
                email=email,
                descripcion=descripcion,
                fecha=fecha,
                hora=hora,
                duracion=duracion,
                tecnico_id=tecnico_id,
                direccion=direccion,
                codigo_postal=codigo_postal,
                service_type=service_type_obj,
                service_subcategories=json.dumps(subcategorias) if subcategorias else None,
                enable_maintenance=enable_maintenance,
                maintenance_frequency=maintenance_frequency
            )
            
            flash('Presupuesto creado con éxito', 'success')
            return redirect(url_for('presupuestos.detalle', id=presupuesto.id))
        except Exception as e:
            flash(f'Error al crear el presupuesto: {str(e)}', 'danger')
    
    # Para solicitud GET, cargar tipos de servicios
    service_types = ServiceType.query.all()
    return render_template('presupuestos/crear.html', service_types=service_types)

@presupuestos_bp.route('/<int:id>')
@login_required
def detalle(id):
    """Ver detalles de un presupuesto específico"""
    presupuesto = Presupuesto.obtener_por_id(id)
    if not presupuesto:
        flash('Presupuesto no encontrado', 'danger')
        return redirect(url_for('presupuestos.index'))
    # Procesar la descripción para extraer información estructurada
    info_servicio = {}
    info_plaga = {}
    info_mantenimiento = {}
    descripcion_limpia = ""

    if presupuesto.descripcion:
        descripcion_completa = presupuesto.descripcion
        descripcion_limpia = descripcion_completa
        if "Servicio:" in descripcion_completa:
            servicio_parts = descripcion_completa.split("Servicio:", 1)
            descripcion_limpia = servicio_parts[0].strip()
            resto = servicio_parts[1]
            if "Tipo de plaga:" in resto:
                servicio_nombre = resto.split("Tipo de plaga:", 1)[0].strip()
                info_servicio["nombre"] = servicio_nombre
            else:
                info_servicio["nombre"] = resto.strip()
        if "Tipo de plaga:" in descripcion_completa:
            plaga_parts = descripcion_completa.split("Tipo de plaga:", 1)[1]
            if "Plan de mantenimiento:" in plaga_parts:
                plaga_tipo = plaga_parts.split("Plan de mantenimiento:", 1)[0].strip()
                info_plaga["tipo"] = plaga_tipo
            else:
                info_plaga["tipo"] = plaga_parts.strip()
        if "Plan de mantenimiento:" in descripcion_completa:
            mantenimiento_info = descripcion_completa.split("Plan de mantenimiento:", 1)[1].strip()
            if "durante" in mantenimiento_info.lower():
                partes = mantenimiento_info.split("durante", 1)
                info_mantenimiento["plan"] = partes[0].strip()
                info_mantenimiento["duracion"] = "durante " + partes[1].strip()
            else:
                info_mantenimiento["plan"] = mantenimiento_info
        if "Servicio:" in descripcion_limpia:
            descripcion_limpia = descripcion_limpia.split("Servicio:", 1)[0].strip()
        frases_comunes = ["Desinfeccion y desratizacion", "Desinfección y desratización", "Desinfeccion", "Desinfección", "Desratizacion", "Desratización"]
        for frase in frases_comunes:
            if descripcion_limpia.startswith(frase):
                descripcion_limpia = descripcion_limpia.replace(frase, "", 1).strip()
        if not descripcion_limpia or descripcion_limpia.isspace():
            descripcion_limpia = None

    return render_template('presupuestos/detalle.html', 
                          presupuesto=presupuesto, 
                          trabajo=presupuesto,  # <- Esto permite que la plantilla de trabajos funcione
                          desde_presupuestos=True,
                          info_servicio=info_servicio,
                          info_plaga=info_plaga,
                          info_mantenimiento=info_mantenimiento,
                          descripcion_limpia=descripcion_limpia.strip() if descripcion_limpia else None)

@presupuestos_bp.route('/api/subcategorias/<int:service_type_id>')
def obtener_subcategorias(service_type_id):
    """API para obtener subcategorías de un tipo de servicio"""
    subcategorias = ServiceSubcategory.query.filter_by(service_type_id=service_type_id).all()
    return jsonify([{'id': s.id, 'name': s.name} for s in subcategorias])

@presupuestos_bp.route('/rechazar/<int:id>', methods=['POST'])
@login_required
def rechazar(id):
    """Rechaza un presupuesto (cambia su estado a 'Rechazado')"""
    presupuesto = Presupuesto.obtener_por_id(id)
    if not presupuesto:
        flash('Presupuesto no encontrado', 'danger')
        return redirect(url_for('presupuestos.index'))
    presupuesto.estado = 'Rechazado'
    db.session.commit()
    flash('Presupuesto rechazado correctamente.', 'success')
    return redirect(url_for('presupuestos.index'))
