import Link from 'next/link';
import Header from '@/components/Header';
import PhotoImg from './PhotoImg';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { fetchDGDetails } from '@/lib/api';
import DownloadPDFButton from './DownloadPDFButton';

// ── Colors ────────────────────────────────────────────────────────────────────
const NAVY   = '#304890';
const BLUE   = '#17458F';
const BLUE_BG   = 'rgba(48,72,144,0.50)';
const YELLOW    = '#FEBD1F';
const YELLOW_BG = 'rgba(254,189,31,0.50)';

const FONT = '"Dubai", sans-serif';

function cleanText(text: any): string {
  if (!text) return '';
  return String(text).replace(/(<([^>]+)>)/gi, '').trim();
}

// ── DotStrip ──────────────────────────────────────────────────────────────────
function DotStrip() {
  return (
    <div style={{
      display: 'flex',
      gap: 5,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '6px 0',
    }}>
      {Array.from({ length: 16 }, (_, i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: i % 2 === 0 ? BLUE : YELLOW,
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

// ── LabelBadge ────────────────────────────────────────────────────────────────
function LabelBadge({ label, color }: { label: string; color: 'blue' | 'yellow' }) {
  const isBlue = color === 'blue';
  return (
    <div style={{
      width: 94,
      flexShrink: 0,
      background: isBlue ? BLUE_BG : YELLOW_BG,
      textAlign: 'center',
      padding: '6px 8px',
      fontSize: 14,
      fontWeight: 700,
      color: isBlue ? BLUE : '#7a5800',
      whiteSpace: 'nowrap',
      fontFamily: FONT,
      alignSelf: 'stretch',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {label}
    </div>
  );
}

// ── InfoCell ──────────────────────────────────────────────────────────────────
function InfoCell({
  text,
  align,
  minHeight = 26,
}: {
  text: string;
  align: 'left' | 'right';
  minHeight?: number;
}) {
  return (
    <div style={{
      flex: 1,
      minHeight,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
      padding: '6px 10px',
      fontSize: 18,
      fontWeight: 400,
      color: '#000',
      fontFamily: FONT,
      wordBreak: 'break-word',
      textAlign: align,
      lineHeight: 1.45,
    }}>
      {text}
    </div>
  );
}


// ── DistrictCard ──────────────────────────────────────────────────────────────
function DistrictCard({
  districtName,
  yearLeft,
  yearRight,
  dgLeft,
  dgRight,
}: {
  districtName: string;
  yearLeft: string;
  yearRight: string;
  dgLeft?: any;
  dgRight?: any;
}) {
  const hasLeft  = !!dgLeft;
  const hasRight = !!dgRight;

  const dgRows: { label: string; color: 'blue' | 'yellow'; leftVal: string; rightVal: string }[] = [
    {
      label: 'DOB',
      color: 'blue',
      leftVal:  hasLeft  ? cleanText(dgLeft.DOB)              : '',
      rightVal: hasRight ? cleanText(dgRight.DOB)             : '',
    },
    {
      label: 'DOW',
      color: 'yellow',
      leftVal:  hasLeft  ? cleanText(dgLeft.DOA)              : '',
      rightVal: hasRight ? cleanText(dgRight.DOA)             : '',
    },
    {
      label: 'Classification',
      color: 'blue',
      leftVal:  hasLeft  ? cleanText(dgLeft.Classification)   : '',
      rightVal: hasRight ? cleanText(dgRight.Classification)  : '',
    },
    {
      label: 'Mobile',
      color: 'yellow',
      leftVal:  hasLeft  ? cleanText(dgLeft.member_mobile_no) : '',
      rightVal: hasRight ? cleanText(dgRight.member_mobile_no): '',
    },
  ];

  const spouseRows: { label: string; color: 'blue' | 'yellow'; leftVal: string; rightVal: string; minHeight?: number }[] = [
    {
      label: 'Email',
      color: 'blue',
      leftVal:  hasLeft  ? cleanText(dgLeft.member_email_id)  : '',
      rightVal: hasRight ? cleanText(dgRight.member_email_id) : '',
    },
    {
      label: 'Address',
      color: 'yellow',
      leftVal:  hasLeft  ? cleanText(dgLeft.Address)          : '',
      rightVal: hasRight ? cleanText(dgRight.Address)         : '',
      minHeight: 60,
    },
  ];

  return (
    <div data-pdf-card style={{
      width: 860,
      background: '#fff',
      borderRadius: 8,
      overflow: 'hidden',
      boxShadow: '0 3px 16px rgba(48,72,144,0.15)',
      marginBottom: 36,
      fontFamily: FONT,
    }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', background: NAVY }}>
        <div style={{ flex: 1, textAlign: 'center', padding: '11px 12px', fontWeight: 700, fontSize: 14, color: '#fff', fontFamily: FONT }}>
          {yearLeft}
        </div>
        <div style={{ flex: 2, textAlign: 'center', padding: '11px 12px', fontWeight: 700, fontSize: 16, color: '#fff', letterSpacing: 0.5, fontFamily: FONT }}>
          {districtName.toUpperCase()}
        </div>
        <div style={{ flex: 1, textAlign: 'center', padding: '11px 12px', fontWeight: 700, fontSize: 14, color: '#fff', fontFamily: FONT }}>
          {yearRight}
        </div>
      </div>

      {/* ── Card body ── */}
      <div style={{ padding: '20px 24px 24px' }}>

        {/* ── Governor names + dots in one line ── */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14, gap: 8 }}>
          <div style={{ flex: 1, fontWeight: 700, fontSize: 22, color: '#000', fontFamily: FONT }}>
            {hasLeft ? cleanText(dgLeft.member_name) : '—'}
          </div>
          <DotStrip />
          <div style={{ flex: 1, fontWeight: 700, fontSize: 22, color: '#000', fontFamily: FONT, textAlign: 'right' }}>
            {hasRight ? cleanText(dgRight.member_name) : '—'}
          </div>
        </div>

        {/* ── DG data rows ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 4 }}>

          {/* Left DG photo */}
          <div style={{ flexShrink: 0, paddingRight: 12, display: 'flex', alignItems: 'center' }}>
            <PhotoImg src={hasLeft ? dgLeft.profilephoto : undefined} alt="DG Left" size={120} />
          </div>

          {/* Data rows */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {dgRows.map(row => (
              <div key={row.label} style={{ display: 'flex', alignItems: 'stretch', minHeight: 34 }}>
                <InfoCell text={row.leftVal} align="right" minHeight={34} />
                <LabelBadge label={row.label} color={row.color} />
                <InfoCell text={row.rightVal} align="left" minHeight={34} />
              </div>
            ))}
          </div>

          {/* Right DG photo */}
          <div style={{ flexShrink: 0, paddingLeft: 12, display: 'flex', alignItems: 'center' }}>
            <PhotoImg src={hasRight ? dgRight.profilephoto : undefined} alt="DG Right" size={120} />
          </div>

        </div>

        {/* ── Spouse data rows ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 14 }}>

          {/* Left spouse photo */}
          <div style={{ flexShrink: 0, paddingRight: 12, display: 'flex', alignItems: 'center' }}>
            <PhotoImg src={hasLeft ? dgLeft.Spouse_Photo : undefined} alt="Spouse Left" size={120} />
          </div>

          {/* Spouse rows */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {spouseRows.map(row => (
              <div key={row.label} style={{ display: 'flex', alignItems: 'stretch', minHeight: row.minHeight || 34 }}>
                <InfoCell text={row.leftVal} align="right" minHeight={row.minHeight} />
                <LabelBadge label={row.label} color={row.color} />
                <InfoCell text={row.rightVal} align="left" minHeight={row.minHeight} />
              </div>
            ))}
          </div>

          {/* Right spouse photo */}
          <div style={{ flexShrink: 0, paddingLeft: 12, display: 'flex', alignItems: 'center' }}>
            <PhotoImg src={hasRight ? dgRight.Spouse_Photo : undefined} alt="Spouse Right" size={120} />
          </div>

        </div>

        {/* ── Spouse names + dots in one line ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, fontSize: 22, fontWeight: 500, color: '#000', fontFamily: FONT }}>
            {hasLeft ? cleanText(dgLeft.Spouse_Name) : ''}
          </div>
          <DotStrip />
          <div style={{ flex: 1, fontSize: 22, fontWeight: 500, color: '#000', fontFamily: FONT, textAlign: 'right' }}>
            {hasRight ? cleanText(dgRight.Spouse_Name) : ''}
          </div>
        </div>

      </div>{/* end card body */}

    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
const HOME_DISTRICT = '3262'; // exclude the home district from "other DGs"

export default async function DGDirectoryPage() {
  let dgs26: any[] = [];
  let dgs27: any[] = [];

  try {
    [dgs26, dgs27] = await Promise.all([
      fetchDGDetails('2026-2027'),
      fetchDGDetails('2027-2028'),
    ]);
  } catch {
    // fail silently
  }

  // Build district map, exclude the home district
  const districtMap = new Map<string, { dg26?: any; dg27?: any }>();

  for (const dg of dgs26) {
    const key = cleanText(dg.DistricName);
    if (key.includes(HOME_DISTRICT)) continue;
    districtMap.set(key, { ...(districtMap.get(key) || {}), dg26: dg });
  }
  for (const dg of dgs27) {
    const key = cleanText(dg.DistricName);
    if (key.includes(HOME_DISTRICT)) continue;
    districtMap.set(key, { ...(districtMap.get(key) || {}), dg27: dg });
  }

  const districts = Array.from(districtMap.entries()).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="boxed_wrapper">
      <Header />

      <section
        className="page-title centred"
        style={{ position: 'relative', padding: '30px 0', backgroundColor: '#9EDFFD' }}
      >
        <div className="auto-container">
          <div className="content-box">
            <div className="title">
              <h1 className="text-dark">Other District Governors</h1>
            </div>
            <div className="btn-box">
              <Link href="/" className="theme-btn btn-one dist-btn">Back</Link>
            </div>
          </div>
        </div>
      </section>

      <div style={{ background: '#e8e8e8', minHeight: '60vh', padding: '50px 35px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          <h2 style={{
            fontSize: 18,
            fontWeight: 900,
            color: NAVY,
            letterSpacing: 1,
            textTransform: 'uppercase',
            marginBottom: 28,
            fontFamily: FONT,
          }}>
            OTHER DISTRICT GOVERNORS
          </h2>

          <DownloadPDFButton />

          {districts.length === 0 && (
            <p style={{ color: '#888', fontFamily: FONT }}>No data available.</p>
          )}

          {districts.map(([districtName, { dg26, dg27 }]) => (
            <DistrictCard
              key={districtName}
              districtName={districtName}
              yearLeft="2026-2027"
              yearRight="2027-2028"
              dgLeft={dg26}
              dgRight={dg27}
            />
          ))}

        </div>
      </div>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
