from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models.models import Job, Technician, JobHistory, User
from app.extensions import db
from datetime import datetime, timedelta
from sqlalchemy import func, desc

# Este es el error: falta el argumento __name__
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
            "trabajos_realizados": Job.query.filter_by(technician_id=tecnico.id).count(), 
            "trabajos_pendientes": Job.query.filter_by(technician_id=tecnico.id, estado='Pendiente').count(),
            "trabajos_completados": Job.query.filter_by(technician_id=tecnico.id, estado='Completado').count(),
        }
    # Si es admin, obtener estadísticas generales
    else:
        stats = {
            "trabajos": Job.query.count(),
            "pendientes": Job.query.filter_by(estado='Pendiente').count(),
            "completados": Job.query.filter_by(estado='Completado').count(),
            "tecnicos_activos": Technician.query.filter_by(available=True).count(),
        }
    
    return jsonify(stats)
