'use client';

import GoldDots from './AdvisorCard/GoldDots';
import NavyDots from './AdvisorCard/NavyDots';

const NAVY   = '#304890';
const YELLOW = '#FEBD1F';

// Proportional widths derived from 595 px Figma design
const W_TOP_NARROW    = '33.6%'; // 200 / 595  yellow outline bar
const W_TOP_WIDE      = '46.9%'; // 279 / 595  navy filled bar
const W_BOT_WIDE      = '68.2%'; // 406 / 595  yellow filled bar
const W_BOT_NARROW    = '48.9%'; // 291 / 595  navy outline bar

export interface MemberCardProps {
  designation:    string;
  name:           string;
  club:           string;
  classification: string;
  mobile:         string;
  blood:          string;
  email:          string;
  address:        string;
  dob:            string;
  dow?:           string;
  rid:            string;
  img?:           string;
  spouseName?:    string;
  spouseImg?:     string;
  index:          number;
  // legacy – kept so existing callers compile
  headerColor?:   string;
  bodyColor?:     string;
}

// ── Photo ──────────────────────────────────────────────────────────────────
function Photo({ src, alt }: { src?: string; alt: string }) {
  const isPlaceholder =
    !src ||
    src.includes('photoplaceholder') ||
    src.includes('profile_pic') ||
    src.includes('dummy');

  const imgSrc = isPlaceholder ? '/blank-profile.webp' : src!;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={alt}
      width={120}
      height={120}
      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/blank-profile.webp'; }}
      style={{ objectFit: 'cover', display: 'block', width: 120, height: 120, borderRadius: 4, border: '1px solid #ddd' }}
    />
  );
}

// ── Info column (center) ───────────────────────────────────────────────────
function InfoCol({ rid, dob, dow, classification, mobile }: {
  rid: string; dob: string; dow?: string;
  classification: string; mobile: string;
}) {
  const style: React.CSSProperties = {
    fontSize: 22, fontFamily: 'Dubai, sans-serif',
    color: 'black', lineHeight: '28px',
    marginBottom: 10,
  };
  return (
    <div style={{ flex: 2, padding: '10px 14px', minWidth: 0 }}>
      <div style={style}><span>ID: {rid}&nbsp;&nbsp;</span><span>DOB: {dob}</span></div>
      <div style={style}>DOW: {dow}</div>
      <div style={style}>Cl: {classification}</div>
      <div style={style}>Mobile: {mobile}</div>
    </div>
  );
}

// ── Address column (right) ─────────────────────────────────────────────────
function AddressCol({ address, club, spouseName, email }: {
  address: string; club: string; spouseName?: string; email: string;
}) {
  const style: React.CSSProperties = {
    fontSize: 22, fontFamily: 'Dubai, sans-serif',
    color: 'black', lineHeight: '28px',
    wordWrap: 'break-word',
    marginBottom: 10,
  };
  return (
    <div style={{ flex: 3, padding: '10px 14px', minWidth: 0 }}>
      <div style={{ ...style, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {'Email: '}
        {email.length > 30
          ? email.slice(0, 30) + '\n' + email.slice(30)
          : email}
      </div>
      <div style={style}>Add: {address}</div>
      <div style={style}>H.Club: {club}</div>
      <div style={style}>Spouse: {spouseName}</div>
    </div>
  );
}

// ── Vertical divider ───────────────────────────────────────────────────────
const Divider = () => (
  <div style={{
    width: 1, alignSelf: 'stretch', flexShrink: 0,
    background: 'rgba(0,0,0,0.50)', margin: '0 2px',
  }} />
);

// ── Decorative bars helper ─────────────────────────────────────────────────
function Bars({
  side, position,
}: {
  side: 'left' | 'right';
  position: 'top' | 'bottom';
}) {
  const isLeft   = side === 'left';
  const isTop    = position === 'top';

  // Radius: the END away from the card edge is rounded
  const narrowR  = isLeft
    ? { borderTopRightRadius: 20, borderBottomRightRadius: 20 }
    : { borderTopLeftRadius:  20, borderBottomLeftRadius:  20 };

  // Border: omit the side that touches the card edge (bleeds into overflow)
  const topNarrowBorder = isLeft
    ? { borderTop: `3px ${YELLOW} solid`, borderRight: `3px ${YELLOW} solid`, borderBottom: `3px ${YELLOW} solid` }
    : { borderTop: `3px ${YELLOW} solid`, borderLeft:  `3px ${YELLOW} solid`, borderBottom: `3px ${YELLOW} solid` };

  const topWideBorder = isLeft
    ? { borderTop: `3px ${NAVY} solid`, borderRight: `3px ${NAVY} solid`, borderBottom: `3px ${NAVY} solid` }
    : { borderTop: `3px ${NAVY} solid`, borderLeft:  `3px ${NAVY} solid`, borderBottom: `3px ${NAVY} solid` };

  const botWideBorder = isLeft
    ? { borderTop: `3px ${YELLOW} solid`, borderRight: `3px ${YELLOW} solid`, borderBottom: `3px ${YELLOW} solid` }
    : { borderTop: `3px ${YELLOW} solid`, borderLeft:  `3px ${YELLOW} solid`, borderBottom: `3px ${YELLOW} solid` };

  const botNarrowBorder = isLeft
    ? { borderTop: `3px ${NAVY} solid`, borderRight: `3px ${NAVY} solid`, borderBottom: `3px ${NAVY} solid` }
    : { borderTop: `3px ${NAVY} solid`, borderLeft:  `3px ${NAVY} solid`, borderBottom: `3px ${NAVY} solid` };

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

  const photos = (
    <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
      <Photo src={img}       alt={name} />
      <Photo src={spouseImg} alt={spouseName || 'Spouse'} />
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
      minHeight: 200,
      marginBottom: 18,
      width: '100%',
      boxSizing: 'border-box',
    }}>

      {/* Top decoration bars */}
      <Bars side={isEven ? 'left'  : 'right'} position="top" />

      {/* Bottom decoration bars */}
      <Bars side={isEven ? 'right' : 'left'}  position="bottom" />

      {/* Gold dots – at the tip of the top navy bar */}
      {isEven ? (
        // bars from left → right tip of navy bar at 46.9%
        <GoldDots style={{ position: 'absolute', left: 'calc(46.9% - 48px)', top: 14 }} />
      ) : (
        // bars from right → left tip of navy bar at 53.1% from left, mirror dots
        <GoldDots style={{ position: 'absolute', left: 'calc(53.1% - 2px)', top: 14, transform: 'scaleX(-1)' }} />
      )}

      {/* Navy dots – at the tip of the bottom yellow bar */}
      {isEven ? (
        // bars from right → left tip of yellow bar at 31.8% from left
        <NavyDots style={{ position: 'absolute', left: 'calc(31.8% - 0px)', bottom: 13 }} />
      ) : (
        // bars from left → right tip of yellow bar at 68.2%, mirror dots
        <NavyDots style={{ position: 'absolute', left: 'calc(68.2% + -48px)', bottom: 13, transform: 'scaleX(-1)' }} />
      )}

      {/* Name header – absolutely placed so it sits over the top bars */}
      <div style={{
        position: 'absolute',
        top: 14,
        ...(isEven
          // bars from left → name on RIGHT, after the gold dots at ~46.9%
          ? { left: '48.9%', maxWidth: 'calc(51.1% - 16px)' }
          // bars from right → name on LEFT, before the gold dots at ~53.1%
          : { left: 13, maxWidth: 'calc(53.1% - 20px)' }
        ),
        fontSize: 22,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 700,
        color: 'black',
        zIndex: 2,
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
        paddingTop: 32,
        paddingBottom: 32,
        paddingLeft: 8,
        paddingRight: 8,
      }}>
        {isEven ? (
          // Photos | Info | | Address
          <>{photos}{info}<Divider />{addr}</>
        ) : (
          // Info | | Address | Photos
          <>{info}<Divider />{addr}{photos}</>
        )}
      </div>
    </div>
  );
}
