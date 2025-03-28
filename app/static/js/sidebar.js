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

function toggleDropdown() {
  const bottomContainer = document.querySelector('.bottom-container');
  const dropdownMenu = bottomContainer.querySelector('.dropdown-menu');

  if (bottomContainer.classList.contains('open')) {
    dropdownMenu.style.display = 'none';
    setTimeout(() => {
      bottomContainer.classList.remove('open');
    }, 300);
  } else {
    dropdownMenu.style.display = 'flex';
    bottomContainer.classList.add('open');
  }
}

// Al hacer clic en el contenedor, mostramos u ocultamos el dropdown
document.querySelector('.bottom-container').addEventListener('click', function(event) {
  event.stopPropagation(); // Evitamos que el clic se propague al documento
  toggleDropdown();
});

// Listener para cerrar el dropdown al hacer clic fuera del contenedor
document.addEventListener('click', function(event) {
  const bottomContainer = document.querySelector('.bottom-container');
  const dropdownMenu = bottomContainer.querySelector('.dropdown-menu');
  
  if (bottomContainer.classList.contains('open') && !bottomContainer.contains(event.target)) {
    dropdownMenu.style.display = 'none';
    setTimeout(() => {
      bottomContainer.classList.remove('open');
    }, 300);
  }
});
