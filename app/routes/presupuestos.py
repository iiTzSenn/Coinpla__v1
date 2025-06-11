from flask import Blueprint, render_template, redirect, request, url_for, flash, jsonify
from flask_login import login_required, current_user
from app.models import Presupuesto, ServiceType, ServiceSubcategory
from app.extensions import db
import json

presupuestos_bp = Blueprint('presupuestos', __name__, url_prefix='/presupuestos')

@presupuestos_bp.route('/')
@login_required
def index():
    """Página principal de presupuestos"""
    presupuestos = Presupuesto.obtener_todos()
    return render_template('presupuestos/index.html', presupuestos=presupuestos)

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
    return render_template('presupuestos/detalle.html', presupuesto=presupuesto)

@presupuestos_bp.route('/api/subcategorias/<int:service_type_id>')
def obtener_subcategorias(service_type_id):
    """API para obtener subcategorías de un tipo de servicio"""
    subcategorias = ServiceSubcategory.query.filter_by(service_type_id=service_type_id).all()
    return jsonify([{'id': s.id, 'name': s.name} for s in subcategorias])
