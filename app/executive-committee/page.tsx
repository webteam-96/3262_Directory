import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MemberCard from '@/components/MemberCard';
import ScrollToTop from '@/components/ScrollToTop';
import DownloadPDFButton, { type MemberForPDF } from '@/components/DownloadPDFButton';
import { fetchCommitteeList } from '@/lib/api';

const HEADER_COLORS = ['#f97316', '#2563eb', '#16a34a', '#FAA61F'];
const BODY_COLORS   = ['#FFCD9E', '#dbeafe', '#d1fae5', '#fef9c3'];

export default async function ExecutiveCommitteePage() {
  let members: any[] = [];
  try {
    const data = await fetchCommitteeList();
    const raw  = data.withoutCat;
    const seen = new Set<string>();
    members = raw.filter((m: any) => {
      const key = (m.DistrictDesignation || '').toUpperCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch {
    // fail silently
  }

  // build serialisable list for the PDF button (client component)
  const pdfMembers: MemberForPDF[] = members.map((m: any, i: number) => ({
    designation   : m.DistrictDesignation || 'Member',
    name          : m.name          || '',
    club          : m.ClubName      || '',
    classification: m.classification || '',
    mobile        : m.MobileNumber  || '',
    blood         : m.Bloodgrp      || '',
    email         : m.MailID        || '',
    address       : m.Address       || '',
    dob           : m.DOB           || '',
    rid           : m.RotaryID      || '',
    img           : m.img           || '',
    headerColor   : HEADER_COLORS[i % 4],
    bodyColor     : BODY_COLORS[i % 4],
  }));

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
              <h1 className="text-dark">Executive Committee</h1>
            </div>
            <div className="btn-box d-flex gap-2 flex-wrap justify-content-center">
              <Link href="/" className="theme-btn btn-one dist-btn">Back</Link>
              <DownloadPDFButton
                members={pdfMembers}
                title="Executive Committee"
                filename="executive-committee-2025-26.pdf"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="auto-container">
          <div className="row clearfix align-items-start justify-content-center">
            {members.length === 0 && <p>No members found.</p>}
            {members.map((member: any, index: number) => (
              <div key={index} className="col-xxl-6 col-xl-6 col-md-6 col-12">
                <MemberCard
                  designation={member.DistrictDesignation || 'Member'}
                  name={member.name          || ''}
                  club={member.ClubName      || ''}
                  classification={member.classification || ''}
                  mobile={member.MobileNumber  || ''}
                  blood={member.Bloodgrp      || ''}
                  email={member.MailID        || ''}
                  address={member.Address       || ''}
                  dob={member.DOB           || ''}
                  rid={member.RotaryID      || ''}
                  img={member.img}
                  headerColor={HEADER_COLORS[index % 4]}
                  bodyColor={BODY_COLORS[index % 4]}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
