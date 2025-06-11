from datetime import datetime
from app.extensions import db
from app.models.models import Job

class Presupuesto:
    """
    Clase auxiliar que actúa como un adaptador para el modelo Job.
    En lugar de usar herencia, esta clase se encarga de crear y manipular
    objetos Job con estados de presupuesto.
    """
    @staticmethod
    def crear(nombre_cliente, apellido_cliente, telefono, email, descripcion, 
             fecha, hora, duracion, tecnico_id, cantidad=0, tipo_plaga=None, direccion=None, codigo_postal=None,
             service_type=None, service_subcategories=None, enable_maintenance=False, 
             maintenance_frequency=None, maintenance_duration=None, **kwargs):
        """
        Crea un nuevo presupuesto (un Job con estado='Pendiente')
        """
        from app.extensions import db
        
        # Crear el objeto Job que representará el presupuesto
        trabajo = Job(
            nombre_cliente=nombre_cliente,
            apellido_cliente=apellido_cliente,
            telefono=telefono,
            email=email,
            descripcion=descripcion,
            fecha=fecha,
            hora=hora,
            duracion=duracion,
            cantidad=cantidad,
            tipo_plaga=tipo_plaga,
            technician_id=tecnico_id,
            direccion=direccion if direccion else 'Pendiente de asignar',
            codigo_postal=codigo_postal,
            estado='Pendiente'
        )
          # Guardar la información del servicio
        if service_type:
            trabajo.service_type_id = service_type.id if hasattr(service_type, 'id') else None
        trabajo.service_subcategories = service_subcategories
        
        db.session.add(trabajo)
        db.session.commit()
        return trabajo
    
    @staticmethod
    def obtener_todos():
        """
        Obtiene todos los presupuestos (Jobs con estado='Pendiente')
        """
        return Job.query.filter_by(estado='Pendiente').all()
    
    @staticmethod
    def obtener_por_id(id):
        """
        Obtiene un presupuesto específico por su ID
        """
        return Job.query.filter_by(id=id, estado='Pendiente').first()
    
    @staticmethod
    def extraer_email(trabajo):
        """
        Extrae el email del campo descripción si existe
        """
        if trabajo.descripcion and trabajo.descripcion.startswith("Email:"):
            lineas = trabajo.descripcion.split("\n\n", 1)
            if len(lineas) >= 1:
                return lineas[0].replace("Email:", "").strip()
        return ""
    
    @staticmethod
    def extraer_descripcion_sin_email(trabajo):
        """
        Extrae solo la descripción sin el email
        """
        if trabajo.descripcion and trabajo.descripcion.startswith("Email:"):
            lineas = trabajo.descripcion.split("\n\n", 1)
            if len(lineas) > 1:
                return lineas[1]
        return trabajo.descripcion