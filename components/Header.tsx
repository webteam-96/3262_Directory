'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <>
      <header className="main-header header-style-one">
        <div className="header-lower">
          <div className="d-flex justify-content-between align-items-center">
            <div className="logo-box">
              <figure className="logo">
                <Link href="/"><Image src="/assets/images/logo1.png" alt="Logo" width={150} height={60} unoptimized /></Link>
              </figure>
            </div>
            <div className="menu-area d-flex align-items-center">
              <div className="mobile-nav-toggler">
                <i className="icon-bar"></i>
                <i className="icon-bar"></i>
                <i className="icon-bar"></i>
              </div>
              <nav className="main-menu navbar-expand-md navbar-light">
                <div className="collapse navbar-collapse show clearfix" id="navbarSupportedContent">
                  <ul className="navigation clearfix">
                    <li className="current"><Link href="/">DIGITAL DIRECTORY</Link></li>
                  </ul>
                </div>
              </nav>
            </div>
          </div>
        </div>

        <div className="sticky-header">
          <div className="d-flex justify-content-between align-items-center">
            <div className="logo-box">
              <figure className="logo">
                <Link href="/"><Image src="/assets/images/logo1.png" alt="Logo" width={150} height={60} unoptimized /></Link>
              </figure>
            </div>
            <div className="menu-area">
              <nav className="main-menu clearfix"></nav>
            </div>
          </div>
        </div>
      </header>

      <div className="mobile-menu">
        <div className="menu-backdrop"></div>
        <div className="close-btn"><i className="fas fa-times"></i></div>
        <nav className="menu-box">
          <div className="nav-logo">
            <a href="https://3020.rotaryindia.org/" target="_blank" rel="noreferrer">
              <Image src="/assets/images/logo-2.png" alt="" width={120} height={50} unoptimized />
            </a>
          </div>
          <div className="menu-outer"></div>
        </nav>
      </div>
    </>
  );
}
