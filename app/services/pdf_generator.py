import os
from datetime import datetime
from flask import render_template, current_app
import pdfkit
import logging

# Configurar el registro
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

def generar_pdf(template_path, context):
    """
    Genera un archivo PDF a partir de una plantilla HTML y contexto proporcionados.
    
    Args:
        template_path (str): Ruta a la plantilla HTML relativa a la carpeta templates
        context (dict): Contexto con los datos para rellenar la plantilla
    
    Returns:
        str: Ruta al archivo PDF generado
    """
    logging.debug(f"Generando PDF con plantilla: {template_path}")
    
    # Determinar el tipo de documento basado en el template_path
    tipo_documento = 'documento'
    if 'presupuestos/' in template_path:
        tipo_documento = 'presupuesto'
        subdirectorio = 'presupuestos'
    elif 'comprobantes/' in template_path:
        tipo_documento = 'comprobante'
        subdirectorio = 'comprobantes'
    elif 'facturas/' in template_path:
        tipo_documento = 'factura'
        subdirectorio = 'facturas'
    else:
        subdirectorio = ''
    
    logging.debug(f"Tipo de documento: {tipo_documento}, subdirectorio: {subdirectorio}")
    
    # Crear la carpeta de salida específica para el tipo de documento
    output_dir = os.path.join(current_app.root_path, 'static', 'pdfs', subdirectorio)
    os.makedirs(output_dir, exist_ok=True)
    
    # Extraer datos del contexto según el tipo de documento
    if tipo_documento == 'presupuesto':
        datos = context.get('presupuesto', {})
    elif tipo_documento == 'comprobante':
        datos = context.get('comprobante', {})
    elif tipo_documento == 'factura':
        datos = context.get('factura', {})
    else:
        datos = context
    
    # Generar el nombre del archivo con timestamp para evitar sobrescritura
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    nombre_cliente = datos.get('nombre_cliente', 'cliente')
    apellido_cliente = datos.get('apellido_cliente', '')
    id_documento = datos.get('id', '')
    
    file_name = f"{tipo_documento}_{nombre_cliente}_{apellido_cliente}_{id_documento}_{timestamp}.pdf"
    # Limpiar el nombre del archivo para evitar caracteres especiales
    file_name = ''.join(c if c.isalnum() or c in ['_', '-', '.'] else '_' for c in file_name)
    file_path = os.path.join(output_dir, file_name)
    
    logging.debug(f"Ruta del archivo PDF a generar: {file_path}")
    
    try:
        # Renderizar la plantilla HTML con el contexto
        html_content = render_template(template_path, **context)
        
        # Opciones para la generación del PDF
        options = {
            'page-size': 'A4',
            'margin-top': '0.75in',
            'margin-right': '0.75in',
            'margin-bottom': '0.75in',
            'margin-left': '0.75in',
            'encoding': "UTF-8",
            'no-outline': None,
            'quiet': ''
        }
        
        # Generar el PDF
        try:
            # Intentar usar wkhtmltopdf si está instalado
            pdfkit.from_string(html_content, file_path, options=options)
            logging.info(f"PDF generado con éxito usando pdfkit: {file_path}")
        except Exception as e:
            logging.error(f"Error al generar PDF con pdfkit: {str(e)}")
            logging.info("Intentando método alternativo...")
            
            # Si falla, usar un método alternativo más básico
            from reportlab.lib.pagesizes import letter
            from reportlab.pdfgen import canvas
            from reportlab.lib.styles import getSampleStyleSheet
            from reportlab.platypus import SimpleDocTemplate, Paragraph
            
            doc = SimpleDocTemplate(file_path, pagesize=letter)
            styles = getSampleStyleSheet()
            story = []
            
            # Título
            story.append(Paragraph(f"{tipo_documento.upper()}", styles['Title']))
            
            # Datos del cliente
            story.append(Paragraph(f"Cliente: {nombre_cliente} {apellido_cliente}", styles['Normal']))
            story.append(Paragraph(f"Fecha: {datos.get('fecha', '')}", styles['Normal']))
            
            # Contenido específico según el tipo de documento
            if tipo_documento == 'presupuesto':
                story.append(Paragraph(f"Hora: {datos.get('hora', '')}", styles['Normal']))
                story.append(Paragraph(f"Técnico: {datos.get('tecnico', '')}", styles['Normal']))
                story.append(Paragraph(f"Duración: {datos.get('duracion', '')}", styles['Normal']))
                story.append(Paragraph("Descripción:", styles['Heading2']))
                story.append(Paragraph(datos.get('descripcion', ''), styles['Normal']))
            elif tipo_documento == 'comprobante':
                story.append(Paragraph("Detalles del servicio:", styles['Heading2']))
                story.append(Paragraph(datos.get('detalles', ''), styles['Normal']))
            elif tipo_documento == 'factura':
                story.append(Paragraph(f"Importe total: {datos.get('monto', '0')} €", styles['Heading2']))
                story.append(Paragraph("Forma de pago: Transferencia bancaria", styles['Normal']))
                story.append(Paragraph("Cuenta: ES76 2100 0418 4502 0005 1332", styles['Normal']))
            
            # Pie de página
            story.append(Paragraph("COINPLA - Servicios Técnicos", styles['Normal']))
            story.append(Paragraph("Email: info@coinpla.es | Teléfono: +34 910 123 456", styles['Normal']))
            
            # Generar el PDF
            doc.build(story)
            logging.info(f"PDF generado con éxito usando método alternativo: {file_path}")
        
        return file_path
        
    except Exception as e:
        logging.error(f"Error al generar el PDF: {str(e)}")
        # En caso de error, generar un PDF simplificado como último recurso
        create_basic_pdf(file_path, tipo_documento, datos)
        return file_path

def create_basic_pdf(file_path, tipo_documento, datos):
    """
    Crea un PDF básico como último recurso en caso de fallar los otros métodos.
    
    Args:
        file_path (str): Ruta donde guardar el PDF
        tipo_documento (str): Tipo de documento (presupuesto, comprobante, factura)
        datos (dict): Datos para incluir en el PDF
    """
    logging.info(f"Creando PDF básico como último recurso: {file_path}")
    
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    
    c = canvas.Canvas(file_path, pagesize=letter)
    c.setFont("Helvetica-Bold", 16)
    
    # Título del documento
    c.drawString(100, 750, f"{tipo_documento.upper()}")
    
    c.setFont("Helvetica-Bold", 12)
    nombre_cliente = datos.get('nombre_cliente', '')
    apellido_cliente = datos.get('apellido_cliente', '')
    c.drawString(100, 720, f"Cliente: {nombre_cliente} {apellido_cliente}")
    
    c.setFont("Helvetica", 12)
    c.drawString(100, 700, f"Fecha: {datos.get('fecha', '')}")
    
    y_pos = 680
    
    if tipo_documento == 'presupuesto':
        c.drawString(100, y_pos, f"Hora: {datos.get('hora', '')}"); y_pos -= 20
        c.drawString(100, y_pos, f"Técnico: {datos.get('tecnico', '')}"); y_pos -= 20
        c.drawString(100, y_pos, f"Duración: {datos.get('duracion', '')}"); y_pos -= 40
        
        c.setFont("Helvetica-Bold", 12)
        c.drawString(100, y_pos, "DESCRIPCIÓN DEL TRABAJO:"); y_pos -= 20
        c.setFont("Helvetica", 12)
        
        descripcion = datos.get('descripcion', '')
        for i in range(0, len(descripcion), 70):
            c.drawString(120, y_pos, descripcion[i:i+70]); y_pos -= 20
    
    elif tipo_documento == 'comprobante':
        c.setFont("Helvetica-Bold", 12)
        c.drawString(100, y_pos, "DETALLES DEL SERVICIO:"); y_pos -= 20
        c.setFont("Helvetica", 12)
        
        detalles = datos.get('detalles', '')
        for i in range(0, len(detalles), 70):
            c.drawString(120, y_pos, detalles[i:i+70]); y_pos -= 20
    
    elif tipo_documento == 'factura':
        c.setFont("Helvetica-Bold", 12)
        c.drawString(100, y_pos, f"IMPORTE TOTAL: {datos.get('monto', '0')} €"); y_pos -= 40
        c.setFont("Helvetica", 12)
        c.drawString(100, y_pos, "Forma de pago: Transferencia bancaria"); y_pos -= 20
        c.drawString(100, y_pos, "Cuenta: ES76 2100 0418 4502 0005 1332"); y_pos -= 20
    
    # Pie de página
    c.setFont("Helvetica", 10)
    c.drawString(100, 100, "COINPLA - Servicios Técnicos")
    c.drawString(100, 80, "Email: info@coinpla.es | Teléfono: +34 910 123 456")
    
    c.save()
    logging.info(f"PDF básico creado exitosamente: {file_path}")