"""
Generic CRUD base every domain repository extends. Keeps the session
itself out of route/service code — routes call a repository method, the
repository owns all querying. None of these methods commit; the caller's
FastAPI dependency (db/session.py's get_db / get_db_optional) commits once
per request, so a single request that touches several repositories still
gets one atomic transaction.
"""
import uuid
from typing import Generic, List, Optional, Type, TypeVar

from sqlalchemy import select
from sqlalchemy.orm import Session

ModelType = TypeVar("ModelType")


class BaseRepository(Generic[ModelType]):
    model: Type[ModelType]

    def __init__(self, db: Session):
        self.db = db

    def get(self, id: uuid.UUID) -> Optional[ModelType]:
        return self.db.get(self.model, id)

    def get_or_404(self, id: uuid.UUID) -> ModelType:
        obj = self.get(id)
        if obj is None:
            raise LookupError(f"{self.model.__name__} {id} not found")
        return obj

    def list(self, *, limit: int = 100, offset: int = 0) -> List[ModelType]:
        stmt = select(self.model).order_by(self.model.created_at.desc()).offset(offset).limit(limit)
        return list(self.db.scalars(stmt))

    def create(self, **kwargs) -> ModelType:
        obj = self.model(**kwargs)
        self.db.add(obj)
        self.db.flush()
        return obj

    def update(self, obj: ModelType, **kwargs) -> ModelType:
        for key, value in kwargs.items():
            setattr(obj, key, value)
        self.db.flush()
        return obj

    def delete(self, obj: ModelType) -> None:
        self.db.delete(obj)
        self.db.flush()
