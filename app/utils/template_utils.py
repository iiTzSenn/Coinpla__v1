def generate_row_html(trabajo):
    """
    Genera HTML para filas de tabla de trabajos
    """
    technician_name = f"{trabajo.technician.nombre} {trabajo.technician.apellido or ''}" if trabajo.technician else "Sin asignar"
    status_class = "status-pending" if trabajo.estado in ["Pendiente", "En Proceso"] else "status-paid"
    
    return f"""
    <tr>
      <td class="text-center"><a href="/jobs/{trabajo.id}">Nº_{trabajo.id}</a></td>
      <td class="text-center">{trabajo.nombre_cliente} {trabajo.apellido_cliente or ''}</td>
      <td class="text-center">{trabajo.fecha.strftime("%d/%m/%Y")}</td>
      <td class="text-center"><p class="status {status_class}">{trabajo.estado}</p></td>
      <td class="text-center">{technician_name}</td>
      <td class="text-center">{trabajo.cantidad or 'N/A'}</td>
    </tr>
    """

def generate_tech_row_html(tecnico):
    """
    Genera HTML para filas de tabla de técnicos
    """
    availability_badge = '<span class="badge bg-success">Disponible</span>' if tecnico.available else '<span class="badge bg-danger">No disponible</span>'
    toggle_icon = 'toggle-on' if tecnico.available else 'toggle-off'
    
    return f"""
    <tr>
      <td>{tecnico.nombre} {tecnico.apellido or ''}</td>
      <td class="text-center">{tecnico.telefono or ''}</td>
      <td class="text-center">{availability_badge}</td>
      <td class="text-center">
        <div class="d-flex justify-content-center align-items-center">
          <button class="btn btn-warning btn-sm btn-action editar-tecnico" 
                  data-bs-toggle="modal" 
                  data-bs-target="#editTecnicoModal"
                  data-id="{tecnico.id}"
                  data-first_name="{tecnico.nombre or ''}"
                  data-last_name="{tecnico.apellido or ''}"
                  data-telefono="{tecnico.telefono or ''}">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn btn-danger btn-sm btn-action confirm-delete-tech" 
                  data-id="{tecnico.id}"
                  data-bs-toggle="modal"
                  data-bs-target="#confirmDeleteTechModal">
            <i class="bi bi-trash-fill"></i>
          </button>
          <form method="POST" action="/technicians/toggle/{tecnico.id}" class="d-inline">
            <button type="button" class="btn btn-info btn-sm btn-action toggle-disponibilidad" title="Alternar disponibilidad">
              <i class="bi bi-{toggle_icon}"></i>
            </button>
          </form>
        </div>
      </td>
    </tr>
    """

def generate_dashboard_work_row(trabajo):
    """
    Genera HTML para filas de tabla de trabajos pendientes en el dashboard
    """
    from datetime import datetime
    
    technician_name = f"{trabajo.technician.nombre} {trabajo.technician.apellido or ''}" if trabajo.technician else "Sin asignar"
    status_class = "status-pending" if trabajo.estado in ["Pendiente", "En Proceso"] else "status-paid"
    costo = trabajo.cantidad if trabajo.cantidad else 'N/A'  # Cambiado de costo_estimado a cantidad
    costo_display = f"{costo}€" if costo != 'N/A' else costo
    
    # Verificar si la fecha ya ha pasado
    fecha_vencida = ""
    fecha_actual = datetime.now().date()
    
    # Convertir trabajo.fecha a date si es un datetime
    fecha_trabajo = trabajo.fecha
    if isinstance(fecha_trabajo, datetime):
        fecha_trabajo = fecha_trabajo.date()
    
    if fecha_trabajo < fecha_actual and trabajo.estado in ["Pendiente", "En Proceso"]:
        fecha_vencida = "date-expired"
    
    from flask import url_for
    job_url = url_for('jobs.ver_trabajo', id=trabajo.id)
    
    return f"""
    <tr>
      <td class="text-center"><a href="{job_url}">Nº_{trabajo.id}</a></td>
      <td class="text-center">{trabajo.nombre_cliente} {trabajo.apellido_cliente or ''}</td>
      <td class="text-center {fecha_vencida}">{trabajo.fecha.strftime("%d/%m/%Y")}</td>
      <td class="text-center"><p class="status {status_class}">{trabajo.estado}</p></td>
      <td class="text-center">{technician_name}</td>
      <td class="text-center">{costo_display}</td>
    </tr>
    """

def generate_history_row(trabajo):
    """
    Genera HTML para filas de tabla en historial de trabajos
    """
    technician_name = f"{trabajo.technician.nombre} {trabajo.technician.apellido or ''}" if trabajo.technician else "Sin asignar"
    
    return f"""
    <tr>
      <td>{trabajo.id}</td>
      <td>{trabajo.nombre_cliente} {trabajo.apellido_cliente or ''}</td>
      <td>{technician_name}</td>
      <td>{trabajo.fecha.strftime("%d/%m/%Y")}</td>
      <td><p class="status status-paid">Completado</p></td>
      <td>
        <div class="d-flex justify-content-center align-items-center">
          <button class="btn btn-info btn-sm btn-action ver-detalles"
            data-bs-toggle="modal" 
            data-bs-target="#detalleTrabajoModal"
            data-nombre="{trabajo.nombre_cliente}"
            data-apellido="{trabajo.apellido_cliente or ''}"
            data-telefono="{trabajo.telefono or ''}"
            data-direccion="{trabajo.direccion or ''}"
            data-codigo_postal="{trabajo.codigo_postal or ''}"
            data-descripcion="{trabajo.descripcion}"
            data-duracion="{trabajo.duracion}"
            data-fecha="{trabajo.fecha.strftime('%d/%m/%Y')}"
            data-hora="{trabajo.hora}"
            data-tecnico="{technician_name}"
            data-dia-completado="{trabajo.fecha_completado.strftime('%d/%m/%Y') if hasattr(trabajo, 'fecha_completado') and trabajo.fecha_completado else 'N/A'}">
            <i class="bi bi-eye"></i>
          </button>
        </div>
      </td>
    </tr>
    """
