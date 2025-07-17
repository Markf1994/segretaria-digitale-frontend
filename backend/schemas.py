from pydantic import BaseModel
from datetime import datetime

class SegnalazioneBase(BaseModel):
    tipo: str
    priorita: str
    stato: str
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
