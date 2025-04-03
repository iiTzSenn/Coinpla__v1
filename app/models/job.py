from app.extensions import db

class Job(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre_cliente = db.Column(db.String(100), nullable=False)
    estado = db.Column(db.String(50), nullable=False)
    costo_estimado = db.Column(db.Float, nullable=True)
    tecnico_id = db.Column(db.Integer, db.ForeignKey('technician.id'), nullable=True)
    fecha = db.Column(db.Date, nullable=False)

    # Usar la ruta completamente calificada para evitar conflictos
    tecnico = db.relationship('app.models.technician.Technician', backref='trabajos')
