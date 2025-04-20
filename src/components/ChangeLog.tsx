import React, { useState } from 'react';
import { 
  History, 
  Star, 
  Bug, 
  Sparkles,
  Search,
  Filter,
  Calendar,
  Tag,
  ArrowUpDown,
  CheckCircle,
  AlertTriangle,
  Rocket,
  Zap,
  Shield,
  Heart,
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  Award,
  Layout,
  Palette,
  Cpu,
  Lock,
  Users,
  MessageCircle,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChangeLogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  platform: 'all' | 'web' | 'mobile' | 'desktop';
  changes: {
    type: 'feature' | 'improvement' | 'fix' | 'security';
    title: string;
    description: string;
    impact?: 'high' | 'medium' | 'low';
    author?: string;
  }[];
}

const changelog: ChangeLogEntry[] = [
  {
    version: "1.0.0",
    date: "2024-01-01",
    type: 'major',
    platform: 'all',
    changes: [
      {
        type: "feature",
        title: "Peluncuran Platform",
        description: "Peluncuran resmi platform BioCare dengan fitur dasar konsultasi kesehatan online.",
        impact: 'high',
        author: "BioCare Team"
      },
      {
        type: "feature",
        title: "Sistem Autentikasi",
        description: "Implementasi sistem login dan registrasi dengan verifikasi email dan keamanan tingkat tinggi.",
        impact: 'high',
        author: "Security Team"
      },
      {
        type: "feature",
        title: "Manajemen Penyakit",
        description: "Database penyakit dengan informasi pengobatan dan terapi yang komprehensif.",
        impact: 'high',
        author: "Medical Team"
      },
      {
        type: "feature",
        title: "UI/UX Modern",
        description: "Desain antarmuka yang intuitif dan responsif dengan tema terang/gelap.",
        impact: 'high',
        author: "Design Team"
      }
    ]
  },
  {
    version: "1.1.0",
    date: "2024-01-15",
    type: 'minor',
    platform: 'web',
    changes: [
      {
        type: "feature",
        title: "Verifikasi Dokter",
        description: "Sistem verifikasi untuk dokter dengan upload dokumen lisensi dan validasi multi-tahap.",
        impact: 'high',
        author: "Verification Team"
      },
      {
        type: "improvement",
        title: "UI/UX Konsultasi",
        description: "Peningkatan antarmuka konsultasi dengan fitur real-time dan notifikasi.",
        impact: 'medium',
        author: "Design Team"
      },
      {
        type: "security",
        title: "Enkripsi Data",
        description: "Implementasi enkripsi end-to-end untuk data medis dan informasi sensitif.",
        impact: 'high',
        author: "Security Team"
      },
      {
        type: "feature",
        title: "Sistem Reputasi",
        description: "Pengenalan sistem reputasi dan badge untuk dokter dan pengguna aktif.",
        impact: 'medium',
        author: "Gamification Team"
      }
    ]
  },
  {
    version: "1.1.1",
    date: "2024-01-20",
    type: 'patch',
    platform: 'web',
    changes: [
      {
        type: "fix",
        title: "Bug Navigasi",
        description: "Perbaikan masalah navigasi sidebar dan menu mobile untuk pengalaman yang lebih baik.",
        impact: 'medium',
        author: "Frontend Team"
      },
      {
        type: "fix",
        title: "Performa Aplikasi",
        description: "Optimasi performa dan perbaikan memory leak untuk kinerja yang lebih baik.",
        impact: 'medium',
        author: "Performance Team"
      },
      {
        type: "improvement",
        title: "Animasi UI",
        description: "Peningkatan animasi dan transisi untuk interaksi yang lebih halus.",
        impact: 'low',
        author: "Design Team"
      }
    ]
  },
  {
    version: "1.2.0",
    date: "2024-01-23",
    type: 'minor',
    platform: 'all',
    changes: [
      {
        type: "feature",
        title: "Dashboard Dokter",
        description: "Dashboard khusus untuk dokter dengan statistik dan manajemen konsultasi.",
        impact: 'high',
        author: "Doctor Team"
      },
      {
        type: "feature",
        title: "Sistem Badge",
        description: "Sistem badge dan pencapaian untuk meningkatkan engagement pengguna.",
        impact: 'medium',
        author: "Gamification Team"
      },
      {
        type: "improvement",
        title: "Sistem Like",
        description: "Peningkatan sistem like untuk konsultasi dan jawaban dengan notifikasi real-time.",
        impact: 'medium',
        author: "Frontend Team"
      },
      {
        type: "feature",
        title: "Admin Dashboard",
        description: "Dashboard admin untuk manajemen pengguna dan konten platform.",
        impact: 'high',
        author: "Admin Team"
      }
    ]
  },
  {
    version: "1.2.1",
    date: "2024-01-24",
    type: 'patch',
    platform: 'web',
    changes: [
      {
        type: "fix",
        title: "Navigasi Mobile",
        description: "Perbaikan interaksi menu mobile dan expandable tabs.",
        impact: 'medium',
        author: "Frontend Team"
      },
      {
        type: "improvement",
        title: "UI Changelog",
        description: "Peningkatan tampilan dan interaksi halaman changelog.",
        impact: 'medium',
        author: "Design Team"
      },
      {
        type: "improvement",
        title: "Performa Sidebar",
        description: "Optimasi performa dan animasi sidebar menu.",
        impact: 'medium',
        author: "Performance Team"
      },
      {
        type: "fix",
        title: "Akses Menu",
        description: "Perbaikan kontrol akses menu berdasarkan peran pengguna.",
        impact: 'high',
        author: "Security Team"
      }
    ]
  }
];

const impactColors = {
  high: 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400',
  medium: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400',
  low: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
};

const platformIcons = {
  all: Globe,
  web: Laptop,
  mobile: Smartphone,
  desktop: Tablet
};

const typeColors = {
  major: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400',
  minor: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400',
  patch: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 }
};

export function ChangeLog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set([changelog[0].version]));

  const toggleVersion = (version: string) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(version)) {
      newExpanded.delete(version);
    } else {
      newExpanded.add(version);
    }
    setExpandedVersions(newExpanded);
  };

  const filteredChangelog = changelog
    .filter(entry => {
      const matchesSearch = 
        entry.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.changes.some(change => 
          change.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          change.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      const matchesType = selectedType === 'all' || entry.type === selectedType;
      const matchesPlatform = selectedPlatform === 'all' || entry.platform === selectedPlatform;
      
      return matchesSearch && matchesType && matchesPlatform;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Hero Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-white"
        >
          <div className="absolute inset-0 bg-[linear-gradient(40deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.1)_100%)]" />
          <div className="relative space-y-4">
            <History className="h-12 w-12" />
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Riwayat Perubahan</h1>
              <p className="text-lg text-white/80">
                Dokumentasi perubahan dan pembaruan platform BioCare
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="search"
              placeholder="Cari perubahan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 py-2.5 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4">
            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-2 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">Semua Tipe</option>
              <option value="major">Major Release</option>
              <option value="minor">Minor Release</option>
              <option value="patch">Patch</option>
            </select>

            {/* Platform Filter */}
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-2 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">Semua Platform</option>
              <option value="web">Web</option>
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
            </select>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              {sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}
            </button>
          </div>
        </div>

        {/* Changelog List */}
        <div className="space-y-6">
          {filteredChangelog.map((entry) => {
            const isExpanded = expandedVersions.has(entry.version);
            const PlatformIcon = platformIcons[entry.platform];
            
            return (
              <motion.div
                key={entry.version}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                {/* Version Header */}
                <button
                  onClick={() => toggleVersion(entry.version)}
                  className="w-full p-6 flex items-start justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        Version {entry.version}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[entry.type]}`}>
                          {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <PlatformIcon className="h-4 w-4" />
                          <span className="text-sm">{entry.platform.charAt(0).toUpperCase() + entry.platform.slice(1)}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(entry.date).toLocaleDateString('id-ID', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0 ml-4"
                  >
                    <ArrowUpDown className="h-5 w-5 text-slate-400" />
                  </motion.div>
                </button>

                {/* Changes List */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 pb-6 space-y-4">
                        {entry.changes.map((change, index) => {
                          const Icon = change.type === 'feature' ? Sparkles :
                                     change.type === 'improvement' ? Star :
                                     change.type === 'fix' ? Bug :
                                     Shield;
                          
                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50"
                            >
                              <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                change.type === 'feature' ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400' :
                                change.type === 'improvement' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' :
                                change.type === 'fix' ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400' :
                                'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
                              }`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-medium text-slate-900 dark:text-slate-100">
                                    {change.title}
                                  </h4>
                                  {change.impact && (
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${impactColors[change.impact]}`}>
                                      {change.impact.charAt(0).toUpperCase() + change.impact.slice(1)} Impact
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                  {change.description}
                                </p>
                                {change.author && (
                                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                    <Award className="h-4 w-4" />
                                    <span>{change.author}</span>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {filteredChangelog.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <History className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">Tidak ada perubahan yang ditemukan</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}