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


@app.post("/login", response_model=schemas.Token)
def login(data: schemas.LoginRequest):
    token_data = {
        "sub": data.email,
        "email": data.email,
        "nome": data.email.split("@")[0],
    }
    access_token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": access_token}


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> schemas.User:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    return schemas.User(
        id=str(payload.get("sub", "")),
        email=str(payload.get("email", "")),
        nome=str(payload.get("nome", "")),
    )


@app.post("/segnalazioni", response_model=schemas.Segnalazione, dependencies=[Depends(get_current_user)])
def create_segnalazione(segnalazione: schemas.SegnalazioneCreate, db: Session = Depends(get_db)):
    return crud.create_segnalazione(db, segnalazione)


@app.patch(
    "/segnalazioni/{segnalazione_id}",
    response_model=schemas.Segnalazione,
    dependencies=[Depends(get_current_user)],
)
def update_segnalazione(
    segnalazione_id: int,
    segnalazione: schemas.SegnalazioneUpdate,
    db: Session = Depends(get_db),
):
    db_segnalazione = crud.update_segnalazione(db, segnalazione_id, segnalazione)
    if db_segnalazione is None:
        raise HTTPException(status_code=404, detail="Segnalazione not found")
    return db_segnalazione


@app.get("/segnalazioni", response_model=list[schemas.Segnalazione])
def read_segnalazioni(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_segnalazioni(db, skip=skip, limit=limit)


@app.get("/users/me", response_model=schemas.User)
def read_users_me(current_user: schemas.User = Depends(get_current_user)):
    return current_user


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
