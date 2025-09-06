import { CheckCircle, Zap, Shield, Globe, BookOpen, Users } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "Pencarian Ultra Cepat",
      description: "Temukan jurnal dalam 10 detik dengan AI canggih yang memahami konteks pertanyaan Anda."
    },
    {
      icon: <BookOpen className="w-8 h-8 text-blue-500" />,
      title: "Database Lengkap",
      description: "Akses jutaan jurnal dari universitas terkemuka dunia dengan pembaruan real-time."
    },
    {
      icon: <Shield className="w-8 h-8 text-green-500" />,
      title: "Akurasi Terjamin",
      description: "Kutipan dan daftar pustaka yang akurat sesuai standar akademik internasional."
    },
    {
      icon: <Globe className="w-8 h-8 text-purple-500" />,
      title: "Multi-Bahasa",
      description: "Pencarian Jurnal Internasional jadi lebih mudah dan cepat"
    },
    {
      icon: <Users className="w-8 h-8 text-indigo-500" />,
      title: "Oleh Mahasiswa",
      description: "Dibuat oleh mahasiswa untuk mahasiswa, memahami kebutuhan akademik Anda."
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-emerald-500" />,
      title: "Format Otomatis",
      description: "Generate daftar pustaka dalam format APA secara instan."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Kenapa Memilih JurnalGPT?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Platform AI tercanggih untuk penelitian akademik dengan fitur-fitur unggulan
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors duration-300">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-white rounded-xl shadow-sm mr-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-white">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Dipercaya Oleh Ribuan Mahasiswa dan Peneliti
            </h3>
            <p className="text-blue-100 text-lg">
              Bergabunglah dengan komunitas akademik yang telah mempercayai JurnalGPT
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">2M+</div>
              <div className="text-blue-100">Jurnal Akademik</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-blue-100">Pengguna Aktif</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-100">Universitas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">4.9/5</div>
              <div className="text-blue-100">Rating Kepuasan</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
