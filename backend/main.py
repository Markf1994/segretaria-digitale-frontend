import os
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import jwt
from . import models, schemas, crud
from .database import SessionLocal, engine
from fastapi.middleware.cors import CORSMiddleware

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

SECRET_KEY = os.getenv("SECRET_KEY", "secret")
ALGORITHM = os.getenv("ALGORITHM", "HS256")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )


@app.post("/segnalazioni", response_model=schemas.Segnalazione, dependencies=[Depends(get_current_user)])
def create_segnalazione(segnalazione: schemas.SegnalazioneCreate, db: Session = Depends(get_db)):
    return crud.create_segnalazione(db, segnalazione)


@app.get("/segnalazioni", response_model=list[schemas.Segnalazione])
def read_segnalazioni(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_segnalazioni(db, skip=skip, limit=limit)
