"""first

Revision ID: 039935fc0820
Revises: 
Create Date: 2020-11-04 19:23:45.859706

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '039935fc0820'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('rooms',
    sa.Column('name', sa.String(length=64), nullable=False),
    sa.Column('bpm', sa.Integer(), nullable=True),
    sa.Column('num_of_bar', sa.Integer(), nullable=True),
    sa.PrimaryKeyConstraint('name')
    )
    op.create_index(op.f('ix_rooms_bpm'), 'rooms', ['bpm'], unique=False)
    op.create_index(op.f('ix_rooms_num_of_bar'), 'rooms', ['num_of_bar'], unique=False)
    op.create_table('sounds',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('sound_type', sa.String(length=64), nullable=True),
    sa.Column('pitch_name', sa.String(length=64), nullable=True),
    sa.Column('start', sa.Integer(), nullable=True),
    sa.Column('length', sa.Integer(), nullable=True),
    sa.Column('room', sa.String(length=64), nullable=True),
    sa.Column('made_by', sa.String(length=64), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_sounds_length'), 'sounds', ['length'], unique=False)
    op.create_index(op.f('ix_sounds_made_by'), 'sounds', ['made_by'], unique=False)
    op.create_index(op.f('ix_sounds_pitch_name'), 'sounds', ['pitch_name'], unique=False)
    op.create_index(op.f('ix_sounds_room'), 'sounds', ['room'], unique=False)
    op.create_index(op.f('ix_sounds_sound_type'), 'sounds', ['sound_type'], unique=False)
    op.create_index(op.f('ix_sounds_start'), 'sounds', ['start'], unique=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_sounds_start'), table_name='sounds')
    op.drop_index(op.f('ix_sounds_sound_type'), table_name='sounds')
    op.drop_index(op.f('ix_sounds_room'), table_name='sounds')
    op.drop_index(op.f('ix_sounds_pitch_name'), table_name='sounds')
    op.drop_index(op.f('ix_sounds_made_by'), table_name='sounds')
    op.drop_index(op.f('ix_sounds_length'), table_name='sounds')
    op.drop_table('sounds')
    op.drop_index(op.f('ix_rooms_num_of_bar'), table_name='rooms')
    op.drop_index(op.f('ix_rooms_bpm'), table_name='rooms')
    op.drop_table('rooms')
    # ### end Alembic commands ###