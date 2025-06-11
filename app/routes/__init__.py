# rutas de la aplicación

from app.routes.auth import auth_bp
from app.routes.jobs import jobs_bp
from app.routes.technicians import tech_bp
from app.routes.admin import admin_bp
from app.routes.api import api_bp
from app.routes.presupuestos import presupuestos_bp

def register_blueprints(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(jobs_bp)
    app.register_blueprint(tech_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(api_bp)
    app.register_blueprint(presupuestos_bp)