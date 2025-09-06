"use client";

import { JournalReference } from "@/types/search";
import { startStreamingSearch } from "@/app/actions";
import {
  ExternalLink,
  Download,
  BookOpen,
  Search,
  CheckCircle2,
  Brain,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { marked } from "marked";
import { streamSearchStatus, startSearch } from "@/lib/api";
import { EnhancedLoading } from "@/components/enhanced-loading";

interface SearchResultsProps {
  query: string;
  startYear: string;
  endYear: string;
  mode: string;
}

export default function SearchResults({
  query,
  startYear,
  endYear,
  mode,
}: SearchResultsProps) {
  const [searchState, setSearchState] = useState<
    "searching" | "found" | "processing" | "complete"
  >("searching");
  const [progress, setProgress] = useState(0);
  const [journalsFound, setJournalsFound] = useState(0);
  const [currentLoadingStep, setCurrentLoadingStep] = useState(0);
  const [result, setResult] = useState<{
    answer: string;
    references: JournalReference[];
    bibliography?: string[];
    taskId?: string;
    phase?: 'waiting' | 'sources' | 'answer' | 'completed';
    answerPending?: boolean;
  } | null>(null);
  
  // Helper function to update progress and step
  const updateProgress = (newProgress: number) => {
    setProgress(newProgress);
    // Update step based on progress
    if (newProgress < 25) setCurrentLoadingStep(0);
    else if (newProgress < 50) setCurrentLoadingStep(1);
    else if (newProgress < 75) setCurrentLoadingStep(2);
    else setCurrentLoadingStep(3);
  };
  
  // Helper untuk normalisasi sumber
  const normalizeSource = (s: any): JournalReference => {
    console.log('Frontend normalizing source:', JSON.stringify(s, null, 2));
    
    // Ekstrak judul dengan berbagai kemungkinan field name
    const title = s.title || s.paper_title || s.document_title || s.name || s.Title || 'Unknown Title';
    
    // Ekstrak authors dengan berbagai kemungkinan format
    let authors: string[] = ['Unknown Author'];
    if (s.authors && typeof s.authors === 'string') {
      // Jika authors berupa string, split berdasarkan koma dan bersihkan
      authors = s.authors.split(',')
        .map((author: string) => author.trim())
        .filter((author: string) => author.length > 0);
    } else if (Array.isArray(s.authors) && s.authors.length > 0) {
      authors = s.authors.filter((author: string) => author && typeof author === 'string');
    } else if (s.author && typeof s.author === 'string') {
      authors = [s.author];
    } else if (s.creator && typeof s.creator === 'string') {
      authors = [s.creator];
    } else if (s.Authors && typeof s.Authors === 'string') {
      authors = s.Authors.split(',')
        .map((author: string) => author.trim())
        .filter((author: string) => author.length > 0);
    } else if (s.Authors && Array.isArray(s.Authors)) {
      authors = s.Authors.filter((author: string) => author && typeof author === 'string');
    } else if (s.Author && typeof s.Author === 'string') {
      authors = [s.Author];
    }
    
    // Pastikan minimal ada satu author yang valid
    if (authors.length === 0 || (authors.length === 1 && authors[0].trim() === '')) {
      authors = ['Unknown Author'];
    }
    
    // Ekstrak tahun
    const year = (() => {
      const y = s.year || s.published_year || s.publication_year || s.date_year || s.Year || s.PublishedYear;
      if (y) {
        const yearNum = parseInt(String(y).slice(0, 4));
        return isNaN(yearNum) ? new Date().getFullYear() : yearNum;
      }
      return new Date().getFullYear();
    })();
    
    // Ekstrak journal/publisher
    const journal = (s.publisher || s.journal || s.source || s.conference || s.Journal || s.Publisher || 'Unknown Journal').toString().toUpperCase();
    
    console.log('Frontend normalized result:', { title, authors, year, journal });
    
    return {
      title,
      authors,
      year,
      journal,
      doi: s.doi || s.DOI || s.identifier || '',
      url: s.url || s.link || s.href || '',
      pdfUrl: s.pdfUrl || s.pdf_url || s.pdf || '',
      abstract: s.abstract || s.teks || s.summary || s.description || '',
    };
  };
  
  useEffect(() => {
    let cancelled = false;
    let progressInterval: NodeJS.Timeout | null = null;

    const runSseFlow = async () => {
      try {
        setSearchState("searching");
        setProgress(0);
        setJournalsFound(0);

        // Progress simulasi untuk fase awal pencarian
        let searchingProgress = 0;
        progressInterval = setInterval(() => {
          if (searchingProgress < 30) {
            searchingProgress += 1;
            updateProgress(searchingProgress);
          }
        }, 300);

        // Mulai pencarian untuk mendapatkan taskId
        const yearString = `${startYear}-${endYear}`;
        const startResp = await startSearch(query, yearString, mode);
        const taskId = startResp.task_id;
        if (!taskId) {
          throw new Error("No task_id returned by backend");
        }

        // Cek apakah ada persentase awal dari backend
        const initialPercentage = startResp.percentage !== undefined ? Number(startResp.percentage) : null;
        
        if (cancelled) return;
        setResult({
          answer: '',
          references: [],
          bibliography: [],
          taskId,
          phase: 'waiting',
          answerPending: true,
        });
        
        // Clear progress interval yang lama
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
        
        // Gunakan persentase dari backend jika tersedia atau set ke nilai default
        if (initialPercentage !== null) {
          setProgress(initialPercentage);
        } else {
          setProgress(35); // Fallback jika backend tidak mengirim persentase awal
          
          // Hanya mulai interval simulasi jika backend tidak mengirim persentase
          let sourcesProgress = 35;
          progressInterval = setInterval(() => {
            if (sourcesProgress < 55) {
              sourcesProgress += 1;
              setProgress(sourcesProgress);
            }
          }, 500);
        }

        // Buka SSE stream dan proses event
        for await (const event of streamSearchStatus(taskId)) {
          if (cancelled) break;
          const phase = event.phase as 'sources' | 'answer' | 'completed';

          // Ambil persentase progress dari backend jika ada
          const backendPercentage = event.percentage !== undefined && event.percentage !== null ? Number(event.percentage) : null;
          
          if (phase === 'sources' && Array.isArray(event.sources)) {
            // Clear progress interval saat sumber ditemukan
            if (progressInterval) {
              clearInterval(progressInterval);
              progressInterval = null;
            }
            
            const refs = event.sources.map(normalizeSource);
            setResult(prev => ({
              ...(prev || { answer: '', references: [] }),
              references: refs,
              taskId,
              phase: 'sources',
              answerPending: true,
            }));
            setJournalsFound(refs.length);
            setSearchState("found");
            
            // Gunakan persentase dari backend jika tersedia
            if (backendPercentage !== null) {
              setProgress(backendPercentage);
            } else {
              setProgress(60); // Fallback jika backend tidak mengirim persentase
            }
            
            // Hanya mulai interval simulasi jika backend tidak mengirim persentase
            if (backendPercentage === null) {
              let processingProgress = 60;
              progressInterval = setInterval(() => {
                if (processingProgress < 85) {
                  processingProgress += 1;
                  setProgress(processingProgress);
                }
              }, 800);
            }
          }

          if (phase === 'answer') {
            // Clear progress interval saat jawaban siap
            if (progressInterval) {
              clearInterval(progressInterval);
              progressInterval = null;
            }
            
            const refs = Array.isArray(event.sources) ? event.sources.map(normalizeSource) : (result?.references || []);
            setResult(prev => ({
              ...(prev || { answer: '' , references: []}),
              references: refs,
              answer: event.answer || '',
              taskId,
              phase: 'answer',
              answerPending: false,
            }));
            setSearchState("processing");
            
            // Gunakan persentase dari backend jika tersedia
            if (backendPercentage !== null) {
              setProgress(backendPercentage);
            } else {
              setProgress(90); // Fallback jika backend tidak mengirim persentase
            }
            
            // Hanya mulai interval simulasi jika backend tidak mengirim persentase
            if (backendPercentage === null) {
              let finalizingProgress = 90;
              progressInterval = setInterval(() => {
                if (finalizingProgress < 98) {
                  finalizingProgress += 1;
                  setProgress(finalizingProgress);
                }
              }, 500);
            }
          }

          if (phase === 'completed') {
            // Clear progress interval saat selesai
            if (progressInterval) {
              clearInterval(progressInterval);
              progressInterval = null;
            }
            
            const refs = Array.isArray(event.sources) ? event.sources.map(normalizeSource) : (result?.references || []);
            const bib = Array.isArray(event.bibliography) ? event.bibliography : [];
            setResult(prev => ({
              ...(prev || { answer: '' , references: []}),
              references: refs,
              answer: event.answer || (prev?.answer || ''),
              bibliography: bib,
              taskId,
              phase: 'completed',
              answerPending: false,
            }));
            setSearchState("complete");
            setProgress(100); // Selalu set ke 100% ketika completed
            break; // SSE selesai
          }
          
          // Update progress jika ada perubahan persentase dari backend (untuk status lainnya)
          if (backendPercentage !== null && phase !== 'sources' && phase !== 'answer' && phase !== 'completed') {
            setProgress(backendPercentage);
          }
        }
      } catch (error: any) {
        console.error("SSE search error:", error);
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
        
        // Check if this is a rate limit error (HTTP 429)
        const isRateLimitError = error?.message?.includes('429') || 
                                 error?.status === 429 || 
                                 error?.statusCode === 429;
        
        if (isRateLimitError) {
          // Rate limit error - kuota pencarian harian sudah habis
          setResult({
            answer: '### Batas Pencarian  Tercapai\n\nMaaf, kuota pencarian Anda telah habis. Silakan upgrade ke paket premium untuk mendapatkan kuota pencarian yang lebih banyak.',
            references: [],
            phase: 'completed',
            answerPending: false,
            taskId: '',
          });
          setSearchState("complete");
          setProgress(100);
          
          // Set remaining quota to 0 in localStorage if it's not already set
          try {
            localStorage.setItem('searchQuotaRemaining', '0');
          } catch (e) {
            console.warn('Failed to update quota info in localStorage:', e);
          }
        }
        // Regular error handling for other types of errors
        else if (result && result.references && result.references.length > 0) {
          // Jika sudah memiliki beberapa hasil, tetap tampilkan dengan pesan error
          setResult(prev => ({
            ...(prev || { answer: '', references: [] }),
            answer: prev?.answer || 'Maaf, terjadi kesalahan saat mengambil jawaban lengkap. Namun beberapa referensi telah ditemukan.',
            answerPending: false,
          }));
          setSearchState("complete");
          setProgress(100);
        } else {
          // Tampilkan pesan error jika tidak ada hasil sama sekali
          setResult({
            answer: 'Maaf, terjadi kesalahan saat menghubungi backend. Silakan coba lagi dalam beberapa saat.',
            references: [],
            phase: 'completed',
            answerPending: false,
            taskId: '',
          });
          setSearchState("complete");
          setProgress(100);
        }
      }
    };

    runSseFlow();

    return () => {
      cancelled = true;
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
    };
  }, [query, startYear, endYear, mode]);

  // Tampilkan referensi segera saat sources tersedia, tapi jawaban masih loading
  if (searchState !== "complete" && (!result || !result.references || result.references.length === 0)) {
    return (
      <EnhancedLoading
        currentStep={currentLoadingStep}
        progress={progress}
        journalsFound={journalsFound}
      />
    );
  }

  if (!result) {
    return (
      <div className="mt-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Tidak Ada Hasil Ditemukan
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Silakan coba kueri pencarian yang berbeda atau periksa ejaan kata kunci Anda.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Coba Pencarian Lain
          </button>
        </div>
      </div>
    );
  }

  const { answer, references, bibliography } = result;
  const isAnswerPending = result.answerPending || searchState !== "complete";

  return (
    <div className="mt-8 space-y-8">
      {/* AI-generated answer section - enhanced design */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Jawaban AI
                {isAnswerPending && (
                  <span className="text-blue-200 text-sm ml-2 font-normal animate-pulse">
                    (sedang diproses...)
                  </span>
                )}
              </h2>
              <p className="text-blue-100 text-sm">
                Jawaban berdasarkan analisis jurnal akademik terkini
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {!answer && isAnswerPending && (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              <div className="flex justify-center mt-6">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          {answer && (
            <div className="prose max-w-none">
              <div
                dangerouslySetInnerHTML={{ __html: formatAnswerText(answer, query) }}
              />
            </div>
          )}
        </div>
      </div>

      {/* References section - enhanced card design */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-2 duration-500 delay-300">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Referensi Akademik</h2>
              <p className="text-green-100 text-sm">
                {references.length} sumber jurnal ditemukan
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {references.map((reference, index) => (
              <div
                key={index}
                className="animate-in slide-in-from-bottom-4 fade-in duration-500 hover:scale-[1.02] transition-transform"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'both'
                }}
              >
                <Reference
                  reference={reference}
                  index={index}
                  taskId={result.taskId}
                  bibliography={bibliography}
                />
              </div>
            ))}

            {references.length === 0 && (
              <div className="text-center py-8 animate-in fade-in duration-500 delay-500">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Tidak ada referensi ditemukan untuk pencarian ini.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchProgress({
  state,
  progress,
  journalsFound,
}: {
  state: "searching" | "found" | "processing" | "complete";
  progress: number;
  journalsFound: number;
}) {
  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex flex-col items-center mb-6">
        <h2 className="text-lg font-medium text-center mb-2">
          {progress < 25 && "Mencari sumber akademis..."}
          {progress >= 25 && progress < 50 && "Mengumpulkan sumber-sumber relevan..."}
          {progress >= 50 && progress < 75 && "Menganalisis konten akademis..."}
          {progress >= 75 && progress < 95 && "Menyusun jawaban..."}
          {progress >= 95 && progress < 100 && "Finalisasi hasil..."}
          {progress === 100 && "Pencarian selesai"}
        </h2>
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="font-semibold text-violet-600 text-xl">{journalsFound}</span>
          <span className="text-gray-600">jurnal ditemukan</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-sm font-medium text-gray-700 mb-1">{progress}% selesai</div>
          <div className="w-16 h-16 mb-2 relative">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {/* Lingkaran background */}
              <circle 
                cx="50" cy="50" r="45" 
                fill="none" 
                stroke="#e4e4e7" 
                strokeWidth="8"
              />
              {/* Lingkaran progress */}
              <circle 
                cx="50" cy="50" r="45" 
                fill="none" 
                stroke={
                  progress < 50 ? "#3b82f6" : 
                  progress < 75 ? "#8b5cf6" : 
                  progress < 95 ? "#6366f1" : 
                  "#10b981"
                }
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * progress / 100)}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
              <text 
                x="50" y="55" 
                textAnchor="middle" 
                dominantBaseline="middle" 
                fontSize="20"
                fontWeight="bold"
                fill="#4f46e5"
              >
                {Math.round(progress)}%
              </text>
            </svg>
          </div>
        </div>
        
        {progress > 0 && progress < 100 && (
          <p className="text-xs text-gray-500 mt-1 max-w-md text-center">
            {progress < 25 && "Menjalankan algoritma pencarian di database akademis dan mengindeks publikasi ilmiah yang relevan..."}
            {progress >= 25 && progress < 50 && "Menemukan dan mengevaluasi relevansi sumber-sumber akademis berdasarkan kueri pencarian..."}
            {progress >= 50 && progress < 75 && "Mengekstrak dan menganalisis data dari jurnal ilmiah untuk menyusun jawaban komprehensif..."}
            {progress >= 75 && progress < 95 && "Menyintesis informasi dan membangun jawaban berdasarkan sumber-sumber terpercaya..."}
            {progress >= 95 && progress < 100 && "Finalisasi dan memverifikasi kualitas jawaban dan referensi yang digunakan..."}
          </p>
        )}
      </div>

      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn(
            "absolute top-0 left-0 h-full transition-all duration-300 ease-in-out",
            progress < 50 ? "bg-blue-600" : 
            progress < 75 ? "bg-violet-600" : 
            progress < 95 ? "bg-indigo-600" : 
            "bg-emerald-600"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between mt-6 px-2 sm:px-6">
        <div className="flex flex-col items-center gap-1">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
              state === "searching" ? "bg-violet-600 scale-110" : state === "found" || state === "processing" || state === "complete" ? "bg-green-500" : "bg-gray-200"
            )}
          >
            {state === "searching" ? (
              <Search className="h-4 w-4 text-white animate-pulse" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-white" />
            )}
          </div>
          <span
            className={cn(
              "text-xs text-center",
              state === "searching"
                ? "text-violet-600 font-medium"
                : state === "found" || state === "processing" || state === "complete"
                  ? "text-green-500 font-medium"
                  : "text-gray-400"
            )}
          >
            Pencarian
          </span>
          </div>

        <div className="flex flex-col items-center gap-1">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
              state === "found" ? "bg-violet-600 scale-110" : state === "processing" || state === "complete" ? "bg-green-500" : "bg-gray-200"
            )}
          >
            {state === "found" ? (
              <Search className="h-4 w-4 text-white animate-pulse" />
            ) : state === "processing" || state === "complete" ? (
              <CheckCircle2 className="h-4 w-4 text-white" />
            ) : null}
          </div>
          <span
            className={cn(
              "text-xs text-center",
              state === "found"
                ? "text-violet-600 font-medium"
                : state === "processing" || state === "complete"
                  ? "text-green-500 font-medium"
                  : "text-gray-400"
            )}
          >
            Sumber<br/>Ditemukan
          </span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
              state === "processing" ? "bg-violet-600 scale-110" : state === "complete" ? "bg-green-500" : "bg-gray-200"
            )}
          >
            {state === "processing" ? (
              <Brain className="h-4 w-4 text-white animate-pulse" />
            ) : state === "complete" ? (
              <CheckCircle2 className="h-4 w-4 text-white" />
            ) : null}
          </div>
          <span
            className={cn(
              "text-xs text-center",
              state === "processing"
                ? "text-violet-600 font-medium"
                : state === "complete"
                  ? "text-green-500 font-medium"
                  : "text-gray-400"
            )}
          >
            Mengolah<br/>Data
          </span>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        {state === "searching" && (
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <Search className="h-6 w-6 text-blue-600 animate-bounce" />
            </div>
            <p className="text-sm text-gray-600 font-medium">
              {progress < 15 && "Menginisialisasi pencarian akademis..."}
              {progress >= 15 && progress < 30 && "Mencari jurnal ilmiah..."}
              {progress >= 30 && progress < 40 && "Menjelajahi database akademis..."}
            </p>
          </div>
        )}
        
        {state === "found" && (
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <Search className="h-6 w-6 text-blue-600 animate-bounce" />
            </div>
            <p className="text-sm text-gray-600 font-medium">
              {progress < 65 && "Mengumpulkan sumber akademis..."}
              {progress >= 65 && progress < 75 && "Mengevaluasi relevansi jurnal..."}
              {progress >= 75 && "Memproses teks akademis..."}
            </p>
          </div>
        )}
        
        {state === "processing" && (
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <Brain className="h-6 w-6 text-blue-600 animate-bounce" />
            </div>
            <p className="text-sm text-gray-600 font-medium">
              {progress < 92 && "Menganalisis konten dari sumber ilmiah..."}
              {progress >= 92 && progress < 98 && "Menyempurnakan hasil akhir..."}
              {progress >= 98 && "Hampir selesai..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Komponen untuk menampilkan teks abstrak dengan opsi "Lebih banyak..." dan "Tampilkan lebih sedikit"
function AbstractText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const maxLength = 150; // Jumlah karakter yang ditampilkan sebelum tombol "Lebih banyak..."
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  if (!text) return <p className="reference-abstract">Tidak ada abstrak tersedia</p>;
  
  if (text.length <= maxLength) {
    return <p className="reference-abstract mb-2">"{text}"</p>;
  }
  
  if (expanded) {
    return (
      <div>
        <p className="reference-abstract mb-1">"{text}"</p>
        <button 
          onClick={toggleExpanded} 
          className="text-blue-600 hover:text-blue-800 text-xs mt-1 font-medium flex items-center"
        >
          <span>Tampilkan lebih sedikit</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <p className="reference-abstract mb-1">"{text.substring(0, maxLength)}..."</p>
      <button 
        onClick={toggleExpanded} 
        className="text-blue-600 hover:text-blue-800 text-xs mt-1 font-medium flex items-center"
      >
        <span>Lebih banyak...</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

function Reference({
  reference,
  index,
  taskId,
  bibliography: allBibliography,
}: {
  reference: JournalReference;
  index: number;
  taskId?: string;
  bibliography?: string[];
}) {
  // Handle missing data in reference
  const safeReference = {
    title: reference.title || "No Title",
    authors: reference.authors || ["Unknown Author"],
    year: reference.year || "n.d.",
    journal: reference.journal || "No Journal",
    abstract: reference.abstract || "",
    pdfUrl: reference.pdfUrl || "",
    url: reference.url || "",
  };
  
  // Get bibliography entry that matches this reference's index
  const getBibliographyEntry = (): string => {
    if (!allBibliography || allBibliography.length === 0) {
      // Jika tidak ada data bibliography, gunakan format fallback
      return `${safeReference.authors.join(', ')}. (${safeReference.year}). ${safeReference.title}. ${safeReference.journal}.`;
    }
    
    // Jika bibliografi tersedia berdasarkan urutan indeks, gunakan itu
    if (allBibliography[index] && typeof allBibliography[index] === 'string') {
      return allBibliography[index];
    }
    
    // Jika tidak sesuai indeks, coba temukan berdasarkan konten
    // Cari entri bibliography yang cocok dengan referensi ini
    const titleLower = safeReference.title.toLowerCase();
    const authorLastNames = safeReference.authors.map(author => {
      const nameParts = author.split(' ');
      return nameParts[nameParts.length - 1].toLowerCase();
    });
    const yearStr = safeReference.year.toString();
    
    // Coba temukan kecocokan berdasarkan judul, penulis, atau tahun
    const matchingEntry = allBibliography.find(entry => {
      // Pastikan entry adalah string
      if (!entry || typeof entry !== 'string') return false;
      
      try {
        const entryLower = entry.toLowerCase();
        
        // Periksa kecocokan judul (lebih diprioritaskan)
        if (entryLower.includes(titleLower)) {
          return true;
        }
        
        // Periksa kecocokan nama penulis DAN tahun untuk konfirmasi
        const hasYear = entryLower.includes(yearStr);
        if (hasYear) {
          // Periksa jika nama penulis ada dalam entri
          return authorLastNames.some(name => entryLower.includes(name));
        }
      } catch (e) {
        console.error("Error processing bibliography entry:", e);
        return false;
      }
      
      return false;
    });
    
    // Gunakan entri yang cocok atau fallback ke format standar
    return matchingEntry || `${safeReference.authors.join(', ')}. (${safeReference.year}). ${safeReference.title}. ${safeReference.journal}.`;
  };
  
  // Get bibliography entry for this reference, but only if bibliography is available
  const bibliographyEntry = taskId ? getBibliographyEntry() : `${safeReference.authors.join(', ')}. (${safeReference.year}). ${safeReference.title}. ${safeReference.journal}.`;

  // State for copy button feedback
  const [copied, setCopied] = useState(false);

  const handleCopyBibliography = () => {
    navigator.clipboard.writeText(bibliographyEntry);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 hover:border-blue-300 hover:-translate-y-1 group">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
              <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 leading-tight mb-2 group-hover:text-blue-900 transition-colors duration-300">
                {safeReference.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-3">
                <span className="font-medium">{safeReference.authors.join(", ")}</span>
                <span className="text-gray-400">•</span>
                <span>{safeReference.year}</span>
                <span className="text-gray-400">•</span>
                <span className="italic">{safeReference.journal}</span>
              </div>

              {/* Abstract */}
              {safeReference.abstract && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4 border-l-4 border-blue-500">
                  <div className="text-gray-700 text-sm leading-relaxed">
                    <AbstractText text={safeReference.abstract} />
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {(safeReference.pdfUrl || safeReference.url) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {safeReference.pdfUrl && (
                    <a
                      href={safeReference.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 hover:scale-105 transition-all duration-200 border border-red-200 hover:border-red-300 hover:shadow-md min-h-[44px]"
                    >
                      <Download size={16} className="mr-2" />
                      PDF
                    </a>
                  )}
                  {safeReference.url && (
                    <a
                      href={safeReference.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-3 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 hover:scale-105 transition-all duration-200 border border-blue-200 hover:border-blue-300 hover:shadow-md min-h-[44px]"
                    >
                      <ExternalLink size={16} className="mr-2" />
                      Link
                    </a>
                  )}
                </div>
              )}

              {/* Bibliography */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <strong className="text-blue-800 text-xs">Daftar Pustaka:</strong>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`h-6 w-6 p-0 transition-all duration-200 ${
                      copied
                        ? 'text-green-600 bg-green-100'
                        : 'text-blue-600 hover:text-blue-800 hover:bg-blue-100'
                    }`}
                    onClick={handleCopyBibliography}
                    title={copied ? "Berhasil disalin!" : "Salin daftar pustaka"}
                  >
                    {copied ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <div className="text-xs text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatBibliographyText(bibliographyEntry) }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Function to format bibliography text with italic formatting
function formatBibliographyText(text: string): string {
  if (!text) return '';
  
  // Replace text between asterisks with italic HTML
  // This regex matches text between single asterisks (*text*) and replaces it with <em>text</em>
  return text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

// Function to format answer text with comprehensive markdown styling
function formatAnswerText(text: string, query?: string): string {
  try {
    // Preprocessing untuk formatting khusus
    // 1. Deteksi teks bold dengan ** yang tidak terformat dengan benar di Markdown
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // 2. Konversi URL yang belum menjadi link
    const urlRegex = /(?<![\[\(])(https?:\/\/[^\s"]+)(?![\]\)])/g;
    text = text.replace(urlRegex, '[$1]($1)');

    // Konfigurasi Marked
    // @ts-ignore - Marked tipe tidak lengkap
    marked.setOptions({
      gfm: true,                // GitHub flavored markdown
      breaks: true,             // Convert \n to <br>
    });
    
    // Proses markdown menjadi HTML
    const htmlContent = marked.parse(text) as string;
    
    // Processor untuk menambahkan kelas CSS ke elemen HTML
    const processHTML = (html: string): string => {
      let processedHTML = html;
      
      // Paragraf dengan text-justify
      processedHTML = processedHTML.replace(/<p>/g, '<p class="text-justify mb-4">');
      
      // Heading dengan ukuran dan spacing yang tepat
      processedHTML = processedHTML.replace(/<h1>/g, '<h1 class="text-2xl font-semibold mt-6 mb-4">');
      processedHTML = processedHTML.replace(/<h2>/g, '<h2 class="text-xl font-semibold mt-5 mb-3">');
      processedHTML = processedHTML.replace(/<h3>/g, '<h3 class="text-lg font-semibold mt-4 mb-3">');
      processedHTML = processedHTML.replace(/<h4>/g, '<h4 class="text-base font-semibold mt-4 mb-2">');
      processedHTML = processedHTML.replace(/<h5>/g, '<h5 class="text-sm font-semibold mt-3 mb-2">');
      processedHTML = processedHTML.replace(/<h6>/g, '<h6 class="text-xs font-semibold mt-3 mb-2">');
      
      // List dengan proper indentation dan spacing
      processedHTML = processedHTML.replace(/<ul>/g, '<ul class="list-disc pl-6 my-4">');
      processedHTML = processedHTML.replace(/<ol>/g, '<ol class="list-decimal pl-6 my-4">');
      processedHTML = processedHTML.replace(/<li>/g, '<li class="mb-1">');
      
      // Code blocks dengan syntax highlighting styling
      processedHTML = processedHTML.replace(/<pre>/g, '<pre class="bg-gray-100 p-3 rounded my-4 overflow-auto text-sm">');
      processedHTML = processedHTML.replace(/<code>/g, '<code class="font-mono text-sm bg-gray-100 px-1 py-0.5 rounded">');
      
      // Blockquote dengan styling yang lebih jelas
      processedHTML = processedHTML.replace(/<blockquote>/g, '<blockquote class="border-l-4 border-gray-300 pl-4 py-1 my-4 italic text-gray-700">');
      
      // Table styling
      processedHTML = processedHTML.replace(/<table>/g, '<table class="min-w-full border border-gray-200 my-4">');
      processedHTML = processedHTML.replace(/<thead>/g, '<thead class="bg-gray-100">');
      processedHTML = processedHTML.replace(/<th>/g, '<th class="border border-gray-200 px-4 py-2 text-left">');
      processedHTML = processedHTML.replace(/<td>/g, '<td class="border border-gray-200 px-4 py-2">');
      
      // Link styling
      processedHTML = processedHTML.replace(/<a /g, '<a class="text-blue-600 hover:underline" ');
      
      // Image styling
      processedHTML = processedHTML.replace(/<img /g, '<img class="max-w-full h-auto my-4 rounded" loading="lazy" ');
      
      // Horizontal rule
      processedHTML = processedHTML.replace(/<hr>/g, '<hr class="my-6 border-t border-gray-300">');
      
      // Highlight kata kunci pencarian jika ada
      if (query && query.trim().length > 0) {
        const keywords = query.trim().split(/\s+/)
          .filter(word => word.length > 3) // Hanya kata dengan panjang > 3 huruf
          .map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escape regex special chars
          .join('|');
        
        if (keywords) {
          const regex = new RegExp(`(${keywords})`, 'gi');
          // Hanya highlight teks di luar tag HTML
          processedHTML = processedHTML.replace(
            /(<[^>]*>|[^<]+)/g,
            match => {
              // Jika bukan tag HTML, lakukan highlighting
              if (!match.startsWith('<') && !match.endsWith('>')) {
                return match.replace(
                  regex, 
                  '<span class="bg-yellow-100 rounded px-0.5">$1</span>'
                );
              }
              return match;
            }
          );
        }
      }
      
      return processedHTML;
    };

    const processedHTML = processHTML(htmlContent);

    // Wrap the entire content in a div with a class for global styling
    return `<div class="text-gray-800 search-results-content">${processedHTML}</div>`;
  } catch (error) {
    console.error('Error parsing markdown:', error);
    // Fallback dengan minimal formatting untuk handling error
    const safeText = text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n\n/g, '</p><p class="text-justify mb-4">') // Paragraf
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>'); // Bold text
      
    return `<div class="text-gray-800 search-results-content"><p class="text-justify mb-4">${safeText}</p></div>`;
  }
}
