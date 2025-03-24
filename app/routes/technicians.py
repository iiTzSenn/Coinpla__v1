from flask import Blueprint, render_template, request, redirect, url_for, flash
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
    flash("Estado actualizado", "success")
    return redirect(url_for('technicians.listar_tecnicos'))

@tech_bp.route('/delete/<int:id>', methods=['POST'])
@login_required
def eliminar_tecnico(id):
    tecnico = Technician.query.get_or_404(id)
    trabajos = Job.query.filter_by(technician_id=id).all()
    for trabajo in trabajos:
        trabajo.technician_id = None
        historial = JobHistory(job_id=trabajo.id, action='Desasignación', details='Técnico eliminado')
        db.session.add(historial)

    db.session.delete(tecnico)
    db.session.commit()
    flash("Técnico eliminado", "success")
    return redirect(url_for('technicians.listar_tecnicos'))
