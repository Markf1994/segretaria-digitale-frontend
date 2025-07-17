"""create segnalazioni table"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0001"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "segnalazioni",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("tipo", sa.String, nullable=False),
        sa.Column("priorita", sa.String, nullable=False),
        sa.Column("stato", sa.String, nullable=False),
        sa.Column("data", sa.DateTime, nullable=True),
        sa.Column("descrizione", sa.String, nullable=True),
        sa.Column("lat", sa.Float, nullable=True),
        sa.Column("lng", sa.Float, nullable=True),
    )

def downgrade():
    op.drop_table("segnalazioni")
