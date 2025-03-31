import random
from datetime import datetime, timedelta
from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from sqlalchemy import func
from app.extensions import db
from app.models.models import User, Job, Technician, JobHistory
from app.utils.validators import validar_y_normalizar_telefono

jobs_bp = Blueprint('jobs', __name__)

@jobs_bp.route('/')
@login_required
def index():
    trabajos_recientes = Job.query.order_by(Job.updated_at.desc()).limit(10).all()
    total_usuarios = User.query.count()
    total_trabajos = Job.query.count()
    trabajos_pendientes = Job.query.filter_by(estado='Pendiente').count()
    trabajos_completados = Job.query.filter_by(estado='Completado').count()
    
    # Preparar datos para el gráfico: trabajos por mes en los últimos 6 meses
    current_month = datetime.now().month
    current_year = datetime.now().year
    meses_labels = []
    trabajos_mes = []
    for i in range(6):
        month = current_month - i
        year = current_year
        if month <= 0:
            month += 12
            year -= 1
        label = datetime(year, month, 1).strftime('%b %Y')
        meses_labels.append(label)
        count = Job.query.filter(
            func.extract('year', Job.fecha) == year,
            func.extract('month', Job.fecha) == month
        ).count()
        trabajos_mes.append(count)
    meses_labels.reverse()
    trabajos_mes.reverse()
    
    trabajosPendientesMes = []
    for i in range(6):
        month = current_month - i
        year = current_year
        if month <= 0:
            month += 12
            year -= 1
        count_pendientes = Job.query.filter(
            func.extract('year', Job.fecha) == year,
            func.extract('month', Job.fecha) == month,
            Job.estado == 'Pendiente'
        ).count()
        trabajosPendientesMes.append(count_pendientes)
    trabajosPendientesMes.reverse()
    
    # Preparar eventos para el calendario: usar todos los trabajos con fecha definida
    jobs_for_calendar = Job.query.filter(Job.fecha != None).all()
    eventos_calendario = []
    for job in jobs_for_calendar:
        eventos_calendario.append({
            'titulo': f"{job.nombre_cliente} {job.apellido_cliente or ''}",
            'start': job.fecha.strftime('%Y-%m-%d')
        })
    
    # Calcular facturación mensual
    facturacion_mes = []
    for i in range(6):
        month = current_month - i
        year = current_year
        if month <= 0:
            month += 12
            year -= 1
        total_facturacion = db.session.query(func.sum(Job.costo_final)).filter(
            func.extract('year', Job.fecha) == year,
            func.extract('month', Job.fecha) == month,
            Job.estado == 'Completado'
        ).scalar() or 0
        facturacion_mes.append(total_facturacion)
    facturacion_mes.reverse()

    page = request.args.get('page', 1, type=int)
    per_page = 10
    trabajos_pendientes_proceso = Job.query.filter(Job.estado.in_(['Pendiente', 'En Proceso'])) \
                                           .order_by(Job.updated_at.desc()) \
                                           .paginate(page=page, per_page=per_page, error_out=False)

    return render_template('dashboard_admin.html',
                           trabajos_recientes=trabajos_recientes,
                           total_usuarios=total_usuarios,
                           total_trabajos=total_trabajos,
                           trabajos_pendientes=trabajos_pendientes,
                           trabajos_completados=trabajos_completados,
                           meses_labels=meses_labels,
                           trabajos_mes=trabajos_mes,
                           trabajosPendientesMes=trabajosPendientesMes,  # Enviar al frontend
                           facturacion_mes=facturacion_mes,  # Enviar al frontend
                           eventos_calendario=eventos_calendario,
                           trabajos_pendientes_proceso=trabajos_pendientes_proceso)

@jobs_bp.route('/listar_trabajos')  # Cambiado de '/jobs' a '/listar_trabajos'
@login_required
def listar_trabajos():
    trabajos = Job.query.filter(Job.estado != 'Completado').all()
    tecnicos = Technician.query.all()
    return render_template('trabajos.html', trabajos=trabajos, tecnicos=tecnicos)

@jobs_bp.route('/jobs/<int:id>')
@login_required
def ver_trabajo(id):
    trabajo = Job.query.get_or_404(id)
    return render_template('detalle_trabajo.html', trabajo=trabajo)

@jobs_bp.route('/jobs/create', methods=['POST'])
@login_required
def crear_trabajo():
    DURACION_MAP = {"corta": 1, "media": 2, "larga": 3}

    nombre = request.form.get('nombre_cliente')
    apellido = request.form.get('apellido_cliente')
    direccion = request.form.get('direccion')
    descripcion = request.form.get('descripcion')
    telefono_raw = request.form.get('telefono')

    try:
        telefono = validar_y_normalizar_telefono(telefono_raw) if telefono_raw else None
    except ValueError as e:
        flash(str(e), "danger")
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

    tecnicos = Technician.query.filter_by(available=True).all()
    candidatos = []
    for tecnico in tecnicos:
        trabajos_asignados = Job.query.filter_by(technician_id=tecnico.id).all()
        conflicto = False
        for t in trabajos_asignados:
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

@jobs_bp.route('/jobs/edit/<int:id>', methods=['POST'])
@login_required
def editar_trabajo(id):
    trabajo = Job.query.get_or_404(id)
    tecnicos = Technician.query.all()

    trabajo.nombre_cliente = request.form.get('nombre_cliente')
    trabajo.apellido_cliente = request.form.get('apellido_cliente')
    trabajo.direccion = request.form.get('direccion')
    trabajo.descripcion = request.form.get('descripcion')

    telefono_raw = request.form.get('telefono')
    try:
        trabajo.telefono = validar_y_normalizar_telefono(telefono_raw) if telefono_raw else None
    except ValueError as e:
        trabajos = Job.query.filter(Job.estado != 'Completado').all()
        return render_template('trabajos.html',
                               trabajos=trabajos,
                               tecnicos=tecnicos,
                               error_modal_id=trabajo.id,
                               error_telefono=str(e))
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

    return render_template('historial.html',
                           trabajos=trabajos,
                           cliente=cliente,
                           fecha_inicio=fecha_inicio,
                           fecha_fin=fecha_fin,
                           tecnico=tecnico)
