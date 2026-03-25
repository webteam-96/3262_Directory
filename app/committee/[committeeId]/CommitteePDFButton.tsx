'use client';

import { useState } from 'react';

// B5 portrait: 176 × 250 mm
const B5_W_MM     = 176;
const B5_H_MM     = 250;
const PX20_MM     = 20 * 25.4 / 96;
const TOP_PAD_MM  = (64.8  / 708.66) * 250 + PX20_MM;
const BOT_PAD_MM  = ((708.66 - 675) / 708.66) * 250 + PX20_MM;
const SIDE_PAD_MM = PX20_MM;
const CONT_W_MM   = B5_W_MM - SIDE_PAD_MM * 2;
const CONT_H_MM   = B5_H_MM - TOP_PAD_MM - BOT_PAD_MM;
const CARDS_PER_PAGE = 5;
const GAP_MM      = 2;
const CARD_SLOT_H_MM = (CONT_H_MM - GAP_MM * (CARDS_PER_PAGE - 1)) / CARDS_PER_PAGE;

// 8 px/mm for sharp output
const PX_PER_MM = 8;
const BG_W      = Math.round(B5_W_MM * PX_PER_MM);
const BG_H      = Math.round(B5_H_MM * PX_PER_MM);

async function svgToPngDataUrl(svgUrl: string, wPx: number, hPx: number): Promise<string> {
  const res     = await fetch(svgUrl);
  const svgText = await res.text();
  const blob    = new Blob([svgText], { type: 'image/svg+xml' });
  const objUrl  = URL.createObjectURL(blob);
  return new Promise<string>((resolve, reject) => {
    const img  = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = wPx; c.height = hPx;
      c.getContext('2d')!.drawImage(img, 0, 0, wPx, hPx);
      URL.revokeObjectURL(objUrl);
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = () => { URL.revokeObjectURL(objUrl); reject(new Error('SVG load failed')); };
    img.src = objUrl;
  });
}

async function proxyImages(el: HTMLElement): Promise<() => void> {
  const imgs     = Array.from(el.querySelectorAll('img')) as HTMLImageElement[];
  const origSrcs = imgs.map(i => i.src);
  for (const img of imgs) {
    const src = img.getAttribute('src') || '';
    if (!src || src.startsWith('/') || src.startsWith(window.location.origin)) continue;
    img.src = `/api/proxy-image?url=${encodeURIComponent(src)}`;
  }
  await Promise.all(imgs.map(img => new Promise<void>(res => {
    if (img.complete && img.naturalWidth > 0) { res(); return; }
    img.onload  = () => res();
    img.onerror = () => res();
  })));
  return () => imgs.forEach((img, i) => { img.src = origSrcs[i]; });
}

function makePage(canvases: (HTMLCanvasElement | null)[], bgBmp: ImageBitmap): string {
  const pg  = document.createElement('canvas');
  pg.width  = BG_W;
  pg.height = BG_H;
  const ctx = pg.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, BG_W, BG_H);
  ctx.drawImage(bgBmp, 0, 0, BG_W, BG_H);

  const xPx       = Math.round(SIDE_PAD_MM  * PX_PER_MM);
  const yStart    = Math.round(TOP_PAD_MM   * PX_PER_MM);
  const contentW  = Math.round(CONT_W_MM    * PX_PER_MM);
  const slotHpx   = Math.round(CARD_SLOT_H_MM * PX_PER_MM);
  const gapPx     = Math.round(GAP_MM       * PX_PER_MM);

  canvases.forEach((c, i) => {
    if (!c) return;
    const dy = yStart + i * (slotHpx + gapPx);
    // Fill full content width, preserve aspect ratio — never clip the source
    const dw = contentW;
    const dh = Math.round(c.height * contentW / c.width);
    ctx.drawImage(c, 0, 0, c.width, c.height, xPx, dy, dw, dh);
  });

  return pg.toDataURL('image/jpeg', 0.88);
}

interface Props { title: string; filename: string; }

export default function CommitteePDFButton({ title, filename }: Props) {
  const [loading, setLoading] = useState(false);
  const [status,  setStatus]  = useState('');

  const handleDownload = async () => {
    setLoading(true);
    try {
      const container = document.getElementById('committee-canvas');
      if (!container) {
        alert('Content not found. Please wait for the page to load fully.');
        setLoading(false);
        return;
      }

      const cardEls = Array.from(container.children) as HTMLElement[];
      if (cardEls.length === 0) {
        alert('No member cards found.');
        setLoading(false);
        return;
      }

      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      setStatus('Loading background…');
      const bgDataUrl = await svgToPngDataUrl('/assets/border-bg.svg', BG_W, BG_H);
      const bgBlob    = await fetch(bgDataUrl).then(r => r.blob());
      const bgBmp     = await createImageBitmap(bgBlob);

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'b5' });
      const total = cardEls.length;

      for (let i = 0; i < cardEls.length; i += CARDS_PER_PAGE) {
        if (i > 0) pdf.addPage('b5', 'portrait');

        const batch    = cardEls.slice(i, i + CARDS_PER_PAGE);
        const canvases: (HTMLCanvasElement | null)[] = [];

        for (let j = 0; j < batch.length; j++) {
          setStatus(`Rendering card ${i + j + 1} / ${total}…`);
          const el      = batch[j];
          const restore = await proxyImages(el);
          const canvas  = await html2canvas(el, {
            scale: 2, useCORS: true, allowTaint: false,
            backgroundColor: '#ffffff', logging: false,
          });
          restore();
          canvases.push(canvas);
        }

        while (canvases.length < CARDS_PER_PAGE) canvases.push(null);

        setStatus(`Building page ${Math.floor(i / CARDS_PER_PAGE) + 1}…`);
        pdf.addImage(makePage(canvases, bgBmp), 'JPEG', 0, 0, B5_W_MM, B5_H_MM);
      }

      pdf.save(filename);

    } catch (err: any) {
      console.error('PDF error:', err);
      alert('PDF failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="theme-btn btn-one dist-btn"
    >
      {loading ? (status || 'Generating PDF…') : 'Download PDF'}
    </button>
  );
}
