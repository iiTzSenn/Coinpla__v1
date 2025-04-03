# Importar los modelos directamente desde models.py
from app.models.models import Job, Technician, User, JobHistory, JobCategory, JobComment, JobFile

# Exportar los modelos para que puedan ser importados desde app.models
__all__ = ["Job", "Technician", "User", "JobHistory", "JobCategory", "JobComment", "JobFile"]
