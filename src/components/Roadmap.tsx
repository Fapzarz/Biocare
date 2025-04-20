import React, { useState } from 'react';
import { 
  Rocket, 
  Star, 
  Calendar, 
  ArrowRight,
  Search,
  Filter,
  Sparkles,
  Zap,
  Shield,
  Heart,
  Layout,
  Palette,
  Cpu,
  Lock,
  Users,
  MessageCircle,
  Database,
  Globe,
  Video,
  Wallet,
  Phone,
  BrainCircuit,
  Bot,
  LineChart,
  Smartphone,
  Cloud,
  Fingerprint,
  Gauge,
  Laptop,
  ChevronDown,
  ChevronUp,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: 'planned' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  year: string;
  platform: 'all' | 'web' | 'mobile' | 'desktop';
  category: 'feature' | 'improvement' | 'security' | 'performance';
  team: string;
  impact: string;
  dependencies?: string[];
  features: {
    title: string;
    description: string;
    status: 'planned' | 'in-progress' | 'completed';
  }[];
}

const roadmapItems: RoadmapItem[] = [
  {
    id: 'ehr-integration',
    title: "EHR Integration",
    description: "Integrasi dengan sistem rekam medis elektronik untuk meningkatkan interoperabilitas data kesehatan",
    status: "planned",
    priority: "high",
    quarter: "Q1",
    year: "2025",
    platform: "all",
    category: "feature",
    team: "Integration Team",
    impact: "Meningkatkan interoperabilitas data kesehatan",
    features: [
      {
        title: "Data Import/Export",
        description: "Migrasi data dari sistem EHR yang ada",
        status: "planned"
      },
      {
        title: "Real-time Sync",
        description: "Sinkronisasi data real-time dengan sistem EHR",
        status: "planned"
      },
      {
        title: "Standards Compliance",
        description: "Implementasi standar HL7/FHIR untuk interoperabilitas",
        status: "planned"
      }
    ]
  },
  {
    id: 'telemedicine',
    title: "Telemedicine Platform",
    description: "Platform telemedicine yang komprehensif dengan fitur video call dan manajemen jadwal",
    status: "planned",
    priority: "high",
    quarter: "Q2",
    year: "2025",
    platform: "all",
    category: "feature",
    team: "Product Team",
    impact: "Meningkatkan aksesibilitas layanan kesehatan",
    features: [
      {
        title: "Video Consultation",
        description: "Konsultasi video HD dengan enkripsi end-to-end",
        status: "planned"
      },
      {
        title: "Smart Scheduling",
        description: "Sistem penjadwalan otomatis dengan AI",
        status: "planned"
      },
      {
        title: "Digital Prescriptions",
        description: "Penulisan dan pengiriman resep digital",
        status: "planned"
      }
    ]
  },
  {
    id: 'ai-diagnosis',
    title: "AI Health Assistant",
    description: "Asisten kesehatan berbasis AI untuk pre-diagnosis dan monitoring",
    status: "planned",
    priority: "high",
    quarter: "Q3",
    year: "2025",
    platform: "all",
    category: "feature",
    team: "AI Team",
    impact: "Meningkatkan akurasi dan efisiensi diagnosis awal",
    features: [
      {
        title: "Symptom Analysis",
        description: "Analisis gejala menggunakan machine learning",
        status: "planned"
      },
      {
        title: "Health Monitoring",
        description: "Monitoring kesehatan real-time dengan AI",
        status: "planned"
      },
      {
        title: "Predictive Analytics",
        description: "Prediksi risiko kesehatan berbasis AI",
        status: "planned"
      }
    ]
  },
  {
    id: 'mobile-platform',
    title: "Native Mobile Platform",
    description: "Platform mobile native dengan fitur offline dan integrasi IoT",
    status: "planned",
    priority: "high",
    quarter: "Q4",
    year: "2025",
    platform: "mobile",
    category: "feature",
    team: "Mobile Team",
    impact: "Meningkatkan aksesibilitas dan pengalaman pengguna mobile",
    features: [
      {
        title: "Offline Support",
        description: "Akses penuh fitur dalam mode offline",
        status: "planned"
      },
      {
        title: "IoT Integration",
        description: "Integrasi dengan perangkat kesehatan IoT",
        status: "planned"
      },
      {
        title: "Advanced Security",
        description: "Keamanan biometrik dan enkripsi lokal",
        status: "planned"
      }
    ]
  },
  {
    id: 'health-marketplace',
    title: "Healthcare Marketplace",
    description: "Marketplace untuk produk dan layanan kesehatan terintegrasi",
    status: "planned",
    priority: "medium",
    quarter: "Q1",
    year: "2026",
    platform: "all",
    category: "feature",
    team: "Commerce Team",
    impact: "Menyediakan akses ke produk dan layanan kesehatan",
    features: [
      {
        title: "Product Catalog",
        description: "Katalog produk kesehatan terverifikasi",
        status: "planned"
      },
      {
        title: "Secure Payments",
        description: "Sistem pembayaran aman multi-provider",
        status: "planned"
      },
      {
        title: "Delivery Integration",
        description: "Integrasi dengan layanan pengiriman",
        status: "planned"
      }
    ]
  }
];

const statusColors = {
  planned: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400',
  'in-progress': 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400',
  completed: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
};

const priorityColors = {
  high: 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400',
  medium: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400',
  low: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
};

const categoryIcons = {
  feature: Sparkles,
  improvement: Star,
  security: Shield,
  performance: Zap
};

const platformIcons = {
  all: Globe,
  web: Laptop,
  mobile: Smartphone,
  desktop: Cpu
};

export function Roadmap() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set([roadmapItems[0].id]));

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const filteredItems = roadmapItems
    .filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
      const matchesPlatform = selectedPlatform === 'all' || item.platform === selectedPlatform;
      const matchesQuarter = selectedQuarter === 'all' || `${item.quarter} ${item.year}` === selectedQuarter;
      
      return matchesSearch && matchesStatus && matchesPlatform && matchesQuarter;
    })
    .sort((a, b) => {
      // Sort by year, then quarter
      const yearDiff = parseInt(a.year) - parseInt(b.year);
      if (yearDiff !== 0) return yearDiff;
      
      const quarters = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 };
      return quarters[a.quarter] - quarters[b.quarter];
    });

  const quarters = Array.from(new Set(roadmapItems.map(item => `${item.quarter} ${item.year}`)));

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        {/* Hero Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 p-8 text-white"
        >
          <div className="absolute inset-0 bg-[linear-gradient(40deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.1)_100%)]" />
          <div className="relative space-y-4">
            <Rocket className="h-12 w-12" />
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Roadmap</h1>
              <p className="text-lg text-white/80">
                Rencana pengembangan platform BioCare ke depan
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
              placeholder="Cari fitur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 py-2.5 text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-2 text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:ring-purple-500"
            >
              <option value="all">Semua Status</option>
              <option value="planned">Planned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            {/* Platform Filter */}
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-2 text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:ring-purple-500"
            >
              <option value="all">Semua Platform</option>
              <option value="web">Web</option>
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
            </select>

            {/* Quarter Filter */}
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-2 text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:ring-purple-500"
            >
              <option value="all">Semua Quarter</option>
              {quarters.map(quarter => (
                <option key={quarter} value={quarter}>{quarter}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          {filteredItems.map((item, index) => {
            const isExpanded = expandedItems.has(item.id);
            const PlatformIcon = platformIcons[item.platform];
            const CategoryIcon = categoryIcons[item.category];
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                {/* Header */}
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full p-6 flex items-start justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                          {item.status === 'in-progress' ? 'In Progress' : 
                           item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[item.priority]}`}>
                          {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {item.quarter} {item.year}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <PlatformIcon className="h-4 w-4" />
                        {item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CategoryIcon className="h-4 w-4" />
                        {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                      </span>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0 ml-4"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    )}
                  </motion.div>
                </button>

                {/* Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 pb-6 space-y-6">
                        {/* Description */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-slate-900 dark:text-slate-100">Description</h4>
                          <p className="text-slate-600 dark:text-slate-300">{item.description}</p>
                        </div>

                        {/* Features */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-slate-900 dark:text-slate-100">Features</h4>
                          <div className="grid gap-4 sm:grid-cols-2">
                            {item.features.map((feature, featureIndex) => (
                              <motion.div
                                key={featureIndex}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: featureIndex * 0.1 }}
                                className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium text-slate-900 dark:text-slate-100">{feature.title}</h5>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[feature.status]}`}>
                                    {feature.status === 'in-progress' ? 'In Progress' : 
                                     feature.status.charAt(0).toUpperCase() + feature.status.slice(1)}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{feature.description}</p>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* Impact & Team */}
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <h4 className="font-medium text-slate-900 dark:text-slate-100">Impact</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300">{item.impact}</p>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-medium text-slate-900 dark:text-slate-100">Team</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300">{item.team}</p>
                          </div>
                        </div>

                        {/* Dependencies */}
                        {item.dependencies && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-slate-900 dark:text-slate-100">Dependencies</h4>
                            <div className="flex flex-wrap gap-2">
                              {item.dependencies.map((dep, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                                >
                                  {dep}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <Rocket className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">No roadmap items found</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Legend</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <h4 className="font-medium text-slate-900 dark:text-slate-100">Status</h4>
              <div className="space-y-1">
                {Object.entries(statusColors).map(([status, color]) => (
                  <div key={status} className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
                      {status === 'in-progress' ? 'In Progress' : 
                       status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-slate-900 dark:text-slate-100">Priority</h4>
              <div className="space-y-1">
                {Object.entries(priorityColors).map(([priority, color]) => (
                  <div key={priority} className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-slate-900 dark:text-slate-100">Category</h4>
              <div className="space-y-1">
                {Object.entries(categoryIcons).map(([category, Icon]) => (
                  <div key={category} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-slate-900 dark:text-slate-100">Platform</h4>
              <div className="space-y-1">
                {Object.entries(platformIcons).map(([platform, Icon]) => (
                  <div key={platform} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6">
          <div className="flex items-center gap-3 text-yellow-600 dark:text-yellow-400">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-medium">Disclaimer</h3>
          </div>
          <p className="mt-2 text-sm text-yellow-600/80 dark:text-yellow-400/80">
            Roadmap ini bersifat indikatif dan dapat berubah sesuai dengan kebutuhan dan prioritas pengembangan. Kami akan selalu mengutamakan fitur yang memberikan manfaat terbesar bagi pengguna.
          </p>
        </div>
      </motion.div>
    </div>
  );
}