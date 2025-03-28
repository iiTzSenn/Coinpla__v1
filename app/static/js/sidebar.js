const toggleButton = document.getElementById('toggle-btn')
const sidebar = document.getElementById('sidebar')

function toggleSidebar(){
  sidebar.classList.toggle('close')
  toggleButton.classList.toggle('rotate')

  closeAllSubMenus()
}

function toggleSubMenu(button){

  if(!button.nextElementSibling.classList.contains('show')){
    closeAllSubMenus()
  }

  button.nextElementSibling.classList.toggle('show')
  button.classList.toggle('rotate')

  if(sidebar.classList.contains('close')){
    sidebar.classList.toggle('close')
    toggleButton.classList.toggle('rotate')
  }
}

function closeAllSubMenus(){
  Array.from(sidebar.getElementsByClassName('show')).forEach(ul => {
    ul.classList.remove('show')
    ul.previousElementSibling.classList.remove('rotate')
  })
}

// Marcar la opción activa según la URL actual
document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname; // Obtiene la ruta actual
  document.querySelectorAll('#sidebar ul li a').forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.parentElement.classList.add('active'); // Marca la opción activa
    }
  });
});

// Manejar la clase 'active' en las opciones del sidebar al hacer clic
document.querySelectorAll('#sidebar ul li a').forEach(link => {
  link.addEventListener('click', function () {
    // Eliminar la clase 'active' de todas las opciones
    document.querySelectorAll('#sidebar ul li').forEach(item => {
      item.classList.remove('active');
    });
    // Agregar la clase 'active' a la opción seleccionada
    this.parentElement.classList.add('active');
  });
});

function toggleDropdown() {
  const bottomContainer = document.querySelector('.bottom-container');
  const dropdownMenu = bottomContainer.querySelector('.dropdown-menu');

  if (bottomContainer.classList.contains('open')) {
    dropdownMenu.style.display = 'none'; // Ocultar el menú
    setTimeout(() => {
      bottomContainer.classList.remove('open'); // Remover la clase después de ocultar
    }, 300); // Esperar a que termine la animación
  } else {
    dropdownMenu.style.display = 'flex'; // Mostrar el menú
    bottomContainer.classList.add('open'); // Agregar la clase inmediatamente
  }
}

document.querySelector('.bottom-container').addEventListener('click', toggleDropdown);