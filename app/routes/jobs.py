import random
from datetime import datetime, timedelta
from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from sqlalchemy import func

from app.extensions import db
from app.models.models import Job, Technician, JobHistory
from app.utils.validators import verificar_telefono

jobs_bp = Blueprint('jobs', __name__)

@jobs_bp.route('/')
@login_required
def index():
    return render_template('index.html')

@jobs_bp.route('/jobs')
@login_required
def listar_trabajos():
    trabajos = Job.query.filter(Job.estado != 'Completado').all()
    tecnicos = Technician.query.all()
    return render_template('trabajos.html', trabajos=trabajos, tecnicos=tecnicos)

@jobs_bp.route('/jobs/create', methods=['POST'])
@login_required
def crear_trabajo():
    DURACION_MAP = {"corta": 1, "media": 2, "larga": 3}

    nombre = request.form.get('nombre_cliente')
    apellido = request.form.get('apellido_cliente')
    direccion = request.form.get('direccion')
    descripcion = request.form.get('descripcion')
    telefono = request.form.get('telefono')

    # Validar teléfono
    if telefono and not verificar_telefono(telefono):
        flash("Teléfono inválido. Asegúrate de usar un formato correcto.", "danger")
        return redirect(url_for('jobs.listar_trabajos'))

    duracion = request.form.get('duracion') or 'media'
    fecha_str = request.form.get('fecha')
    hora_str = request.form.get('hora')

    try:
        fecha = datetime.strptime(fecha_str, '%Y-%m-%d')
        hora = datetime.strptime(hora_str, '%H:%M').time()
    except ValueError:
        flash("Fecha u hora con formato inválido.", "danger")
        return redirect(url_for('jobs.listar_trabajos'))

    inicio = datetime.combine(fecha.date(), hora)
    fin = inicio + timedelta(hours=DURACION_MAP.get(duracion, 2))

    trabajo = Job(
        nombre_cliente=nombre,
        apellido_cliente=apellido,
        direccion=direccion,
        descripcion=descripcion,
        telefono=telefono,
        duracion=duracion,
        fecha=fecha,
        hora=hora_str,
        estado='Pendiente'
    )

    # Autoasignación de técnicos disponibles
    tecnicos = Technician.query.filter_by(available=True).all()
    candidatos = []

    for tecnico in tecnicos:
        trabajos = Job.query.filter_by(technician_id=tecnico.id).all()
        conflicto = False
        for t in trabajos:
            t_inicio = datetime.combine(t.fecha.date(), datetime.strptime(t.hora, '%H:%M').time())
            t_duracion = DURACION_MAP.get(t.duracion, 2)
            t_fin = t_inicio + timedelta(hours=t_duracion)
            if inicio < t_fin and fin > t_inicio:
                conflicto = True
                break
        if not conflicto:
            candidatos.append(tecnico)

    if candidatos:
        min_workload = min(t.workload for t in candidatos)
        disponibles = [t for t in candidatos if t.workload == min_workload]
        asignado = random.choice(disponibles)
        trabajo.technician_id = asignado.id
        asignado.workload += 1
    else:
        flash("No hay técnicos disponibles en ese horario", "warning")

    db.session.add(trabajo)
    db.session.commit()

    historial = JobHistory(job_id=trabajo.id, action="Creación", details=f"Trabajo creado por {current_user.username}")
    db.session.add(historial)
    db.session.commit()

    flash("Trabajo creado correctamente", "success")
    return redirect(url_for('jobs.listar_trabajos'))


    return render_template('crear_trabajo.html')

@jobs_bp.route('/jobs/edit/<int:id>', methods=['GET', 'POST'])
@login_required
def editar_trabajo(id):
    trabajo = Job.query.get_or_404(id)
    tecnicos = Technician.query.all()

    if request.method == 'POST':
        trabajo.nombre_cliente = request.form.get('nombre_cliente')
        trabajo.apellido_cliente = request.form.get('apellido_cliente')
        trabajo.direccion = request.form.get('direccion')
        trabajo.descripcion = request.form.get('descripcion')
        telefono = request.form.get('telefono')
        if telefono and not verificar_telefono(telefono):
            flash("Teléfono inválido", "danger")
            return redirect(url_for('jobs.editar_trabajo', id=id))
        trabajo.telefono = telefono
        trabajo.codigo_postal = request.form.get('codigo_postal')
        trabajo.duracion = request.form.get('duracion')
        trabajo.fecha = datetime.strptime(request.form.get('fecha'), '%Y-%m-%d')
        trabajo.hora = request.form.get('hora')
        nuevo_tecnico = request.form.get('tecnico_id')
        if nuevo_tecnico:
            nuevo_tecnico = int(nuevo_tecnico)
            if trabajo.technician_id != nuevo_tecnico:
                anterior = Technician.query.get(trabajo.technician_id)
                if anterior:
                    anterior.workload = max(0, anterior.workload - 1)
                nuevo = Technician.query.get(nuevo_tecnico)
                trabajo.technician_id = nuevo_tecnico
                if nuevo:
                    nuevo.workload += 1

        trabajo.estado = request.form.get('estado')
        db.session.commit()

        historial = JobHistory(job_id=trabajo.id, action="Edición", details=f"Actualizado por {current_user.username}")
        db.session.add(historial)
        db.session.commit()

        flash("Trabajo actualizado", "success")
        return redirect(url_for('jobs.listar_trabajos'))

    return render_template('editar_trabajo.html', trabajo=trabajo, tecnicos=tecnicos)

@jobs_bp.route('/jobs/delete/<int:id>', methods=['POST'])
@login_required
def eliminar_trabajo(id):
    trabajo = Job.query.get_or_404(id)
    if trabajo.technician_id:
        tecnico = Technician.query.get(trabajo.technician_id)
        if tecnico:
            tecnico.workload = max(0, tecnico.workload - 1)

    historial = JobHistory(job_id=trabajo.id, action="Eliminado", details=f"Eliminado por {current_user.username}")
    db.session.add(historial)
    db.session.delete(trabajo)
    db.session.commit()

    flash("Trabajo eliminado", "success")
    return redirect(url_for('jobs.listar_trabajos'))

@jobs_bp.route('/jobs/complete/<int:id>', methods=['POST'])
@login_required
def completar_trabajo(id):
    trabajo = Job.query.get_or_404(id)
    trabajo.estado = "Completado"
    historial = JobHistory(job_id=trabajo.id, action="Completado", details="Trabajo completado")
    db.session.add(historial)
    db.session.commit()
    flash("Trabajo marcado como completado", "success")
    return redirect(url_for('jobs.listar_trabajos'))

@jobs_bp.route('/historial')
@login_required
def historial():
    query = Job.query.filter_by(estado='Completado')

    cliente = request.args.get('cliente', '').strip()
    fecha_inicio = request.args.get('fecha_inicio', '').strip()
    fecha_fin = request.args.get('fecha_fin', '').strip()
    tecnico = request.args.get('tecnico', '').strip()

    if cliente:
        query = query.filter(
            func.concat(Job.nombre_cliente, ' ', Job.apellido_cliente).ilike(f'%{cliente}%')
        )

    if fecha_inicio:
        try:
            fecha_inicio_dt = datetime.strptime(fecha_inicio, '%Y-%m-%d')
            query = query.filter(Job.fecha >= fecha_inicio_dt)
        except ValueError:
            flash("Formato de fecha de inicio inválido", "warning")

    if fecha_fin:
        try:
            fecha_fin_dt = datetime.strptime(fecha_fin, '%Y-%m-%d')
            query = query.filter(Job.fecha <= fecha_fin_dt)
        except ValueError:
            flash("Formato de fecha de fin inválido", "warning")

    if tecnico:
        query = query.join(Technician).filter(
            func.concat(Technician.nombre, ' ', Technician.apellido).ilike(f'%{tecnico}%')
        )

    trabajos = query.order_by(Job.updated_at.desc()).all()

    return render_template(
        'historial.html',
        trabajos=trabajos,
        cliente=cliente,
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin,
        tecnico=tecnico
    )


