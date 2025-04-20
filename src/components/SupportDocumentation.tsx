import React, { useState } from 'react';
import { 
  Book, 
  MessageCircle, 
  Mail, 
  Phone, 
  FileText, 
  HelpCircle,
  Search,
  ArrowRight,
  ExternalLink,
  Video,
  Lightbulb,
  Headphones,
  Globe,
  Clock,
  CheckCircle,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const searchResultVariants = {
  hidden: { opacity: 0, y: -10 },
  show: { opacity: 1, y: 0 }
};

const guides = [
  {
    title: "Memulai dengan BioCare",
    description: "Panduan lengkap untuk pengguna baru",
    icon: Book,
    category: "getting-started",
    articles: [
      "Cara membuat akun",
      "Mengatur profil",
      "Memahami fitur utama",
      "Tips keamanan akun"
    ]
  },
  {
    title: "Konsultasi Kesehatan",
    description: "Panduan untuk konsultasi online",
    icon: MessageCircle,
    category: "consultation",
    articles: [
      "Membuat konsultasi baru",
      "Berkomunikasi dengan dokter",
      "Memahami status konsultasi",
      "Kebijakan privasi medis"
    ]
  },
  {
    title: "Verifikasi Dokter",
    description: "Proses verifikasi untuk dokter",
    icon: CheckCircle,
    category: "verification",
    articles: [
      "Persyaratan verifikasi",
      "Mengajukan verifikasi",
      "Status verifikasi",
      "FAQ verifikasi"
    ]
  },
  {
    title: "Keamanan & Privasi",
    description: "Informasi keamanan data",
    icon: Globe,
    category: "security",
    articles: [
      "Enkripsi data",
      "Hak akses data",
      "Kebijakan penyimpanan",
      "Keamanan akun"
    ]
  }
];

const popularTopics = [
  "Cara mengubah password",
  "Lupa password",
  "Verifikasi email",
  "Kebijakan pembayaran",
  "Kerahasiaan data medis",
  "Status konsultasi",
  "Notifikasi",
  "Pengaturan akun"
];

export function SupportDocumentation() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSearchResults(e.target.value.length > 0);
  };

  const filteredGuides = guides.filter(guide => 
    selectedCategory ? guide.category === selectedCategory : true
  );

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
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-white"
        >
          <div className="absolute inset-0 bg-[linear-gradient(40deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.1)_100%)]" />
          <div className="relative space-y-4">
            <Headphones className="h-12 w-12" />
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Bantuan & Dukungan</h1>
              <p className="text-lg text-white/80">
                Temukan jawaban untuk semua pertanyaan Anda tentang BioCare
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="search"
                placeholder="Cari bantuan..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <AnimatePresence>
                {showSearchResults && (
                  <motion.div
                    variants={searchResultVariants}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    className="absolute top-full left-0 right-0 mt-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-10"
                  >
                    <div className="space-y-2">
                      {popularTopics
                        .filter(topic => 
                          topic.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((topic, index) => (
                          <button
                            key={index}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-300"
                          >
                            {topic}
                          </button>
                        ))
                      }
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            { icon: Video, title: "Video Tutorial", desc: "Pelajari melalui video" },
            { icon: Lightbulb, title: "FAQ", desc: "Pertanyaan umum" },
            { icon: ExternalLink, title: "Kontak Kami", desc: "Butuh bantuan lebih?" }
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={i}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors group"
              >
                <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {item.desc}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Main Content */}
        <div className="space-y-8">
          {filteredGuides.map((guide, index) => {
            const Icon = guide.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors group"
              >
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500 transition-colors">
                      <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {guide.title}
                      </h2>
                      <p className="text-slate-500 dark:text-slate-400">
                        {guide.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {guide.articles.map((article, i) => (
                      <motion.button
                        key={i}
                        className="flex items-center gap-2 p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 group/item transition-colors text-left"
                      >
                        <ArrowRight className="h-4 w-4 text-slate-400 group-hover/item:text-indigo-500 dark:group-hover/item:text-indigo-400 transition-colors" />
                        <span className="text-sm text-slate-600 dark:text-slate-300 group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors">
                          {article}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Contact Section */}
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Hubungi Kami
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: Mail,
                  title: "Email",
                  content: "support@biocare.com",
                  desc: "Respon dalam 24 jam"
                },
                {
                  icon: Phone,
                  title: "Telepon",
                  content: "0800-123-4567",
                  desc: "Senin - Jumat, 09:00 - 17:00"
                },
                {
                  icon: MessageCircle,
                  title: "Live Chat",
                  content: "Mulai Chat",
                  desc: "Tersedia 24/7"
                }
              ].map((contact, i) => {
                const Icon = contact.icon;
                return (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">
                        {contact.title}
                      </h4>
                    </div>
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      {contact.content}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {contact.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}