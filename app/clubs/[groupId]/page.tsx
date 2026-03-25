import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import ClubDirectoryLayout from './ClubDirectoryLayout';
import ClubPDFButton from '@/components/ClubPDFButton';
import { fetchClubFromDirectory } from '@/lib/api';

export default async function ClubDetailsPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;

  const result = await fetchClubFromDirectory(groupId).catch(() => null);

  const club      = result?.club      || null;
  const president = result?.president || null;
  const secretary = result?.secretary || null;
  const members   = result?.members   || [];

  const clubName = club?.Club_Name || 'Club';

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
              <h1 className="text-dark">{clubName}</h1>
            </div>
            <div className="btn-box">
              <Link href="/clubs" className="theme-btn btn-one dist-btn">Back</Link>
            </div>
          </div>
        </div>
      </section>

      {!club && (
        <div className="container mt-4">
          <p>Club not found.</p>
        </div>
      )}

      {club && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px 0' }}>
          <ClubPDFButton clubName={clubName} />
        </div>
      )}

      {club && (
        <div>
          <ClubDirectoryLayout
            club={club}
            president={president}
            secretary={secretary}
            members={members}
          />
        </div>
      )}

      <Footer />
      <ScrollToTop />
    </div>
  );
}
