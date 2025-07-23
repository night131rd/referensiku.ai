import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import { createClient } from "../../supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Hero />
      <Footer />
    </div>
  );
}
