'use client';

import { useEffect } from 'react';

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
  return (
    <img
      src={photoSrc(src)}
      width={120}
      height={120}
      style={{ width: 120, height: 120, objectFit: 'cover', display: 'block', borderRadius: 4 }}
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
  const DIVIDER   = META_TOP + 3 * 28 + 20;   // 162
  const PRES_TOP  = DIVIDER + 30;              // 192  — president title
  const P_OFF     = PRES_TOP - 104;            // 88
  // Secretary placed 30px + 80px margin below the bottom of the president block
  const SEC_TOP   = PRES_TOP + (205 - 104) + 110; // 192 + 101 + 110 = 403
  const S_V       = SEC_TOP - 214;             // offset for sec text (title was at 214)
  const S_P_OFF   = SEC_TOP - 104;             // offset for sec photo block (photo was at 117/122)
  const TABLE_H   = SEC_TOP + (324 - 214) + 80; // 80px margin after secretary card
  const TABLE_R   = SEC_TOP + (357 - 214) + 80;

  const canvasH = Math.max(900, TABLE_R + members.length * 70 + 20);

  const suffix = clean(club.Club_Name)
    .replace(/^rotary\s+club\s+of\s+/i, '')
    .toUpperCase();

  const cell = (left: number, width: number, top: number, bg: string) => ({
    position: 'absolute' as const,
    left, top, width,
    height: 64,
    background: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    fontSize: 16,
    lineHeight: '22px',
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
        data-row-h={70}
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
          color: '#304890', fontSize: 28,
          fontFamily: 'Inter, sans-serif', fontWeight: 900,
          whiteSpace: 'nowrap',
        }}>
          ROTARY CLUB OF {suffix}
        </div>

        {/* ── CLUB META (3 rows, each flex space-between) ── */}
        <div style={{
          position: 'absolute', left: 47, top: META_TOP, width: 1200 - 94,
          fontSize: 18, lineHeight: '28px',
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

        <div style={{ position: 'absolute', left: 310, top: 104 + P_OFF, width: 390, fontSize: 18, fontWeight: 700, textAlign: 'center' }}>
          President: {clean(president?.member_name)}
        </div>

        <div style={{ position: 'absolute', left: 310, top: 130 + P_OFF, fontSize: 18 }}><b>ID:</b> {clean(president?.RotaryID)}</div>
        <div style={{ position: 'absolute', left: 490, top: 130 + P_OFF, fontSize: 18 }}><b>DOB:</b> {fmtDOB(president?.DOB)}</div>
        <div style={{ position: 'absolute', left: 310, top: 156 + P_OFF, fontSize: 18 }}><b>DOA:</b> {fmtDOB(president?.DOA)}</div>
        <div style={{ position: 'absolute', left: 310, top: 182 + P_OFF, fontSize: 18 }}><b>Cl:</b> {clean(president?.Classification) || clean(president?.Designation)}</div>
        <div style={{ position: 'absolute', left: 310, top: 208 + P_OFF, fontSize: 18 }}><b>Mobile:</b> {fmtMobile(president)}</div>
        <div style={{ position: 'absolute', left: 310, top: 234 + P_OFF, fontSize: 18 }}><b>Email:</b> {clean(president?.MailID)}</div>

        <div style={{ position: 'absolute', left: 700, top: 130 + P_OFF, width: 1, height: 122, background: 'rgba(0,0,0,0.50)' }} />

        <div style={{ position: 'absolute', left: 712, top: 130 + P_OFF, width: 260, fontSize: 18, lineHeight: '24px' }}>
          <b>Add:</b> {clean(president?.Address)}
        </div>
        <div style={{ position: 'absolute', left: 712, top: 234 + P_OFF, width: 260, fontSize: 18 }}>
          <b>Spouse:</b> {clean(president?.Spouse_name) || ''}
        </div>

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

        <div style={{ position: 'absolute', left: 26, top: 214 + S_V, width: 424, fontSize: 18, fontWeight: 700, textAlign: 'center' }}>
          Secretary: {clean(secretary?.member_name)}
        </div>

        <div style={{ position: 'absolute', left: 26,  top: 240 + S_V, fontSize: 18 }}><b>ID:</b> {clean(secretary?.RotaryID)}</div>
        <div style={{ position: 'absolute', left: 200, top: 240 + S_V, fontSize: 18 }}><b>DOB:</b> {fmtDOB(secretary?.DOB)}</div>
        <div style={{ position: 'absolute', left: 26,  top: 266 + S_V, fontSize: 18 }}><b>DOA:</b> {fmtDOB(secretary?.DOA)}</div>
        <div style={{ position: 'absolute', left: 26,  top: 292 + S_V, fontSize: 18 }}><b>Cl:</b> {clean(secretary?.Classification) || clean(secretary?.Designation)}</div>
        <div style={{ position: 'absolute', left: 26,  top: 318 + S_V, fontSize: 18 }}><b>Mobile:</b> {fmtMobile(secretary)}</div>
        <div style={{ position: 'absolute', left: 26,  top: 344 + S_V, fontSize: 18 }}><b>Email:</b> {clean(secretary?.MailID)}</div>

        <div style={{ position: 'absolute', left: 450, top: 240 + S_V, width: 1, height: 122, background: 'rgba(0,0,0,0.50)' }} />

        <div style={{ position: 'absolute', left: 462, top: 240 + S_V, width: 260, fontSize: 18, lineHeight: '24px' }}>
          <b>Add:</b> {clean(secretary?.Address)}
        </div>
        <div style={{ position: 'absolute', left: 462, top: 344 + S_V, width: 260, fontSize: 18 }}>
          <b>Spouse:</b> {clean(secretary?.Spouse_name) || ''}
        </div>

        {/* ── TABLE HEADERS (full 1200px) ── */}
        {COLS.map((col) => (
          <div key={col.label} style={{
            position: 'absolute',
            left: col.left, top: TABLE_H,
            width: col.width, height: 30,
            background: '#304890',
            borderRadius: '10px 10px 0 0',
            color: 'white', fontSize: 16,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', textAlign: 'center',
            padding: '0 8px', boxSizing: 'border-box',
          }}>
            {col.label}
          </div>
        ))}

        {/* ── TABLE ROWS ── */}
        {members.map((m: any, i: number) => {
          const top = TABLE_R + i * 70;
          const bg  = i % 2 === 0 ? 'rgba(254,189,31,0.20)' : 'rgba(48,72,144,0.20)';
          return [
            <div key={`${i}-sno`}  style={cell(COLS[0].left, COLS[0].width, top, bg)}>{i + 1}</div>,
            <div key={`${i}-name`} style={cell(COLS[1].left, COLS[1].width, top, bg)}>
              {clean(m.member_name)}<br />{clean(m.RotaryID)}<br />{fmtDOB(m.DOA)}
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
