from flask import Blueprint, render_template, request, make_response
from flask_login import login_required, current_user
from datetime import datetime
from sqlalchemy import func
import pdfkit

from app.models.models import Job, Technician
from app.extensions import db

export_bp = Blueprint('export', __name__)

# Ruta al ejecutable de wkhtmltopdf (ajústala si estás en Linux o Mac)
pdfkit_config = pdfkit.configuration(wkhtmltopdf=r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe')

@export_bp.route('/export/pdf')
@login_required
def exportar_pdf():
    query = Job.query.filter_by(estado='Completado')
    cliente = request.args.get('cliente')
    fecha_inicio = request.args.get('fecha_inicio')
    fecha_fin = request.args.get('fecha_fin')
    tecnico = request.args.get('tecnico')

    if cliente:
        query = query.filter(func.concat(Job.nombre_cliente, ' ', Job.apellido_cliente).ilike(f'%{cliente}%'))
    if fecha_inicio:
        try:
            query = query.filter(Job.fecha >= datetime.strptime(fecha_inicio, '%Y-%m-%d'))
        except:
            pass
    if fecha_fin:
        try:
            query = query.filter(Job.fecha <= datetime.strptime(fecha_fin, '%Y-%m-%d'))
        except:
            pass
    if tecnico:
        query = query.join(Technician).filter(func.concat(Technician.nombre, ' ', Technician.apellido).ilike(f'%{tecnico}%'))

    trabajos = query.order_by(Job.updated_at.desc()).all()

    # Construcción del asunto dinámico
    filtros = []
    if cliente: filtros.append(f"Cliente: {cliente}")
    if fecha_inicio: filtros.append(f"Desde: {fecha_inicio}")
    if fecha_fin: filtros.append(f"Hasta: {fecha_fin}")
    if tecnico: filtros.append(f"Técnico: {tecnico}")

    asunto = " | ".join(filtros) if filtros else "Historial de trabajos completados"
    fecha_actual = datetime.now().strftime('%d/%m/%Y')

    html = render_template(
        'export_pdf.html',
        trabajos=trabajos,
        fecha_actual=fecha_actual,
        version="1.0",
        autor=current_user.username,
        asunto=asunto
    )

    pdf = pdfkit.from_string(html, False, configuration=pdfkit_config, options={
        'orientation': 'Landscape',
        'page-size': 'A4',
        'margin-top': '10mm',
        'margin-bottom': '20mm',
        'enable-local-file-access': '',
    })

    response = make_response(pdf)
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = 'inline; filename=historial.pdf'
    return response
