from app.services.pdf_generator import generar_pdf
from app.services.email_service import enviar_email
from app import create_app
import os

def test_generar_y_enviar_documentos():
    app = create_app()
    with app.app_context():
        # Datos de prueba
        comprobante_context = {
            'nombre_cliente': 'Juan',
            'apellido_cliente': 'Perez',
            'fecha': '2025-04-09',
            'detalles': 'Reparacion de aire acondicionado'
        }

        factura_context = {
            'nombre_cliente': 'Juan',
            'apellido_cliente': 'Perez',
            'fecha': '2025-04-09',
            'monto': 150.00
        }

        # Generar PDFs
        comprobante_pdf = generar_pdf('comprobantes/comprobante_template.html', comprobante_context)
        factura_pdf = generar_pdf('facturas/factura_template.html', factura_context)

        print(f"Comprobante generado: {comprobante_pdf}")
        print(f"Factura generada: {factura_pdf}")

        # Enviar correo básico sin adjuntos
        enviar_email(
            destinatario='pedrito01020304050607@gmail.com',
            asunto='Prueba de Comprobante y Factura',
            cuerpo='Este es un correo de prueba sin adjuntos.'
        )

        print("Correo básico enviado exitosamente.")

if __name__ == '__main__':
    test_generar_y_enviar_documentos()