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
             fecha, hora, duracion, tecnico_id, **kwargs):
        """
        Crea un nuevo presupuesto (un Job con estado='Pendiente')
        """
        from app.extensions import db
        
        # Crear el objeto Job que representará el presupuesto
        # Nota: El email se almacena en el campo descripcion con un prefijo especial
        descripcion_completa = f"Email: {email}\n\n{descripcion}"
        
        trabajo = Job(
            nombre_cliente=nombre_cliente,
            apellido_cliente=apellido_cliente,
            telefono=telefono,
            descripcion=descripcion_completa,  # Almacenamos el email aquí
            fecha=fecha,
            hora=hora,
            duracion=duracion,
            technician_id=tecnico_id,  # Mapear tecnico_id a technician_id
            direccion=kwargs.get('direccion', 'Pendiente de asignar'),
            estado='Pendiente'  # Cambiado de 'Presupuesto' a 'Pendiente'
        )
        
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