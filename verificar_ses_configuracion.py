# Verificar si Amazon SES está configurado correctamente
import boto3
from botocore.exceptions import NoCredentialsError, PartialCredentialsError
import os

def verificar_ses_configuracion():
    try:
        ses_client = boto3.client(
            'ses',
            aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
            region_name=os.environ.get('AWS_REGION', 'us-east-1')
        )

        # Obtener las direcciones de correo verificadas
        response = ses_client.list_verified_email_addresses()
        print("Direcciones de correo verificadas:", response['VerifiedEmailAddresses'])

        # Verificar el estado de la cuenta SES
        account_details = ses_client.get_account_sending_enabled()
        print("Envío habilitado:", account_details['Enabled'])

    except NoCredentialsError:
        print("Error: No se encontraron credenciales de AWS.")
    except PartialCredentialsError:
        print("Error: Credenciales de AWS incompletas.")
    except Exception as e:
        print(f"Error al verificar la configuración de SES: {e}")

if __name__ == '__main__':
    verificar_ses_configuracion()