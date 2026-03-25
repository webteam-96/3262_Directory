import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import ClubsList from './ClubsList';
import BulkDownloadButton from '@/components/BulkDownloadButton';
import { fetchClubsDirectory } from '@/lib/api';

export default async function ClubsPage() {
  let clubs: any[] = [];
  try {
    clubs = await fetchClubsDirectory();
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
              <h1 className="text-dark">Rotary Clubs of District 3262</h1>
            </div>
            <div className="btn-box">
              <Link href="/" className="theme-btn btn-one dist-btn">Back</Link>
            </div>
          </div>
        </div>
      </section>

      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px 0' }}>
        <BulkDownloadButton clubs={clubs} />
      </div>

      <ClubsList initialClubs={clubs} />

      <Footer />
      <ScrollToTop />
    </div>
  );
}
