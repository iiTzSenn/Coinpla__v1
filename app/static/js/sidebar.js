const toggleButton = document.getElementById('toggle-btn');
const sidebar = document.getElementById('sidebar');

/**
 * Alterna el estado de la barra lateral entre abierto y cerrado
 */
function toggleSidebar() {
  sidebar.classList.toggle('close');
  toggleButton.classList.toggle('rotate');
  
  // Guardar el estado del sidebar
  const isClosed = sidebar.classList.contains('close');
  localStorage.setItem('sidebarState', isClosed ? 'closed' : 'open');
  
  // Asegurar que todos los submenús se cierren cuando se cierra el sidebar
  if (sidebar.classList.contains('close')) {
    closeAllSubMenus();
  }
}

/**
 * Alterna el estado de un submenú específico
 * @param {HTMLElement} button - El botón que controla el submenú
 */
function toggleSubMenu(button) {
  // Si el sidebar está cerrado, primero abrirlo
  if (sidebar.classList.contains('close')) {
    sidebar.classList.remove('close');
    toggleButton.classList.remove('rotate');
    localStorage.setItem('sidebarState', 'open');
  }
  
  // Luego manejar el submenú
  const submenu = button.nextElementSibling;
  const submenuId = submenu.getAttribute('data-submenu-id') || button.getAttribute('data-target');
  
  if (!submenu.classList.contains('show')) {
    closeAllSubMenus();
    submenu.classList.add('show');
    button.classList.add('rotate');
    
    // Guardar estado del submenú abierto
    localStorage.setItem('activeSubmenu', submenuId);
  } else {
    submenu.classList.remove('show');
    button.classList.remove('rotate');
    localStorage.removeItem('activeSubmenu');
  }
}

/**
 * Cierra todos los submenús abiertos
 */
function closeAllSubMenus() {
  // Cerrar todos los submenús
  const submenus = document.querySelectorAll('#sidebar .sub-menu.show');
  submenus.forEach(submenu => {
    submenu.classList.remove('show');
    const button = submenu.previousElementSibling;
    if (button && button.classList.contains('rotate')) {
      button.classList.remove('rotate');
    }
  });
  localStorage.removeItem('activeSubmenu');
}

/**
 * Función simplificada para manejar el dropdown del avatar
 */
function handleAvatarDropdown() {
  const bottomContainer = document.querySelector('#sidebar .bottom-container');
  const dropdownMenu = bottomContainer.querySelector('.dropdown-menu');
  
  // Evento para alternar el dropdown al hacer clic en el contenedor
  bottomContainer.addEventListener('click', function(e) {
    e.stopPropagation(); // Evitar que el clic afecte a otros elementos
    this.classList.toggle('open');
  });
  
  // Evitar que los clics dentro del dropdown cierren el dropdown
  dropdownMenu.addEventListener('click', function(e) {
    e.stopPropagation(); // Evitar propagación del clic
  });
  
  // Manejar los clics en las opciones del dropdown
  const dropdownOptions = dropdownMenu.querySelectorAll('a');
  dropdownOptions.forEach(option => {
    option.addEventListener('click', function(e) {
      e.stopPropagation();
      
      // Quitar la clase active de todas las opciones
      dropdownOptions.forEach(opt => opt.classList.remove('active'));
      
      // Añadir la clase active solo a la opción seleccionada
      this.classList.add('active');
    });
  });
  
  // Cerrar el dropdown al hacer clic fuera
  document.addEventListener('click', function(e) {
    if (!e.target.closest('#sidebar .bottom-container')) {
      bottomContainer.classList.remove('open');
    }
  });
}

/**
 * Marca una opción dentro del dropdown como activa
 * @param {HTMLElement} option - La opción seleccionada
 */
function markDropdownOptionActive(option) {
  // Remover la clase 'active' de todas las opciones dentro del dropdown
  const dropdownOptions = document.querySelectorAll('#sidebar .bottom-container .dropdown-menu a');
  dropdownOptions.forEach(opt => {
    opt.classList.remove('active');
    const icon = opt.querySelector('svg');
    if (icon) {
      icon.style.fill = ''; // Restaurar el color del icono
    }
  });

  // Agregar la clase 'active' solo a la opción seleccionada
  option.classList.add('active');
  const activeIcon = option.querySelector('svg');
  if (activeIcon) {
    activeIcon.style.fill = '#00ff00'; // Iluminar el icono de la opción activa
  }
}

/**
 * Restaura el estado de los submenús desde localStorage
 */
function restoreSubmenuState() {
  const activeSubmenuId = localStorage.getItem('activeSubmenu');
  
  if (activeSubmenuId) {
    // Buscar el submenú por ID o atributo data-target
    const submenu = document.querySelector(`.sub-menu[data-submenu-id="${activeSubmenuId}"]`) || 
                   document.querySelector(`.sub-menu[id="${activeSubmenuId}"]`);
    
    if (submenu) {
      submenu.classList.add('show');
      const button = submenu.previousElementSibling;
      if (button) {
        button.classList.add('rotate');
      }
    }
  }
}

/**
 * Marca los elementos activos según la URL actual
 */
function markActiveItems() {
  const currentPath = window.location.pathname;
  
  // Primero remover todas las clases active existentes
  document.querySelectorAll('#sidebar a').forEach(link => {
    link.classList.remove('active');
  });
  
  // Buscar y marcar enlaces directos que coincidan con la URL actual
  document.querySelectorAll('#sidebar a').forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPath) {
      link.classList.add('active');
      
      // Si el enlace está dentro de un submenú, asegurarse de que el submenú esté abierto
      const subMenu = link.closest('.sub-menu');
      if (subMenu) {
        subMenu.classList.add('show');
        const button = subMenu.previousElementSibling;
        if (button) {
          button.classList.add('rotate');
        }
      }
    }
  });
}

// Inicialización cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', () => {
  // Restaurar estado del sidebar desde localStorage
  const sidebarState = localStorage.getItem('sidebarState');
  if (sidebarState === 'closed' && sidebar) {
    sidebar.classList.remove('close'); // Asegurar que el sidebar se cargue abierto
    localStorage.setItem('sidebarState', 'open'); // Actualizar el estado a 'open'
  } else {
    // Solo restaurar submenús si el sidebar está abierto
    restoreSubmenuState();
  }
  
  // Marcar la opción activa según la URL actual
  const currentPath = window.location.pathname;
  document.querySelectorAll('#sidebar ul li a').forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.closest('li').classList.add('active');
      
      // Si el enlace está dentro de un submenú, abrir ese submenú
      const parentSubmenu = link.closest('.sub-menu');
      if (parentSubmenu) {
        parentSubmenu.classList.add('show');
        const button = parentSubmenu.previousElementSibling;
        if (button) {
          button.classList.add('rotate');
          
          // Guardar este submenú como activo
          const submenuId = parentSubmenu.getAttribute('data-submenu-id') || button.getAttribute('data-target');
          if (submenuId) {
            localStorage.setItem('activeSubmenu', submenuId);
          }
        }
      }
    }
  });
  
  // Añadir event listeners para evitar que se cierren submenús al hacer clic en ellos
  document.querySelectorAll('#sidebar .sub-menu a').forEach(link => {
    link.addEventListener('click', function(e) {
      // No propagar el evento click para que no se cierre el submenú
      e.stopPropagation();
      
      // Almacenar información sobre el submenú actual
      const parentSubmenu = link.closest('.sub-menu');
      if (parentSubmenu) {
        const submenuId = parentSubmenu.getAttribute('data-submenu-id') || 
                         parentSubmenu.previousElementSibling.getAttribute('data-target');
        if (submenuId) {
          localStorage.setItem('activeSubmenu', submenuId);
        }
      }
    });
  });
  
  // Asegurar que los clics en submenús no cierren el desplegable
  document.addEventListener('click', function(event) {
    // Verificar si el clic fue dentro de un submenú o en un botón desplegable
    if (event.target.closest('.sub-menu') || event.target.closest('.dropdown-btn')) {
      // No hacer nada si es dentro del submenú o en el botón desplegable
      return;
    }
    
    // Cerrar todos los submenús si el clic fue fuera de ellos
    closeAllSubMenus();
    
    const bottomContainer = document.querySelector('#sidebar .bottom-container');
    if (bottomContainer && bottomContainer.classList.contains('open')) {
      // Si el clic no fue dentro del contenedor o del menú desplegable del usuario
      if (!event.target.closest('.bottom-container')) {
        bottomContainer.classList.remove('open');
      }
    }
  });

  // Inicializar el manejo del dropdown del avatar
  if (document.querySelector('#sidebar .bottom-container')) {
    handleAvatarDropdown();
  }

  // Llamar a la función para marcar los elementos activos
  markActiveItems();
});
