from flask import Blueprint, render_template, request, flash, redirect, url_for
from flask_login import login_required, current_user
from app.extensions import db
from app.models.models import User

users_bp = Blueprint('users', __name__)

@users_bp.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        # Validar y actualizar nombre de usuario
        if username and username != current_user.username:
            if User.query.filter(User.username == username).first():
                flash('El nombre de usuario ya existe.', 'danger')
                return redirect(url_for('users.profile'))
            current_user.username = username
        # Validar y actualizar correo
        if email and email != current_user.email:
            if User.query.filter(User.email == email).first():
                flash('El correo electrónico ya existe.', 'danger')
                return redirect(url_for('users.profile'))
            current_user.email = email
        # Actualizar contraseña si se proporcionó
        if password:
            if password != confirm_password:
                flash('Las contraseñas no coinciden.', 'danger')
                return redirect(url_for('users.profile'))
            current_user.set_password(password)
        db.session.commit()
        flash('Perfil actualizado con éxito.', 'success')
        return redirect(url_for('users.profile'))
    return render_template('profile.html')
