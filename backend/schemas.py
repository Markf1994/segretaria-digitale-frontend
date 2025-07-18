from pydantic import BaseModel
from datetime import datetime
from enum import Enum


class TipoSegnalazione(str, Enum):
    PIANTE = "Piante"
    ANIMALI = "Animali"
    DANNEGGIAMENTI = "Danneggiamenti"
    REATI = "Reati"
    ALTRO = "Altro"


class StatoSegnalazione(str, Enum):
    APERTA = "aperta"
    IN_LAVORAZIONE = "in lavorazione"
    CHIUSA = "chiusa"

class SegnalazioneBase(BaseModel):
    tipo: TipoSegnalazione
    priorita: str
    stato: StatoSegnalazione
    descrizione: str | None = None
    lat: float | None = None
    lng: float | None = None

class SegnalazioneCreate(SegnalazioneBase):
    pass

class Segnalazione(SegnalazioneBase):
    id: int
    data: datetime

    class Config:
        orm_mode = True


class User(BaseModel):
    id: str
    email: str
    nome: str


class LoginRequest(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
