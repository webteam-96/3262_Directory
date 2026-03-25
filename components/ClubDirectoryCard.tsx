'use client';

import Image from 'next/image';

// ── Constants ────────────────────────────────────────────────────────────────
const BLUE = '#304890';
const GOLD = '#FEBD1F';
const BLUE_TINT = 'rgba(48, 72, 144, 0.18)';
const GOLD_TINT = 'rgba(254, 189, 31, 0.18)';
const DIVIDER = '#D6DAE9';

// ── Sample Data ───────────────────────────────────────────────────────────────
const clubInfo = {
  name: 'ROTARY CLUB OF BASUDEVPUR',
  clubId: '90705',
  charterDate: '15/03/1985',
  meetingDay: 'Sunday',
  meetingTime: '11:00 AM',
  venue: 'Hotel Basudevpur Palace, Main Road',
  ag: 'Rtn. Suresh Patel',
  clubAdvisor: 'Rtn. Mahesh Kumar',
  sponsorClub: 'Rotary Club of Bhubaneswar',
};

const president = {
  name: 'Rajesh Kumar Mohanty',
  id: '12290499',
  dob: '12/05',
  dow: '20/11',
  classification: 'Business Management',
  mobile: '+91 9876543210',
  email: 'rajesh.mohanty@gmail.com',
  address: 'Plot No. 45, Sector 3, Basudevpur, Odisha – 756162',
  spouse: 'Priya Mohanty',
  spouseDob: '08/03',
  photo: '/assets/images/dummy.jpg',
  spousePhoto: '/assets/images/dummy.jpg',
};

const secretary = {
  name: 'Suresh Chandra Dash',
  id: '11920654',
  dob: '25/08',
  dow: '14/02',
  classification: 'Education',
  mobile: '+91 9123456789',
  email: 'suresh.dash@gmail.com',
  address: 'House No. 12, Gandhi Nagar, Basudevpur, Odisha – 756164',
  spouse: 'Anita Dash',
  spouseDob: '30/06',
  photo: '/assets/images/dummy.jpg',
  spousePhoto: '/assets/images/dummy.jpg',
};

const members = [
  {
    name: 'Ajay Kumar Sahoo',
    rid: '11223344',
    joining: '01/07/2020',
    classification: 'Medicine',
    address: 'MG Road, Basudevpur, Odisha',
    mobile: '+91 9000000001',
    email: 'ajay.sahoo@gmail.com',
  },
  {
    name: 'Bijay Nanda Patra',
    rid: '22334455',
    joining: '01/07/2019',
    classification: 'Engineering',
    address: 'Station Road, Basudevpur',
    mobile: '+91 9000000002',
    email: 'bijay.patra@gmail.com',
  },
  {
    name: 'Chinmaya Rout',
    rid: '33445566',
    joining: '01/07/2021',
    classification: 'Legal',
    address: 'Nehru Nagar, Basudevpur, Odisha',
    mobile: '+91 9000000003',
    email: 'chinmaya.rout@gmail.com',
  },
  {
    name: 'Debasis Mishra',
    rid: '44556677',
    joining: '15/01/2022',
    classification: 'Commerce',
    address: 'Civil Lines, Basudevpur',
    mobile: '+91 9000000004',
    email: 'debasis.mishra@gmail.com',
  },
  {
    name: 'Fakir Mohan Senapati',
    rid: '55667788',
    joining: '01/07/2023',
    classification: 'Agriculture',
    address: 'Sadar Bazar, Basudevpur, Odisha',
    mobile: '+91 9000000005',
    email: 'fakir.senapati@gmail.com',
  },
];

// ── Dot Accent Cluster ────────────────────────────────────────────────────────
function DotCluster({ corner }: { corner: 'tl' | 'br' }) {
  const pos = corner === 'tl'
    ? { top: 0, left: 0 }
    : { bottom: 0, right: 0 };

  return (
    <div style={{ position: 'absolute', ...pos, zIndex: 10 }}>
      {/* Row 1: two gold dots */}
      <div style={{ display: 'flex', gap: 3, marginBottom: 3 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD }} />
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD }} />
      </div>
      {/* Row 2: one blue dot (L-shape) */}
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: BLUE }} />
    </div>
  );
}

// ── Overlapping Photo Cluster ─────────────────────────────────────────────────
function PhotoCluster({
  memberPhoto,
  spousePhoto,
}: {
  memberPhoto: string;
  spousePhoto: string;
}) {
  return (
    <div
      style={{
        position: 'relative',
        width: 90,
        height: 88,
        flexShrink: 0,
      }}
    >
      <DotCluster corner="tl" />

      {/* Member photo — behind, offset down */}
      <Image
        src={memberPhoto}
        alt="Member"
        width={58}
        height={72}
        unoptimized
        style={{
          position: 'absolute',
          left: 0,
          top: 8,
          objectFit: 'cover',
          border: `2px solid ${GOLD}`,
          borderRadius: 4,
        }}
      />

      {/* Spouse photo — in front, overlapping */}
      <Image
        src={spousePhoto}
        alt="Spouse"
        width={58}
        height={72}
        unoptimized
        style={{
          position: 'absolute',
          left: 26,
          top: 0,
          objectFit: 'cover',
          border: `2px solid ${BLUE}`,
          borderRadius: 4,
        }}
      />

      <DotCluster corner="br" />
    </div>
  );
}

// ── Official Card (President / Secretary) ────────────────────────────────────
function OfficialCard({
  title,
  person,
  photoOnLeft,
}: {
  title: string;
  person: typeof president;
  photoOnLeft: boolean;
}) {
  return (
    <div
      style={{
        border: `1px solid ${DIVIDER}`,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 16,
      }}
    >
      {/* Title bar */}
      <div
        style={{
          background: BLUE,
          color: '#fff',
          padding: '8px 16px',
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: 0.4,
        }}
      >
        {title}
      </div>

      {/* Body */}
      <div
        style={{
          display: 'flex',
          flexDirection: photoOnLeft ? 'row' : 'row-reverse',
          alignItems: 'flex-start',
          gap: 0,
        }}
      >
        {/* Gold-tint photo band */}
        <div
          style={{
            background: GOLD_TINT,
            padding: '16px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'stretch',
          }}
        >
          <PhotoCluster memberPhoto={person.photo} spousePhoto={person.spousePhoto} />
        </div>

        {/* Details */}
        <div style={{ flex: 1, padding: '14px 16px', fontSize: 13 }}>
          <div
            style={{
              fontWeight: 700,
              color: BLUE,
              fontSize: 15,
              marginBottom: 10,
            }}
          >
            {title}: {person.name}
          </div>

          <div style={{ display: 'flex', gap: 0 }}>
            {/* Left half */}
            <div style={{ flex: 1, paddingRight: 12 }}>
              <div style={{ marginBottom: 3 }}>
                <strong>ID:</strong> {person.id}
              </div>
              <div style={{ marginBottom: 3 }}>
                <strong>DOB:</strong> {person.dob}
              </div>
              <div style={{ marginBottom: 3 }}>
                <strong>DOW:</strong> {person.dow}
              </div>
              <div style={{ marginBottom: 3 }}>
                <strong>CI:</strong> {person.classification}
              </div>
              <div style={{ marginBottom: 3 }}>
                <strong>Mobile:</strong> {person.mobile}
              </div>
              <div style={{ wordBreak: 'break-all' }}>
                <strong>Email:</strong> {person.email}
              </div>
            </div>

            {/* Vertical divider */}
            <div
              style={{
                width: 1,
                background: DIVIDER,
                alignSelf: 'stretch',
                flexShrink: 0,
              }}
            />

            {/* Right half */}
            <div style={{ flex: 1, paddingLeft: 12 }}>
              <div style={{ marginBottom: 8 }}>
                <strong>Address:</strong>
                <div style={{ color: '#444', marginTop: 2 }}>{person.address}</div>
              </div>
              {person.spouse && (
                <div>
                  <strong>Spouse:</strong> {person.spouse}
                  {person.spouseDob && (
                    <div style={{ color: '#555', fontSize: 12 }}>
                      DOB: {person.spouseDob}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ClubDirectoryCard() {
  const thBase: React.CSSProperties = {
    background: BLUE,
    color: '#fff',
    padding: '10px 12px',
    border: 'none',
    textAlign: 'left',
    fontSize: 13,
    fontWeight: 700,
    margin: 0,
  };

  return (
    <div
      className="max-w-2xl mx-auto"
      style={{
        background: '#fff',
        borderRadius: 10,
        boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* ── Section 1: Club Header ── */}
      <div
        style={{
          background: BLUE,
          padding: '16px 20px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            color: '#fff',
            fontWeight: 800,
            fontSize: 20,
            margin: 0,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
          }}
        >
          {clubInfo.name}
        </h2>
      </div>

      {/* Info bar */}
      <div
        style={{
          background: '#f0f3fa',
          padding: '12px 20px',
          borderBottom: `3px solid ${GOLD}`,
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
          {/* Left column */}
          <div style={{ flex: '1 1 60%', fontSize: 13 }}>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '3px 8px 3px 0', border: 'none' }}>
                    <strong>Club ID:</strong> {clubInfo.clubId}
                  </td>
                  <td style={{ padding: '3px 8px', border: 'none' }}>
                    <strong>Charter Date:</strong> {clubInfo.charterDate}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 8px 3px 0', border: 'none' }} colSpan={2}>
                    <strong>Meeting Day, Time:</strong> {clubInfo.meetingDay}, {clubInfo.meetingTime}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 8px 3px 0', border: 'none' }} colSpan={2}>
                    <strong>Venue:</strong> {clubInfo.venue}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Divider */}
          <div
            style={{
              width: 1,
              background: DIVIDER,
              margin: '4px 12px',
              alignSelf: 'stretch',
              flexShrink: 0,
            }}
          />

          {/* Right column */}
          <div style={{ flex: '1 1 30%', fontSize: 13 }}>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '3px 8px', border: 'none' }}>
                    <strong>AG:</strong> {clubInfo.ag}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 8px', border: 'none' }}>
                    <strong>Club Advisor:</strong> {clubInfo.clubAdvisor}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 8px', border: 'none' }}>
                    <strong>Sponsor Club:</strong> {clubInfo.sponsorClub}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Section 2: Officials ── */}
      <div style={{ padding: '16px 20px 0' }}>
        <OfficialCard title="President" person={president} photoOnLeft={true} />
        <OfficialCard title="Secretary" person={secretary} photoOnLeft={false} />
      </div>

      {/* ── Section 3: Member Table ── */}
      <div style={{ padding: '0 20px 24px' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            borderSpacing: 0,
            tableLayout: 'fixed',
          }}
          cellSpacing={0}
          cellPadding={0}
        >
          <thead>
            <tr>
              <th style={{ ...thBase, width: 44, borderRadius: '8px 0 0 0' }}>
                S.No
              </th>
              <th style={{ ...thBase, width: '26%' }}>Name / ID / Joining</th>
              <th style={{ ...thBase, width: '16%' }}>Classification</th>
              <th style={{ ...thBase }}>Address</th>
              <th style={{ ...thBase, borderRadius: '0 8px 0 0' }}>Mobile / Email</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => {
              const bg = i % 2 === 0 ? GOLD_TINT : BLUE_TINT;
              const td: React.CSSProperties = {
                padding: '8px 12px',
                border: 'none',
                fontSize: 13,
                background: bg,
                verticalAlign: 'top',
                margin: 0,
              };
              return (
                <tr key={i}>
                  <td style={{ ...td, textAlign: 'center', fontWeight: 600 }}>
                    {i + 1}
                  </td>
                  <td style={td}>
                    <strong>{m.name}</strong>
                    <div style={{ color: '#555', fontSize: 12 }}>{m.rid}</div>
                    <div style={{ color: '#888', fontSize: 11 }}>{m.joining}</div>
                  </td>
                  <td style={td}>{m.classification}</td>
                  <td style={td}>{m.address}</td>
                  <td style={td}>
                    <div>{m.mobile}</div>
                    <div style={{ color: '#555', fontSize: 12, wordBreak: 'break-all' }}>
                      {m.email}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
