import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import BulkCommitteePDFButton from '@/components/BulkCommitteePDFButton';
import { fetchCommitteeList } from '@/lib/api';

const COMMITTEE_COLORS = ['#009fb4', '#179448', '#b37eb5', '#ed721d'];

export default async function HomePage() {
  let withCat: any[] = [];
  try {
    const data = await fetchCommitteeList();
    withCat = data.withCat;
  } catch {
    // fail silently
  }

  return (
    <div className="boxed_wrapper">
      <Header />

      <section className="chooseus-section bg-color-1">
        <div className="auto-container">
          <div className="row justify-content-center">
            <div className="col-md-4 col-12">
              <Link href="/executive-committee" className="club-crd1">
                <div className="cat-text">Executive Committee</div>
              </Link>
            </div>
            <div className="col-md-4 col-12">
              <Link href="/clubs" className="club-crd">
                <div className="cat-text">Rotary Clubs of District 3262</div>
              </Link>
            </div>
            <div className="col-md-4 col-12">
              <Link href="/dg-directory" className="club-crd1">
                <div className="cat-text">District Governors 2026-27</div>
              </Link>
            </div>
          </div>

          <div className="d-flex justify-content-center mb-4">
            <BulkCommitteePDFButton
              committees={withCat.map((c: any) => ({
                id:   String(c.Fk_DistrictCommitteeID),
                name: c.name || '',
              }))}
            />
          </div>

          <div className="row justify-content-center align-items-center mb-5">
            {withCat.map((committee: any, index: number) => (
              <div key={committee.Fk_DistrictCommitteeID} className="col-md-4 col-12">
                <Link
                  href={`/committee/${committee.Fk_DistrictCommitteeID}?title=${encodeURIComponent(committee.name)}`}
                  className="avenu-crd"
                  style={{ backgroundColor: COMMITTEE_COLORS[index % COMMITTEE_COLORS.length] }}
                >
                  <div className="cat-text">{committee.name}</div>
                </Link>
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
