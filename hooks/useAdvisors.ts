'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Advisor, AdvisorsResponse } from '../types/advisor';

interface UseAdvisorsResult {
  advisors:   Advisor[];
  total:      number;
  page:       number;
  pageSize:   number;
  totalPages: number;
  loading:    boolean;
  error:      string | null;
  setPage:    (p: number) => void;
  retry:      () => void;
}

export function useAdvisors(initialPage = 1, pageSize = 10): UseAdvisorsResult {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(initialPage);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [tick,     setTick]     = useState(0);

  const retry = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/advisors?page=${page}&pageSize=${pageSize}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<AdvisorsResponse>;
      })
      .then(json => {
        if (cancelled) return;
        setAdvisors(json.data);
        setTotal(json.total);
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err.message ?? 'Failed to load advisors');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [page, pageSize, tick]);

  return {
    advisors,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    loading,
    error,
    setPage,
    retry,
  };
}
