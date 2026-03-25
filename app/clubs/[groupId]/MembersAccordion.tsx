'use client';

import { useState } from 'react';

function AccordionSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#1a3a6b',
          color: '#fff',
          border: 'none',
          borderRadius: open ? '8px 8px 0 0' : 8,
          padding: '12px 20px',
          fontWeight: 700,
          fontSize: 16,
          cursor: 'pointer',
        }}
      >
        <span>{title}</span>
        <span style={{
          display: 'inline-block',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
          fontSize: 18,
          lineHeight: 1,
        }}>▼</span>
      </button>

      {open && (
        <div style={{
          border: '1px solid #ddd',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          overflow: 'auto',
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function MembersAccordion({
  bod,
  members,
  clubName,
}: {
  bod: any[];
  members: any[];
  clubName: string;
}) {
  const thStyle: React.CSSProperties = {
    background: '#1a3a6b',
    color: '#fff',
    padding: '10px 12px',
    fontWeight: 700,
    fontSize: 13,
    textAlign: 'left',
    whiteSpace: 'nowrap',
  };

  const tdStyle = (alt: boolean): React.CSSProperties => ({
    padding: '8px 12px',
    fontSize: 13,
    verticalAlign: 'top',
    borderBottom: '1px solid #e8e8e8',
    background: alt ? '#fef9c3' : '#fff',
  });

  return (
    <>
      {/* BOD Table */}
      {bod.length > 0 && (
        <AccordionSection title="Board of Directors">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 50 }}>S.No</th>
                <th style={thStyle}>Name / ID</th>
                <th style={thStyle}>Designation</th>
                <th style={thStyle}>Address</th>
                <th style={thStyle}>Mobile / Email</th>
              </tr>
            </thead>
            <tbody>
              {bod.map((m: any, i: number) => (
                <tr key={i}>
                  <td style={{ ...tdStyle(i % 2 !== 0), textAlign: 'center' }}>{i + 1}</td>
                  <td style={tdStyle(i % 2 !== 0)}>
                    <strong>{m.Name || ''}</strong>
                    {m.rid && <div style={{ color: '#666', fontSize: 12 }}>{m.rid}</div>}
                  </td>
                  <td style={tdStyle(i % 2 !== 0)}>{m.Designation || ''}</td>
                  <td style={tdStyle(i % 2 !== 0)}>{m.address || ''}</td>
                  <td style={tdStyle(i % 2 !== 0)}>
                    {m.Mobile_number && <div>{m.Mobile_number}</div>}
                    {m.Emailid && <div style={{ color: '#555', fontSize: 12 }}>{m.Emailid}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AccordionSection>
      )}

      {/* Members Table */}
      {members.length > 0 && (
        <AccordionSection title={`Members (${members.length})`}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 50 }}>S.No</th>
                <th style={thStyle}>Name / ID / Joining</th>
                <th style={thStyle}>Classification</th>
                <th style={thStyle}>Address</th>
                <th style={thStyle}>Mobile / Email</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m: any, i: number) => (
                <tr key={i}>
                  <td style={{ ...tdStyle(i % 2 !== 0), textAlign: 'center' }}>{i + 1}</td>
                  <td style={tdStyle(i % 2 !== 0)}>
                    <strong>{m.memberName || ''}</strong>
                    {m.masterUID && <div style={{ color: '#666', fontSize: 12 }}>{m.masterUID}</div>}
                    {m.joiningDate && <div style={{ color: '#888', fontSize: 11 }}>{m.joiningDate}</div>}
                  </td>
                  <td style={tdStyle(i % 2 !== 0)}>{m.classification || m.Classification || ''}</td>
                  <td style={tdStyle(i % 2 !== 0)}>{m.address || ''}</td>
                  <td style={tdStyle(i % 2 !== 0)}>
                    {m.membermobile && <div>{m.membermobile}</div>}
                    {m.email && <div style={{ color: '#555', fontSize: 12 }}>{m.email}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AccordionSection>
      )}
    </>
  );
}
