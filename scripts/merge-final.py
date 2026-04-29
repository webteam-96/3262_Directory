"""Merge 00.pdf + 22-04-draft-merged.pdf + 23.pdf into a final book."""
from pathlib import Path
from pypdf import PdfWriter

ROOT = Path(__file__).resolve().parent.parent
FIRST  = ROOT / "22-04-draft" / "00.pdf"
MIDDLE = ROOT / "22-04-draft-merged.pdf"
LAST   = ROOT / "22-04-draft" / "23.pdf"
OUT    = ROOT / "22-04-draft-final.pdf"

files = [FIRST, MIDDLE, LAST]

writer = PdfWriter()
for p in files:
    print(f"  + {p.name}")
    writer.append(str(p))

with open(OUT, "wb") as f:
    writer.write(f)

print(f"\nFinal -> {OUT}")
