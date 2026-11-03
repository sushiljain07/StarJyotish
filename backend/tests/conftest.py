"""
Point every DB-backed test at a dedicated test database.

The DB-backed test modules each `load_dotenv(backend/.env)` and skip when
DATABASE_URL is unset. Without this file they ran against whatever
backend/.env named — normally the developer's dev database — and left
throwaway users, profiles and reports there.

Rules (applied before any test module or app code is imported):
  - TEST_DATABASE_URL set (env var or backend/.env) → DATABASE_URL is
    replaced with it, so the app and the tests use the test database.
  - TEST_DATABASE_URL unset → DATABASE_URL is blanked, so DB-backed tests
    skip instead of touching the dev database. load_dotenv() never
    overrides a variable that already exists, so the blank value sticks.
  - CI sets TEST_DATABASE_URL to its throwaway Postgres service.

Create the local test database once and migrate it:
    createdb starjyotish_test
    DATABASE_URL=$TEST_DATABASE_URL alembic upgrade head
"""
import os
from pathlib import Path

from dotenv import dotenv_values

_env_file = dotenv_values(Path(__file__).resolve().parent.parent / ".env")
_test_url = (os.getenv("TEST_DATABASE_URL") or _env_file.get("TEST_DATABASE_URL") or "").strip()

os.environ["DATABASE_URL"] = _test_url
