"use client";

import { useState } from "react";
import { AlertCircle, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "../../supabase/client";
import { usePathname } from "next/navigation";

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"bug" | "suggestion" | "general">("bug");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const pathname = usePathname();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError("Mohon masukkan pesan");
      return;
    }
    
    setSending(true);
    setError("");
    
    try {
      const supabase = createClient();
      
      // Kirim feedback ke Supabase
      const { error: supabaseError } = await supabase
        .from("user_feedback")
        .insert({
          type,
          message,
          email: email || null,
          page_url: window.location.href,
          user_agent: navigator.userAgent,
        });
      
      if (supabaseError) {
        throw new Error(supabaseError.message);
      }
      
      // Sukses
      setSent(true);
      
      // Reset form setelah 3 detik
      setTimeout(() => {
        setOpen(false);
        setTimeout(() => {
          setSent(false);
          setMessage("");
          setEmail("");
          setType("bug");
        }, 300);
      }, 3000);
      
    } catch (err) {
      console.error("Error sending feedback:", err);
      setError("Gagal mengirim feedback. Silakan coba lagi nanti.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Tombol mengambang */}
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 rounded-full shadow-lg w-12 h-12 p-0 bg-blue-600 hover:bg-blue-700 z-50"
        aria-label="Laporkan bug atau kirim saran"
      >
        <MessageSquarePlus size={20} />
      </Button>

      {/* Dialog Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Laporkan Bug & Feedback</DialogTitle>
            <DialogDescription>
              Bantu kami meningkatkan Referensiku.ai dengan melaporkan bug
              atau mengirimkan saran dan kritik Anda.
            </DialogDescription>
          </DialogHeader>
          
          {sent ? (
            <div className="py-6 text-center">
              <div className="mx-auto bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Terima kasih!</h3>
              <p className="text-gray-500">
                Feedback Anda telah diterima dan akan kami tindaklanjuti.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Jenis Feedback</Label>
                <Select
                  value={type}
                  onValueChange={(value: any) => setType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis feedback" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug">Bug / Error</SelectItem>
                    <SelectItem value="suggestion">Saran / Ide</SelectItem>
                    <SelectItem value="general">Umum / Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Pesan</Label>
                <Textarea
                  id="message"
                  placeholder={
                    type === "bug"
                      ? "Deskripsikan bug yang Anda temukan... (apa yang terjadi, halaman mana, dll)"
                      : "Masukkan saran atau feedback Anda..."
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email (opsional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@contoh.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Untuk memberi tahu Anda jika bug telah diperbaiki
                </p>
              </div>
              
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={sending}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={sending}>
                  {sending ? "Mengirim..." : "Kirim Feedback"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
