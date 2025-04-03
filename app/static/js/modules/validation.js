/**
 * Módulo de validación - Contiene funciones reutilizables para validar formularios
 */
const Validation = {
  /**
   * Valida un número de teléfono español
   * @param {string} telefono - Número de teléfono a validar
   * @returns {boolean} - True si es válido, false si no
   */
  validarTelefono: function(telefono) {
    if (!telefono) return true; // Si está vacío, asumimos que es opcional
    const telefonoRegex = /^(?:\+34[\s-]?)?(?:\d{3}[\s.-]?\d{3}[\s.-]?\d{3})$/;
    return telefonoRegex.test(telefono);
  },
  
  /**
   * Muestra un mensaje de error de teléfono inválido
   * @param {HTMLElement} inputElement - Elemento input del teléfono
   * @param {string} errorId - ID para el div de error
   */
  mostrarErrorTelefono: function(inputElement, errorId) {
    inputElement.classList.add("is-invalid");
    if (!document.getElementById(errorId)) {
      const errorDiv = document.createElement("div");
      errorDiv.id = errorId;
      errorDiv.className = "invalid-feedback d-block";
      errorDiv.innerText = "Formato de teléfono inválido. Usa +34 612345678 o 612345678.";
      inputElement.parentNode.appendChild(errorDiv);
    }
  },
  
  /**
   * Oculta un mensaje de error
   * @param {HTMLElement} inputElement - Elemento input
   * @param {string} errorId - ID del div de error
   */
  ocultarError: function(inputElement, errorId) {
    inputElement.classList.remove("is-invalid");
    const errorDiv = document.getElementById(errorId);
    if (errorDiv) {
      errorDiv.remove();
    }
  },
  
  /**
   * Aplica validación de teléfono a un formulario
   * @param {string} formId - ID del formulario
   * @param {string} telefonoInputId - ID del input de teléfono
   * @param {string} errorId - ID para el div de error
   */
  aplicarValidacionTelefono: function(formId, telefonoInputId, errorId) {
    const form = document.getElementById(formId);
    const telefonoInput = document.getElementById(telefonoInputId);
    
    if (form && telefonoInput) {
      // Validación en envío del formulario
      form.addEventListener("submit", (e) => {
        const telefono = telefonoInput.value.trim();
        if (telefono && !this.validarTelefono(telefono)) {
          e.preventDefault();
          this.mostrarErrorTelefono(telefonoInput, errorId);
        }
      });
      
      // Validación en tiempo real
      telefonoInput.addEventListener("input", () => {
        const telefono = telefonoInput.value.trim();
        if (telefono && !this.validarTelefono(telefono)) {
          this.mostrarErrorTelefono(telefonoInput, errorId);
        } else {
          this.ocultarError(telefonoInput, errorId);
        }
      });
    }
  }
};

// Exportar el módulo para usarlo en otros archivos
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = Validation;
}
