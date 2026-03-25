'use client';
import { useEffect, useState } from 'react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollUp = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <button
      className="scroll-top scroll-to-target"
      onClick={scrollUp}
      style={{ display: visible ? 'block' : 'none' }}
      aria-label="Scroll to top"
    >
      <i className="fal fa-long-arrow-up"></i>
    </button>
  );
}
