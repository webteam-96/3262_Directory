'use client';

import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import React from 'react';
import MemberCard from './MemberCard';

// ── PDF constants ─────────────────────────────────────────────────────────────
const B5_W_MM     = 142;
const B5_H_MM     = 215;
const PX20_MM     = 20 * 25.4 / 96;
const TOP_PAD_MM  = (64.8  / 708.66) * 215 + PX20_MM;
const BOT_PAD_MM  = ((708.66 - 675) / 708.66) * 215 + PX20_MM;
const SIDE_PAD_MM = PX20_MM;
const CONT_W_MM   = B5_W_MM - SIDE_PAD_MM * 2;
const HEADING_H_MM   = 4;
const CONT_H_MM   = B5_H_MM - TOP_PAD_MM - BOT_PAD_MM - HEADING_H_MM;
const CARDS_PER_PAGE = 5;
const GAP_MM         = 2;
const CARD_SLOT_H_MM = (CONT_H_MM - GAP_MM * (CARDS_PER_PAGE - 1)) / CARDS_PER_PAGE;
const PX_PER_MM      = 16;
const BG_W           = Math.round(B5_W_MM * PX_PER_MM);
const BG_H           = Math.round(B5_H_MM * PX_PER_MM);

// ── Helpers ───────────────────────────────────────────────────────────────────
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

async function proxyAllImages(container: HTMLElement): Promise<void> {
  const imgs = Array.from(container.querySelectorAll('img')) as HTMLImageElement[];
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
}

function makePage(canvases: (HTMLCanvasElement | null)[], bgBmp: ImageBitmap): string {
  const pg  = document.createElement('canvas');
  pg.width  = BG_W;
  pg.height = BG_H;
  const ctx = pg.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, BG_W, BG_H);
  ctx.drawImage(bgBmp, 0, 0, BG_W, BG_H);

  const xPx      = Math.round(SIDE_PAD_MM    * PX_PER_MM);
  const yStart   = Math.round((TOP_PAD_MM + HEADING_H_MM) * PX_PER_MM);
  const contentW = Math.round(CONT_W_MM      * PX_PER_MM);
  const slotHpx  = Math.round(CARD_SLOT_H_MM * PX_PER_MM);
  const gapPx    = Math.round(GAP_MM         * PX_PER_MM);

  canvases.forEach((c, i) => {
    if (!c) return;
    const slotTop = yStart + i * (slotHpx + gapPx);
    // Fit card into its slot (width AND height) so a tall card shrinks
    // instead of bleeding into the next slot's space.
    const scale = Math.min(contentW / c.width, slotHpx / c.height);
    const dw = Math.round(c.width  * scale);
    const dh = Math.round(c.height * scale);
    const dx = xPx + Math.round((contentW - dw) / 2);
    const dy = slotTop + Math.round((slotHpx - dh) / 2);
    ctx.drawImage(c, 0, 0, c.width, c.height, dx, dy, dw, dh);
  });

  return pg.toDataURL('image/jpeg', 0.95);
}

// ── Data helpers ──────────────────────────────────────────────────────────────
const DESIGNATION_MAP: Record<string, string> = {
  ZAC: 'Zonal Avenue Chair',
  GAH: 'Group Avenue Head',
  ZCC: 'Zonal Co-Chair',
  ZDC: 'Zonal District Chair',
};

function resolveDesignation(raw: string): string {
  const key = (raw || '').substring(0, 3);
  return DESIGNATION_MAP[key] ? `${DESIGNATION_MAP[key]} (${key})` : raw;
}

function formatDayMonth(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const parts = dateStr.trim().split('/');
  if (parts.length < 2) return '';
  return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}`;
}

async function generateCommitteePDF(
  records: any[],
  html2canvas: any,
  jsPDF: any,
  rightBmp: ImageBitmap,
  leftBmp: ImageBitmap,
  setStatus: (s: string) => void,
  committeeName: string,
  totalCommittees: number,
  committeeIndex: number,
): Promise<Uint8Array> {
  const containerW = Math.round(CONT_W_MM * PX_PER_MM);
  const container  = document.createElement('div');
  container.style.cssText = `position:fixed;left:-9999px;top:0;width:${containerW}px;background:white;z-index:-1;overflow:hidden;box-sizing:border-box;`;
  document.body.appendChild(container);

  const root = createRoot(container);
  flushSync(() => {
    root.render(
      <>
        {records.map((record, idx) => {
          const rid = (record.RotaryID || '').trim();
          return (
            <div key={idx} data-pdf-card={String(idx)}>
              <MemberCard
                index={idx}
                designation={resolveDesignation(record.DistrictDesignation || '')}
                name={record.name             || ''}
                club={record.ClubName         || ''}
                classification={record.Keywords?.trim() || ''}
                mobile={record.MobileNumber   || ''}
                blood={record.Bloodgrp        || ''}
                email={record.MailID          || ''}
                address={record.Address?.trim() || ''}
                dob={formatDayMonth(record.DOB)}
                dow={formatDayMonth(record.DOA || record.DOW)}
                rid={rid}
                img={record.img || record.imgPath || record.profilephoto || ''}
                spouseName={record.SpouseName || record.Spouse_Name || ''}
                spouseImg={record.SpousePhoto || record.Spouse_Photo || ''}
              />
            </div>
          );
        })}
      </>,
    );
  });

  await proxyAllImages(container);

  const cardEls = Array.from(container.querySelectorAll<HTMLElement>('[data-pdf-card]'));
  const pdf     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [142, 215] });
  const total   = cardEls.length;
  let pageIndex = 0;

  for (let i = 0; i < cardEls.length; i += CARDS_PER_PAGE) {
    if (i > 0) pdf.addPage([142, 215], 'portrait');
    const batch    = cardEls.slice(i, i + CARDS_PER_PAGE);
    const canvases: (HTMLCanvasElement | null)[] = [];

    for (let j = 0; j < batch.length; j++) {
      setStatus(`Committee ${committeeIndex + 1}/${totalCommittees}: ${committeeName} — card ${i + j + 1}/${total}`);
      const canvas = await html2canvas(batch[j], {
        scale: 1, useCORS: true, allowTaint: false,
        backgroundColor: '#ffffff', logging: false,
      });
      canvases.push(canvas);
    }

    while (canvases.length < CARDS_PER_PAGE) canvases.push(null);
    // odd pages (1,3,5…) → right SVG; even pages (2,4,6…) → left SVG
    const bgBmp = pageIndex % 2 === 0 ? rightBmp : leftBmp;
    pageIndex++;
    pdf.addImage(makePage(canvases, bgBmp), 'JPEG', 0, 0, B5_W_MM, B5_H_MM);

    // Committee name heading — only on first page
    if (i === 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(48, 72, 144);
      pdf.text(committeeName, B5_W_MM / 2, TOP_PAD_MM + 4, { align: 'center' });
      pdf.setTextColor(0, 0, 0);
    }
  }

  const bytes = pdf.output('arraybuffer') as ArrayBuffer;
  root.unmount();
  document.body.removeChild(container);
  return new Uint8Array(bytes);
}

// ── Fixed committee order for bulk PDF ────────────────────────────────────────
const COMMITTEE_ORDER = [
  'District Secretariat',
  'District Chief Executive',
  'District Secretary General',
  'District Executive Secretary',
  'Additional District Secretary General',
  'ADSG',
  'District Advisory Committee',
  'District Directory Committee',
  'Assistant Governor',
  'Zonal Chairs',
  'District Learning Team',
  'District Bylaw Committee',
  'Strategic Planning Committee',
  'Grievance Redressal Committee',
  'District Finance Committee',
  'District Legal Cell',
  'GML Committee',
  'District Sgt-At-Arms',
  'District Membership Committee',
  'District Member Attraction Committee',
  'District Member Retention Committee',
  'District Member Engagement Committee',
  'District New Club Development Committee',
  'District Women Membership Committee',
  'District Diversity, Equity and Inclusion Committee',
  'District Foundation Committee',
  'District Global Grant Committee',
  'District Annual Fund Sub-Committee',
  'District Grants Sub-committee',
  'District Endowment/Major Gifts Sub-committee',
  'District Fundraising Sub-committee',
  'District Paul Harris Society Coordinator',
  'District PolioPlus Sub-committee',
  'District Scholarship Sub-committee',
  'District Stewardship Sub-committee',
  'District Rotary Peace Fellowships Sub-committee',
  'District Disaster Management Committee',
  'District Public Image Committee',
  'District Alumni Committee',
  'District Youth Service Committee',
  'District Interact Committee',
  'District Rotaract Representative',
  'District Rotaract Committee',
  'District Community Service',
  'District RI Convention Promotion Committee',
  'District Vocational Service',
  'District Skill Development Committee',
  'District 7 Areas of Focus Committee',
  'Peace Building & Conflict Prevention',
  'Disease Prevention & Treatment',
  'Dylasis Committee',
  'Dental Care',
  'Blood Donation',
  'Filaria Committee',
  'Eye Care',
  'Eye Conclave',
  'Maternal & Child Health',
  'Water, Sanitation & Hygienic',
  'Basic Education & Literacy Committee',
  'Community Economic  Development',
  'District Environment Committee',
  'Organ Donation Committee',
  'Cancer Prevention & Awareness',
  'General Health Camps',
  'Artificial Limbs (LN4)',
  'Mental Health Awarness',
  'Rotary Action Group',
  'Rotary Friendship Exchange',
  'District RLI (Rotary Leadership Institute)',
  'PP Fourm',
  'District Special Aids',
  'Public Relation Committee',
  'Print & Electronic Media',
  'Social Media',
  'District IT Cell',
  'Rotary Fellowship Committee',
  'Inter District Greetings Committee',
  'Intra District Greetings Committee',
  'District Election Committee',
  'District Awards Committee',
  'RCC (Rotary Community Corp)',
  'Rotary News Trust',
  'District Committee for Differently Abled',
  'District CSR Committee',
  'Women Empowerment Committee',
  'Roof-top Gardening Committee',
  'Rain Water Harvesting',
  'International Service',
  'Youth Protection Officer',
  'District RYLA',
  'District Picnic Committee',
  'District Women-Car Rally',
  'District Sports Committee',
  'District Cricket Tournament',
  'Rotary Day Celebration Committee',
  'Rotary Litt-Fest',
  'Rotary Got Talent (RGT)',
  'District Cultural Committee',
  'Road Safety Committee',
  'Women Day Celebration Committee',
  'Career Counselling Committee',
  'District Wealth Creation Committee',
  'District Ethics Committee',
  'District RI Presidential Message Promotion Committee',
  'District Coordination & OCV Committee',
  'District Events',
  'District PELS & SELS',
  'AGLS & DTLS',
  'Club Leadership Learning Seminar',
  'District Conference',
  'District Program & Events Committee',
];

function getCommitteeOrder(name: string): number {
  const n = name.trim().toLowerCase();
  const idx = COMMITTEE_ORDER.findIndex(c => n.includes(c.trim().toLowerCase()) || c.trim().toLowerCase().includes(n));
  return idx === -1 ? COMMITTEE_ORDER.length : idx;
}

// ── Component ─────────────────────────────────────────────────────────────────
interface Committee { id: string; name: string; }

export default function BulkCommitteePDFButton({ committees }: { committees: Committee[] }) {
  const [loading, setLoading] = useState(false);
  const [status,  setStatus]  = useState('');

  const handleDownload = async () => {
    setLoading(true);
    try {
      const [{ default: html2canvas }, { jsPDF }, JSZip] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
        import('jszip'),
      ]);

      // ── 1. Sort committees in fixed order, then fetch data ──
      const sorted = [...committees].sort((a, b) => getCommitteeOrder(a.name) - getCommitteeOrder(b.name));

      setStatus('Fetching committee data…');
      const allData = await Promise.all(
        sorted.map(c =>
          fetch(`/api/committee-details/${c.id}`)
            .then(r => r.json())
            .catch(() => [] as any[])
        )
      );

      // ── 2. Load SVG backgrounds once ──
      setStatus('Loading backgrounds…');
      const [rightBmp, leftBmp] = await Promise.all([
        svgToPngDataUrl('/assets/border-right.svg', BG_W, BG_H).then(d => fetch(d).then(r => r.blob())).then(b => createImageBitmap(b)),
        svgToPngDataUrl('/assets/border-left.svg',  BG_W, BG_H).then(d => fetch(d).then(r => r.blob())).then(b => createImageBitmap(b)),
      ]);

      // ── 3. Generate one PDF per committee, add to zip ──
      const zip = new JSZip.default();

      for (let i = 0; i < sorted.length; i++) {
        const records = allData[i];
        if (records.length === 0) continue;
        await new Promise(r => setTimeout(r, 0)); // yield to browser between committees

        const pdfBytes = await generateCommitteePDF(
          records, html2canvas, jsPDF, rightBmp, leftBmp,
          setStatus, sorted[i].name,
          sorted.length, i,
        );

        const filename = `${String(i + 1).padStart(3, '0')}-${sorted[i].name.replace(/\s+/g, '-').toLowerCase()}-2025-26.pdf`;
        zip.file(filename, pdfBytes);
      }

      // ── 4. Download zip ──
      setStatus('Compressing…');
      const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
      const url     = URL.createObjectURL(zipBlob);
      const a       = document.createElement('a');
      a.href        = url;
      a.download    = 'all-committees-2025-26.zip';
      a.click();
      URL.revokeObjectURL(url);

    } catch (err: any) {
      console.error(err);
      alert('Download failed: ' + err?.message);
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
      style={{ minWidth: 220 }}
    >
      {loading ? (status || 'Generating…') : 'Download All Committees PDF'}
    </button>
  );
}
