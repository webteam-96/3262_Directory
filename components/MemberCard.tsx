'use client';

import GoldDots from './AdvisorCard/GoldDots';
import NavyDots from './AdvisorCard/NavyDots';
import focalPoints from '@/lib/photo-focal-points.json';

const FOCAL: Record<string, { x: number; y: number }> = focalPoints as Record<string, { x: number; y: number }>;
const DEFAULT_POS = '50% 25%';

function objectPositionFor(src?: string): string {
  if (!src) return DEFAULT_POS;
  const f = FOCAL[src];
  return f ? `${f.x}% ${f.y}%` : DEFAULT_POS;
}

const NAVY = '#304890';
const YELLOW = '#FEBD1F';

// Proportional widths derived from 595 px Figma design
const W_TOP_NARROW = '33.6%'; // 200 / 595  yellow outline bar
const W_TOP_WIDE = '46.9%'; // 279 / 595  navy filled bar
const W_BOT_WIDE = '68.2%'; // 406 / 595  yellow filled bar
const W_BOT_NARROW = '48.9%'; // 291 / 595  navy outline bar

export interface MemberCardProps {
  designation: string;
  name: string;
  club: string;
  classification: string;
  mobile: string;
  blood: string;
  email: string;
  address: string;
  dob: string;
  dow?: string;
  rid: string;
  img?: string;
  spouseName?: string;
  spouseImg?: string;
  index: number;
  // legacy – kept so existing callers compile
  headerColor?: string;
  bodyColor?: string;
}

// ── Photo ──────────────────────────────────────────────────────────────────
const PLACEHOLDER_IMG = '/blank-profile.webp';

function isPlaceholderUrl(src?: string): boolean {
  if (!src) return true;
  return (
    src.includes('photoplaceholder') ||
    src.includes('profile_pic') ||
    src.includes('dummy')
  );
}

function Photo({ src, alt }: { src?: string; alt: string }) {
  // url and objectPosition are BOTH derived purely from `src` so server
  // and client always compute identical values — no hydration mismatch
  const url = isPlaceholderUrl(src) ? PLACEHOLDER_IMG : src!;
  const objectPosition = objectPositionFor(src);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      width={160}
      height={160}
      suppressHydrationWarning
      onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMG; }}
      style={{ objectFit: 'cover', objectPosition, display: 'block', width: 160, height: 160, borderRadius: 4, border: '1px solid #ddd' }}
    />
  );
}

// ── Info column (center) ───────────────────────────────────────────────────
function InfoCol({ rid, dob, dow, classification, mobile }: {
  rid: string; dob: string; dow?: string;
  classification: string; mobile: string;
}) {
  const style: React.CSSProperties = {
    fontSize: 26, fontFamily: 'Dubai, sans-serif',
    color: 'black', lineHeight: '32px',
    marginBottom: 5,
  };
  return (
    <div style={{ flex: 2, padding: '10px 14px', minWidth: 0 }}>
      {(rid || dob) && (
        <div style={style}>
          {rid && <span><b>ID:</b> {rid}&nbsp;&nbsp;</span>}
          {dob && <span><b>DOB:</b> {dob}</span>}
        </div>
      )}
      {dow && <div style={style}><b>DOW:</b> {dow}</div>}
      {classification && <div style={style}><b>Cl:</b> {classification}</div>}
      {mobile && <div style={style}><b>Mobile:</b> {mobile}</div>}
    </div>
  );
}

// ── Address column (right) ─────────────────────────────────────────────────
function AddressCol({ address, club, spouseName, email }: {
  address: string; club: string; spouseName?: string; email: string;
}) {
  const style: React.CSSProperties = {
    fontSize: 26, fontFamily: 'Dubai, sans-serif',
    color: 'black', lineHeight: '32px',
    wordWrap: 'break-word',
    marginBottom: 5,
  };
  return (
    <div style={{ flex: 3, padding: '10px 5px', minWidth: 0 }}>
      {email && (
        <div style={{ ...style, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          <b>Email:</b>{' '}
          {email.length > 30
            ? email.slice(0, 30) + '\n' + email.slice(30)
            : email}
        </div>
      )}
      {address && (
        <div style={{ ...style, wordWrap: 'break-word', wordBreak: 'break-word' }}>
          <b>Add:</b> {address.replace(/^Residence\s*-\s*/i, '')}
        </div>
      )}
      {club && <div style={style}><b>H.Club:</b> {club}</div>}
      {spouseName && <div style={style}><b>Spouse:</b> {spouseName}</div>}
    </div>
  );
}

// ── Vertical divider ───────────────────────────────────────────────────────
const Divider = () => (
  <div style={{
    width: 1, alignSelf: 'stretch', flexShrink: 0,
    background: 'rgba(0,0,0,0.50)', margin: '20px 2px 5px',
  }} />
);

// ── Decorative bars helper ─────────────────────────────────────────────────
function Bars({
  side, position,
}: {
  side: 'left' | 'right';
  position: 'top' | 'bottom';
}) {
  const isLeft = side === 'left';
  const isTop = position === 'top';

  // Radius: the END away from the card edge is rounded
  const narrowR = isLeft
    ? { borderTopRightRadius: 20, borderBottomRightRadius: 20 }
    : { borderTopLeftRadius: 20, borderBottomLeftRadius: 20 };

  // Border: omit the side that touches the card edge (bleeds into overflow)
  const topNarrowBorder = isLeft
    ? { borderTop: `3px ${YELLOW} solid`, borderRight: `3px ${YELLOW} solid`, borderBottom: `3px ${YELLOW} solid` }
    : { borderTop: `3px ${YELLOW} solid`, borderLeft: `3px ${YELLOW} solid`, borderBottom: `3px ${YELLOW} solid` };

  const topWideBorder = isLeft
    ? { borderTop: `3px ${NAVY} solid`, borderRight: `3px ${NAVY} solid`, borderBottom: `3px ${NAVY} solid` }
    : { borderTop: `3px ${NAVY} solid`, borderLeft: `3px ${NAVY} solid`, borderBottom: `3px ${NAVY} solid` };

  const botWideBorder = isLeft
    ? { borderTop: `3px ${YELLOW} solid`, borderRight: `3px ${YELLOW} solid`, borderBottom: `3px ${YELLOW} solid` }
    : { borderTop: `3px ${YELLOW} solid`, borderLeft: `3px ${YELLOW} solid`, borderBottom: `3px ${YELLOW} solid` };

  const botNarrowBorder = isLeft
    ? { borderTop: `3px ${NAVY} solid`, borderRight: `3px ${NAVY} solid`, borderBottom: `3px ${NAVY} solid` }
    : { borderTop: `3px ${NAVY} solid`, borderLeft: `3px ${NAVY} solid`, borderBottom: `3px ${NAVY} solid` };

  const edge = isLeft ? { left: 0 } : { right: 0 };

  if (isTop) {
    return (
      <>
        {/* Yellow outline bar (narrower, higher) */}
        <div style={{
          position: 'absolute', ...edge, top: 12,
          width: W_TOP_NARROW, height: 16, ...narrowR, ...topNarrowBorder,
        }} />
        {/* Navy filled bar (wider, lower) */}
        <div style={{
          position: 'absolute', ...edge, top: 20,
          width: W_TOP_WIDE, height: 16, background: NAVY, ...narrowR, ...topWideBorder,
        }} />
      </>
    );
  }

  // Bottom bars
  return (
    <>
      {/* Yellow filled bar (wider, higher) */}
      <div style={{
        position: 'absolute', ...edge, bottom: 18,
        width: W_BOT_WIDE, height: 16, background: YELLOW, ...narrowR, ...botWideBorder,
      }} />
      {/* Navy outline bar (narrower, lower) */}
      <div style={{
        position: 'absolute', ...edge, bottom: 10,
        width: W_BOT_NARROW, height: 16, ...narrowR, ...botNarrowBorder,
      }} />
    </>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function MemberCard({
  designation, name, club, classification,
  mobile, email, address, dob, dow, rid,
  img, spouseName, spouseImg, index,
}: MemberCardProps) {
  const isEven = index % 2 === 0; // even → photos left, name right

  const hasSpouse = spouseName && spouseName.trim() !== '';

  const photos = (
    <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
      <Photo src={img} alt={name} />
      {hasSpouse && <Photo src={spouseImg} alt={spouseName} />}
    </div>
  );

  const info = (
    <InfoCol
      rid={rid} dob={dob} dow={dow}
      classification={classification} mobile={mobile}
    />
  );

  const addr = (
    <AddressCol address={address} club={club} spouseName={spouseName} email={email} />
  );

  return (
    <div style={{
      position: 'relative',
      background: 'white',
      overflow: 'hidden',
      // minHeight: 200,
      minHeight: 200,
      marginBottom: 2,
      width: '100%',
      boxSizing: 'border-box',
    }}>

      {/* Bottom decoration bars */}
      <Bars side={isEven ? 'right' : 'left'} position="bottom" />

      {/* Navy dots – at the tip of the bottom yellow bar */}
      {isEven ? (
        <NavyDots style={{ position: 'absolute', left: 'calc(31.8% - 0px)', bottom: 13 }} />
      ) : (
        <NavyDots style={{ position: 'absolute', left: 'calc(68.2% + -48px)', bottom: 13, transform: 'scaleX(-1)' }} />
      )}

      {/* Name header – aligned with info fields, past the photos */}
      <div style={{
        fontSize: 26,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 700,
        color: 'black',
        padding: '8px 8px 0 8px',
        paddingLeft: isEven ? 8 + 160 + (hasSpouse ? 12 + 160 : 0) + 14 : 14,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {designation}: {name}
      </div>

      {/* Content body */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        paddingTop: 4,
        paddingBottom: 32,
        paddingLeft: 8,
        paddingRight: 8,
      }}>
        {isEven ? (
          <>{photos}{info}<Divider />{addr}</>
        ) : (
          <>{info}<Divider />{addr}{photos}</>
        )}
      </div>
    </div>
  );
}
