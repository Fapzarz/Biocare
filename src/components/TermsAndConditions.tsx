import React from 'react';
import { Scroll, Shield, AlertTriangle, UserCheck, CheckCircle, FileText, Scale, Clock } from 'lucide-react';
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
    icon: UserCheck,
    title: "Persyaratan Pengguna",
    content: [
      { title: "Usia Minimal", desc: "Pengguna harus berusia minimal 18 tahun" },
      { title: "Informasi Akurat", desc: "Informasi yang diberikan harus akurat dan valid" },
      { title: "Kerahasiaan Akun", desc: "Pengguna bertanggung jawab atas kerahasiaan akun" },
      { title: "Larangan", desc: "Dilarang membuat akun palsu atau menyalahgunakan platform" }
    ]
  },
  {
    icon: Scale,
    title: "Layanan Konsultasi",
    content: [
      { title: "Sifat Konsultasi", desc: "Konsultasi bersifat informatif, bukan pengganti pemeriksaan medis langsung" },
      { title: "Respons Dokter", desc: "Dokter akan merespons dalam waktu yang wajar" },
      { title: "Kondisi Darurat", desc: "Untuk kondisi darurat, hubungi layanan gawat darurat" },
      { title: "Biaya", desc: "Biaya konsultasi sesuai dengan ketentuan yang berlaku" }
    ]
  },
  {
    icon: Shield,
    title: "Privasi dan Kerahasiaan",
    content: [
      { title: "Kerahasiaan Data", desc: "Informasi medis dilindungi kerahasiaannya" },
      { title: "Akses Terbatas", desc: "Akses ke data terbatas untuk staf yang berwenang" },
      { title: "Enkripsi Data", desc: "Data dienkripsi dan disimpan dengan aman" },
      { title: "Kebijakan Berbagi", desc: "Data tidak akan dibagikan tanpa izin" }
    ]
  },
  {
    icon: AlertTriangle,
    title: "Pembatasan Tanggung Jawab",
    content: [
      { title: "Layanan Apa Adanya", desc: "Platform disediakan 'sebagaimana adanya'" },
      { title: "Keputusan Medis", desc: "Kami tidak bertanggung jawab atas keputusan medis pengguna" },
      { title: "Penggunaan Platform", desc: "Pengguna bertanggung jawab atas penggunaan platform" },
      { title: "Penangguhan Akun", desc: "Kami berhak menangguhkan akun yang melanggar ketentuan" }
    ]
  }
];

export function TermsAndConditions() {
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
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-8 text-white"
        >
          <div className="absolute inset-0 bg-[linear-gradient(40deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.1)_100%)]" />
          <div className="relative space-y-4">
            <Scroll className="h-12 w-12" />
            <h1 className="text-3xl font-bold">Syarat dan Ketentuan</h1>
            <p className="text-lg text-white/80">
              Ketentuan penggunaan platform BioCare
            </p>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Clock className="h-4 w-4" />
              Terakhir diperbarui: {new Date().toLocaleDateString()}
            </div>
          </div>
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
                    <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                      {section.title}
                    </h2>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {section.content.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                          <h3 className="font-medium text-slate-900 dark:text-slate-100">
                            {item.title}
                          </h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 pl-6">
                          {item.desc}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Note */}
        <motion.div 
          variants={itemVariants}
          className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-slate-400 dark:text-slate-500" />
            <h3 className="font-medium text-slate-900 dark:text-slate-100">
              Catatan Penting
            </h3>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Dengan menggunakan BioCare, Anda menyatakan telah membaca, memahami, dan menyetujui semua syarat dan ketentuan ini. Kami berhak mengubah ketentuan ini sewaktu-waktu, dan perubahan akan efektif setelah diumumkan di platform.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}