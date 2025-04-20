import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScrollMenuProps {
  items: { id: string; label: string }[];
  activeId: string;
  onChange: (id: string) => void;
}

export function ScrollMenu({ items, activeId, onChange }: ScrollMenuProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftScroll(scrollLeft > 0);
    setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const handleScroll = () => {
    checkScroll();
  };

  return (
    <div className="relative group">
      {/* Left Scroll Button */}
      {showLeftScroll && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 flex items-center justify-center bg-white dark:bg-slate-700 shadow-md rounded-full border border-slate-200 dark:border-slate-600 touch-feedback md:opacity-0 md:group-hover:opacity-100 transition-opacity"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        </button>
      )}

      {/* Right Scroll Button */}
      {showRightScroll && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 flex items-center justify-center bg-white dark:bg-slate-700 shadow-md rounded-full border border-slate-200 dark:border-slate-600 touch-feedback md:opacity-0 md:group-hover:opacity-100 transition-opacity"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        </button>
      )}

      {/* Scroll Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-x-auto scrollbar-hide smooth-scroll relative"
        role="tablist"
      >
        <div className="flex space-x-2 px-4 py-2 min-w-max">
          {items.map((item) => (
            <button
              key={item.id}
              role="tab"
              aria-selected={activeId === item.id}
              onClick={() => onChange(item.id)}
              className={`
                py-2 px-4 rounded-full whitespace-nowrap text-sm font-medium
                transition-all duration-200 touch-feedback min-h-[44px]
                ${activeId === item.id
                  ? 'bg-rose-600 dark:bg-rose-500 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                }
              `}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scroll Indicators */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-slate-100 dark:bg-slate-700">
        <div
          className="h-full bg-rose-600 dark:bg-rose-500 transition-all duration-300"
          style={{
            width: scrollRef.current
              ? `${(scrollRef.current.scrollLeft / (scrollRef.current.scrollWidth - scrollRef.current.clientWidth)) * 100}%`
              : '0%',
            transform: `translateX(${scrollRef.current?.scrollLeft || 0}px)`,
          }}
        />
      </div>
    </div>
  );
}