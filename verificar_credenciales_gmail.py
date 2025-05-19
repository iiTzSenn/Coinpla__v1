import os
import smtplib
from dotenv import load_dotenv
import ssl

def verificar_credenciales():
    # Cargar variables de entorno
    load_dotenv()
    
    # Obtener credenciales
    mail_username = os.environ.get('MAIL_USERNAME')
    mail_password = os.environ.get('MAIL_PASSWORD')
    
    print(f"Verificando credenciales para: {mail_username}")
    
    try:
        # Crear contexto SSL para conexión segura
        context = ssl.create_default_context()
        
        # Intentar conectar al servidor SMTP de Gmail
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.ehlo()
        server.starttls(context=context)  # Usar contexto SSL para starttls
        server.ehlo()  # Necesario después de STARTTLS
        server.login(mail_username, mail_password)
        
        print("✅ ¡Conexión exitosa! Las credenciales son correctas.")
        server.quit()
        return True
    except Exception as e:
        print(f"❌ Error de conexión: {str(e)}")
        return False

if __name__ == "__main__":
    verificar_credenciales()