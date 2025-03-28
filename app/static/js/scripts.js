/* =====================
   1. UTILS & GLOBAL SETUP
===================== */

function saveScrollPos() {
  sessionStorage.setItem("scrollPos", window.scrollY);
}

document.addEventListener("DOMContentLoaded", function () {
  if (sessionStorage.getItem("scrollPos")) {
    window.scrollTo(0, sessionStorage.getItem("scrollPos"));
    sessionStorage.removeItem("scrollPos");
  }
});

/* =====================
   2. ALERTS & MESSAGES
===================== */

document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    var flashAlerts = document.querySelectorAll(".alert:not(.persistent-alert)");
    flashAlerts.forEach(function (alert) {
      alert.classList.add('shrink');
      alert.addEventListener('transitionend', function () {
        alert.remove();
      });
    });
  }, 2000);
});

/* =====================
   3. SIDEBAR TOGGLE
===================== */

// Función para abrir/cerrar la sidebar
function toggleSidebar() {
  var sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('close');
  // En este diseño, no aplicamos efecto de "rotate" al botón
  // Si deseas agregar algún efecto visual adicional, puedes descomentar la siguiente línea:
  // document.getElementById('toggle-btn').classList.toggle('rotate');
  closeAllSubMenus();
}

/* =====================
   4. SUBMENU TOGGLE
===================== */

function toggleSubMenu(button) {
  var subMenu = button.nextElementSibling;
  if (!subMenu.classList.contains('show')) {
    closeAllSubMenus();
  }
  subMenu.classList.toggle('show');
  button.classList.toggle('rotate');

  var sidebar = document.getElementById('sidebar');
  if (sidebar.classList.contains('close')) {
    sidebar.classList.remove('close');
    document.getElementById('toggle-btn').classList.remove('rotate');
  }
}

function closeAllSubMenus() {
  var subMenus = document.querySelectorAll('#sidebar .sub-menu.show');
  subMenus.forEach(function (menu) {
    menu.classList.remove('show');
    var btn = menu.previousElementSibling;
    if (btn && btn.classList.contains('rotate')) {
      btn.classList.remove('rotate');
    }
  });
}

/* =====================
   7. HISTORIAL MODAL HANDLER
===================== */

document.addEventListener('DOMContentLoaded', function () {
  var detalleButtons = document.querySelectorAll('.ver-detalles');
  detalleButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var nombre = button.getAttribute('data-nombre') || '';
      var apellido = button.getAttribute('data-apellido') || '';
      var telefono = button.getAttribute('data-telefono') || '';
      var direccion = button.getAttribute('data-direccion') || '';
      var descripcion = button.getAttribute('data-descripcion') || '';
      var codigoPostal = button.getAttribute('data-codigo_postal') || '';
      var duracion = button.getAttribute('data-duracion') || '';
      var fecha = button.getAttribute('data-fecha') || '';
      var hora = button.getAttribute('data-hora') || '';
      var tecnico = button.getAttribute('data-tecnico') || '';
      var diaCompletado = button.getAttribute('data-dia-completado') || '';

      document.getElementById('detalleCliente').innerText = nombre + ' ' + apellido;
      document.getElementById('detalleTelefono').innerText = telefono;
      document.getElementById('detalleDireccion').innerText = direccion;
      document.getElementById('detalleDescripcion').innerText = descripcion;
      document.getElementById('detalleCodigoPostal').innerText = codigoPostal;
      document.getElementById('detalleDuracion').innerText = duracion;
      document.getElementById('detalleFecha').innerText = fecha;
      document.getElementById('detalleHora').innerText = hora;
      document.getElementById('detalleTecnico').innerText = tecnico;
      document.getElementById('detalleDiaCompletado').innerText = diaCompletado;

      var detalleModal = new bootstrap.Modal(document.getElementById('detalleTrabajoModal'));
      detalleModal.show();
    });
  });
});

/* =====================
   8. VALIDACIÓN TELÉFONO EN MODAL EDICIÓN
===================== */

document.addEventListener("DOMContentLoaded", function () {
  const editJobForm = document.getElementById("editJobForm");
  const telefonoInput = document.getElementById("modalTelefono");

  if (editJobForm && telefonoInput) {
    editJobForm.addEventListener("submit", function (e) {
      const telefono = telefonoInput.value.trim();
      const telefonoRegex = /^(?:\+34\s?)?\d{9}$/;
      if (telefono && !telefonoRegex.test(telefono)) {
        e.preventDefault();
        telefonoInput.classList.add("is-invalid");
        if (!document.getElementById("telefono-error")) {
          const errorDiv = document.createElement("div");
          errorDiv.id = "telefono-error";
          errorDiv.className = "invalid-feedback d-block";
          errorDiv.innerText = "Formato de teléfono inválido. Usa +34 612345678 o 612345678.";
          telefonoInput.parentNode.appendChild(errorDiv);
        }
      } else {
        telefonoInput.classList.remove("is-invalid");
        const errorDiv = document.getElementById("telefono-error");
        if (errorDiv) {
          errorDiv.remove();
        }
      }
    });
  }
});

/* =====================
   9. VALIDACIÓN TELÉFONO EN FORMULARIO AÑADIR TRABAJO
===================== */

document.addEventListener("DOMContentLoaded", function () {
  const addJobForm = document.getElementById("addJobForm");
  if (addJobForm) {
    addJobForm.addEventListener("submit", function (e) {
      const telefonoInput = document.getElementById("telefono");
      const telefono = telefonoInput.value.trim();
      const telefonoRegex = /^(?:\+34[\s-]?)?(?:\d{3}[\s.-]?\d{3}[\s.-]?\d{3})$/;
      if (telefono && !telefonoRegex.test(telefono)) {
        e.preventDefault();
        telefonoInput.classList.add("is-invalid");
        if (!document.getElementById("telefono-error-add")) {
          const errorDiv = document.createElement("div");
          errorDiv.id = "telefono-error-add";
          errorDiv.className = "invalid-feedback d-block";
          errorDiv.innerText = "Formato de teléfono inválido. Ejemplo: +34 612345678 o 123-456-789.";
          telefonoInput.parentNode.appendChild(errorDiv);
        }
      } else {
        telefonoInput.classList.remove("is-invalid");
        const errorDiv = document.getElementById("telefono-error-add");
        if (errorDiv) {
          errorDiv.remove();
        }
      }
    });
  }
});

/* =====================
   10. OTROS EVENTOS: CALENDAR, SUBMENÚ, ETC.
===================== */

document.addEventListener("DOMContentLoaded", function() {
  var calendarEl = document.getElementById('calendar');
  if (calendarEl) {
    var calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: '/api/calendar_events', // Endpoint para obtener eventos
      eventClick: function(info) {
        alert('Evento: ' + info.event.title);
      }
    });
    calendar.render();
  }
  
  // Opcional: funciones para submenús (si se usan en tu sidebar)
  const toggleButton = document.getElementById('toggle-btn');
  const sidebar = document.getElementById('sidebar');

  function toggleSubMenu(button) {
    if (!button.nextElementSibling.classList.contains('show')) {
      closeAllSubMenus();
    }
    button.nextElementSibling.classList.toggle('show');
    button.classList.toggle('rotate');

    if (sidebar.classList.contains('close')) {
      sidebar.classList.remove('close');
      toggleButton.classList.remove('rotate');
    }
  }

  function closeAllSubMenus() {
    Array.from(sidebar.getElementsByClassName('show')).forEach(ul => {
      ul.classList.remove('show');
      ul.previousElementSibling.classList.remove('rotate');
    });
  }
});
