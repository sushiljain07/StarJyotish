import os
import sys
from logging.config import fileConfig
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import engine_from_config, pool

from alembic import context

# Make `import db...` resolve the same way it does for the FastAPI app
# (both run with backend/ as the working directory / on sys.path).
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

# Load backend/.env so DATABASE_URL is available whether this runs locally
# or via `alembic upgrade head` in a deploy step — same file main.py loads.
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

from db.models import Base  # noqa: E402  (import after sys.path/env setup above)
from db.session import _normalize_url  # noqa: E402

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

database_url = os.getenv("DATABASE_URL", "").strip()
if database_url:
    config.set_main_option("sqlalchemy.url", _normalize_url(database_url))
elif not config.get_main_option("sqlalchemy.url"):
    raise RuntimeError(
        "DATABASE_URL is not set. Copy backend/.env.example to backend/.env "
        "and set DATABASE_URL before running Alembic."
    )

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Every model in db/models/ is imported by db/models/__init__.py, so this
# single import gives autogenerate the full schema picture.
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
