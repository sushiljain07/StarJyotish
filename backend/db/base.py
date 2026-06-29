"""
Declarative base for every ORM model in db/models/.

The naming convention below makes Alembic autogenerate produce stable,
predictable constraint/index names (uq_..., ix_..., fk_..., ck_..., pk_...)
instead of database-assigned defaults that differ between Postgres
versions and drivers. Without this, two autogenerate runs against the same
schema can produce spurious rename diffs.
"""
from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase

NAMING_CONVENTION = {
    "ix": "ix_%(table_name)s_%(column_0_N_name)s",
    "uq": "uq_%(table_name)s_%(column_0_N_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=NAMING_CONVENTION)
