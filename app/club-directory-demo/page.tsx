import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import ClubDirectoryCard from '@/components/ClubDirectoryCard';

export default function ClubDirectoryDemoPage() {
  return (
    <div className="boxed_wrapper">
      <Header />
      <div style={{ background: '#eef1f8', padding: '40px 16px', minHeight: '80vh' }}>
        <ClubDirectoryCard />
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
