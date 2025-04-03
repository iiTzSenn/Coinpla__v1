import os
from flask import Flask
from dotenv import load_dotenv

from app.config import Config
from app.extensions import db, login_manager, mail, cache, migrate

# Carga el .env (ya se carga en config, pero por si acaso)
load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Inicialización de extensiones
    db.init_app(app)
    mail.init_app(app)
    cache.init_app(app)
    login_manager.init_app(app)
    migrate.init_app(app, db)

    login_manager.login_view = 'auth.login'
    login_manager.login_message = None

    with app.app_context():
        # Importar modelos aquí para evitar problemas de importación circular
        from app.models.models import User
        
        @login_manager.user_loader
        def load_user(user_id):
            return User.query.get(int(user_id))

    # Registro de rutas (blueprints)
    from app.routes.auth import auth_bp
    from app.routes.jobs import jobs_bp
    from app.routes.technicians import tech_bp
    from app.routes.admin import admin_bp
    from app.routes.export import export_bp
    from app.routes.users import users_bp
    from .routes.api import api_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(jobs_bp)
    app.register_blueprint(tech_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(export_bp)
    app.register_blueprint(users_bp, url_prefix='/users')
    app.register_blueprint(api_bp)

    return app
