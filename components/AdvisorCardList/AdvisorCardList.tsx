'use client';

import { useAdvisors } from '../../hooks/useAdvisors';
import AdvisorCard from '../AdvisorCard/AdvisorCard';
import AdvisorCardSkeleton from './AdvisorCardSkeleton';
import styles from '../AdvisorCard/AdvisorCard.module.css';

interface Props {
  pageSize?: number;
}

export default function AdvisorCardList({ pageSize = 10 }: Props) {
  const {
    advisors, loading, error,
    page, totalPages,
    setPage, retry,
  } = useAdvisors(1, pageSize);

  /* ── Error state ── */
  if (error) {
    return (
      <div className={styles.error}>
        <p>Failed to load advisors: {error}</p>
        <button className={styles.retryBtn} onClick={retry}>Retry</button>
      </div>
    );
  }

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <>
        {Array.from({ length: pageSize }, (_, i) => (
          <AdvisorCardSkeleton key={i} />
        ))}
      </>
    );
  }

  /* ── Page numbers helper ── */
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div>
      {advisors.map((advisor, i) => (
        <AdvisorCard
          key={advisor.id}
          advisor={advisor}
          index={(page - 1) * pageSize + i}   // global index drives odd/even layout
        />
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            ‹ Prev
          </button>

          {pages.map(p => (
            <button
              key={p}
              className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}

          <button
            className={styles.pageBtn}
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  );
}
