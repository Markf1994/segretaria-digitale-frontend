from pathlib import Path
import sys
from pathlib import Path as _P

# ensure project root is on sys.path when running tests directly
ROOT = _P(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.pdf import build_segnaletica_orizzontale_pdf


def test_build_pdf_contains_logo_and_header(tmp_path: Path) -> None:
    lavori = [
        {"descrizione": "Tracciamento linee", "quantita": 1},
    ]
    pdf_path = build_segnaletica_orizzontale_pdf(2024, "ACME", lavori)

    data = pdf_path.read_text(encoding="utf-8")
    assert '<img src="logo.png"' in data
    assert "Lavori da eseguire" in data

    pdf_path.unlink()
