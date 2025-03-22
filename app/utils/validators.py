import re

def verificar_telefono(numero):
    """
    Verifica si el número cumple el formato de teléfono español.
    """
    patron = re.compile(r'^(?:\+34[\s-]?)?(?:\d{3}[\s.-]?\d{3}[\s.-]?\d{3})$')
    return bool(patron.match(numero))
