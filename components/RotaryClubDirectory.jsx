'use client';

import { useEffect } from 'react';

/* ─── Dot helper ─── */
const Dot = ({ left, top, color }) => (
  <div
    style={{
      position: 'absolute',
      left,
      top,
      width: 6,
      height: 6,
      borderRadius: 9999,
      background: color,
    }}
  />
);

/* ─── Male silhouette SVG ─── */
const MaleSVG = () => (
  <svg viewBox="0 0 64 80" width={64} height={80}>
    <rect width="64" height="80" fill="#d4b896" />
    <circle cx="32" cy="22" r="13" fill="#8B6340" />
    <polygon points="18,46 32,54 46,46 52,80 12,80" fill="#2c3e6e" />
    <polygon points="28,54 32,62 36,54 34,80 30,80" fill="#fff" />
    <ellipse cx="32" cy="65" rx="20" ry="22" fill="#8B6340" />
  </svg>
);

/* ─── Female silhouette SVG ─── */
const FemaleSVG = () => (
  <svg viewBox="0 0 64 80" width={64} height={80}>
    <rect width="64" height="80" fill="#d4b896" />
    <circle cx="32" cy="20" r="13" fill="#c8956c" />
    <ellipse cx="32" cy="12" rx="15" ry="9" fill="#1a0a00" />
    <rect x="17" y="8" width="5" height="20" rx="3" fill="#1a0a00" />
    <ellipse cx="32" cy="62" rx="22" ry="28" fill="#8B1a2e" />
    <rect x="10" y="38" width="44" height="5" fill="#c8a84b" />
  </svg>
);

/* ─── Photo block (male + female SVGs on coloured bg) ─── */
const PhotoBlock = ({ left, top, bgLeft, bgTop }) => (
  <>
    {/* Yellow tinted background */}
    <div
      style={{
        position: 'absolute',
        left: bgLeft,
        top: bgTop,
        width: 222,
        height: 70,
        background: 'rgba(254,189,31,0.20)',
      }}
    />
    {/* Male portrait */}
    <div style={{ position: 'absolute', left, top }}>
      <MaleSVG />
    </div>
    {/* Female portrait */}
    <div style={{ position: 'absolute', left: left + 72, top }}>
      <FemaleSVG />
    </div>
  </>
);

/* ─── Reusable info-field row ─── */
const Field = ({ label, value, left, top, fontSize = 14 }) => (
  <div style={{ position: 'absolute', left, top, fontSize, whiteSpace: 'nowrap' }}>
    <span style={{ fontWeight: 700 }}>{label}: </span>
    <span>{value}</span>
  </div>
);

/* ─── Table rows data ─── */
const rows = Array(9).fill({
  sno: '1',
  name: 'Agarwal Bharat /',
  nameSub: '111063682 /19-Feb-2021',
  classification: 'Doctor',
  address: '302,Ratna Towers',
  addressSub: 'cuttack Road',
  addressSub2: 'Bhubaneswar',
  mobile: '+91 9437013456/',
  mobileSub: 'satguru.fuels',
  mobileSub2: '@gmail.com',
});

export default function RotaryClubDirectory() {
  useEffect(() => {
    if (document.getElementById('inter-font')) return;
    const link = document.createElement('link');
    link.id = 'inter-font';
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Inter:wght@900&display=swap';
    document.head.appendChild(link);
  }, []);

  const GOLD = '#FEBD1F';
  const BLUE = '#17458F';

  return (
    <div
      style={{
        width: 600,
        minHeight: 860,
        background: 'white',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Segoe UI', Arial, sans-serif",
      }}
    >
      {/* ── 1. Title ── */}
      <div
        style={{
          position: 'absolute',
          left: 170,
          top: 12,
          color: '#304890',
          fontSize: 16,
          fontFamily: 'Inter',
          fontWeight: 900,
          textDecoration: 'underline',
          whiteSpace: 'nowrap',
        }}
      >
        ROTARY CLUB OF BASUDEVPUR
      </div>

      {/* ── 2. Club Meta — Left Column ── */}
      <div
        style={{
          position: 'absolute',
          left: 47,
          top: 38,
          fontSize: 13,
          lineHeight: '18px',
        }}
      >
        <div>
          <span style={{ fontWeight: 700 }}>Club ID:</span>{' '}
          <span style={{ fontWeight: 400 }}>222364,</span>{' '}
          <span style={{ fontWeight: 700 }}>Charter Date:</span>{' '}
          <span style={{ fontWeight: 400 }}>11.03.2021,</span>
        </div>
        <div>
          <span style={{ fontWeight: 700 }}>Meeting Day, Time:</span>{' '}
          <span style={{ fontWeight: 400 }}>Sunday, 07:00pm</span>
        </div>
        <div>
          <span style={{ fontWeight: 700 }}>Venue:</span>{' '}
          <span style={{ fontWeight: 400 }}>
            Miracle English Medium School, Basudevpur
          </span>
        </div>
      </div>

      {/* ── 3. Club Meta — Right Column ── */}
      <div
        style={{
          position: 'absolute',
          left: 357,
          top: 38,
          fontSize: 13,
          lineHeight: '18px',
        }}
      >
        <div>
          <span style={{ fontWeight: 700 }}>AG:</span>{' '}
          <span style={{ fontWeight: 400 }}>Bhagirathi Bal</span>
        </div>
        <div>
          <span style={{ fontWeight: 700 }}>Club Advisor:</span>{' '}
          <span style={{ fontWeight: 400 }}>Chandra Kanta Das</span>
        </div>
        <div>
          <span style={{ fontWeight: 700 }}>Sponsor Club:</span>{' '}
          <span style={{ fontWeight: 400 }}>RC Bhadrak</span>
        </div>
      </div>

      {/* ── 4. Horizontal Divider ── */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 97,
          width: 600,
          height: 2,
          background: '#D6DAE9',
        }}
      />

      {/* ── 5. President Block ── */}

      {/* Photo block: bg at left:0, top:122; SVGs at left:40, top:117 */}
      <PhotoBlock bgLeft={0} bgTop={122} left={40} top={117} />

      {/* President dots — top-left cluster */}
      <Dot left={32} top={109} color={BLUE} />
      <Dot left={42} top={109} color={GOLD} />
      <Dot left={53} top={109} color={BLUE} />
      <Dot left={32} top={119} color={GOLD} />
      <Dot left={32} top={129} color={BLUE} />

      {/* President dots — bottom-right cluster */}
      <Dot left={163} top={205} color={BLUE} />
      <Dot left={174} top={205} color={GOLD} />
      <Dot left={184} top={185} color={BLUE} />
      <Dot left={184} top={195} color={GOLD} />
      <Dot left={184} top={205} color={BLUE} />

      {/* President title */}
      <div
        style={{
          position: 'absolute',
          left: 258,
          top: 104,
          fontSize: 15,
          fontWeight: 700,
        }}
      >
        President: Rahul Chandra Panigrah
      </div>

      {/* President info fields */}
      <Field label="ID" value="000000" left={192} top={124} />
      <Field label="DOB" value="DD/MM" left={272} top={124} />
      <Field label="DOW" value="DD/MM" left={192} top={139} />
      <Field label="Cl" value="Chattered Accountant" left={192} top={154} />
      <Field label="Mobile" value="+91 9437960565" left={192} top={169} />
      <Field label="Email" value="rc_mohanty@hotmail.com" left={192} top={184} />

      {/* President vertical separator */}
      <div
        style={{
          position: 'absolute',
          left: 395,
          top: 129,
          width: 1,
          height: 72,
          background: 'rgba(0,0,0,0.5)',
        }}
      />

      {/* President address */}
      <div
        style={{
          position: 'absolute',
          left: 401,
          top: 124,
          width: 169,
          fontSize: 14,
          lineHeight: '20px',
        }}
      >
        Add: Sudarshan Arts and Crafts Village, Plot No. CB-5, Jayadev Vihar
      </div>

      {/* President spouse */}
      <div style={{ position: 'absolute', left: 401, top: 179, fontSize: 14 }}>
        Spouse: Full Name
      </div>

      {/* ── 6. Secretary Block ── */}

      {/* Secretary title */}
      <div
        style={{
          position: 'absolute',
          left: 92,
          top: 214,
          fontSize: 15,
          fontWeight: 700,
        }}
      >
        Secretary: Rahul Chandra Panigrah
      </div>

      {/* Secretary info fields */}
      <Field label="ID" value="000000" left={26} top={234} />
      <Field label="DOB" value="DD/MM" left={106} top={234} />
      <Field label="DOW" value="DD/MM" left={26} top={249} />
      <Field label="Cl" value="Chattered Accountant" left={26} top={264} />
      <Field label="Mobile" value="+91 9437960565" left={26} top={279} />
      <Field label="Email" value="rc_mohanty@hotmail.com" left={26} top={294} />

      {/* Secretary vertical separator */}
      <div
        style={{
          position: 'absolute',
          left: 229,
          top: 239,
          width: 1,
          height: 72,
          background: 'rgba(0,0,0,0.5)',
        }}
      />

      {/* Secretary address */}
      <div
        style={{
          position: 'absolute',
          left: 235,
          top: 234,
          width: 169,
          fontSize: 14,
          lineHeight: '20px',
        }}
      >
        Add: Sudarshan Arts and Crafts Village, Plot No. CB-5, Jayadev Vihar
      </div>

      {/* Secretary spouse */}
      <div style={{ position: 'absolute', left: 235, top: 289, fontSize: 14 }}>
        Spouse: Full Name
      </div>

      {/* Secretary photo block: bg at left:373, top:232; SVGs at left:413, top:227 */}
      <PhotoBlock bgLeft={373} bgTop={232} left={413} top={227} />

      {/* Secretary dots — top-left cluster */}
      <Dot left={405} top={219} color={BLUE} />
      <Dot left={415} top={219} color={GOLD} />
      <Dot left={426} top={219} color={BLUE} />
      <Dot left={405} top={229} color={GOLD} />
      <Dot left={405} top={239} color={BLUE} />

      {/* Secretary dots — bottom-right cluster */}
      <Dot left={536} top={315} color={BLUE} />
      <Dot left={547} top={315} color={GOLD} />
      <Dot left={557} top={295} color={BLUE} />
      <Dot left={557} top={305} color={GOLD} />
      <Dot left={557} top={315} color={BLUE} />

      {/* ── 7. Table Headers ── */}
      {[
        { label: 'S.No',              left: 12,  width: 38,  padding: '0 6px'  },
        { label: 'Name/ID/Joining',   left: 54,  width: 152, padding: '0 18px' },
        { label: 'Classification',    left: 210, width: 110, padding: '0 12px' },
        { label: 'Address',           left: 324, width: 147, padding: '0 26px' },
        { label: 'Mobile/Email',      left: 475, width: 108, padding: '0 10px' },
      ].map((col) => (
        <div
          key={col.label}
          style={{
            position: 'absolute',
            left: col.left,
            top: 324,
            width: col.width,
            height: 30,
            background: '#304890',
            borderRadius: '10px 10px 0 0',
            color: 'white',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: col.padding,
            boxSizing: 'border-box',
          }}
        >
          {col.label}
        </div>
      ))}

      {/* ── 8. Table Rows ── */}
      {rows.map((row, i) => {
        const top = 357 + i * 54;
        const bg =
          i % 2 === 0
            ? 'rgba(254,189,31,0.20)'
            : 'rgba(48,72,144,0.20)';

        const cells = [
          { left: 12,  width: 38,  content: <>{row.sno}</> },
          {
            left: 54,
            width: 152,
            content: (
              <>
                {row.name}
                <br />
                {row.nameSub}
              </>
            ),
          },
          { left: 210, width: 110, content: <>{row.classification}</> },
          {
            left: 324,
            width: 147,
            content: (
              <>
                {row.address}
                <br />
                {row.addressSub}
                <br />
                {row.addressSub2}
              </>
            ),
          },
          {
            left: 475,
            width: 108,
            content: (
              <>
                {row.mobile}
                <br />
                {row.mobileSub}
                <br />
                {row.mobileSub2}
              </>
            ),
          },
        ];

        return cells.map((cell) => (
          <div
            key={`${i}-${cell.left}`}
            style={{
              position: 'absolute',
              left: cell.left,
              top,
              width: cell.width,
              height: 48,
              background: bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              fontSize: 13,
              lineHeight: '16px',
              boxSizing: 'border-box',
            }}
          >
            {cell.content}
          </div>
        ));
      })}
    </div>
  );
}
