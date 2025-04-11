import os
import sys

# Forzar UTF-8 en el entorno de Python
os.environ['PYTHONIOENCODING'] = 'utf-8'
if sys.version_info >= (3, 7):
    os.environ['PYTHONUTF8'] = '1'

from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)