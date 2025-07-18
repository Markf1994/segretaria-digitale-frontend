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


class SegnalazioneUpdate(BaseModel):
    tipo: str | None = None
    priorita: str | None = None
    stato: str | None = None
    descrizione: str | None = None
    lat: float | None = None
    lng: float | None = None

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
