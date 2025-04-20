import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Apa itu BioCare?",
    answer: "BioCare adalah platform kesehatan digital yang menghubungkan pasien dengan dokter untuk konsultasi kesehatan online. Platform ini menyediakan akses ke informasi kesehatan yang terverifikasi dan memungkinkan pengguna untuk berkonsultasi dengan dokter terpercaya."
  },
  {
    question: "Bagaimana cara mendaftar sebagai dokter?",
    answer: "Untuk mendaftar sebagai dokter, Anda perlu membuat akun dan mengajukan verifikasi dengan mengunggah dokumen lisensi dokter Anda. Tim kami akan memverifikasi kredensial Anda dalam 2-3 hari kerja."
  },
  {
    question: "Apakah konsultasi bersifat rahasia?",
    answer: "Ya, semua konsultasi bersifat rahasia. Anda dapat memilih untuk membuat konsultasi private yang hanya dapat dilihat oleh Anda dan dokter yang merespons."
  },
  {
    question: "Berapa lama waktu respons untuk konsultasi?",
    answer: "Dokter biasanya merespons dalam waktu 24 jam. Untuk kasus darurat, silakan hubungi layanan gawat darurat terdekat."
  },
  {
    question: "Bagaimana sistem reputasi bekerja?",
    answer: "Anda mendapatkan poin reputasi dari aktivitas positif seperti memberikan jawaban yang membantu, mendapatkan like, dan memiliki jawaban yang ditandai sebagai solusi."
  }
];

export function FAQ() {
  const [openItems, setOpenItems] = React.useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <span className="font-medium text-slate-900 dark:text-slate-100">{faq.question}</span>
              {openItems.includes(index) ? (
                <ChevronUp className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              )}
            </button>

            {openItems.includes(index) && (
              <div className="px-6 pb-6">
                <p className="text-slate-600 dark:text-slate-300">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}