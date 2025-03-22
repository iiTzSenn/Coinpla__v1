import os
from dotenv import load_dotenv

# Carga las variables de entorno desde .env
load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')  # <- Muy importante
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CACHE_TYPE = os.environ.get('CACHE_TYPE', 'simple')
