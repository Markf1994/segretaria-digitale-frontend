from __future__ import annotations

from pathlib import Path
import tempfile

HTML_TEMPLATE = """\
<!DOCTYPE html>
<html>
<head>
<meta charset='utf-8'>
<style>
  body {{ font-family: Arial, sans-serif; }}
  header {{ display: flex; align-items: center; gap: 10px; }}
  header img {{ height: 60px; }}
  table {{ border-collapse: collapse; width: 100%; margin-top: 1em; }}
  th, td {{ border: 1px solid #000; padding: 4px; text-align: left; }}
</style>
</head>
<body>
<header>
  <img src="logo.png" alt="logo">
  <h1>Piano Segnaletica Orizzontale Anno {year}</h1>
</header>
<table>
  <thead>
    <tr><th>Azienda</th><th>Lavori da eseguire</th><th>Quantità</th></tr>
  </thead>
  <tbody>
    {rows}
  </tbody>
</table>
</body>
</html>
"""

def build_segnaletica_orizzontale_pdf(year: int, azienda: str, lavori: list[dict]) -> Path:
    """Build a very simple PDF file for horizontal signage.

    The PDF here is actually an HTML file with .pdf extension so that browsers
    can open it. It includes the Polizia logo next to the title and a table of
    works with the 'Lavori da eseguire' header.
    """
    rows_html = "\n    ".join(
        f"<tr><td>{azienda}</td><td>{l.get('descrizione','')}</td><td>{l.get('quantita','')}</td></tr>"
        for l in lavori
    )
    html = HTML_TEMPLATE.format(year=year, rows=rows_html)

    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    path = Path(tmp.name)
    path.write_text(html, encoding="utf-8")
    tmp.close()
    return path
