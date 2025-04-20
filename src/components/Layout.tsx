import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  LogOut, 
  Book,
  FileText,
  Shield,
  History,
  Compass,
  Activity,
  LayoutGrid,
  Database,
  UserCheck,
  BarChart2,
  ChevronRight,
  ChevronLeft,
  Home,
  User,
  Menu as MenuIcon
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { LoadingSpinner } from './LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { ExpandableTabs } from './ExpandableTabs';

interface LayoutProps {
  children: React.ReactNode;
  user: { isAdmin: boolean; username: string; isDoctor?: boolean } | null;
  onLogout?: () => void;
  onSearch?: (query: string) => void;
  onProfileClick?: () => void;
  onNavigate?: (view: string) => void;
}

export function Layout({ 
  children, 
  user, 
  onLogout, 
  onProfileClick,
  onNavigate 
}: LayoutProps) {
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isTabsVisible, setIsTabsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState('home');
  const [isHovering, setIsHovering] = useState(false);
  const [sidebarTopOffset, setSidebarTopOffset] = useState(64);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout>();
  const navigationTimeoutRef = React.useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const headerHeight = 64;
      
      const newTopOffset = Math.max(0, headerHeight - currentScrollY);
      setSidebarTopOffset(newTopOffset);
      
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsNavVisible(true);
      } else if (currentScrollY > 100 && currentScrollY > lastScrollY) {
        setIsNavVisible(false);
      }

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsTabsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsTabsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovering(true);
    setIsSidebarOpen(true);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovering(false);
      setIsSidebarOpen(false);
    }, 150); // Reduced from 300ms to 150ms for faster response
  };

  const menuItems = [
    { id: 'home', title: 'Home', icon: Home },  // Home tab first
    { id: 'profile', title: 'Profile', icon: User },  // Profile tab second
    { id: 'api', title: 'API Docs', icon: FileText },
    { id: 'privacy', title: 'Privacy', icon: Shield },
    { id: 'terms', title: 'Terms', icon: Book },
    { type: 'separator' as const, id: 'separator-1' },
    { id: 'changelog', title: 'Updates', icon: History },
    { id: 'roadmap', title: 'Roadmap', icon: Compass },
    { id: 'status', title: 'Status', icon: Activity },
    { id: 'support', title: 'Help', icon: FileText },
    { type: 'separator' as const, id: 'separator-2' },
    { id: 'admin', title: 'Admin Dashboard', icon: LayoutGrid, adminOnly: true },
    { id: 'doctor', title: 'Doctor Dashboard', icon: UserCheck, doctorOnly: true }
  ];

  const getFilteredMenuItems = () => {
    if (!user) return [];

    return menuItems.filter(item => {
      // Skip items that don't match user role
      if (item.adminOnly && !user.isAdmin) return false;
      if (item.doctorOnly && !user.isDoctor) return false;
      return true;
    });
  };

  const handleNavigate = (id: string, e?: React.MouseEvent) => {
    // Prevent event bubbling
    e?.preventDefault();
    e?.stopPropagation();

    // Clear any existing navigation timeout
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    // Handle navigation based on the ID
    if (id === 'profile' && onProfileClick) {
      onProfileClick();
    } else if (onNavigate) {
      // Use a small timeout to ensure event propagation is fully stopped
      navigationTimeoutRef.current = setTimeout(() => {
        onNavigate(id);
      }, 10);
    }
    
    setCurrentSection(id);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        isNavVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto">
            <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-3 flex-shrink-0">
                <Heart className="h-8 w-8 text-rose-600 dark:text-rose-500" />
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 text-transparent bg-clip-text">
                    BioCare
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                    Healthcare Management
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      {user && (
        <>
          {/* Hover detection area */}
          <div 
            className="fixed left-0 z-50 hidden md:flex items-center h-screen"
            style={{ top: `${sidebarTopOffset}px` }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className={`
              flex items-center justify-center w-6 h-12 
              bg-white dark:bg-slate-800 
              border border-l-0 border-slate-200 dark:border-slate-700
              rounded-r-lg shadow-sm
              transition-all duration-150
              ${isSidebarOpen ? 'opacity-0' : 'opacity-100'}
            `}>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>
          </div>

          <motion.div
            className={`hidden md:flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 fixed left-0 z-40 h-[calc(100vh-${sidebarTopOffset}px)] show-scrollbar-on-hover overflow-hidden ${
              isSidebarOpen || isHovering ? 'sidebar-visible' : 'sidebar-hidden'
            }`}
            style={{ top: `${sidebarTopOffset}px` }}
            animate={{
              width: isSidebarOpen || isHovering ? "280px" : "0px",
              opacity: isSidebarOpen || isHovering ? 1 : 0,
              transition: {
                duration: 0.15, // Reduced from 0.3s to 0.15s
                ease: [0.4, 0, 0.2, 1]
              }
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* User Profile Section */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={(e) => handleNavigate('profile', e)}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors relative group"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-rose-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                    {user.username}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {user.isAdmin ? 'Administrator' : user.isDoctor ? 'Doctor' : 'User'}
                  </p>
                </div>
                <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </button>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 overflow-y-auto px-2 py-4">
              {menuItems.map((item) => {
                if (item.adminOnly && !user?.isAdmin) return null;
                if (item.doctorOnly && !user?.isDoctor) return null;

                if (item.type === 'separator') {
                  return <hr key={item.id} className="my-2 border-slate-200 dark:border-slate-700" />;
                }

                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    onClick={(e) => handleNavigate(item.id, e)}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                      currentSection === item.id 
                        ? 'bg-rose-50 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                    whileHover={{ x: 4 }}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <AnimatePresence>
                      {(isSidebarOpen || isHovering) && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.15 }}
                          className="ml-3 whitespace-nowrap overflow-hidden"
                        >
                          {item.title}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between px-3 py-2">
                <AnimatePresence>
                  {(isSidebarOpen || isHovering) && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap"
                    >
                      Theme
                    </motion.span>
                  )}
                </AnimatePresence>
                <ThemeToggle />
              </div>
              {onLogout && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onLogout();
                  }}
                  className="w-full flex items-center px-3 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/50 transition-colors"
                >
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                  <AnimatePresence>
                    {(isSidebarOpen || isHovering) && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        className="ml-3 whitespace-nowrap"
                      >
                        Logout
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}

      {/* Main Content */}
      <main className={`transition-all duration-300 ${isSidebarOpen ? 'md:pl-[280px]' : 'md:pl-0'}`}>
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 mt-16">
          {children}
        </div>
      </main>

      {/* Mobile Navigation */}
      {user && (
        <AnimatePresence>
          {isTabsVisible && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.5 }}
              className="fixed bottom-4 left-4 right-4 md:hidden z-50"
            >
              <ExpandableTabs
                tabs={getFilteredMenuItems().filter(item => !item.type)}
                onChange={(id) => id && handleNavigate(id)}
                className="mx-auto max-w-lg"
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}