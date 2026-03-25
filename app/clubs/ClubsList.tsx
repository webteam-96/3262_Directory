'use client';

import { useState } from 'react';
import Link from 'next/link';

function cleanText(text: any): string {
  if (!text || typeof text !== 'string') return '';
  return text.trim().replace(/\s+/g, ' ');
}

interface ClubsListProps {
  initialClubs: any[];
}

export default function ClubsList({ initialClubs }: ClubsListProps) {
  const [query, setQuery] = useState('');
  const [clubs, setClubs] = useState(initialClubs);

  const handleSearch = () => {
    const q = query.toLowerCase().trim();
    if (!q) {
      setClubs(initialClubs);
      return;
    }
    const filtered = initialClubs.filter((club) =>
      (club.Club_Name || '').toLowerCase().includes(q) ||
      (club.Club_id || '').toLowerCase().includes(q) ||
      (club.AG_name || '').toLowerCase().includes(q)
    );
    setClubs(filtered);
  };

  return (
    <section className="py-4">
      {/* Search */}
      <div className="container mb-4">
        <div className="row justify-content-end">
          <div className="col-lg-6 col-md-8 col-12">
            <div
              className="d-flex align-items-center shadow-sm"
              style={{
                background: '#fff',
                borderRadius: 50,
                padding: '5px 10px',
                border: '1px solid #ddd',
              }}
            >
              <i className="fas fa-search" style={{ color: '#666', margin: '0 10px', fontSize: 18 }}></i>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by club name..."
                className="form-control border-0 shadow-none"
              />
              <button
                onClick={handleSearch}
                className="btn btn-primary"
                style={{ borderRadius: 50, padding: '8px 20px', background: '#0F6EB7', border: 'none' }}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Club Cards Grid */}
      <div className="auto-container">
        <div className="row g-4">
          {clubs.map((club: any, idx: number) => {
            const name = cleanText(club.Club_Name);
            const clubId = cleanText(club.Club_id);
            const href = club.grpID ? `/clubs/${club.grpID}` : null;

            const card = (
              <div
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  border: '2px solid #0F6EB7',
                  boxShadow: '0 4px 12px rgba(15,110,183,0.12)',
                  padding: '28px 20px',
                  textAlign: 'center',
                  cursor: href ? 'pointer' : 'default',
                  minHeight: 120,
                  display: 'flex',
                  flexDirection: 'column' as const,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  height: '100%',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: '#e8f4fd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <i className="fas fa-users" style={{ color: '#0F6EB7', fontSize: 18 }}></i>
                </div>
                <h5
                  style={{
                    color: '#0F6EB7',
                    fontWeight: 700,
                    fontSize: 15,
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  {name}
                </h5>
                <span style={{ fontSize: 12, color: '#888' }}>
                  Club ID: {clubId}
                </span>
              </div>
            );

            return (
              <div key={idx} className="col-xl-3 col-lg-4 col-md-6 col-12">
                {href ? (
                  <Link href={href} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                    {card}
                  </Link>
                ) : card}
              </div>
            );
          })}

          {clubs.length === 0 && (
            <div className="col-12 text-center py-5">
              <p style={{ color: '#888', fontSize: 16 }}>No clubs found.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
