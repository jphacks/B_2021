"""first setup

Revision ID: 70b8b860e9cb
Revises: 
Create Date: 2020-10-31 15:37:45.698343

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '70b8b860e9cb'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('sounds',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('frequency', sa.Integer(), nullable=True),
    sa.Column('start', sa.Integer(), nullable=True),
    sa.Column('end', sa.Integer(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_sounds_end'), 'sounds', ['end'], unique=False)
    op.create_index(op.f('ix_sounds_frequency'), 'sounds', ['frequency'], unique=False)
    op.create_index(op.f('ix_sounds_start'), 'sounds', ['start'], unique=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_sounds_start'), table_name='sounds')
    op.drop_index(op.f('ix_sounds_frequency'), table_name='sounds')
    op.drop_index(op.f('ix_sounds_end'), table_name='sounds')
    op.drop_table('sounds')
    # ### end Alembic commands ###