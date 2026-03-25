'use client';

import { useState } from 'react';
import ReactDOM from 'react-dom/client';
import ClubDirectoryLayout from '@/app/clubs/[groupId]/ClubDirectoryLayout';

// B5 portrait: 176 × 250 mm
const B5_W_MM     = 176;
const B5_H_MM     = 250;
const PX20_MM     = 20 * 25.4 / 96; // 20px → ~5.29 mm

// SVG border measurements (viewBox 498.9 × 708.66)
const TOP_PAD_MM  = 64.8  / 708.66 * 250 + PX20_MM; // ≈ 28.2 mm
const BOT_PAD_MM  = (708.66 - 675) / 708.66 * 250 + PX20_MM; // ≈ 17.2 mm
const SIDE_PAD_MM = PX20_MM; // ≈ 5.3 mm

const CONT_W = B5_W_MM - SIDE_PAD_MM * 2;
const CONT_H = B5_H_MM - TOP_PAD_MM  - BOT_PAD_MM;

const OUT_DPI       = 150;
const OUT_PX_PER_MM = OUT_DPI / 25.4;
const OUT_W         = Math.round(B5_W_MM * OUT_PX_PER_MM);
const OUT_H         = Math.round(B5_H_MM * OUT_PX_PER_MM);

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
      c.width   = wPx; c.height = hPx;
      c.getContext('2d')!.drawImage(img, 0, 0, wPx, hPx);
      URL.revokeObjectURL(objUrl);
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = () => { URL.revokeObjectURL(objUrl); reject(new Error('SVG load failed')); };
    img.src = objUrl;
  });
}

async function proxyImages(el: HTMLElement): Promise<() => void> {
  const imgs = Array.from(el.querySelectorAll('img')) as HTMLImageElement[];
  const origSrcs = imgs.map((img) => img.src);
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

export default function BulkDownloadButton({ clubs }: { clubs: any[] }) {
  const [status, setStatus] = useState<string | null>(null);

  const clubsWithId = clubs.filter((c) => c.grpID);

  const handleBulkDownload = async () => {
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF }   = await import('jspdf');
    const JSZip       = (await import('jszip')).default;

    // Load SVG background once for all clubs (rasterised at output size)
    const bgDataUrl = await svgToPngDataUrl('/assets/border-dynamic.svg', OUT_W, OUT_H);
    const bgBlob    = await fetch(bgDataUrl).then((r) => r.blob());
    const bgBmp     = await createImageBitmap(bgBlob);

    const zip   = new JSZip();
    const total = clubsWithId.length;

    for (let i = 0; i < total; i++) {
      const club = clubsWithId[i];
      setStatus(`Generating ${i + 1}/${total}...`);

      try {
        const res  = await fetch(`/api/club-data/${club.grpID}`);
        const data = await res.json();
        if (!data) continue;

        const container = document.createElement('div');
        container.style.cssText = 'position:fixed;left:-9999px;top:0;';
        document.body.appendChild(container);

        await new Promise<void>((resolve) => {
          ReactDOM.createRoot(container).render(
            <ClubDirectoryLayout
              club={data.club}
              president={data.president}
              secretary={data.secretary}
              members={data.members || []}
            />,
          );
          setTimeout(resolve, 800);
        });

        const canvasEl = container.querySelector('#club-directory-canvas') as HTMLElement | null;
        if (!canvasEl) { document.body.removeChild(container); continue; }

        canvasEl.style.overflow = 'visible';
        const restoreImgs = await proxyImages(canvasEl);

        const rendered = await html2canvas(canvasEl, {
          scale:           2,
          useCORS:         true,
          allowTaint:      false,
          backgroundColor: '#ffffff',
          logging:         false,
        });

        restoreImgs();
        canvasEl.style.overflow = 'hidden';

        const SCALE  = 2;
        const tH     = parseInt(canvasEl.dataset.tableH || '0') * SCALE;
        const tR     = parseInt(canvasEl.dataset.tableR || '0') * SCALE;
        const rowHpx = parseInt(canvasEl.dataset.rowH   || '70') * SCALE;
        const hdrH   = tR - tH;

        const pxPerMM  = rendered.width / CONT_W;
        const pageHPx  = Math.round(CONT_H * pxPerMM);
        const capToOut = OUT_PX_PER_MM / pxPerMM;
        const outX     = Math.round(SIDE_PAD_MM * OUT_PX_PER_MM);
        const outY     = Math.round(TOP_PAD_MM  * OUT_PX_PER_MM);
        const outW     = Math.round(CONT_W      * OUT_PX_PER_MM);

        const makePage = (contentC: HTMLCanvasElement, contentHPx: number): string => {
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

        const rows1Max    = Math.max(1, Math.floor((pageHPx - tR) / rowHpx));
        const rowsPerPage = Math.max(1, Math.floor((pageHPx - hdrH) / rowHpx));

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'b5' });

        // Page 1
        const page1End = Math.min(tR + rows1Max * rowHpx, rendered.height);
        const p1 = document.createElement('canvas');
        p1.width = rendered.width; p1.height = page1End;
        p1.getContext('2d')!.drawImage(rendered, 0, 0, rendered.width, page1End, 0, 0, rendered.width, page1End);
        pdf.addImage(makePage(p1, page1End), 'JPEG', 0, 0, B5_W_MM, B5_H_MM);

        // Page 2+
        let   nextRow   = rows1Max;
        const totalRows = Math.floor((rendered.height - tR) / rowHpx);

        while (nextRow < totalRows) {
          pdf.addPage('b5', 'portrait');
          const rowsThisPage = Math.min(rowsPerPage, totalRows - nextRow);
          const rowsH = rowsThisPage * rowHpx;
          const comp  = document.createElement('canvas');
          comp.width  = rendered.width; comp.height = hdrH + rowsH;
          const ctx   = comp.getContext('2d')!;
          ctx.drawImage(rendered, 0, tH, rendered.width, hdrH, 0, 0, rendered.width, hdrH);
          ctx.drawImage(rendered, 0, tR + nextRow * rowHpx, rendered.width, rowsH, 0, hdrH, rendered.width, rowsH);
          pdf.addImage(makePage(comp, hdrH + rowsH), 'JPEG', 0, 0, B5_W_MM, B5_H_MM);
          nextRow += rowsThisPage;
        }

        const clubName = data.club?.Club_Name || club.Club_Name || `club-${club.grpID}`;
        zip.file(`${clubName}.pdf`, pdf.output('arraybuffer'));
        document.body.removeChild(container);

      } catch (err) {
        console.error(`Failed for club ${club.grpID}:`, err);
      }
    }

    setStatus('Building zip...');
    const blob = await zip.generateAsync({ type: 'blob' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'clubs-directory.zip'; a.click();
    URL.revokeObjectURL(url);
    setStatus(null);
  };

  return (
    <button
      type="button"
      onClick={handleBulkDownload}
      disabled={status !== null}
      style={{
        borderRadius: 50,
        padding: '8px 24px',
        background: status !== null ? '#888' : '#0F6EB7',
        border: 'none',
        color: '#fff',
        fontSize: 15,
        cursor: status !== null ? 'not-allowed' : 'pointer',
      }}
    >
      {status ?? 'Bulk Download PDF'}
    </button>
  );
}
