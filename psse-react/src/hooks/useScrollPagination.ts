import { useState, useCallback, useMemo, useRef } from 'react';

/**
 * Hook to manage client-side scroll pagination
 */
export const useScrollPagination = <T>(items: T[], initialLimit = 10, step = 10) => {
  const [displayedCount, setDisplayedCount] = useState(initialLimit);
  const isLoadingMore = useRef(false);

  const displayedItems = useMemo(() => {
    return items.slice(0, displayedCount);
  }, [items, displayedCount]);

  const hasMore = useMemo(() => {
    return displayedCount < items.length;
  }, [displayedCount, items.length]);

  const loadMore = useCallback(() => {
    if (isLoadingMore.current) return;
    
    isLoadingMore.current = true;
    setDisplayedCount((prev) => prev + step);
    
    // Allow next load after a short delay to ensure state has updated
    setTimeout(() => {
      isLoadingMore.current = false;
    }, 200);
  }, [step]);

  const reset = useCallback(() => {
    setDisplayedCount(initialLimit);
    isLoadingMore.current = false;
  }, [initialLimit]);

  return { displayedItems, hasMore, loadMore, reset };
};
