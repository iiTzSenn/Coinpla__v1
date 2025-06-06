/**
 * Maneja las notificaciones flash en la aplicación
 */
document.addEventListener('DOMContentLoaded', function() {
  setupNotifications();
});

/**
 * Configura las notificaciones para que se auto-oculten después de un tiempo
 */
function setupNotifications() {
  const notifications = document.querySelectorAll('.alert:not(.persistent-alert)');
  
  notifications.forEach((notification, index) => {
    // Asignar tiempo de desaparición incremental para cada notificación subsiguiente
    const baseDelay = 5000; // 5 segundos para la primera notificación
    const incrementDelay = 1000; // 1 segundo adicional por cada notificación
    const delay = baseDelay + (index * incrementDelay);
    
    // Auto-ocultar después del tiempo especificado
    setTimeout(() => {      // Añade la clase para disparar la animación CSS, pero manteniendo la opacidad
      notification.style.opacity = "1 !important"; // Asegurar que se mantiene sólido
      notification.classList.add('shrink');
      
      // Elimina el elemento después de que termine la animación
      setTimeout(() => {
        // Comprobar si el elemento todavía existe antes de intentar eliminarlo
        if (notification && notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 1000); // La duración de la transición CSS
    }, delay);
  });
}

/**
 * Muestra una notificación programáticamente
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación (success, danger, warning, info)
 * @param {number} duration - Duración en milisegundos (0 para no auto-ocultar)
 */
function showNotification(message, type = 'info', duration = 5000) {
  // Esta función está definida pero no se usa en ninguna parte del código
  // Podría ser útil mantenerla para futuro uso programático
}
