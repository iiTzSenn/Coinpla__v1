/* ===================== */
/* 1. UTILS & GLOBAL SETUP */
/* ===================== */

/**
 * Función para guardar la posición del scroll en sessionStorage.
 */
function saveScrollPos() {
  sessionStorage.setItem("scrollPos", window.scrollY);
}

/**
 * Al cargar el DOM, se restaura la posición de scroll si existe.
 */
document.addEventListener("DOMContentLoaded", function () {
  if (sessionStorage.getItem("scrollPos")) {
    window.scrollTo(0, sessionStorage.getItem("scrollPos"));
    sessionStorage.removeItem("scrollPos");
  }
});

/* ===================== */
/* 2. ALERTS & MESSAGES */
/* ===================== */

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

/* ===================== */
/* 3. MODAL HANDLERS: Trabajos & Técnicos */
/* ===================== */

document.body.addEventListener('click', function (event) {
  const editJobButton = event.target.closest('.editar-trabajo');
  if (editJobButton) {
    const jobId = editJobButton.getAttribute('data-id');
    var editJobForm = document.getElementById('editJobForm');
    if (editJobForm) {
      editJobForm.action = '/jobs/edit/' + jobId;
    }
    document.getElementById('modalNombreCliente').value = editJobButton.getAttribute('data-nombre_cliente') || '';
    document.getElementById('modalApellidoCliente').value = editJobButton.getAttribute('data-apellido_cliente') || '';
    document.getElementById('modalDireccion').value = editJobButton.getAttribute('data-direccion') || '';
    document.getElementById('modalFecha').value = editJobButton.getAttribute('data-fecha') || '';
    document.getElementById('modalHora').value = editJobButton.getAttribute('data-hora') || '';
    document.getElementById('modalEstado').value = editJobButton.getAttribute('data-estado') || 'Pendiente';
    document.getElementById('modalDescripcion').value = editJobButton.getAttribute('data-descripcion') || '';
    document.getElementById('modalTelefono').value = editJobButton.getAttribute('data-telefono') || '';
    document.getElementById('modalCodigoPostal').value = editJobButton.getAttribute('data-codigo_postal') || '';
    document.getElementById('modalTecnicoId').value = editJobButton.getAttribute('data-tecnico-id') || '';
  }
});

document.body.addEventListener('click', function (event) {
  const editTechButton = event.target.closest('.editar-tecnico');
  if (editTechButton) {
    const techId = editTechButton.getAttribute('data-id');
    var editTechForm = document.getElementById('editTecnicoForm');
    if (editTechForm) {
      editTechForm.action = '/technicians/edit/' + techId;
    }
    document.getElementById('modalFirstName').value = editTechButton.getAttribute('data-first_name') || '';
    document.getElementById('modalLastName').value = editTechButton.getAttribute('data-last_name') || '';
    document.getElementById('modalTelefono').value = editTechButton.getAttribute('data-telefono') || '';
  }
});

/* ===================== */
/* 4. FORM ACTIONS & TOGGLES */
/* ===================== */

document.querySelectorAll('.toggle-disponibilidad').forEach(function (btn) {
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    e.preventDefault();
    btn.closest('form').submit();
  });
});

document.body.addEventListener('click', function (event) {
  const deleteJobButton = event.target.closest('.confirm-delete-job');
  if (deleteJobButton) {
    const jobId = deleteJobButton.getAttribute('data-job-id');
    var deleteJobForm = document.getElementById('deleteJobForm');
    if (deleteJobForm) {
      deleteJobForm.action = '/jobs/delete/' + jobId;
    }
  }
});

document.body.addEventListener('click', function (event) {
  const completeJobButton = event.target.closest('.confirm-complete-job');
  if (completeJobButton) {
    const jobId = completeJobButton.getAttribute('data-job-id');
    var completeJobForm = document.getElementById('completeJobForm');
    if (completeJobForm) {
      completeJobForm.action = '/jobs/complete/' + jobId;
    }
  }
});

document.body.addEventListener('click', function (event) {
  const deleteTechButton = event.target.closest('.confirm-delete-tech');
  if (deleteTechButton) {
    const techId = deleteTechButton.getAttribute('data-tech-id');
    console.log("Eliminando técnico con ID:", techId);
    var deleteTechForm = document.getElementById('deleteTechForm');
    if (deleteTechForm) {
      deleteTechForm.action = '/technicians/delete/' + techId;
    }
  }
});

/* ===================== */
/* 5. PASSWORD VISIBILITY TOGGLES */
/* ===================== */

document.addEventListener('DOMContentLoaded', function () {
  var togglePassword = document.getElementById('toggle-password');
  if (togglePassword) {
    togglePassword.addEventListener('click', function () {
      var passwordInput = document.getElementById('password');
      if (passwordInput) {
        if (passwordInput.type === 'password') {
          passwordInput.type = 'text';
          togglePassword.innerHTML = '<i class="bi bi-eye-slash"></i>';
        } else {
          passwordInput.type = 'password';
          togglePassword.innerHTML = '<i class="bi bi-eye"></i>';
        }
      }
    });
  }
});

document.addEventListener('DOMContentLoaded', function () {
  var toggleConfirmPassword = document.getElementById('toggle-confirm-password');
  if (toggleConfirmPassword) {
    toggleConfirmPassword.addEventListener('click', function () {
      var confirmPasswordInput = document.getElementById('confirm_password');
      if (confirmPasswordInput) {
        if (confirmPasswordInput.type === 'password') {
          confirmPasswordInput.type = 'text';
          toggleConfirmPassword.innerHTML = '<i class="bi bi-eye-slash"></i>';
        } else {
          confirmPasswordInput.type = 'password';
          toggleConfirmPassword.innerHTML = '<i class="bi bi-eye"></i>';
        }
      }
    });
  }
});

/* ===================== */
/* 6. FORM VALIDATION */
/* ===================== */

document.addEventListener('DOMContentLoaded', function () {
  var registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function (event) {
      var password = document.getElementById('password').value;
      var confirmPassword = document.getElementById('confirm_password').value;
      if (password !== confirmPassword) {
        event.preventDefault();
        var modal = new bootstrap.Modal(document.getElementById('passwordMismatchModal'));
        modal.show();
      }
    });
  }
});

/* ===================== */
/* 7. HISTORIAL MODAL HANDLER */
/* ===================== */

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

/* ===================== */
/* 8. VALIDACIÓN TELÉFONO EN MODAL EDICIÓN */
/* ===================== */

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
