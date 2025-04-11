from datetime import datetime
from app.extensions import db

class Factura(db.Model):
    """
    Modelo que representa una factura asociada a un trabajo.
    """
    __tablename__ = 'facturas'
    
    id = db.Column(db.Integer, primary_key=True)
    trabajo_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    monto = db.Column(db.Float, nullable=False)
    fecha_emision = db.Column(db.DateTime, default=datetime.utcnow)
    pagada = db.Column(db.Boolean, default=False)
    
    # Relación con el trabajo
    trabajo = db.relationship('Job', backref=db.backref('factura', lazy=True, uselist=False))
    
    def __repr__(self):
        return f'<Factura {self.id} - Trabajo #{self.trabajo_id} - {self.monto}€>'