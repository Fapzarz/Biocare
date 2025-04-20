import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../lib/utils";
import type { LucideIcon } from "lucide-react";

interface Tab {
  id: string;
  title: string;
  icon: LucideIcon;
  type?: never;
}

interface Separator {
  type: "separator";
  title?: never;
  icon?: never;
}

type TabItem = Tab | Separator;

interface ExpandableTabsProps {
  tabs: TabItem[];
  className?: string;
  activeColor?: string;
  onChange?: (id: string | null) => void;
}

const buttonVariants = {
  initial: {
    gap: 0,
    paddingLeft: ".5rem",
    paddingRight: ".5rem",
  },
  animate: (isSelected: boolean) => ({
    gap: isSelected ? ".5rem" : 0,
    paddingLeft: isSelected ? "1rem" : ".5rem",
    paddingRight: isSelected ? "1rem" : ".5rem",
  }),
};

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0 },
};

const transition = { delay: 0.1, type: "spring", bounce: 0, duration: 0.6 };

export function ExpandableTabs({
  tabs,
  className,
  activeColor = "text-rose-600",
  onChange,
}: ExpandableTabsProps) {
  const [selected, setSelected] = React.useState<string | null>(null);
  const outsideClickRef = React.useRef<HTMLDivElement>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = React.useState(false);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  // Custom handler for outside clicks
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (outsideClickRef.current && !outsideClickRef.current.contains(event.target as Node)) {
        setSelected(null);
        onChange?.(null);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onChange]);

  const handleSelect = (id: string) => {
    setSelected(id);
    onChange?.(id);
  };

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowScrollButtons(scrollWidth > clientWidth);
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  React.useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const scrollAmount = 200;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <div
      ref={outsideClickRef}
      className={cn(
        "relative flex items-center",
        className
      )}
    >
      {/* Scroll Left Button */}
      {showScrollButtons && canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 z-10 h-full px-2 bg-gradient-to-r from-slate-50/90 to-transparent dark:from-slate-900/90 flex items-center justify-center"
          aria-label="Scroll left"
        >
          <div className="h-8 w-8 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700">
            <motion.div
              initial={{ x: 2 }}
              animate={{ x: -2 }}
              transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
            >
              ‹
            </motion.div>
          </div>
        </button>
      )}

      {/* Scroll Right Button */}
      {showScrollButtons && canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 z-10 h-full px-2 bg-gradient-to-l from-slate-50/90 to-transparent dark:from-slate-900/90 flex items-center justify-center"
          aria-label="Scroll right"
        >
          <div className="h-8 w-8 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700">
            <motion.div
              initial={{ x: -2 }}
              animate={{ x: 2 }}
              transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
            >
              ›
            </motion.div>
          </div>
        </button>
      )}

      {/* Tabs Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex items-center gap-2 p-2 overflow-x-auto hide-scrollbar bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
      >
        {tabs.map((tab) => {
          if (tab.type === 'separator') {
            return null; // Skip separators in mobile view
          }

          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              variants={buttonVariants}
              initial={false}
              animate="animate"
              custom={selected === tab.id}
              onClick={() => handleSelect(tab.id)}
              transition={transition}
              className={cn(
                "relative flex items-center rounded-xl px-3 py-2.5 font-medium transition-colors duration-300 whitespace-nowrap",
                selected === tab.id
                  ? cn("bg-slate-100 dark:bg-slate-700", activeColor)
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              <AnimatePresence initial={false}>
                {selected === tab.id && (
                  <motion.span
                    variants={spanVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={transition}
                    className="overflow-hidden text-sm sm:text-base"
                  >
                    {tab.title}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}