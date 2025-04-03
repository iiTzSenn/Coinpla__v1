from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models.models import Job, Technician, JobHistory, User
from app.extensions import db
from datetime import datetime, timedelta
from sqlalchemy import func, desc

api_bp = Blueprint('api', __name__, url_prefix='/api')

@api_bp.route('/dashboard-stats')
@login_required
def dashboard_stats():
    # Obtener estadísticas para el dashboard
    stats = {}
    
    # Si el usuario es técnico, obtener sus estadísticas específicas
    if current_user.role == 'tecnico' and current_user.technician_profile:
        tecnico = current_user.technician_profile
        stats = {
            "trabajos_realizados": Job.query.filter_by(technician_id=tecnico.id).count(), # Corregido de tecnico_id a technician_id
            "trabajos_pendientes": Job.query.filter_by(technician_id=tecnico.id, estado='Pendiente').count(), # Corregido
            "trabajos_completados": Job.query.filter_by(technician_id=tecnico.id, estado='Completado').count(), # Corregido
        }
    # Si es admin, obtener estadísticas generales
    else:
        stats = {
            "trabajos_totales": Job.query.count(),
            "trabajos_pendientes": Job.query.filter_by(estado='Pendiente').count(),
            "trabajos_completados": Job.query.filter_by(estado='Completado').count(),
            "tecnicos_activos": Technician.query.filter_by(available=True).count(),
        }
        
        # Calcular facturación total estimada
        total_facturation = db.session.query(func.sum(Job.costo_estimado)).scalar() or 0
        stats["facturacion_total"] = round(total_facturation, 2)
    
    return jsonify(stats)
