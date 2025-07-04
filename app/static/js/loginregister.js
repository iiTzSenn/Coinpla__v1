/* =====================
   TOGGLE PASSWORD VISIBILITY
===================== */

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

/* =====================
   FORM VALIDATION (Registro)
===================== */

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

/* =====================
   FORM VALIDATION (General)
===================== */

const form = document.getElementById('form');
const firstname_input = document.getElementById('firstname-input');
const email_input = document.getElementById('email-input');
const username_input = document.getElementById('username-input'); // Cambiar a username
const password_input = document.getElementById('password-input');
const repeat_password_input = document.getElementById('repeat-password-input');
const error_message = document.getElementById('error-message');

form.addEventListener('submit', (e) => {
  let errors = [];

  if (username_input) {
    // Si estamos en el formulario de inicio de sesión
    errors = getLoginFormErrors(username_input.value, password_input.value);
  } else {
    // Si estamos en el formulario de registro
    errors = getSignupFormErrors(
      firstname_input.value,
      email_input.value,
      password_input.value,
      repeat_password_input.value
    );
  }

  if (errors.length > 0) {
    // Si hay errores
    e.preventDefault();
    error_message.innerText = errors.join('. ');
  }
});

function getSignupFormErrors(firstname, email, password, repeatPassword) {
  let errors = [];

  if (firstname === '' || firstname == null) {
    errors.push('Firstname is required');
    firstname_input.parentElement.classList.add('incorrect');
  }
  if (email === '' || email == null) {
    errors.push('Email is required');
    email_input.parentElement.classList.add('incorrect');
  }
  if (password === '' || password == null) {
    errors.push('Password is required');
    password_input.parentElement.classList.add('incorrect');
  }
  if (password.length < 8) {
    errors.push('Password must have at least 8 characters');
    password_input.parentElement.classList.add('incorrect');
  }
  if (password !== repeatPassword) {
    errors.push('Password does not match repeated password');
    password_input.parentElement.classList.add('incorrect');
    repeat_password_input.parentElement.classList.add('incorrect');
  }

  return errors;
}

function getLoginFormErrors(username, password) {
  let errors = [];

  if (username === '' || username == null) {
    errors.push('Username is required');
    username_input.parentElement.classList.add('incorrect');
  }
  if (password === '' || password == null) {
    errors.push('Password is required');
    password_input.parentElement.classList.add('incorrect');
  }

  return errors;
}

const allInputs = [firstname_input, email_input, username_input, password_input, repeat_password_input].filter(
  (input) => input != null
);

allInputs.forEach((input) => {
  input.addEventListener('input', () => {
    if (input.parentElement.classList.contains('incorrect')) {
      input.parentElement.classList.remove('incorrect');
      error_message.innerText = '';
    }
  });
});
