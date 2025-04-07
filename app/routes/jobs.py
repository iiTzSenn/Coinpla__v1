import random
from datetime import datetime, timedelta
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from sqlalchemy import func, extract, distinct
from app.extensions import db
from app.models.models import User, Job, Technician, JobHistory
from app.utils.validators import validar_y_normalizar_telefono
from app.utils.template_utils import generate_dashboard_work_row, generate_history_row

jobs_bp = Blueprint('jobs', __name__)

@jobs_bp.route('/')
@login_required
def index():
    trabajos_recientes = Job.query.order_by(Job.updated_at.desc()).limit(10).all()
    total_usuarios = User.query.count()
    total_trabajos = Job.query.count()
    trabajos_pendientes = Job.query.filter_by(estado='Pendiente').count()
    trabajos_completados = Job.query.filter_by(estado='Completado').count()
    
    # Preparar datos para el gráfico: trabajos por mes desde el trabajo más antiguo hasta el mes actual
    current_date = datetime.now()
    current_year = current_date.year
    current_month = current_date.month

    # Obtener la fecha mínima de todos los trabajos
    oldest_date = db.session.query(func.min(Job.fecha)).scalar()
    if oldest_date:
        start_year = oldest_date.year
        start_month = oldest_date.month
    else:
        start_year = current_year
        start_month = current_month

    # Calcular la cantidad de meses entre el inicio y ahora
    months_diff = (current_year - start_year) * 12 + (current_month - start_month)

    meses_labels = []
    trabajos_mes = []
    facturacion_mes = []  # Facturación por mes
    trabajosPendientesMes = []

    for m in range(months_diff + 1):
        year = start_year + (start_month + m - 1) // 12
        month = (start_month + m - 1) % 12 + 1
        label = datetime(year, month, 1).strftime('%b %Y')
        meses_labels.append(label)
        
        # Contar trabajos de este mes
        count = Job.query.filter(
            func.extract('year', Job.fecha) == year,
            func.extract('month', Job.fecha) == month
        ).count()
        trabajos_mes.append(count)
        
        # Calcular facturación de trabajos completados para este mes
        facturacion = db.session.query(func.coalesce(func.sum(Job.cantidad), 0)).filter(
            func.extract('year', Job.fecha) == year,
            func.extract('month', Job.fecha) == month,
            Job.estado == 'Completado'
        ).scalar() or 0
        facturacion_mes.append(float(facturacion))
        
        # Contar trabajos pendientes de este mes
        pending_count = Job.query.filter(
            func.extract('year', Job.fecha) == year,
            func.extract('month', Job.fecha) == month,
            Job.estado == 'Pendiente'
        ).count()
        trabajosPendientesMes.append(pending_count)
    
    # Preparar eventos para el calendario
    jobs_for_calendar = Job.query.filter(Job.fecha != None).all()
    eventos_calendario = []
    for job in jobs_for_calendar:
        eventos_calendario.append({
            'titulo': f"{job.nombre_cliente} {job.apellido_cliente or ''}",
            'start': job.fecha.strftime('%Y-%m-%d')
        })
    
    page = request.args.get('page', 1, type=int)
    per_page = 10
    trabajos_pendientes_proceso = Job.query.filter(Job.estado.in_(['Pendiente', 'En Proceso'])) \
                                           .order_by(Job.updated_at.desc()) \
                                           .paginate(page=page, per_page=per_page, error_out=False)

    # Datos de técnicos activos y sus trabajos completados
    tecnicos_activos = Technician.query.filter_by(available=True).all()
    datos_tecnicos = []
    for tecnico in tecnicos_activos:
        trabajos_tech_completados = Job.query.filter_by(
            technician_id=tecnico.id, 
            estado='Completado'
        ).count()
        datos_tecnicos.append({
            'nombre': f"{tecnico.nombre} {tecnico.apellido or ''}".strip(),
            'trabajos_completados': trabajos_tech_completados
        })
    # Ordenar y filtrar técnicos
    datos_tecnicos = sorted(datos_tecnicos, key=lambda x: x['trabajos_completados'], reverse=True)
    datos_tecnicos = [t for t in datos_tecnicos if t['trabajos_completados'] > 0]
    
    # Variables adicionales
    num_trabajos = total_trabajos
    num_trabajos_pendientes = trabajos_pendientes
    num_trabajos_completados = trabajos_completados
    num_trabajos_en_proceso = Job.query.filter_by(estado='En Proceso').count()
    
    # Calcular facturación total
    facturacion_total = db.session.query(func.coalesce(func.sum(Job.cantidad), 0)).scalar() or 0
    facturacion_total = round(float(facturacion_total), 2)

    # Datos para el gráfico de distribución filtrable por mes y año
    datos_tecnicos_por_fecha = {}
    años_disponibles = []
    
    # Consultar todos los años que tienen trabajos
    años_query = db.session.query(
        distinct(extract('year', Job.fecha)).label('year')
    ).filter(Job.estado=='Completado').order_by('year').all()
    
    años_disponibles = [int(año.year) for año in años_query]
    
    # Si no hay años, añadimos el año actual para evitar errores
    if not años_disponibles:
        años_disponibles = [datetime.now().year]
    
    # Para cada año y mes, preparamos datos de técnicos
    for año in años_disponibles:
        for mes in range(1, 13):
            # Obtenemos trabajos completados de este mes/año
            inicio_mes = datetime(año, mes, 1)
            if mes == 12:
                fin_mes = datetime(año + 1, 1, 1) - timedelta(days=1)
            else:
                fin_mes = datetime(año, mes + 1, 1) - timedelta(days=1)
            
            # Subquery para contar trabajos completados por técnico en este período
            trabajos_por_tecnico = db.session.query(
                Job.technician_id,
                func.count(Job.id).label('trabajos_completados')
            ).filter(
                Job.estado=='Completado',
                Job.fecha >= inicio_mes,
                Job.fecha <= fin_mes
            ).group_by(Job.technician_id).subquery()
            
            # Consulta final con JOIN
            resultados = db.session.query(
                Technician.id,
                Technician.nombre,
                Technician.apellido,
                trabajos_por_tecnico.c.trabajos_completados
            ).join(
                trabajos_por_tecnico,
                Technician.id == trabajos_por_tecnico.c.technician_id
            ).filter(
                trabajos_por_tecnico.c.trabajos_completados > 0
            ).all()
            
            # Sólo añadimos a nuestro diccionario si hay datos
            if resultados:
                clave_fecha = f"{año}-{mes:02d}"
                datos_tecnicos_por_fecha[clave_fecha] = [
                    {
                        'id': r.id,
                        'nombre': f"{r.nombre} {r.apellido or ''}".strip(),
                        'trabajos_completados': r.trabajos_completados
                    } for r in resultados
                ]

    return render_template('dashboard_admin.html',
                           trabajos_recientes=trabajos_recientes,
                           total_usuarios=total_usuarios,
                           total_trabajos=total_trabajos,
                           trabajos_pendientes=trabajos_pendientes,
                           trabajos_completados=trabajos_completados,
                           meses_labels=meses_labels,
                           trabajos_mes=trabajos_mes,
                           facturacion_mes=facturacion_mes,
                           trabajosPendientesMes=trabajosPendientesMes,
                           eventos_calendario=eventos_calendario,
                           trabajos_pendientes_proceso=trabajos_pendientes_proceso,
                           num_trabajos=num_trabajos,
                           num_trabajos_pendientes=num_trabajos_pendientes,
                           num_trabajos_completados=num_trabajos_completados,
                           num_trabajos_en_proceso=num_trabajos_en_proceso,
                           facturacion_total=facturacion_total,
                           datos_tecnicos=datos_tecnicos,
                           datos_tecnicos_por_fecha=datos_tecnicos_por_fecha,
                           años_disponibles=años_disponibles,
                           generate_dashboard_row=generate_dashboard_work_row)

@jobs_bp.route('/api/dashboard_stats')
@login_required
def dashboard_stats():
    stats = {
        "trabajos": Job.query.count(),
        "pendientes": Job.query.filter_by(estado="Pendiente").count(),
        "completados": Job.query.filter_by(estado="Completado").count()
    }
    return jsonify(stats)

@jobs_bp.route('/listar_trabajos')
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
    page = request.args.get('page', 1, type=int)
    per_page = 10
    
    cliente_filter = request.args.get('cliente', '')
    tecnico_filter = request.args.get('tecnico', '')
    fecha_inicio = request.args.get('fecha_inicio', '')
    fecha_fin = request.args.get('fecha_fin', '')
    
    query = Job.query.filter_by(estado='Completado')
    
    if cliente_filter:
        query = query.filter(
            (Job.nombre_cliente.ilike(f'%{cliente_filter}%')) |
            (Job.apellido_cliente.ilike(f'%{cliente_filter}%'))
        )
    
    if tecnico_filter:
        query = query.filter(Job.technician_id == int(tecnico_filter))
    
    if fecha_inicio:
        try:
            fecha_inicio_obj = datetime.strptime(fecha_inicio, '%Y-%m-%d')
            query = query.filter(Job.fecha >= fecha_inicio_obj)
        except ValueError:
            flash("Formato de fecha inválido", "warning")
    
    if fecha_fin:
        try:
            fecha_fin_obj = datetime.strptime(fecha_fin, '%Y-%m-%d')
            query = query.filter(Job.fecha <= fecha_fin_obj)
        except ValueError:
            flash("Formato de fecha inválido", "warning")
    
    trabajos = query.order_by(Job.fecha.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    tecnicos = Technician.query.all()
    
    return render_template(
        'historial.html', 
        trabajos=trabajos, 
        tecnicos=tecnicos,
        generate_history_row=generate_history_row
    )
