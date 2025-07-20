from __future__ import annotations

import os
import sys
from pathlib import Path as _P
import importlib

from fastapi.testclient import TestClient

# ensure project root is on sys.path when running tests directly
ROOT = _P(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


def get_test_app(tmp_path: _P):
    db_path = tmp_path / "test.db"
    os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"

    from backend import database
    importlib.reload(database)
    from backend import models
    importlib.reload(models)
    from backend import crud
    importlib.reload(crud)
    from backend import main
    importlib.reload(main)

    return main.app


def test_horizontal_crud(tmp_path: _P):
    app = get_test_app(tmp_path)
    client = TestClient(app)

    data = {
        "luogo": "Az",
        "data": "2024-05-01T00:00:00",
        "descrizione": "Desc",
        "quantita": 1,
        "piano_id": 2,
    }
    resp = client.post("/inventario/signage-horizontal/", json=data)
    assert resp.status_code == 200
    sign = resp.json()
    sign_id = sign["id"]

    resp = client.get("/inventario/signage-horizontal/")
    assert resp.status_code == 200
    assert len(resp.json()) == 1

    resp = client.put(
        f"/inventario/signage-horizontal/{sign_id}/",
        json={"descrizione": "New"},
    )
    assert resp.json()["descrizione"] == "New"

    resp = client.get("/inventario/signage-horizontal/years/")
    assert resp.json() == [2024]

    resp = client.get("/inventario/signage-horizontal/pdf/", params={"year": 2024})
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/pdf"

    resp = client.delete(f"/inventario/signage-horizontal/{sign_id}/")
    assert resp.status_code == 204
    resp = client.get("/inventario/signage-horizontal/")
    assert resp.json() == []


def test_pdf_removed_after_response(tmp_path: _P) -> None:
    app = get_test_app(tmp_path)

    from backend import main as main_module

    pdf_file = tmp_path / "out.pdf"

    def fake_pdf(year: int, azienda: str, lavori: list[dict]):
        pdf_file.write_text("dummy", encoding="utf-8")
        return pdf_file

    main_module.pdf.build_segnaletica_orizzontale_pdf = fake_pdf

    client = TestClient(app)
    resp = client.get("/inventario/signage-horizontal/pdf/", params={"year": 2024})
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/pdf"
    assert not pdf_file.exists()
