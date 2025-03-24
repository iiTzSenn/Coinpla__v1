import re

def validar_y_normalizar_telefono(numero):
    """
    Valida y normaliza un número de teléfono español.
    Acepta formatos con o sin prefijo +34 y diferentes separadores.
    Devuelve el número en formato E.164 (sin +): '34XXXXXXXXX'
    Lanza ValueError si el número no es válido.
    """
    if not numero:
        raise ValueError("El número está vacío")

    # Eliminar espacios, guiones y puntos
    limpio = re.sub(r'[^\d+]', '', numero)

    # Normalización de prefijos
    if limpio.startswith('+34'):
        limpio = '34' + limpio[3:]
    elif limpio.startswith('0034'):
        limpio = '34' + limpio[4:]
    elif limpio.startswith('34'):
        pass
    elif limpio.startswith('6') or limpio.startswith('7') or limpio.startswith('9'):
        limpio = '34' + limpio
    else:
        raise ValueError("Prefijo inválido o número no válido")

    # Validar que tiene exactamente 11 dígitos (34 + 9 cifras)
    if not re.fullmatch(r'34\d{9}', limpio):
        raise ValueError("Formato de número no válido. Ej: +34 612345678 o 612-345-678")

    return limpio
