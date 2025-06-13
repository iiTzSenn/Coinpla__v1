from datetime import datetime
from app.extensions import db
from app.models.models import Job
from app.models.service import ServiceType

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
        # Si se pasa solo el ID (y es un número), obtener el objeto ServiceType
        service_type_obj = None
        if service_type:
            try:
                service_type_id = int(service_type) if not hasattr(service_type, 'id') else service_type.id
                service_type_obj = ServiceType.query.get(service_type_id)
            except (ValueError, TypeError):
                service_type_obj = None

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
        if service_type_obj:
            trabajo.service_type_id = service_type_obj.id
        trabajo.service_subcategories = service_subcategories
        
        db.session.add(trabajo)
        db.session.commit()
        return trabajo
    
    @staticmethod
    def obtener_todos():
        """
        Obtiene todos los presupuestos (Jobs con estado='Pendiente'), ordenados del más nuevo al más antiguo
        """
        return Job.query.filter_by(estado='Pendiente').order_by(Job.fecha.desc(), Job.id.desc()).all()
    
    @staticmethod
    def obtener_por_id(id):
        """
        Obtiene un presupuesto específico por su ID, sin importar el estado
        """
        return Job.query.filter_by(id=id).first()
    
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
    
    @staticmethod
    def obtener_paginados(page, per_page):
        """
        Devuelve un objeto Pagination de presupuestos pendientes
        """
        return Job.query.filter_by(estado='Pendiente').order_by(Job.fecha.desc(), Job.id.desc()).paginate(page=page, per_page=per_page, error_out=False)