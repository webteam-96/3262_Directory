'use client';

import { useState } from 'react';

// B5 portrait: 176 × 250 mm
const B5_W_MM = 176;
const B5_H_MM = 250;
const PX20_MM = 20 * 25.4 / 96; // ≈ 5.29 mm

// SVG viewBox: 498.9 × 708.66
// Top border elements end at y ≈ 64.8  → 64.8/708.66 * 250 ≈ 22.9 mm
// Bottom border starts at y ≈ 675      → (708.66-675)/708.66 * 250 ≈ 11.9 mm
const TOP_PAD_MM  = (64.8  / 708.66) * 250 + PX20_MM;         // ≈ 28.2 mm
const BOT_PAD_MM  = ((708.66 - 675) / 708.66) * 250 + PX20_MM; // ≈ 17.2 mm
const SIDE_PAD_MM = PX20_MM;                                     // ≈ 5.3 mm

const CONT_W = B5_W_MM - SIDE_PAD_MM * 2;         // ≈ 165.4 mm
const CONT_H = B5_H_MM - TOP_PAD_MM - BOT_PAD_MM; // ≈ 204.6 mm
const GAP_MM = PX20_MM;                             // gap between 2 cards

const CARD_H = (CONT_H - GAP_MM) / 2;              // ≈ 99.7 mm each

async function svgToPngDataUrl(svgUrl: string, wPx: number, hPx: number): Promise<string> {
  const res     = await fetch(svgUrl);
  const svgText = await res.text();
  const blob    = new Blob([svgText], { type: 'image/svg+xml' });
  const objUrl  = URL.createObjectURL(blob);
  return new Promise<string>((resolve, reject) => {
    const img  = new Image();
    img.onload = () => {
      const c  = document.createElement('canvas');
      c.width  = wPx;
      c.height = hPx;
      c.getContext('2d')!.drawImage(img, 0, 0, wPx, hPx);
      URL.revokeObjectURL(objUrl);
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = () => { URL.revokeObjectURL(objUrl); reject(new Error('SVG load failed')); };
    img.src = objUrl;
  });
}

/** Swap cross-origin img srcs → proxy, wait for load, return restore fn */
async function proxyImages(el: HTMLElement): Promise<() => void> {
  const imgs     = Array.from(el.querySelectorAll('img')) as HTMLImageElement[];
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

export default function DownloadPDFButton() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const cardEls = Array.from(
        document.querySelectorAll<HTMLElement>('[data-pdf-card]'),
      );
      if (cardEls.length === 0) { setLoading(false); return; }

      // Rasterise SVG at high res (8 px/mm → sharp at B5)
      const BG_W      = Math.round(B5_W_MM * 8);  // 1408 px
      const BG_H      = Math.round(B5_H_MM * 8);  // 2000 px
      const pxPerMM   = BG_W / B5_W_MM;           // 8 px/mm

      const bgDataUrl = await svgToPngDataUrl('/assets/border-bg.svg', BG_W, BG_H);
      const bgBlob    = await fetch(bgDataUrl).then((r) => r.blob());
      const bgBmp     = await createImageBitmap(bgBlob);

      // Positions in px on the full-page canvas
      const xPx         = Math.round(SIDE_PAD_MM * pxPerMM);
      const yPx         = Math.round(TOP_PAD_MM  * pxPerMM);
      const contentWpx  = Math.round(CONT_W  * pxPerMM);
      const cardHpx     = Math.round(CARD_H  * pxPerMM);
      const gapPx       = Math.round(GAP_MM  * pxPerMM);

      /**
       * Merge white base + SVG border + up to 2 card canvases into one page canvas.
       * This avoids any PDF layer hairlines / overlap artefacts.
       */
      const makePage = (
        c1: HTMLCanvasElement | null,
        c2: HTMLCanvasElement | null,
      ): string => {
        const pg  = document.createElement('canvas');
        pg.width  = BG_W;
        pg.height = BG_H;
        const ctx = pg.getContext('2d')!;

        // 1) white base (SVG centre is transparent)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, BG_W, BG_H);

        // 2) SVG decorative border
        ctx.drawImage(bgBmp, 0, 0, BG_W, BG_H);

        // 3) Card 1 — scaled to fit content width × card slot height
        if (c1) {
          const r1   = c1.width / c1.height;
          const dh1  = Math.min(cardHpx, contentWpx / r1);
          const dw1  = dh1 * r1;
          const dx1  = xPx + (contentWpx - dw1) / 2;
          ctx.drawImage(c1, 0, 0, c1.width, c1.height, dx1, yPx, dw1, dh1);
        }

        // 4) Card 2 — positioned below card 1
        if (c2) {
          const r2   = c2.width / c2.height;
          const dh2  = Math.min(cardHpx, contentWpx / r2);
          const dw2  = dh2 * r2;
          const dx2  = xPx + (contentWpx - dw2) / 2;
          const dy2  = yPx + cardHpx + gapPx;
          ctx.drawImage(c2, 0, 0, c2.width, c2.height, dx2, dy2, dw2, dh2);
        }

        return pg.toDataURL('image/png');
      };

      const SCALE = 2;
      const pdf   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'b5' });

      for (let i = 0; i < cardEls.length; i += 2) {
        if (i > 0) pdf.addPage('b5', 'portrait');

        // Capture card 1
        const restore1 = await proxyImages(cardEls[i]);
        const canvas1  = await html2canvas(cardEls[i], {
          scale: SCALE, useCORS: true, allowTaint: false,
          backgroundColor: '#ffffff', logging: false,
        });
        restore1();

        // Capture card 2 (if exists)
        let canvas2: HTMLCanvasElement | null = null;
        if (cardEls[i + 1]) {
          const restore2 = await proxyImages(cardEls[i + 1]);
          canvas2 = await html2canvas(cardEls[i + 1], {
            scale: SCALE, useCORS: true, allowTaint: false,
            backgroundColor: '#ffffff', logging: false,
          });
          restore2();
        }

        pdf.addImage(makePage(canvas1, canvas2), 'PNG', 0, 0, B5_W_MM, B5_H_MM);
      }

      pdf.save('dg-directory.pdf');
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
        background: loading ? '#888' : '#304890',
        color: '#fff',
        border: 'none',
        padding: '10px 28px',
        borderRadius: 6,
        fontSize: 15,
        fontWeight: 700,
        cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: '"Dubai", sans-serif',
        marginBottom: 24,
      }}
    >
      {loading ? 'Generating PDF…' : 'Download PDF'}
    </button>
  );
}
