import React from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  Bell, 
  ArrowRight, 
  ExternalLink, 
  Search, 
  HelpCircle, 
  Clock,
  Globe,
  UserCheck,
  FileText,
  Trash2,
  Download,
  AlertTriangle,
  Settings,
  Mail
} from 'lucide-react';
import { motion } from 'framer-motion';

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

const sections = [
  {
    icon: Database,
    title: "Pengumpulan dan Penggunaan Data",
    content: [
      {
        title: "Data yang Kami Kumpulkan",
        items: [
          "Data identitas (nama, email, nomor telepon)",
          "Data medis yang Anda bagikan dalam konsultasi",
          "Data penggunaan platform",
          "Data perangkat dan browser",
          "Cookie dan teknologi pelacakan"
        ]
      },
      {
        title: "Dasar Hukum Pengolahan (GDPR)",
        items: [
          "Persetujuan eksplisit untuk data kesehatan",
          "Kepentingan sah untuk peningkatan layanan",
          "Kewajiban hukum untuk kepatuhan regulasi",
          "Pelaksanaan kontrak layanan"
        ]
      }
    ]
  },
  {
    icon: Lock,
    title: "Keamanan dan Perlindungan Data",
    content: [
      {
        title: "Langkah Keamanan",
        items: [
          "Enkripsi end-to-end untuk data sensitif",
          "Autentikasi multi-faktor",
          "Pemantauan keamanan 24/7",
          "Audit keamanan berkala",
          "Pembatasan akses berbasis peran"
        ]
      },
      {
        title: "Penyimpanan Data",
        items: [
          "Data disimpan di server yang aman",
          "Backup terenkripsi secara berkala",
          "Periode retensi sesuai regulasi",
          "Penghapusan otomatis data kadaluarsa"
        ]
      }
    ]
  },
  {
    icon: Eye,
    title: "Hak Privasi Anda",
    content: [
      {
        title: "Hak GDPR",
        items: [
          "Hak akses data pribadi",
          "Hak untuk mengoreksi data",
          "Hak untuk menghapus data (right to be forgotten)",
          "Hak untuk membatasi pemrosesan",
          "Hak untuk portabilitas data",
          "Hak untuk menolak pemrosesan"
        ]
      },
      {
        title: "Hak CCPA",
        items: [
          "Hak untuk mengetahui data yang dikumpulkan",
          "Hak untuk menghapus data pribadi",
          "Hak untuk tidak dijual datanya",
          "Hak untuk non-diskriminasi"
        ]
      },
      {
        title: "Hak PDPA",
        items: [
          "Hak untuk pemberitahuan dan persetujuan",
          "Hak untuk akses dan koreksi",
          "Hak untuk penarikan persetujuan",
          "Hak untuk pengalihan data"
        ]
      }
    ]
  },
  {
    icon: Globe,
    title: "Transfer Data Internasional",
    content: [
      {
        title: "Perlindungan Transfer",
        items: [
          "Penggunaan Standard Contractual Clauses (SCCs)",
          "Penilaian dampak transfer data",
          "Enkripsi dalam transit dan penyimpanan",
          "Pemantauan kepatuhan negara tujuan"
        ]
      }
    ]
  },
  {
    icon: Bell,
    title: "Penggunaan Cookie dan Pelacakan",
    content: [
      {
        title: "Jenis Cookie",
        items: [
          "Cookie esensial untuk fungsi website",
          "Cookie analitik untuk performa",
          "Cookie fungsional untuk preferensi",
          "Cookie pihak ketiga (jika ada)"
        ]
      },
      {
        title: "Kontrol Cookie",
        items: [
          "Pengaturan preferensi cookie",
          "Opsi untuk menolak cookie non-esensial",
          "Penghapusan cookie browser"
        ]
      }
    ]
  }
];

const actionButtons = [
  {
    icon: Download,
    title: "Unduh Data Anda",
    description: "Dapatkan salinan data pribadi Anda"
  },
  {
    icon: Trash2,
    title: "Hapus Akun",
    description: "Hapus semua data pribadi Anda"
  },
  {
    icon: Settings,
    title: "Pengaturan Privasi",
    description: "Kelola preferensi privasi Anda"
  },
  {
    icon: Mail,
    title: "Hubungi DPO",
    description: "Tanyakan tentang privasi Anda"
  }
];

export function PrivacyPolicy() {
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
            <Shield className="h-12 w-12" />
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Kebijakan Privasi</h1>
              <p className="text-lg text-white/80">
                Komitmen kami untuk melindungi privasi dan data pribadi Anda
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Clock className="h-4 w-4" />
              Terakhir diperbarui: {new Date().toLocaleDateString()}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {actionButtons.map((action, i) => {
            const Icon = action.icon;
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
                    {action.title}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {action.description}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Main Content */}
        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                      {section.title}
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {section.content.map((subsection, i) => (
                      <div key={i} className="space-y-4">
                        <h3 className="font-medium text-slate-900 dark:text-slate-100">
                          {subsection.title}
                        </h3>
                        <ul className="space-y-2">
                          {subsection.items.map((item, j) => (
                            <motion.li
                              key={j}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 * j }}
                              className="flex items-center gap-2 text-slate-600 dark:text-slate-300"
                            >
                              <ArrowRight className="h-4 w-4 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                              {item}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Contact DPO Section */}
        <motion.div 
          variants={itemVariants}
          className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              <h3 className="font-medium text-slate-900 dark:text-slate-100">
                Data Protection Officer (DPO)
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Untuk pertanyaan terkait privasi data Anda atau permintaan terkait hak privasi Anda, silakan hubungi DPO kami melalui:
            </p>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <p>Email: privacy@biocare.com</p>
              <p>Telepon: 0800-123-4567</p>
              <p>Alamat: Jl. Privasi No. 1, Jakarta 12345</p>
            </div>
          </div>
        </motion.div>

        {/* Important Notice */}
        <motion.div 
          variants={itemVariants}
          className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-medium">Pemberitahuan Penting</h3>
          </div>
          <p className="mt-2 text-sm text-rose-600/80 dark:text-rose-400/80">
            Kebijakan privasi ini dapat diperbarui sewaktu-waktu. Perubahan signifikan akan diberitahukan melalui email atau notifikasi di platform. Dengan terus menggunakan layanan kami, Anda menyetujui kebijakan privasi yang berlaku.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}