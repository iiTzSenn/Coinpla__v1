# Importar los modelos directamente desde models.py
from app.models.models import Job, Technician, User, JobHistory, JobCategory, JobComment, JobFile
from app.models.presupuesto import Presupuesto
from app.models.comprobante import Comprobante
from app.models.factura import Factura

# Exportar los modelos para que puedan ser importados desde app.models
__all__ = [
    "Job", "Technician", "User", "JobHistory", "JobCategory", "JobComment", "JobFile",
    "Presupuesto", "Comprobante", "Factura"
]
