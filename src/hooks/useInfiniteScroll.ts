import { useEffect, useRef, useState } from 'react';

interface UseInfiniteScrollProps {
  loadMore: () => Promise<void>;
  hasMore: boolean;
  loading: boolean;
}

export function useInfiniteScroll({ loadMore, hasMore, loading }: UseInfiniteScrollProps) {
  const [intersecting, setIntersecting] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIntersecting(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const trigger = triggerRef.current;
    if (trigger) {
      observer.observe(trigger);
    }

    return () => {
      if (trigger) {
        observer.unobserve(trigger);
      }
    };
  }, []);

  useEffect(() => {
    if (intersecting && hasMore && !loading) {
      loadMore();
    }
  }, [intersecting, hasMore, loading, loadMore]);

  return { triggerRef };
}