from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
import datetime

class Segnalazione(Base):
    __tablename__ = "segnalazioni"

    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String, nullable=False)
    priorita = Column(String, nullable=False)
    stato = Column(String, nullable=False)
    data = Column(DateTime, default=datetime.datetime.utcnow)
    descrizione = Column(String, nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)


class HorizontalSign(Base):
    __tablename__ = "horizontal_signs"

    id = Column(Integer, primary_key=True, index=True)
    luogo = Column(String, nullable=False)
    data = Column(DateTime, default=datetime.datetime.utcnow)
    descrizione = Column(String, nullable=True)
    quantita = Column(Integer, nullable=True)
    piano_id = Column(Integer, nullable=True)
