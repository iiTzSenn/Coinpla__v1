/**
 * Archivo principal de JavaScript para la aplicación Coinpla
 * 
 * Este archivo carga todos los módulos y configura la aplicación
 */
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar componentes de Bootstrap
  initBootstrapComponents();
  
  // Configurar validación de formularios
  if (typeof Validation !== 'undefined') {
    setupFormValidation();
  }
  
  // Configurar modales
  if (typeof ModalManager !== 'undefined') {
    setupModals();
  }
  
  // Inicializar detalles de trabajo en modales
  setupDetallesTrabajoModal();
  
  // Configurar tooltips y popovers
  setupTooltips();
});

/**
 * Inicializa componentes Bootstrap que requieren JavaScript
 */
function initBootstrapComponents() {
  try {
    // Bootstrap 5 no requiere inicialización manual para muchos componentes
    console.log('Componentes Bootstrap inicializados');
  } catch (error) {
    console.error('Error al inicializar componentes Bootstrap:', error);
  }
}

/**
 * Configura la validación de formularios en la aplicación
 */
function setupFormValidation() {
  try {
    // Validación de teléfono en formulario de añadir trabajo
    if (document.getElementById('addJobForm')) {
      Validation.aplicarValidacionTelefono('addJobForm', 'telefono', 'telefono-error-add');
    }
    
    // Validación de teléfono en modal de edición de trabajo
    if (document.getElementById('editJobForm')) {
      Validation.aplicarValidacionTelefono('editJobForm', 'modalTelefono', 'telefono-error');
    }
    
    // Validación de teléfono en formulario de añadir técnico
    if (document.getElementById('addTechForm')) {
      Validation.aplicarValidacionTelefono('addTechForm', 'telefono', 'telefono-error-tech');
    }
  } catch (error) {
    console.warn('Error al configurar validación de formularios:', error);
  }
}

/**
 * Configura los modales de la aplicación
 */
function setupModals() {
  try {
    // Modal de eliminación de trabajo
    const deleteJobBtns = document.querySelectorAll('.confirm-delete-job');
    if (deleteJobBtns.length) {
      deleteJobBtns.forEach(btn => {
        btn.addEventListener('click', function() {
          const jobId = this.getAttribute('data-id');
          const form = document.getElementById('confirmDeleteModal').querySelector('form');
          form.action = `/jobs/delete/${jobId}`;
        });
      });
    }
    
    // Modal de eliminación de técnico
    const deleteTechBtns = document.querySelectorAll('.confirm-delete-tech');
    if (deleteTechBtns.length) {
      deleteTechBtns.forEach(btn => {
        btn.addEventListener('click', function() {
          const techId = this.getAttribute('data-id');
          const form = document.getElementById('confirmDeleteTechModal').querySelector('form');
          form.action = `/technicians/delete/${techId}`;
        });
      });
    }
    
    // Modal de edición de trabajo
    const editJobBtns = document.querySelectorAll('.editar-trabajo');
    if (editJobBtns.length) {
      editJobBtns.forEach(btn => {
        btn.addEventListener('click', function() {
          const jobId = this.getAttribute('data-id');
          const form = document.getElementById('editJobForm');
          form.action = `/jobs/edit/${jobId}`;
            // Rellenar formulario
          document.getElementById('modalNombreCliente').value = this.getAttribute('data-nombre_cliente') || '';
          document.getElementById('modalApellidoCliente').value = this.getAttribute('data-apellido_cliente') || '';
          document.getElementById('modalTelefono').value = this.getAttribute('data-telefono') || '';
          document.getElementById('modalDireccion').value = this.getAttribute('data-direccion') || '';
          document.getElementById('modalCodigoPostal').value = this.getAttribute('data-codigo_postal') || '';
          document.getElementById('modalDescripcion').value = this.getAttribute('data-descripcion') || '';
          document.getElementById('modalFecha').value = this.getAttribute('data-fecha') || '';
          document.getElementById('modalHora').value = this.getAttribute('data-hora') || '';
          document.getElementById('modalDuracion').value = this.getAttribute('data-duracion') || '';
          document.getElementById('modalTecnicoId').value = this.getAttribute('data-tecnico_id') || '';
          document.getElementById('modalEstado').value = this.getAttribute('data-estado') || '';
          document.getElementById('modalTipoPlaga').value = this.getAttribute('data-tipo_plaga') || '';
          document.getElementById('modalCantidad').value = this.getAttribute('data-cantidad') || '';
        });
      });
    }
    
    // Modal de edición de técnico
    const editTechBtns = document.querySelectorAll('.editar-tecnico');
    if (editTechBtns.length) {
      editTechBtns.forEach(btn => {
        btn.addEventListener('click', function() {
          const techId = this.getAttribute('data-id');
          const form = document.getElementById('editTecnicoForm');
          form.action = `/technicians/edit/${techId}`;
          
          // Rellenar formulario
          document.getElementById('modalFirstName').value = this.getAttribute('data-first_name') || '';
          document.getElementById('modalLastName').value = this.getAttribute('data-last_name') || '';
          document.getElementById('modalTelefono').value = this.getAttribute('data-telefono') || '';
        });
      });
    }
  } catch (error) {
    console.error('Error al configurar modales:', error);
  }
}

/**
 * Configura el modal de detalles de trabajo en la página de historial
 */
function setupDetallesTrabajoModal() {
  try {
    const detalleBtns = document.querySelectorAll('.ver-detalles');
    
    if (!detalleBtns.length) return;
    
    detalleBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        // Obtener los datos del botón
        const nombre = this.getAttribute('data-nombre') || '';
        const apellido = this.getAttribute('data-apellido') || '';
        const telefono = this.getAttribute('data-telefono') || '';
        const direccion = this.getAttribute('data-direccion') || '';
        const codigoPostal = this.getAttribute('data-codigo_postal') || '';
        const descripcion = this.getAttribute('data-descripcion') || '';
        const duracion = this.getAttribute('data-duracion') || '';
        const fecha = this.getAttribute('data-fecha') || '';
        const hora = this.getAttribute('data-hora') || '';
        const tecnico = this.getAttribute('data-tecnico') || '';
        const diaCompletado = this.getAttribute('data-dia-completado') || '';
        
        // Actualizar los elementos del modal
        document.getElementById('detalleCliente').textContent = `${nombre} ${apellido}`;
        document.getElementById('detalleTelefono').textContent = telefono;
        document.getElementById('detalleDireccion').textContent = direccion;
        document.getElementById('detalleCodigoPostal').textContent = codigoPostal;
        document.getElementById('detalleDescripcion').textContent = descripcion;
        document.getElementById('detalleDuracion').textContent = duracion;
        document.getElementById('detalleFecha').textContent = fecha;
        document.getElementById('detalleHora').textContent = hora;
        document.getElementById('detalleTecnico').textContent = tecnico;
        document.getElementById('detalleDiaCompletado').textContent = diaCompletado;
      });
    });
  } catch (error) {
    console.warn('Error al configurar modal de detalles:', error);
  }
}

/**
 * Configura tooltips y popovers de Bootstrap
 */
function setupTooltips() {
  try {
    // Inicializar tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    if (tooltipTriggerList.length) {
      tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
      });
    }
    
    // Inicializar popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    if (popoverTriggerList.length) {
      popoverTriggerList.map(function(popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
      });
    }
  } catch (error) {
    console.warn('Error al configurar tooltips y popovers:', error);
  }
}
