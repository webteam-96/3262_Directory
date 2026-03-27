import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MemberCard from '@/components/MemberCard';
import ScrollToTop from '@/components/ScrollToTop';
import CommitteePDFButton from './CommitteePDFButton';
import { fetchCommitteeDetails } from '@/lib/api';

const DESIGNATION_MAP: Record<string, string> = {
  ZAC: 'Zonal Avenue Chair',
  GAH: 'Group Avenue Head',
  ZCC: 'Zonal Co-Chair',
  ZDC: 'Zonal District Chair',
};

function formatDayMonth(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const parts = dateStr.trim().split('/');
  if (parts.length < 2) return '';
  return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}`;
}

function resolveDesignation(raw: string): string {
  const key = (raw || '').substring(0, 3);
  return DESIGNATION_MAP[key] ? `${DESIGNATION_MAP[key]} (${key})` : raw;
}

export default async function CommitteeDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ committeeId: string }>;
  searchParams: Promise<{ title?: string }>;
}) {
  const { committeeId } = await params;
  const { title }       = await searchParams;
  const pageTitle       = title || 'District Committee Members';
  const pdfFilename     = `${pageTitle.replace(/\s+/g, '-').toLowerCase()}-2025-26.pdf`;

  let records: any[] = [];
  try {
    const raw = await fetchCommitteeDetails(committeeId);
records = [...raw].sort((a: any, b: any) =>
      (a.ClubName || '').toLowerCase().localeCompare((b.ClubName || '').toLowerCase())
    );
  } catch {
    // fail silently
  }

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
              <h1 style={{ fontSize: 40, lineHeight: '62px', color: '#000', fontWeight: 500, textAlign: 'left' }}>
                {pageTitle}
              </h1>
            </div>
            <div className="btn-box d-flex gap-2 flex-wrap justify-content-center">
              <Link href="/" className="theme-btn btn-one dist-btn">Back</Link>
              <CommitteePDFButton title={pageTitle} filename={pdfFilename} />
            </div>
          </div>
        </div>
      </section>

      <section className="about-style-three" style={{ background: '#ffffff' }}>
        <div className="auto-container" id="committee-canvas">
          {records.length === 0 && <p className="text-center">No members found.</p>}
          {records.map((record: any, index: number) => (
            <MemberCard
              key={index}
                index={index}
                designation={resolveDesignation(record.DistrictDesignation || '')}
                name={record.name           || ''}
                club={record.ClubName       || ''}
                classification={record.Keywords?.trim() || ''}
                mobile={record.MobileNumber   || ''}
                blood={record.Bloodgrp        || ''}
                email={record.MailID          || ''}
                address={record.Address?.trim() || ''}
                dob={formatDayMonth(record.DOB)}
                dow={formatDayMonth(record.DOA || record.DOW)}
                rid={record.RotaryID?.trim()  || ''}
                img={record.img               || ''}
                spouseName={record.Spouse_name || record.SpouseName || ''}
                spouseImg={record.SpousePhoto ? `https://rotaryindia.org/Documents/directory/${record.SpousePhoto}` : ''}
              />
          ))}
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
