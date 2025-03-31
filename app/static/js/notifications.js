// Función para cerrar notificaciones manualmente
function closeNotification(notification) {
  notification.classList.remove('show-notification');
  notification.style.opacity = '0';
  notification.style.transform = 'translateY(100px)';
  setTimeout(() => {
    notification.remove();
  }, 300);
}

// Auto-cerrar notificaciones después de 4 segundos
document.addEventListener('DOMContentLoaded', function() {
  const notifications = document.querySelectorAll('.flash-message');
  
  notifications.forEach(notification => {
    setTimeout(() => {
      closeNotification(notification);
    }, 4000); // Cambiado a 4 segundos
  });
});
