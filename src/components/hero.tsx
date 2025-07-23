import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="py-16 md:py-24 lg:py-32 relative bg-gray-50">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="text-black">Jawaban, Kutipan, dan Daftar Pustaka</span>
            <br />
            <span className="text-gray-400">semua dalam satu tempat</span>
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mb-8">
            Mudahkan pencarian jurnal dan kerjakan lebih cepat.
          </p>
          <Link href="/search">
            <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-6 rounded-md text-lg h-auto">
              Mulai Pencarian
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
} 
