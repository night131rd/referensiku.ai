import { Star, Quote } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Ahmad Santoso",
      role: "Mahasiswa S1 UGM",
      content: "brooo 😭😭 JurnalGPT tuh cheatcode akademik asli 💀 yang biasanya gw ngelaprak 2-3 jam sampe otak nge-fry 🍳 sekarang 15 menit langsung kelar 😎📚💨 gila ga sih??? ini tuh bukan recommended lagi, ini WAJIB 🔥🔥",
      rating: 5,
      avatar: "AS"
    },
    {
      name: "Maya Putri",
      role: "Mahasiswa S1 UI",
      content: "SEBAGAI MAHASISWA 🥲 gw tuh sering banget nyasar nyari jurnal, berasa jadi detektif gagal 🕵️‍♂️💔. Tapi sejak ada JurnalGPT?? 😭🙏 sekarang gw tinggal fokus analisis doang, bukan scrolling jurnal sampe mata minus 🤓📚✨. Legit lifesaver sih 🔥🚀",
      rating: 5,
      avatar: "MP"
    },
    {
      name: "Budi Susilo",
      role: "Mahasiswa S1 UNS",
      content: "Kutipan udah auto on point ✨📚 daftar pustaka tinggal jadi, ga pake ribet. Ngelaprak sekarang vibesnya cepet, gampang, tinggal gaspol aja 🚀🔥",
      rating: 5,
      avatar: "BS"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Apa Kata Pengguna Kami
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ribuan peneliti dan mahasiswa telah mempercayai JurnalGPT untuk kebutuhan penelitian mereka
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Quote */}
              <Quote className="w-8 h-8 text-gray-300 mb-4" />

              {/* Content */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="text-center">
          <p className="text-gray-600 mb-6">Dipercaya oleh universitas dan institusi terkemuka</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-lg font-semibold text-gray-400">Universitas Indonesia</div>
            <div className="text-lg font-semibold text-gray-400">IPB University</div>
            <div className="text-lg font-semibold text-gray-400">Universitas Gadjah Mada</div>
            <div className="text-lg font-semibold text-gray-400">ITB</div>
            <div className="text-lg font-semibold text-gray-400">UNS</div>
          </div>
        </div>
      </div>
    </section>
  );
}
