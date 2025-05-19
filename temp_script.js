// Archivo temporal para agregar el script a trabajos.html
document.addEventListener('DOMContentLoaded', function() {
  // Hacer que las filas de la tabla sean clickeables
  document.querySelectorAll('.trabajo-row').forEach(row => {
    row.addEventListener('click', function(e) {
      // Evitar que el clic funcione si se hace en un botón o enlace dentro de la fila
      if (e.target.closest('button') || e.target.closest('a') || e.target.closest('form')) {
        return;
      }
      
      // Obtener el ID del trabajo desde el atributo data-id
      const trabajoId = this.getAttribute('data-id');
      // Redirigir a la página de detalles del trabajo
      if (trabajoId) {
        window.location.href = '/trabajos/' + trabajoId;
      }
    });
  });
});
