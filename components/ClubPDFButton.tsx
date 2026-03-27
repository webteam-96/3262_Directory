'use client';

import { useState } from 'react';

// B5 portrait: 176 × 250 mm
const B5_W_MM  = 176;
const B5_H_MM  = 250;
const PX20_MM  = 20 * 25.4 / 96; // 20px → ~5.29 mm

// SVG viewBox is 498.9 × 708.66.
// Top border elements end at y≈64.8  →  64.8/708.66 * 250 ≈ 22.9 mm
// Bottom border starts at y≈675      →  (708.66-675)/708.66 * 250 ≈ 11.9 mm
const TOP_PAD_MM  = 64.8  / 708.66 * 250 + PX20_MM; // ≈ 28.2 mm
const BOT_PAD_MM  = (708.66 - 675) / 708.66 * 250 + PX20_MM; // ≈ 17.2 mm
const SIDE_PAD_MM = PX20_MM; // ≈ 5.3 mm  (sides have only thin decorations)

const CONT_W = B5_W_MM - SIDE_PAD_MM * 2;         // ~165.4 mm
const CONT_H = B5_H_MM - TOP_PAD_MM - BOT_PAD_MM; // ~204.6 mm

// Output page canvas at 150 DPI — small enough to encode fast, sharp enough for print
const OUT_DPI      = 150;
const OUT_PX_PER_MM = OUT_DPI / 25.4;                          // ~5.91
const OUT_W        = Math.round(B5_W_MM * OUT_PX_PER_MM);     // ~1039 px
const OUT_H        = Math.round(B5_H_MM * OUT_PX_PER_MM);     // ~1476 px

/** Swap cross-origin img srcs → proxy, wait to load, return restore fn */
async function proxyImages(el: HTMLElement): Promise<() => void> {
  const imgs    = Array.from(el.querySelectorAll('img')) as HTMLImageElement[];
  const origSrcs = imgs.map((i) => i.src);
  for (const img of imgs) {
    const src = img.getAttribute('src') || '';
    if (!src || src.startsWith('/') || src.startsWith(window.location.origin)) continue;
    img.src = `/api/proxy-image?url=${encodeURIComponent(src)}`;
  }
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((res) => {
          if (img.complete && img.naturalWidth > 0) { res(); return; }
          img.onload  = () => res();
          img.onerror = () => res();
        }),
    ),
  );
  return () => imgs.forEach((img, i) => { img.src = origSrcs[i]; });
}

/** Load an SVG URL and rasterise it to a PNG data-URL at the given pixel size */
async function svgToPngDataUrl(svgUrl: string, wPx: number, hPx: number): Promise<string> {
  const res     = await fetch(svgUrl);
  const svgText = await res.text();
  const blob    = new Blob([svgText], { type: 'image/svg+xml' });
  const objUrl  = URL.createObjectURL(blob);
  return new Promise<string>((resolve, reject) => {
    const img  = new Image();
    img.onload = () => {
      const c   = document.createElement('canvas');
      c.width   = wPx;
      c.height  = hPx;
      c.getContext('2d')!.drawImage(img, 0, 0, wPx, hPx);
      URL.revokeObjectURL(objUrl);
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = () => { URL.revokeObjectURL(objUrl); reject(new Error('SVG load failed')); };
    img.src = objUrl;
  });
}

/** Draw a rectangular region of src-canvas onto a new canvas and return it */
function sliceCanvas(src: HTMLCanvasElement, y: number, h: number): HTMLCanvasElement {
  const c   = document.createElement('canvas');
  c.width   = src.width;
  c.height  = h;
  c.getContext('2d')!.drawImage(src, 0, y, src.width, h, 0, 0, src.width, h);
  return c;
}

export default function ClubPDFButton({ clubName }: { clubName: string }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const el = document.getElementById('club-directory-canvas');
      if (!el) { alert('Layout element not found.'); return; }

      // Read table coordinates exposed via data attributes (layout px, unscaled)
      const SCALE   = 2;
      const tH      = parseInt(el.dataset.tableH || '0') * SCALE; // table header top
      const tR      = parseInt(el.dataset.tableR || '0') * SCALE; // first data row top
      const rowHpx  = parseInt(el.dataset.rowH   || '70') * SCALE; // row step
      const hdrH    = tR - tH;                                      // header section height

      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF }   = await import('jspdf');

      // Rasterise both SVGs at output page size
      const [rightBmp, leftBmp] = await Promise.all([
        svgToPngDataUrl('/assets/border-right.svg', OUT_W, OUT_H).then(d => fetch(d).then(r => r.blob())).then(b => createImageBitmap(b)),
        svgToPngDataUrl('/assets/border-left.svg',  OUT_W, OUT_H).then(d => fetch(d).then(r => r.blob())).then(b => createImageBitmap(b)),
      ]);

      const prevOverflow = el.style.overflow;
      el.style.overflow  = 'visible';
      const restoreImgs  = await proxyImages(el);

      const canvas = await html2canvas(el, {
        scale:           SCALE,
        useCORS:         true,
        allowTaint:      false,
        backgroundColor: '#ffffff',
        logging:         false,
      });

      restoreImgs();
      el.style.overflow = prevOverflow;

      // capture px/mm — used only for row-count maths
      const pxPerMM = canvas.width / CONT_W;
      const pageHPx = Math.round(CONT_H * pxPerMM); // content area height in capture-px

      // Scale factor: capture-px → output-px
      const capToOut = OUT_PX_PER_MM / pxPerMM;

      // Output-px positions for the content area
      const outX = Math.round(SIDE_PAD_MM * OUT_PX_PER_MM);
      const outY = Math.round(TOP_PAD_MM  * OUT_PX_PER_MM);
      const outW = Math.round(CONT_W      * OUT_PX_PER_MM);

      /**
       * Composite white + SVG border + content into one OUT_W×OUT_H canvas.
       * Small size + JPEG = fast encode, small PDF, no image-boundary lines.
       */
      const makePage = (contentC: HTMLCanvasElement, contentHPx: number, bgBmp: ImageBitmap): string => {
        const pg  = document.createElement('canvas');
        pg.width  = OUT_W;
        pg.height = OUT_H;
        const ctx = pg.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, OUT_W, OUT_H);
        ctx.drawImage(bgBmp, 0, 0, OUT_W, OUT_H);
        ctx.drawImage(contentC, 0, 0, contentC.width, contentHPx,
          outX, outY, outW, Math.round(contentHPx * capToOut));
        return pg.toDataURL('image/jpeg', 0.88);
      };

      // How many rows fit on page 1 (above tR there is the details block)
      const rows1Max    = Math.max(1, Math.floor((pageHPx - tR) / rowHpx));
      // Subsequent pages: table header repeated + rows
      const rowsPerPage = Math.max(1, Math.floor((pageHPx - hdrH) / rowHpx));

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'b5' });

      let pageIndex = 0;

      // ── PAGE 1: details + table header + rows that fit ───────────────
      const page1End = Math.min(tR + rows1Max * rowHpx, canvas.height);
      pdf.addImage(makePage(sliceCanvas(canvas, 0, page1End), page1End, pageIndex % 2 === 0 ? rightBmp : leftBmp),
        'JPEG', 0, 0, B5_W_MM, B5_H_MM);
      pageIndex++;

      // ── SUBSEQUENT PAGES: table header + rows ────────────────────────
      let   nextRow   = rows1Max;
      const totalRows = Math.floor((canvas.height - tR) / rowHpx);

      while (nextRow < totalRows) {
        pdf.addPage('b5', 'portrait');

        const rowsThisPage = Math.min(rowsPerPage, totalRows - nextRow);
        const rowsH        = rowsThisPage * rowHpx;
        const compositeH   = hdrH + rowsH;

        // Build composite: [table header] + [rows slice]
        const comp   = document.createElement('canvas');
        comp.width   = canvas.width;
        comp.height  = compositeH;
        const ctx    = comp.getContext('2d')!;
        ctx.drawImage(canvas, 0, tH, canvas.width, hdrH, 0, 0, canvas.width, hdrH);
        ctx.drawImage(canvas,
          0, tR + nextRow * rowHpx, canvas.width, rowsH,
          0, hdrH,                  canvas.width, rowsH);

        // odd pages (1,3,5…) → right SVG; even pages (2,4,6…) → left SVG
        pdf.addImage(makePage(comp, compositeH, pageIndex % 2 === 0 ? rightBmp : leftBmp), 'JPEG', 0, 0, B5_W_MM, B5_H_MM);
        pageIndex++;
        nextRow += rowsThisPage;
      }

      pdf.save(`${clubName}.pdf`);

    } catch (err: any) {
      console.error(err);
      alert('PDF failed: ' + err?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      style={{
        borderRadius: 50,
        padding: '8px 24px',
        background: loading ? '#888' : '#0F6EB7',
        border: 'none',
        color: '#fff',
        fontSize: 15,
        cursor: loading ? 'not-allowed' : 'pointer',
      }}
    >
      {loading ? 'Generating PDF...' : 'Download PDF'}
    </button>
  );
}
