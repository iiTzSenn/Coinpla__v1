const toggleButton = document.getElementById('toggle-btn');
const sidebar = document.getElementById('sidebar');

function toggleSidebar() {
  sidebar.classList.toggle('close');
  toggleButton.classList.toggle('rotate');
  closeAllSubMenus();
}

function toggleSubMenu(button) {
  if (!button.nextElementSibling.classList.contains('show')) {
    closeAllSubMenus();
  }
  button.nextElementSibling.classList.toggle('show');
  button.classList.toggle('rotate');

  if (sidebar.classList.contains('close')) {
    sidebar.classList.toggle('close');
    toggleButton.classList.toggle('rotate');
  }
}

function closeAllSubMenus() {
  Array.from(sidebar.getElementsByClassName('show')).forEach(ul => {
    ul.classList.remove('show');
    ul.previousElementSibling.classList.remove('rotate');
  });
}

// Marcar la opción activa según la URL actual
document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  document.querySelectorAll('#sidebar ul li a').forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.parentElement.classList.add('active');
    }
  });
});

// Manejar la clase 'active' en las opciones del sidebar al hacer clic
document.querySelectorAll('#sidebar ul li a').forEach(link => {
  link.addEventListener('click', function () {
    document.querySelectorAll('#sidebar ul li').forEach(item => {
      item.classList.remove('active');
    });
    this.parentElement.classList.add('active');
  });
});

// Función para controlar el menú desplegable del usuario
function toggleDropdown() {
  const bottomContainer = document.querySelector('#sidebar .bottom-container');
  bottomContainer.classList.toggle('open');
  
  // Agregar console.log para depuración
  console.log("Dropdown toggled, open:", bottomContainer.classList.contains('open'));
}

// Si el usuario hace clic fuera del dropdown, cerrarlo
document.addEventListener('click', function(event) {
  const bottomContainer = document.querySelector('#sidebar .bottom-container');
  const dropdownMenu = document.querySelector('#sidebar .dropdown-menu');
  
  if (bottomContainer && bottomContainer.classList.contains('open')) {
    // Si el clic no fue dentro del contenedor o del menú desplegable
    if (!event.target.closest('.bottom-container')) {
      bottomContainer.classList.remove('open');
    }
  }
});
