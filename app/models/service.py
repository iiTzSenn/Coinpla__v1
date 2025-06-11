from app.extensions import db
from datetime import datetime

class ServiceType(db.Model):
    """
    Modelo para los tipos de servicios principales
    """
    __tablename__ = 'service_types'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    subcategories = db.relationship('ServiceSubcategory', backref='service_type', lazy=True, cascade="all, delete-orphan")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<ServiceType {self.id}: {self.name}>'


class ServiceSubcategory(db.Model):
    """
    Modelo para las subcategorías de servicios (por ejemplo, tipos de plagas, tipos de desatascos)
    """
    __tablename__ = 'service_subcategories'

    id = db.Column(db.Integer, primary_key=True)
    service_type_id = db.Column(db.Integer, db.ForeignKey('service_types.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<ServiceSubcategory {self.id}: {self.name}>'


class MaintenancePlan(db.Model):
    """
    Modelo para los planes de mantenimiento asociados a un trabajo
    """
    __tablename__ = 'maintenance_plans'

    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    frequency = db.Column(db.String(50), nullable=False)  # Mensual, Bimensual, etc.
    duration = db.Column(db.Integer)  # Duración en meses
    start_date = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<MaintenancePlan {self.id}: {self.frequency}>'
