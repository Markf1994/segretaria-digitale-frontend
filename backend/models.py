from sqlalchemy import Column, Integer, String, DateTime, Float
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
