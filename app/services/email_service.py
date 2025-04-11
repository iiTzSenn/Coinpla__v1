import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email.mime.application import MIMEApplication
from email import encoders
import os
import unicodedata
import re
from email.utils import formataddr
import logging
from flask import current_app

# Configurar el registro
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

def limpiar_nombre_archivo(nombre):
    nombre = unicodedata.normalize('NFKD', nombre).encode('ascii', 'ignore').decode('ascii')
    return re.sub(r'[^\w\s-]', '_', nombre)

def limpiar_texto(texto):
    # Normalizar el texto para eliminar caracteres especiales
    texto = unicodedata.normalize('NFKD', texto).encode('ascii', 'ignore').decode('ascii')
    return texto

def enviar_email(destinatario, asunto, cuerpo, adjuntos=None):
    """
    Envía un correo electrónico al destinatario especificado.
    
    Args:
        destinatario (str): Dirección de correo electrónico del destinatario
        asunto (str): Asunto del correo
        cuerpo (str): Cuerpo del mensaje
        adjuntos (list, optional): Lista de rutas a archivos adjuntos. Defaults to None.
    
    Returns:
        bool: True si el envío fue exitoso, False en caso contrario
    """
    logging.debug(f"Iniciando el envío de correo a {destinatario}")

    try:
        # En modo desarrollo, no enviamos correos reales, solo simulamos y guardamos los PDFs
        if not current_app.config.get('MAIL_SERVER'):
            logging.info('Modo desarrollo: No se enviará correo real.')
            logging.info(f'Destinatario: {destinatario}')
            logging.info(f'Asunto: {asunto}')
            logging.info(f'Adjuntos: {adjuntos}')
            # Devolvemos True porque en desarrollo consideramos exitoso aunque no se envíe realmente
            return True
        
        # Configuración del servidor de correo desde la configuración de la app
        servidor_smtp = current_app.config.get('MAIL_SERVER')
        puerto_smtp = current_app.config.get('MAIL_PORT')
        remitente = current_app.config.get('MAIL_USERNAME')
        contraseña = current_app.config.get('MAIL_PASSWORD')
        
        if not all([servidor_smtp, puerto_smtp, remitente, contraseña]):
            logging.error("Configuración de correo incompleta en config.py")
            return False

        logging.debug(f"Servidor SMTP: {servidor_smtp}, Puerto: {puerto_smtp}")
        logging.debug(f"Remitente: {remitente}, Destinatario: {destinatario}")

        # Crear el mensaje de correo
        mensaje = MIMEMultipart()
        mensaje['From'] = formataddr(("COINPLA Servicios Técnicos", remitente))
        mensaje['To'] = destinatario
        mensaje['Subject'] = limpiar_texto(asunto)

        # Agregar el cuerpo del mensaje
        mensaje.attach(MIMEText(limpiar_texto(cuerpo), 'plain'))

        # Agregar archivos adjuntos si existen
        if adjuntos:
            for ruta_adjunto in adjuntos:
                if os.path.exists(ruta_adjunto):
                    nombre_adjunto = os.path.basename(ruta_adjunto)
                    # Asegurarse de que el nombre del archivo termine en .pdf
                    if not nombre_adjunto.lower().endswith('.pdf'):
                        nombre_adjunto += '.pdf'
                    nombre_limpio = limpiar_nombre_archivo(nombre_adjunto)
                    
                    # Leer el archivo
                    with open(ruta_adjunto, 'rb') as archivo:
                        contenido_archivo = archivo.read()
                    
                    # Usar MIMEApplication específicamente para PDFs
                    parte = MIMEApplication(contenido_archivo, _subtype='pdf')
                    
                    # Agregar cabeceras
                    parte.add_header(
                        'Content-Disposition',
                        f'attachment; filename="{nombre_limpio}"',
                    )
                    
                    mensaje.attach(parte)
                    logging.debug(f"Adjunto agregado: {nombre_limpio} (tipo: application/pdf)")
                else:
                    logging.warning(f"El archivo adjunto no existe: {ruta_adjunto}")

        # Enviar el correo
        with smtplib.SMTP(servidor_smtp, puerto_smtp) as servidor:
            servidor.starttls()
            servidor.login(remitente, contraseña)
            texto = mensaje.as_string()
            servidor.sendmail(remitente, destinatario, texto)
            
        logging.info('Correo enviado exitosamente.')
        return True
        
    except Exception as e:
        logging.error(f'Error al enviar el correo: {str(e)}')
        return False