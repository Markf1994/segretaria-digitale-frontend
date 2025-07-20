from sqlalchemy.orm import Session
from . import models, schemas
import datetime


def get_segnalazioni(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Segnalazione).offset(skip).limit(limit).all()


def create_segnalazione(db: Session, segnalazione: schemas.SegnalazioneCreate):
    db_segnalazione = models.Segnalazione(**segnalazione.model_dump(mode="json"))
    db.add(db_segnalazione)
    db.commit()
    db.refresh(db_segnalazione)
    return db_segnalazione


def update_segnalazione(
    db: Session,
    segnalazione_id: int,
    segnalazione: schemas.SegnalazioneUpdate,
):
    db_segnalazione = (
        db.query(models.Segnalazione)
        .filter(models.Segnalazione.id == segnalazione_id)
        .first()
    )
    if not db_segnalazione:
        return None
    for key, value in segnalazione.dict(exclude_unset=True).items():
        setattr(db_segnalazione, key, value)
    db.commit()
    db.refresh(db_segnalazione)
    return db_segnalazione


def create_horizontal_sign(db: Session, sign: schemas.HorizontalSignCreate):
    db_sign = models.HorizontalSign(**sign.model_dump(mode="json"))
    db.add(db_sign)
    db.commit()
    db.refresh(db_sign)
    return db_sign


def get_horizontal_signs(
    db: Session, plan: int | None = None, year: int | None = None
):
    query = db.query(models.HorizontalSign)
    if plan is not None:
        query = query.filter(models.HorizontalSign.piano_id == plan)
    if year is not None:
        start = datetime.datetime(year, 1, 1)
        end = datetime.datetime(year + 1, 1, 1)
        query = query.filter(models.HorizontalSign.data >= start)
        query = query.filter(models.HorizontalSign.data < end)
    return query.all()


def update_horizontal_sign(
    db: Session, sign_id: int, sign: schemas.HorizontalSignUpdate
):
    db_sign = db.query(models.HorizontalSign).filter(models.HorizontalSign.id == sign_id).first()
    if not db_sign:
        return None
    for key, value in sign.dict(exclude_unset=True).items():
        setattr(db_sign, key, value)
    db.commit()
    db.refresh(db_sign)
    return db_sign


def delete_horizontal_sign(db: Session, sign_id: int) -> bool:
    db_sign = db.query(models.HorizontalSign).filter(models.HorizontalSign.id == sign_id).first()
    if not db_sign:
        return False
    db.delete(db_sign)
    db.commit()
    return True


def get_horizontal_years(db: Session) -> list[int]:
    years = {
        s.data.year for s in db.query(models.HorizontalSign).all() if s.data is not None
    }
    return sorted(years)
