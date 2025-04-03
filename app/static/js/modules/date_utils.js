/**
 * Módulo de utilidades para fechas - Funciones reutilizables para el manejo de fechas
 */
const DateUtils = {
  /**
   * Formatea una fecha a formato local español (dd/mm/yyyy)
   * @param {Date|string} date - Fecha a formatear
   * @returns {string} - Fecha formateada
   */
  formatLocalDate: function(date) {
    if (!date) return '';
    
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  },
  
  /**
   * Formatea una fecha y hora a formato local español
   * @param {Date|string} date - Fecha a formatear
   * @returns {string} - Fecha y hora formateada
   */
  formatLocalDateTime: function(date) {
    if (!date) return '';
    
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  
  /**
   * Convierte una fecha a formato ISO para formularios
   * @param {Date|string} date - Fecha a convertir
   * @returns {string} - Fecha en formato YYYY-MM-DD
   */
  toISODateString: function(date) {
    if (!date) return '';
    
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },
  
  /**
   * Extrae la hora de una fecha en formato HH:MM
   * @param {Date|string} date - Fecha de la que extraer la hora
   * @returns {string} - Hora en formato HH:MM
   */
  extractTimeString: function(date) {
    if (!date) return '';
    
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  },
  
  /**
   * Calcula la diferencia en días entre dos fechas
   * @param {Date|string} date1 - Primera fecha
   * @param {Date|string} date2 - Segunda fecha
   * @returns {number} - Diferencia en días (valor absoluto)
   */
  daysDifference: function(date1, date2) {
    const d1 = date1 instanceof Date ? date1 : new Date(date1);
    const d2 = date2 instanceof Date ? date2 : new Date(date2);
    
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;
    
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
};

// Exportar el módulo para usarlo en otros archivos
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = DateUtils;
}
