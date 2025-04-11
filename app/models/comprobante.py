from datetime import datetime
from app.extensions import db

class Comprobante(db.Model):
    """
    Modelo que representa un comprobante de servicio.
    """
    __tablename__ = 'comprobantes'
    
    id = db.Column(db.Integer, primary_key=True)
    trabajo_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    detalles = db.Column(db.Text, nullable=True)
    fecha_emision = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relación con el trabajo
    trabajo = db.relationship('Job', backref=db.backref('comprobante', lazy=True, uselist=False))
    
    def __repr__(self):
        return f'<Comprobante {self.id} - Trabajo #{self.trabajo_id}>'