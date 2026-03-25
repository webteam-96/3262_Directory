'use client';

import type { Advisor } from '../../types/advisor';
import GoldDots from './GoldDots';
import NavyDots from './NavyDots';
import styles from './AdvisorCard.module.css';

interface Props {
  advisor: Advisor;
  index:   number;          // 0-based; 0,2,4… = ODD layout; 1,3,5… = EVEN layout
}

const FALLBACK = '/blank-profile.webp';

function Photo({ src, left, alt }: { src: string; left: number; alt: string }) {
  const isBlank = !src || src.includes('profile_pic') || src.includes('photoplaceholder') || src.includes('dummy');
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={isBlank ? FALLBACK : src}
      alt={alt}
      className={styles.photo}
      style={{ left }}
      onError={e => { (e.currentTarget as HTMLImageElement).src = FALLBACK; }}
    />
  );
}

export default function AdvisorCard({ advisor, index }: Props) {
  const isOdd = index % 2 === 0; // spec: index % 2 === 0 → ODD layout

  if (isOdd) {
    /* ───────────── ODD card (photos LEFT, name RIGHT) ───────────── */
    return (
      <div className={styles.card}>

        {/* Top decoration – pills from LEFT edge */}
        <div className={styles.pill} style={{ left: 0, top: 12, width: 200, border: '3px solid #FEBD1F', borderRadius: '0 20px 20px 0' }} />
        <div className={styles.pill} style={{ left: 0, top: 20, width: 279, background: '#304890', borderRadius: '0 20px 20px 0' }} />

        {/* Gold dots at right tip of navy pill */}
        <GoldDots style={{ position: 'absolute', left: 234, top: 17 }} />

        {/* Advisor name */}
        <div className={styles.name} style={{ left: 291 }}>
          Advisor: {advisor.name}
        </div>

        {/* Photos */}
        <Photo src={advisor.photo1Url} left={8}  alt={advisor.name} />
        <Photo src={advisor.photo2Url} left={92} alt={`${advisor.name} spouse`} />

        {/* Info – left column */}
        <div className={styles.info} style={{ left: 176, top: 38 }}>ID: {advisor.id}</div>
        <div className={styles.info} style={{ left: 256, top: 38 }}>DOB: {advisor.dob}</div>
        <div className={styles.info} style={{ left: 176, top: 60 }}>DOW: {advisor.dow}</div>
        <div className={styles.info} style={{ left: 176, top: 82 }}>Cl: {advisor.classification}</div>
        <div className={styles.info} style={{ left: 176, top: 104 }}>Mobile: {advisor.mobile}</div>
        <div className={styles.info} style={{ left: 176, top: 126 }}>Email: {advisor.email}</div>

        {/* Vertical divider */}
        <div className={styles.divider} style={{ left: 379 }} />

        {/* Info – right column */}
        <div className={styles.info} style={{ left: 385, top: 38,  width: 169, lineHeight: '18px' }}>Add: {advisor.address}</div>
        <div className={styles.info} style={{ left: 385, top: 104, width: 209 }}>H.Club: {advisor.hclub}</div>
        <div className={styles.info} style={{ left: 385, top: 126, width: 213 }}>Spouse: {advisor.spouse}</div>

        {/* Bottom decoration – pills from RIGHT edge (left-rounded) */}
        <div className={styles.pill} style={{ left: 189, top: 140, width: 406, background: '#FEBD1F', borderRadius: '20px 0 0 20px' }} />
        <div className={styles.pill} style={{ left: 304, top: 148, width: 291, border: '3px solid #304890', borderRadius: '20px 0 0 20px' }} />

        {/* Navy dots at left tip of yellow pill */}
        <NavyDots style={{ position: 'absolute', left: 162, top: 137 }} />
      </div>
    );
  }

  /* ───────────── EVEN card (photos RIGHT, name LEFT) ───────────── */
  return (
    <div className={styles.card}>

      {/* Top decoration – pills from RIGHT edge (left-rounded) */}
      <div className={styles.pill} style={{ left: 395, top: 12, width: 200, border: '3px solid #FEBD1F', borderRadius: '20px 0 0 20px' }} />
      <div className={styles.pill} style={{ left: 316, top: 20, width: 279, background: '#304890', borderRadius: '20px 0 0 20px' }} />

      {/* Gold dots flipped toward left pill tip */}
      <GoldDots style={{ position: 'absolute', left: 290, top: 17, transform: 'scaleX(-1)' }} />

      {/* Advisor name */}
      <div className={styles.name} style={{ left: 10 }}>
        Advisor: {advisor.name}
      </div>

      {/* Photos – right side */}
      <Photo src={advisor.photo1Url} left={423} alt={advisor.name} />
      <Photo src={advisor.photo2Url} left={507} alt={`${advisor.name} spouse`} />

      {/* Info – left column starts x=0 */}
      <div className={styles.info} style={{ left: 0,  top: 38 }}>ID: {advisor.id}</div>
      <div className={styles.info} style={{ left: 80, top: 38 }}>DOB: {advisor.dob}</div>
      <div className={styles.info} style={{ left: 0,  top: 60 }}>DOW: {advisor.dow}</div>
      <div className={styles.info} style={{ left: 0,  top: 82 }}>Cl: {advisor.classification}</div>
      <div className={styles.info} style={{ left: 0,  top: 104 }}>Mobile: {advisor.mobile}</div>
      <div className={styles.info} style={{ left: 0,  top: 126 }}>Email: {advisor.email}</div>

      {/* Vertical divider */}
      <div className={styles.divider} style={{ left: 203 }} />

      {/* Info – right column starts x=209 */}
      <div className={styles.info} style={{ left: 209, top: 38,  width: 169, lineHeight: '18px' }}>Add: {advisor.address}</div>
      <div className={styles.info} style={{ left: 209, top: 104, width: 209 }}>H.Club: {advisor.hclub}</div>
      <div className={styles.info} style={{ left: 209, top: 126, width: 213 }}>Spouse: {advisor.spouse}</div>

      {/* Bottom decoration – pills from LEFT edge (right-rounded) */}
      <div className={styles.pill} style={{ left: 0, top: 140, width: 406, background: '#FEBD1F', borderRadius: '0 20px 20px 0' }} />
      <div className={styles.pill} style={{ left: 0, top: 148, width: 291, border: '3px solid #304890', borderRadius: '0 20px 20px 0' }} />

      {/* Navy dots flipped toward right tip */}
      <NavyDots style={{ position: 'absolute', left: 358, top: 137, transform: 'scaleX(-1)' }} />
    </div>
  );
}
