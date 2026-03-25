import Image from 'next/image';
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

      <section className="page-title centred pd-100">
        <div
          className="bg-layer"
          style={{ backgroundImage: 'url(/assets/images/banner/banner-4.jpg)' }}
        ></div>
        <div className="auto-container">
          <div className="content-box justify-content-center pd-26 mb-3">
            <div className="title">
              <h1>DIGITAL DIRECTORY 2025-26</h1>
            </div>
          </div>

          <div className="content-box p-3 justify-content-center">
            <div className="row align-items-center">
              <div className="col-md-4 col-12">
                <div className="team-block-one">
                  <div className="inner-box">
                    <div className="image-box">
                      <figure className="image">
                        <Image
                          src="/assets/images/president.jpg"
                          alt="RI President"
                          width={200}
                          height={250}
                          style={{ objectFit: 'cover' }}
                          unoptimized
                        />
                      </figure>
                    </div>
                    <div className="lower-content">
                      <h3>Francesco Arezzo</h3>
                      <span className="designation">Rotary International President 2025-26</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4 col-12">
                <div className="row">
                  <div className="col-md-6 col-12">
                    <figure className="image">
                      <Image src="/assets/images/ri-logo.png" alt="RI Logo" width={120} height={80} unoptimized />
                    </figure>
                  </div>
                  <div className="col-md-6 col-12">
                    <figure className="image">
                      <Image src="/assets/images/dist-logo.png" alt="District Logo" width={120} height={80} unoptimized />
                    </figure>
                  </div>
                </div>
                <hr />
                <div className="row align-items-center">
                  <div className="col-md-6 col-12">
                    <figure className="image">
                      <Image src="/assets/images/unite-forgood.png" alt="Unite For Good" width={120} height={80} className="main-logo" unoptimized />
                    </figure>
                  </div>
                  <div className="col-md-6 col-12">
                    <figure className="image">
                      <Image src="/assets/images/3020logo.png" alt="3020 Logo" width={120} height={80} className="main-logo" unoptimized />
                    </figure>
                  </div>
                </div>
              </div>

              <div className="col-md-4 col-12">
                <div className="team-block-one">
                  <div className="inner-box">
                    <div className="image-box">
                      <figure className="image">
                        <Image
                          src="/assets/images/dg-pic.jpg"
                          alt="District Governor"
                          width={200}
                          height={250}
                          style={{ objectFit: 'cover' }}
                          unoptimized
                        />
                      </figure>
                    </div>
                    <div className="lower-content">
                      <h3>Yeluri Kalyan Chakravarthy</h3>
                      <span className="designation">District Governor 2025-26</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
