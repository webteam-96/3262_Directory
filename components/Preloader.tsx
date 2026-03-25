'use client';
import { useState, useEffect } from 'react';

export default function Preloader() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hide = () => {
      const el = document.querySelector('.preloader') as HTMLElement | null;
      if (!el) return;
      el.style.opacity = '0';
      setTimeout(() => { el.style.display = 'none'; }, 500);
    };
    if (document.readyState === 'complete') {
      hide();
    } else {
      window.addEventListener('load', hide);
      return () => window.removeEventListener('load', hide);
    }
  }, []);

  if (!mounted) return null;

  return (
    <div className="preloader">
      <div className="boxes">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="box">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        ))}
      </div>
    </div>
  );
}
