"""add checks for tipo and stato columns"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None

TIPO_VALUES = ("Piante", "Animali", "Danneggiamenti", "Reati", "Altro")
STATO_VALUES = ("aperta", "in lavorazione", "chiusa")


def upgrade():
    conn = op.get_bind()
    if conn.dialect.name == "sqlite":
        # SQLite doesn't support ALTER ADD CONSTRAINT easily; use a CHECK
        op.execute(
            sa.text(
                f"CREATE TEMPORARY TABLE segnalazioni_tmp AS SELECT * FROM segnalazioni"))
        op.drop_table("segnalazioni")
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
            sa.CheckConstraint(
                f"tipo IN ({', '.join(repr(v) for v in TIPO_VALUES)})",
                name="tipo_check",
            ),
            sa.CheckConstraint(
                f"stato IN ({', '.join(repr(v) for v in STATO_VALUES)})",
                name="stato_check",
            ),
        )
        op.execute(sa.text("INSERT INTO segnalazioni SELECT * FROM segnalazioni_tmp"))
        op.execute(sa.text("DROP TABLE segnalazioni_tmp"))
    else:
        op.create_check_constraint(
            "tipo_check",
            "segnalazioni",
            f"tipo IN ({', '.join(repr(v) for v in TIPO_VALUES)})",
        )
        op.create_check_constraint(
            "stato_check",
            "segnalazioni",
            f"stato IN ({', '.join(repr(v) for v in STATO_VALUES)})",
        )


def downgrade():
    conn = op.get_bind()
    if conn.dialect.name != "sqlite":
        op.drop_constraint("tipo_check", "segnalazioni", type_="check")
        op.drop_constraint("stato_check", "segnalazioni", type_="check")
    else:
        op.execute(
            sa.text(
                f"CREATE TEMPORARY TABLE segnalazioni_tmp AS SELECT * FROM segnalazioni"))
        op.drop_table("segnalazioni")
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
        op.execute(sa.text("INSERT INTO segnalazioni SELECT * FROM segnalazioni_tmp"))
        op.execute(sa.text("DROP TABLE segnalazioni_tmp"))
