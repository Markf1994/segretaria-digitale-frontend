from sqlalchemy.orm import Session
from . import models, schemas


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
