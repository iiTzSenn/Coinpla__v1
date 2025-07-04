from flask import Blueprint, render_template, redirect, url_for, flash
from flask_login import login_required, current_user
from app.models.models import User, Technician
from app.extensions import db

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

@admin_bp.route('/users')
@login_required
def admin_users():
    if current_user.role != 'admin':
        flash("Acceso denegado", "danger")
        return redirect(url_for('jobs.index'))
    users = User.query.all()
    technicians = Technician.query.all()
    return render_template('admin_users.html', users=users, technicians=technicians)

@admin_bp.route('/delete_pending/<int:user_id>', methods=['POST'])
@login_required
def admin_delete_pending_user(user_id):
    if current_user.role != 'admin':
        flash("Acceso denegado", "danger")
        return redirect(url_for('jobs.index'))
    user = User.query.get_or_404(user_id)
    # Solo se pueden eliminar usuarios pendientes (no verificados)
    if user.verified:
        flash("No se puede eliminar un usuario ya verificado", "warning")
        return redirect(url_for('admin.admin_users'))
    db.session.delete(user)
    db.session.commit()
    flash("Solicitud de verificación eliminada", "success")
    return redirect(url_for('admin.admin_users'))


@admin_bp.route('/verify/<int:user_id>', methods=['POST'])
@login_required
def admin_verify_user(user_id):
    if current_user.role != 'admin':
        flash("Acceso denegado", "danger")
        return redirect(url_for('jobs.index'))
    user = User.query.get_or_404(user_id)
    user.verified = True
    db.session.commit()
    
    # Si el usuario es técnico y no tiene perfil de técnico, se crea
    if user.role == 'tecnico' and not user.technician_profile:
        technician_profile = Technician(nombre=user.username, email=user.email, user_id=user.id)
        db.session.add(technician_profile)
        db.session.commit()
    
    flash("Usuario verificado", "success")
    return redirect(url_for('admin.admin_users'))

@admin_bp.route('/unverify/<int:user_id>', methods=['POST'])
@login_required
def admin_unverify_user(user_id):
    if current_user.role != 'admin':
        flash("Acceso denegado", "danger")
        return redirect(url_for('jobs.index'))
    user = User.query.get_or_404(user_id)
    user.verified = False
    db.session.commit()
    flash("Usuario desverificado", "success")
    return redirect(url_for('admin.admin_users'))

@admin_bp.route('/promote/<int:user_id>', methods=['POST'])
@login_required
def admin_promote_user(user_id):
    if current_user.role != 'admin':
        flash("Acceso denegado", "danger")
        return redirect(url_for('jobs.index'))
    user = User.query.get_or_404(user_id)
    user.role = 'admin'
    db.session.commit()
    flash("Usuario promovido a admin", "success")
    return redirect(url_for('admin.admin_users'))

@admin_bp.route('/demote/<int:user_id>', methods=['POST'])
@login_required
def admin_demote_user(user_id):
    if current_user.role != 'admin' or user_id == current_user.id:
        flash("Operación no permitida", "warning")
        return redirect(url_for('admin.admin_users'))
    user = User.query.get_or_404(user_id)
    user.role = 'tecnico'
    db.session.commit()
    flash("Usuario degradado a técnico", "success")
    return redirect(url_for('admin.admin_users'))

@admin_bp.route('/delete/<int:user_id>', methods=['POST'])
@login_required
def admin_delete_user(user_id):
    if current_user.role != 'admin' or user_id == current_user.id:
        flash("No puedes eliminar tu propio usuario", "warning")
        return redirect(url_for('admin.admin_users'))
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    flash("Usuario eliminado", "success")
    return redirect(url_for('admin.admin_users'))
