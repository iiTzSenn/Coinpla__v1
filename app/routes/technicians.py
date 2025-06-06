from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required
from app.extensions import db
from app.models.models import Technician, Job, JobHistory
from app.utils.validators import validar_y_normalizar_telefono

tech_bp = Blueprint('technicians', __name__, url_prefix='/technicians')

@tech_bp.route('/')
@login_required
def listar_tecnicos():
    tecnicos = Technician.query.order_by(Technician.id).all()
    return render_template('tecnicos.html', tecnicos=tecnicos)

@tech_bp.route('/create', methods=['POST'])
@login_required
def crear_tecnico():
    nombre = request.form.get('first_name').strip()
    apellido = request.form.get('last_name').strip()
    telefono = request.form.get('telefono').strip()

    # Validación del teléfono
    if telefono and not verificar_telefono(telefono):
        flash("Teléfono del técnico inválido. Usa un formato correcto.", "danger")
        return redirect(url_for('technicians.listar_tecnicos'))

    nuevo = Technician(nombre=nombre, apellido=apellido, telefono=telefono)
    db.session.add(nuevo)
    db.session.commit()
    flash("Técnico creado exitosamente", "success")
    return redirect(url_for('technicians.listar_tecnicos'))

@tech_bp.route('/edit/<int:id>', methods=['POST'])
@login_required
def editar_tecnico(id):
    tecnico = Technician.query.get_or_404(id)
    tecnico.nombre = request.form.get('first_name').strip()
    tecnico.apellido = request.form.get('last_name').strip()
    telefono = request.form.get('telefono').strip()

    # Validación del teléfono
    if telefono and not verificar_telefono(telefono):
        flash("Teléfono del técnico inválido. Usa un formato correcto.", "danger")
        return redirect(url_for('technicians.listar_tecnicos'))

    tecnico.telefono = telefono
    db.session.commit()
    flash("Técnico actualizado", "success")
    return redirect(url_for('technicians.listar_tecnicos'))

@tech_bp.route('/toggle/<int:id>', methods=['POST'])
@login_required
def toggle_tecnico(id):
    tecnico = Technician.query.get_or_404(id)
    tecnico.available = not tecnico.available
    db.session.commit()
      # Responder según el tipo de petición
    # Si es una petición AJAX (JSON)
    if request.headers.get('Content-Type') == 'application/json' or request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({
            'success': True,
            'id': tecnico.id,
            'available': tecnico.available,
            'message': 'Estado del técnico actualizado'
        })
    
    # Si es una petición normal de formulario
    flash("Estado del técnico actualizado", "success")
    
    # Verificar si viene de la página de administración de usuarios
    referer = request.headers.get('Referer', '')
    if 'admin/users' in referer:
        return redirect(url_for('admin.admin_users'))
    
    return redirect(url_for('technicians.listar_tecnicos'))

@tech_bp.route('/delete/<int:id>', methods=['POST'])
@login_required
def eliminar_tecnico(id):
    tecnico = Technician.query.get_or_404(id)
    
    # Liberamos los trabajos asignados al técnico antes de eliminarlo
    trabajos = Job.query.filter_by(technician_id=id).all()
    for trabajo in trabajos:
        trabajo.technician_id = None
        historial = JobHistory(job_id=trabajo.id, action='Desasignación', details='Técnico eliminado del sistema')
        db.session.add(historial)

    # Eliminamos el técnico
    db.session.delete(tecnico)
    db.session.commit()
    flash("Técnico eliminado correctamente", "success")
    
    # Verificar si la petición viene de la página de administración de usuarios
    referer = request.headers.get('Referer', '')
    if 'admin/users' in referer:
        return redirect(url_for('admin.admin_users'))
    
    return redirect(url_for('technicians.listar_tecnicos'))
