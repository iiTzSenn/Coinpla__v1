import json
from markupsafe import Markup

def nl2br(value):
    """
    Convierte saltos de línea en etiquetas <br/>
    """
    if not value:
        return ""
    return Markup(value.replace('\n', '<br/>'))

def from_json(value):
    """
    Convierte una cadena JSON en un objeto Python
    """
    if not value:
        return []
    try:
        return json.loads(value)
    except (ValueError, TypeError):
        return []
