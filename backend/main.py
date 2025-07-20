import os
import csv
from io import StringIO
import datetime
from fastapi import (
    Depends,
    FastAPI,
    HTTPException,
    status,
    Response,
    BackgroundTasks,
    UploadFile,
    File,
)
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import jwt
from . import models, schemas, crud, pdf
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


@app.get(
    "/inventario/signage-horizontal/",
    response_model=list[schemas.HorizontalSign],
)
def list_horizontal_signs(
    year: int | None = None,
    db: Session = Depends(get_db),
):
    return crud.get_horizontal_signs(db, year=year)


@app.post(
    "/inventario/signage-horizontal/",
    response_model=schemas.HorizontalSign,
)
def create_horizontal_sign(sign: schemas.HorizontalSignCreate, db: Session = Depends(get_db)):
    return crud.create_horizontal_sign(db, sign)


@app.put(
    "/inventario/signage-horizontal/{sign_id}/",
    response_model=schemas.HorizontalSign,
)
def update_horizontal_sign(sign_id: int, sign: schemas.HorizontalSignUpdate, db: Session = Depends(get_db)):
    db_sign = crud.update_horizontal_sign(db, sign_id, sign)
    if db_sign is None:
        raise HTTPException(status_code=404, detail="Horizontal sign not found")
    return db_sign


@app.delete("/inventario/signage-horizontal/{sign_id}/", status_code=204)
def delete_horizontal_sign(sign_id: int, db: Session = Depends(get_db)):
    if not crud.delete_horizontal_sign(db, sign_id):
        raise HTTPException(status_code=404, detail="Horizontal sign not found")
    return Response(status_code=204)


@app.get("/inventario/signage-horizontal/years/", response_model=list[int])
def list_horizontal_years(db: Session = Depends(get_db)):
    return crud.get_horizontal_years(db)


@app.get("/inventario/signage-horizontal/pdf/")
def horizontal_pdf(
    year: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    signs = crud.get_horizontal_signs(db, year=year)
    lavori = [
        {"descrizione": s.descrizione or "", "quantita": s.quantita or ""} for s in signs
    ]
    pdf_path = pdf.build_segnaletica_orizzontale_pdf(year, "Azienda", lavori)
    background_tasks.add_task(pdf_path.unlink)
    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=f"segnaletica_orizzontale_{year}.pdf",
    )


@app.post("/segnaletica-orizzontale/import")
def import_horizontal_signs(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Import horizontal signage from a CSV file and return a PDF summary."""
    try:
        content = file.file.read().decode("utf-8")
    finally:
        file.file.close()

    reader = csv.DictReader(StringIO(content))
    if not reader.fieldnames or not {"azienda", "descrizione"}.issubset(
        {h.strip().lower() for h in reader.fieldnames}
    ):
        raise HTTPException(status_code=400, detail="Invalid CSV format")

    year = datetime.datetime.now().year
    lavori: list[dict] = []
    azienda_name: str | None = None

    for row in reader:
        azienda = (row.get("azienda") or "").strip()
        descrizione = (row.get("descrizione") or "").strip()
        if not descrizione:
            continue
        if azienda_name is None:
            azienda_name = azienda
        sign = schemas.HorizontalSignCreate(
            luogo=azienda,
            data=datetime.datetime(year, 1, 1),
            descrizione=descrizione,
            quantita=None,
        )
        crud.create_horizontal_sign(db, sign)
        lavori.append({"descrizione": descrizione, "quantita": ""})

    if not lavori:
        raise HTTPException(status_code=400, detail="No valid rows found")

    pdf_path = pdf.build_segnaletica_orizzontale_pdf(
        year, azienda_name or "", lavori
    )
    background_tasks.add_task(pdf_path.unlink)
    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=f"segnaletica_orizzontale_{year}.pdf",
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
