"""Merge PDFs from ./22-04-draft into a single file in folder order."""
from pathlib import Path
from pypdf import PdfWriter

SRC = Path(__file__).resolve().parent.parent / "22-04-draft"
OUT = SRC.parent / "22-04-draft-merged.pdf"

files = sorted(p for p in SRC.iterdir() if p.suffix.lower() == ".pdf")

writer = PdfWriter()
for p in files:
    print(f"  + {p.name}")
    writer.append(str(p))

with open(OUT, "wb") as f:
    writer.write(f)

print(f"\nMerged {len(files)} files -> {OUT}")
