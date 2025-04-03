/**
 * Módulo para gestionar modales - Simplifica la interacción con modales Bootstrap
 */
const ModalManager = {
  /**
   * Configura un modal de confirmación
   * @param {string} triggerSelector - Selector de los botones que abren el modal
   * @param {string} modalId - ID del modal
   * @param {string} formId - ID del formulario dentro del modal
   * @param {string} actionBaseUrl - URL base para la acción del formulario
   */
  setupConfirmModal: function(triggerSelector, modalId, formId, actionBaseUrl) {
    const triggers = document.querySelectorAll(triggerSelector);
    const modalForm = document.getElementById(formId);
    
    if (!triggers.length || !modalForm) return;
    
    triggers.forEach(trigger => {
      trigger.addEventListener('click', function() {
        const itemId = this.getAttribute('data-id');
        modalForm.action = `${actionBaseUrl}${itemId}`;
      });
    });
  },
  
  /**
   * Configura un modal de edición
   * @param {string} triggerSelector - Selector de los botones que abren el modal
   * @param {string} modalId - ID del modal
   * @param {string} formId - ID del formulario dentro del modal
   * @param {string} actionBaseUrl - URL base para la acción del formulario
   * @param {Object} fieldMappings - Mapeo de atributos data-* a campos del formulario
   */
  setupEditModal: function(triggerSelector, modalId, formId, actionBaseUrl, fieldMappings) {
    const triggers = document.querySelectorAll(triggerSelector);
    const modalForm = document.getElementById(formId);
    
    if (!triggers.length || !modalForm) return;
    
    triggers.forEach(trigger => {
      trigger.addEventListener('click', function() {
        const itemId = this.getAttribute('data-id');
        modalForm.action = `${actionBaseUrl}${itemId}`;
        
        // Rellenar los campos del formulario con los datos del elemento
        for (const [dataAttr, fieldId] of Object.entries(fieldMappings)) {
          const value = this.getAttribute(`data-${dataAttr}`);
          const field = document.getElementById(fieldId);
          if (field && value) {
            if (field.tagName === 'SELECT') {
              for (let i = 0; i < field.options.length; i++) {
                if (field.options[i].value === value) {
                  field.selectedIndex = i;
                  break;
                }
              }
            } else {
              field.value = value;
            }
          }
        }
      });
    });
  }
};

// Exportar el módulo para usarlo en otros archivos
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = ModalManager;
}
