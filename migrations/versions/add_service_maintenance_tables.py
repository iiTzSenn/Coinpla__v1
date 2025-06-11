"""Add service and maintenance tables

Revision ID: add_service_maintenance_tables
Revises: 74d868b7ca1c
Create Date: 2023-06-11 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_service_maintenance_tables'
down_revision = '74d868b7ca1c'
branch_labels = None
depends_on = None


def upgrade():
    # Crear tabla de tipos de servicio
    op.create_table('service_types',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Crear tabla de subcategorías de servicio
    op.create_table('service_subcategories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('service_type_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['service_type_id'], ['service_types.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Crear tabla de planes de mantenimiento
    op.create_table('maintenance_plans',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('job_id', sa.Integer(), nullable=False),
        sa.Column('frequency', sa.String(length=50), nullable=False),
        sa.Column('duration', sa.Integer(), nullable=True),
        sa.Column('start_date', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['job_id'], ['jobs.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Añadir nuevas columnas a la tabla jobs
    op.add_column('jobs', sa.Column('service_type_id', sa.Integer(), nullable=True))
    op.add_column('jobs', sa.Column('service_subcategories', sa.String(length=500), nullable=True))
    op.add_column('jobs', sa.Column('has_maintenance', sa.Boolean(), default=False))
    
    # Crear clave foránea para service_type_id
    op.create_foreign_key(None, 'jobs', 'service_types', ['service_type_id'], ['id'])


def downgrade():
    # Eliminar columnas de la tabla jobs
    op.drop_constraint(None, 'jobs', type_='foreignkey')
    op.drop_column('jobs', 'has_maintenance')
    op.drop_column('jobs', 'service_subcategories')
    op.drop_column('jobs', 'service_type_id')
    
    # Eliminar tablas
    op.drop_table('maintenance_plans')
    op.drop_table('service_subcategories')
    op.drop_table('service_types')
