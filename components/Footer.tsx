import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="auto-container">
        <div className="footer-top">
          <div className="top-inner">
            <figure className="footer-logo">
              <a href="https://3020.rotaryindia.org/" target="_blank" rel="noreferrer">
                <Image src="/assets/images/footer-logo.png" alt="" width={120} height={60} unoptimized />
              </a>
            </figure>
            <figure className="footer-logo">
              <a href="https://3020.rotaryindia.org/" target="_blank" rel="noreferrer">
                <Image src="/assets/images/rllogo.png" alt="" width={120} height={60} unoptimized />
              </a>
            </figure>
            <figure className="footer-logo">
              <a href="https://kaizeninfotech.com/" target="_blank" rel="noreferrer">
                <Image src="/assets/images/kaizenlogo.png" alt="" width={120} height={60} unoptimized />
              </a>
            </figure>
          </div>
        </div>
      </div>
      <div className="footer-bottom centred">
        <div className="auto-container">
          <div className="copyright">
            <p>&copy; 2025 Developed and maintained by{' '}
              <a href="https://kaizeninfotech.com/" target="_blank" rel="noreferrer">Kaizen Infotech Solutions Pvt. Ltd.</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
