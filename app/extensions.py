from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_mail import Mail
from flask_caching import Cache
from flask_migrate import Migrate

db = SQLAlchemy()
login_manager = LoginManager()
mail = Mail()
cache = Cache()
migrate = Migrate()
