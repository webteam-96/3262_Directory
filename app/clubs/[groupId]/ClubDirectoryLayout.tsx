'use client';

import { useEffect } from 'react';
import focalPoints from '@/lib/photo-focal-points.json';

const FOCAL: Record<string, { x: number; y: number }> = focalPoints as Record<string, { x: number; y: number }>;
const DEFAULT_POS = '50% 25%';

function objectPositionFor(src?: string): string {
  if (!src) return DEFAULT_POS;
  const f = FOCAL[src];
  return f ? `${f.x}% ${f.y}%` : DEFAULT_POS;
}

const GOLD = '#FEBD1F';
const BLUE = '#17458F';

function clean(v: any): string {
  if (!v) return '';
  return String(v).replace(/(<([^>]+)>)/gi, '').trim();
}

function fmtCharter(s?: string): string {
  if (!s || s === '01/01/1753') return '';
  return s.replace(/\//g, '.');
}

function fmtTime(s?: string): string {
  if (!s) return '';
  const [h, m] = s.split(':').map(Number);
  const ampm = h >= 12 ? 'pm' : 'am';
  const h12  = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')}${ampm}`;
}

function fmtDOB(s?: string): string {
  return clean(s) || '';
}

// "02/21/2025" (MM/DD/YYYY) or "21/02/2025" (DD/MM/YYYY) → "21-Feb-2025"
function fmtJoinDate(s?: string): string {
  const cleaned = clean(s);
  if (!cleaned) return '';
  const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const parts = cleaned.split(/[\/\-.]/);
  if (parts.length === 3) {
    let a = parseInt(parts[0], 10);
    let b = parseInt(parts[1], 10);
    const y = parts[2];
    let day: number, mon: number;
    if (a > 12 && b <= 12) {
      // first part can't be a month → DD/MM/YYYY
      day = a; mon = b;
    } else if (b > 12 && a <= 12) {
      // second part can't be a month → MM/DD/YYYY
      day = b; mon = a;
    } else {
      // ambiguous (both <=12) — assume MM/DD/YYYY since the API returns that
      day = b; mon = a;
    }
    if (day >= 1 && day <= 31 && mon >= 1 && mon <= 12) {
      return `${String(day).padStart(2, '0')}-${months[mon]}-${y}`;
    }
  }
  return cleaned;
}

function fmtMobile(m: any): string {
  if (!m) return '';
  const code = clean(m.country_code);
  const num  = clean(m.MobileNumber);
  if (!num) return '';
  return code ? `${code} ${num}` : num;
}

const Dot = ({ left, top, color }: { left: number; top: number; color: string }) => (
  <div style={{ position: 'absolute', left, top, width: 6, height: 6, borderRadius: 9999, background: color }} />
);

const DUMMY_PHOTO = '/blank-profile.webp';

function photoSrc(src?: string): string {
  return src && src.startsWith('http') ? src : DUMMY_PHOTO;
}

function PhotoImg({ src }: { src?: string }) {
  const realSrc = photoSrc(src);
  const objectPosition = objectPositionFor(src);
  return (
    <img
      src={realSrc}
      width={120}
      height={120}
      suppressHydrationWarning
      style={{ width: 120, height: 120, objectFit: 'cover', objectPosition, display: 'block', borderRadius: 4 }}
      alt=""
    />
  );
}

/* ─── Table columns scaled to 1200px ─── */
const COLS = [
  { label: 'S.No',            left: 12,  width: 60  },
  { label: 'Name/ID/Joining', left: 80,  width: 280 },
  { label: 'Classification',  left: 368, width: 190 },
  { label: 'Address',         left: 566, width: 380 },
  { label: 'Mobile/Email',    left: 954, width: 234 },
];

export default function ClubDirectoryLayout({
  club,
  president,
  secretary,
  members,
}: {
  club: any;
  president: any;
  secretary: any;
  members: any[];
}) {
  useEffect(() => {
    if (document.getElementById('inter-font-dir')) return;
    const link = document.createElement('link');
    link.id   = 'inter-font-dir';
    link.rel  = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@900&display=swap';
    document.head.appendChild(link);
  }, []);

  /* ── Vertical layout constants ──
     META_TOP  : where the 3 meta rows start
     DIVIDER   : horizontal rule — 20px below the last meta row (3 × 28px)
     PRES_TOP  : where the president title sits — 30px below divider
     P_OFF     : shift applied to every original pres/sec top value
                 (original pres title was at 104; we place it at PRES_TOP)
     TABLE_H   : table header top
     TABLE_R   : first data row top                                        */
  const META_TOP  = 58;
  const DIVIDER   = META_TOP + 3 * 36 + 20;   // 186 (meta rows widened for 26px font)
  const PRES_TOP  = DIVIDER + 30;              // 216  — president title
  const P_OFF     = PRES_TOP - 104;            // 112
  // Secretary placed 110px below the bottom of the president block
  // (pres rows now span 104 → 266, block bottom ≈ 298 with line-height)
  const SEC_TOP   = PRES_TOP + (298 - 104) + 110; // PRES_TOP + 304
  const S_V       = SEC_TOP - 214;             // offset for sec text (title was at 214)
  const S_P_OFF   = SEC_TOP - 104;             // offset for sec photo block
  // Sec rows span 214 → 376 + line-height ≈ 408
  const TABLE_H   = SEC_TOP + (408 - 214) + 80; // SEC_TOP + 274
  const TABLE_R   = SEC_TOP + (440 - 214) + 80; // SEC_TOP + 306

  const canvasH = Math.max(900, TABLE_R + members.length * 100 + 20);

  const suffix = clean(club.Club_Name)
    .replace(/^rotary\s+club\s+of\s+/i, '')
    .toUpperCase();

  const cell = (left: number, width: number, top: number, bg: string) => ({
    position: 'absolute' as const,
    left, top, width,
    height: 95,
    background: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    fontSize: 22,
    lineHeight: '28px',
    padding: '8px 14px',
    boxSizing: 'border-box' as const,
    wordBreak: 'break-word' as const,
  });

  /* Secretary block is offset +600px horizontally and aligned to same
     vertical band as president (top offset −110 from original design) */
  // right-side photo area for secretary (full 1200px canvas)
  const SP = 920;  // secretary photo block left edge (920 + 280 = 1200px canvas edge)

  return (
    <div style={{ overflowX: 'auto' }}>
      <div
        id="club-directory-canvas"
        data-table-h={TABLE_H}
        data-table-r={TABLE_R}
        data-row-h={100}
        style={{
          width: 1200,
          height: canvasH,
          position: 'relative',
          overflow: 'hidden',
          fontFamily: "'Segoe UI', Arial, sans-serif",
          color: '#000',
          margin: '0 auto',
        }}
      >

        {/* ── TITLE (centred in 1200px) ── */}
        <div style={{
          position: 'absolute', left: 0, top: 12, width: 1200,
          textAlign: 'center',
          color: '#304890', fontSize: 32,
          fontFamily: 'Inter, sans-serif', fontWeight: 900,
          whiteSpace: 'nowrap',
        }}>
          ROTARY CLUB OF {suffix}
        </div>

        {/* ── CLUB META (3 rows, each flex space-between) ── */}
        <div style={{
          position: 'absolute', left: 47, top: META_TOP, width: 1200 - 94,
          fontSize: 26, lineHeight: '36px',
        }}>
          {/* Row 1: Club ID · Charter Date · AG */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span><b>Club ID:</b> {clean(club.Club_id)}</span>
            <span><b>Charter Date:</b> {fmtCharter(club.Charter_date)}</span>
            <span><b>AG:</b> {clean(club.AG_name)}</span>
          </div>

          {/* Row 2: Meeting Day · Time · Club Advisor */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span><b>Meeting Day:</b> {clean(club.club_meeting_day)}</span>
            <span><b>Time:</b> {fmtTime(club.club_meeting_from_time)}</span>
            <span><b>Club Advisor:</b> {clean(club.Club_Advisor)}</span>
          </div>

          {/* Row 3: Venue · Sponsor Club */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span><b>Venue:</b> {clean(club.Venue)}</span>
            <span><b>Sponsor Club:</b> {clean(club.Sponsor_Club)}</span>
          </div>
        </div>

        {/* ── DIVIDER (full width) ── */}
        <div style={{ position: 'absolute', left: 0, top: DIVIDER, width: 1200, height: 2, background: '#D6DAE9' }} />

        {/* ══════════════════════════════════════════
            PRESIDENT — full width, photos LEFT
        ══════════════════════════════════════════ */}
        <div style={{ position: 'absolute', left: 0, top: 127 + P_OFF, width: 300, height: 80, background: 'rgba(254,189,31,0.20)' }} />
        <div style={{ position: 'absolute', left: 10,  top: 107 + P_OFF }}>
          <PhotoImg src={president?.imgPath} />
        </div>
        <div style={{ position: 'absolute', left: 150, top: 107 + P_OFF }}>
          <PhotoImg src={president?.Spouse_Photo} />
        </div>

        <Dot left={10}  top={100 + P_OFF} color={GOLD} />
        <Dot left={22}  top={100 + P_OFF} color={BLUE} />
        <Dot left={0}   top={100 + P_OFF} color={BLUE} />
        <Dot left={0}   top={112 + P_OFF} color={GOLD} />
        <Dot left={0}   top={124 + P_OFF} color={BLUE} />
        <Dot left={262} top={232 + P_OFF} color={GOLD} />
        <Dot left={250} top={232 + P_OFF} color={BLUE} />
        <Dot left={274} top={220 + P_OFF} color={GOLD} />
        <Dot left={274} top={232 + P_OFF} color={BLUE} />
        <Dot left={274} top={208 + P_OFF} color={BLUE} />

        {(() => {
          const pId = clean(president?.RotaryID);
          const pDob = fmtDOB(president?.DOB);
          const pDoa = fmtDOB(president?.DOA);
          const pCl = clean(president?.Classification) || clean(president?.Designation);
          const pMob = fmtMobile(president);
          const pEmail = clean(president?.MailID);
          const pAddr = clean(president?.Address);
          const pSpouse = clean(president?.Spouse_name);
          return (<>
            <div style={{ position: 'absolute', left: 310, top: 104 + P_OFF, maxWidth: 880, fontSize: 26, fontWeight: 700 }}>
              President: {clean(president?.member_name)}
            </div>
            {pId && <div style={{ position: 'absolute', left: 310, top: 140 + P_OFF, fontSize: 26 }}><b>ID:</b> {pId}</div>}
            {pDob && <div style={{ position: 'absolute', left: 490, top: 140 + P_OFF, fontSize: 26 }}><b>DOB:</b> {pDob}</div>}
            {pDoa && <div style={{ position: 'absolute', left: 310, top: 172 + P_OFF, fontSize: 26 }}><b>DOA:</b> {pDoa}</div>}
            {pCl && <div style={{ position: 'absolute', left: 310, top: 204 + P_OFF, fontSize: 26, maxWidth: 380, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><b>Cl:</b> {pCl}</div>}
            {pMob && <div style={{ position: 'absolute', left: 310, top: 236 + P_OFF, fontSize: 26 }}><b>Mobile:</b> {pMob}</div>}

            {(pEmail || pAddr || pSpouse) && <div style={{ position: 'absolute', left: 700, top: 140 + P_OFF, width: 1, height: 158, background: 'rgba(0,0,0,0.50)' }} />}

            {pEmail && <div style={{ position: 'absolute', left: 712, top: 140 + P_OFF, fontSize: 26 }}>
              <b>Email:</b> {pEmail}
            </div>}
            {pAddr && <div style={{ position: 'absolute', left: 712, top: 172 + P_OFF, fontSize: 26, lineHeight: '32px' }}>
              <b>Add:</b> {pAddr}
            </div>}
            {pSpouse && <div style={{ position: 'absolute', left: 712, top: 268 + P_OFF, fontSize: 26 }}>
              <b>Spouse:</b> {pSpouse}
            </div>}
          </>);
        })()}

        {/* ══════════════════════════════════════════
            SECRETARY — full width, below president, photos RIGHT
        ══════════════════════════════════════════ */}
        <div style={{ position: 'absolute', left: SP, top: 127 + S_P_OFF, width: 280, height: 80, background: 'rgba(254,189,31,0.20)' }} />
        <div style={{ position: 'absolute', left: SP + 10,  top: 107 + S_P_OFF }}>
          <PhotoImg src={secretary?.imgPath} />
        </div>
        <div style={{ position: 'absolute', left: SP + 150, top: 107 + S_P_OFF }}>
          <PhotoImg src={secretary?.Spouse_Photo} />
        </div>

        {/* dots — top-right of secretary photo block */}
        <Dot left={SP + 262} top={100 + S_P_OFF} color={GOLD} />
        <Dot left={SP + 250} top={100 + S_P_OFF} color={BLUE} />
        <Dot left={SP + 274} top={100 + S_P_OFF} color={BLUE} />
        <Dot left={SP + 274} top={112 + S_P_OFF} color={GOLD} />
        <Dot left={SP + 274} top={124 + S_P_OFF} color={BLUE} />
        {/* dots — bottom-left of secretary photo block */}
        <Dot left={SP + 10}  top={232 + S_P_OFF} color={GOLD} />
        <Dot left={SP + 22}  top={232 + S_P_OFF} color={BLUE} />
        <Dot left={SP + 0}   top={220 + S_P_OFF} color={GOLD} />
        <Dot left={SP + 0}   top={232 + S_P_OFF} color={BLUE} />
        <Dot left={SP + 0}   top={208 + S_P_OFF} color={BLUE} />

        {(() => {
          const sId = clean(secretary?.RotaryID);
          const sDob = fmtDOB(secretary?.DOB);
          const sDoa = fmtDOB(secretary?.DOA);
          const sCl = clean(secretary?.Classification) || clean(secretary?.Designation);
          const sMob = fmtMobile(secretary);
          const sEmail = clean(secretary?.MailID);
          const sAddr = clean(secretary?.Address);
          const sSpouse = clean(secretary?.Spouse_name);
          return (<>
            <div style={{ position: 'absolute', left: 26, top: 214 + S_V, maxWidth: 900, fontSize: 26, fontWeight: 700 }}>
              Secretary: {clean(secretary?.member_name)}
            </div>
            {sId && <div style={{ position: 'absolute', left: 26,  top: 250 + S_V, fontSize: 26 }}><b>ID:</b> {sId}</div>}
            {sDob && <div style={{ position: 'absolute', left: 200, top: 250 + S_V, fontSize: 26 }}><b>DOB:</b> {sDob}</div>}
            {sDoa && <div style={{ position: 'absolute', left: 26,  top: 282 + S_V, fontSize: 26 }}><b>DOA:</b> {sDoa}</div>}
            {sCl && <div style={{ position: 'absolute', left: 26,  top: 314 + S_V, fontSize: 26, maxWidth: 414, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><b>Cl:</b> {sCl}</div>}
            {sMob && <div style={{ position: 'absolute', left: 26,  top: 346 + S_V, fontSize: 26 }}><b>Mobile:</b> {sMob}</div>}

            {(sEmail || sAddr || sSpouse) && <div style={{ position: 'absolute', left: 450, top: 250 + S_V, width: 1, height: 158, background: 'rgba(0,0,0,0.50)' }} />}

            {sEmail && <div style={{ position: 'absolute', left: 462, top: 250 + S_V, maxWidth: 450, fontSize: 26 }}>
              <b>Email:</b> {sEmail}
            </div>}
            {sAddr && <div style={{ position: 'absolute', left: 462, top: 282 + S_V, maxWidth: 450, fontSize: 26, lineHeight: '32px' }}>
              <b>Add:</b> {sAddr}
            </div>}
            {sSpouse && <div style={{ position: 'absolute', left: 462, top: 378 + S_V, maxWidth: 450, fontSize: 26 }}>
              <b>Spouse:</b> {sSpouse}
            </div>}
          </>);
        })()}

        {/* ── TABLE HEADERS (full 1200px) ── */}
        {COLS.map((col) => (
          <div key={col.label} style={{
            position: 'absolute',
            left: col.left, top: TABLE_H,
            width: col.width, height: 30,
            background: '#304890',
            borderRadius: '10px 10px 0 0',
            color: 'white', fontSize: 18, fontWeight: 800,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', textAlign: 'center',
            padding: '0 8px', boxSizing: 'border-box',
          }}>
            {col.label}
          </div>
        ))}

        {/* ── TABLE ROWS ── */}
        {members.map((m: any, i: number) => {
          const top = TABLE_R + i * 100;
          const bg  = i % 2 === 0 ? 'rgba(254,189,31,0.20)' : 'rgba(48,72,144,0.20)';
          const joinDate = fmtJoinDate(m.RIAdmissionDate || m.RI_AdmissionDate || m.riAdmissionDate);
          const namePieces = [clean(m.member_name), clean(m.RotaryID), joinDate].filter(Boolean);
          return [
            <div key={`${i}-sno`}  style={cell(COLS[0].left, COLS[0].width, top, bg)}>{i + 1}</div>,
            <div key={`${i}-name`} style={cell(COLS[1].left, COLS[1].width, top, bg)}>
              {namePieces.join(' / ')}
            </div>,
            <div key={`${i}-cl`}   style={cell(COLS[2].left, COLS[2].width, top, bg)}>
              {clean(m.Classification) || clean(m.Designation)}
            </div>,
            <div key={`${i}-addr`} style={cell(COLS[3].left, COLS[3].width, top, bg)}>
              {clean(m.Address)}
            </div>,
            <div key={`${i}-mob`}  style={cell(COLS[4].left, COLS[4].width, top, bg)}>
              {fmtMobile(m)}<br />{clean(m.MailID)}
            </div>,
          ];
        })}

      </div>
    </div>
  );
}
