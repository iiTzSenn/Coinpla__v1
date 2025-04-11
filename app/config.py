import os
from dotenv import load_dotenv

# Carga las variables de entorno desde .env
load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')  # <- Muy importante
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CACHE_TYPE = os.environ.get('CACHE_TYPE', 'simple')

    # Configuración para Flask-Mail con Gmail
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')  # Configurar en variables de entorno
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')  # Configurar en variables de entorno
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER')  # Configurar en variables de entorno

    # Configuración para Amazon SES
    AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
    AWS_REGION = os.environ.get('AWS_REGION', 'us-east-1')
