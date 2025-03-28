from datetime import datetime
from app.extensions import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model, UserMixin):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='tecnico')
    verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Relación opcional para usuarios de rol técnico
    technician_profile = db.relationship('Technician', backref='user', uselist=False)

    def __init__(self, username, email, password, role='tecnico'):
        self.username = username
        self.email = email
        self.set_password(password)
        self.role = role
        self.verified = False

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @property
    def get_role_display(self):
        if self.role == 'admin':
            return 'Administrador'
        return self.role.capitalize()  # Capitalizar otros roles

    def __repr__(self):
        return f'<User {self.username}>'

class Technician(db.Model):
    __tablename__ = 'technicians'
    
    id = db.Column(db.Integer, primary_key=True)
    # Llave foránea para relacionar con el usuario, opcional inicialmente
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100))
    email = db.Column(db.String(100))
    telefono = db.Column(db.String(20))
    especialidad = db.Column(db.String(100))
    available = db.Column(db.Boolean, default=True)
    workload = db.Column(db.Integer, default=0)
    direccion = db.Column(db.String(200))
    latitud = db.Column(db.Float)
    longitud = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    jobs = db.relationship('Job', backref='technician', lazy=True)

    def __repr__(self):
        return f'<Technician {self.nombre} {self.apellido}>'

class JobCategory(db.Model):
    __tablename__ = 'job_categories'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)

    def __repr__(self):
        return f'<JobCategory {self.nombre}>'

class Job(db.Model):
    __tablename__ = 'jobs'

    id = db.Column(db.Integer, primary_key=True)
    nombre_cliente = db.Column(db.String(100), nullable=False)
    apellido_cliente = db.Column(db.String(100))
    direccion = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text, nullable=False)
    telefono = db.Column(db.String(20))
    codigo_postal = db.Column(db.String(10))
    duracion = db.Column(db.String(10), nullable=False)
    fecha = db.Column(db.DateTime, nullable=False)
    hora = db.Column(db.String(10), nullable=False)
    technician_id = db.Column(db.Integer, db.ForeignKey('technicians.id'), nullable=True)
    estado = db.Column(db.String(20), default='Pendiente')
    categoria_id = db.Column(db.Integer, db.ForeignKey('job_categories.id'), nullable=True)
    prioridad = db.Column(db.String(20), default='Normal')
    costo_estimado = db.Column(db.Float, default=0)
    costo_final = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    history = db.relationship('JobHistory', backref='job', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Job {self.id}: {self.nombre_cliente} {self.apellido_cliente}>'

class JobHistory(db.Model):
    __tablename__ = 'job_history'

    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    action = db.Column(db.String(50), nullable=False)
    details = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<JobHistory {self.id}: {self.action} on Job {self.job_id}>'

class JobComment(db.Model):
    __tablename__ = 'job_comments'

    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id', ondelete="CASCADE"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    contenido = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<JobComment {self.id} for Job {self.job_id}>'

class JobFile(db.Model):
    __tablename__ = 'job_files'

    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id', ondelete="CASCADE"), nullable=False)
    filename = db.Column(db.String(200), nullable=False)
    filepath = db.Column(db.String(500), nullable=False)
    filetype = db.Column(db.String(50))
    filesize = db.Column(db.Integer)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<JobFile {self.filename} for Job {self.job_id}>'
