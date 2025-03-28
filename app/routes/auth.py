from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_user, logout_user, login_required
from sqlalchemy import or_
from app.models.models import User  # Ya no importamos Technician aquí
from app.extensions import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            if not user.verified:
                flash("Cuenta no verificada. Espera aprobación.", "danger")
                return redirect(url_for('auth.login'))
            login_user(user)
            flash("Inicio de sesión exitoso", "success")
            return redirect(url_for('jobs.index'))
        else:
            flash("Credenciales incorrectas", "danger")
    return render_template('login.html')

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')  # Capturar el username
        email = request.form.get('email')
        password = request.form.get('password')
        
        if not username:
            flash('El nombre de usuario es obligatorio.', 'error')
            return redirect(url_for('auth.register'))
        
        # Verificar que no exista ya el usuario o email
        if User.query.filter(or_(User.username == username, User.email == email)).first():
            flash("El usuario o email ya existe.", "danger")
            return redirect(url_for('auth.register'))
        # Crear el usuario; por defecto el rol es "tecnico"
        new_user = User(username=username, email=email, password=password)
        db.session.add(new_user)
        db.session.commit()
        
        flash("Registro exitoso. Espera verificación.", "info")
        return redirect(url_for('auth.login'))
    return render_template('register.html')

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash("Sesión cerrada", "success")
    return redirect(url_for('auth.login'))
