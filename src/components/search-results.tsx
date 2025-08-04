"use client";

import { JournalReference } from "@/types/search";
import { searchJournals } from "@/app/actions";
import {
  ExternalLink,
  Download,
  BookOpen,
  Search,
  CheckCircle2,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

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
  const [result, setResult] = useState<{
    answer: string;
    references: JournalReference[];
    bibliography?: string[];
    taskId?: string;
  } | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      // Simulate searching phase
      setSearchState("searching");
      for (let i = 0; i <= 30; i++) {
        setProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // Simulate found sources phase
      setSearchState("found");
      const randomJournals = Math.floor(Math.random() * 15) + 5; // Random number between 5-20
      setJournalsFound(randomJournals);
      for (let i = 31; i <= 60; i++) {
        setProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // Simulate processing phase
      setSearchState("processing");
      for (let i = 61; i <= 100; i++) {
        setProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // Fetch actual results
      const data = await searchJournals(query, startYear, endYear, mode);
      setResult(data);
      setSearchState("complete");
    };

    fetchResults();
  }, [query, startYear, endYear, mode]);

  if (searchState !== "complete") {
    return (
      <SearchProgress
        state={searchState}
        progress={progress}
        journalsFound={journalsFound}
      />
    );
  }

  if (!result || !result.answer) {
    return (
      <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-gray-100 text-center">
        <p className="text-gray-600">
          Tidak ada hasil ditemukan. Silakan coba kueri pencarian yang berbeda.
        </p>
      </div>
    );
  }

  const { answer, references, bibliography } = result;

  return (
    <div className="mt-8 space-y-6">
      {/* AI-generated answer section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold mb-4">Jawaban Pencarian</h2>
        <div className="prose max-w-none">
          <div 
            dangerouslySetInnerHTML={{ __html: formatAnswerText(answer) }} 
            className="text-justify search-results-content"
          />
        </div>
      </div>

      {/* References section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold mb-4">Referensi </h2>
        <div className="space-y-4">
          {references.map((reference, index) => (
            <Reference 
              key={index} 
              reference={reference} 
              index={index} 
              taskId={result.taskId}
              bibliography={bibliography}
            />
          ))}

          {references.length === 0 && (
            <p className="text-gray-600 text-center py-4">
              Tidak ada referensi ditemukan untuk pencarian ini.
            </p>
          )}
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
        <h2 className="text-lg font-medium text-center mb-2">Menganalisis sumber akademis...</h2>
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="font-semibold text-blue-600 text-xl">{journalsFound}</span>
          <span className="text-gray-600">jurnal ditemukan</span>
        </div>
        <div className="text-sm font-medium text-gray-500 mb-2">{progress}% selesai</div>
      </div>

      <div className="relative h-2 bg-blue-100 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-violet-600 transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between mt-6 px-2 sm:px-6">
        <div className="flex flex-col items-center gap-1">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
              state === "searching" ? "bg-blue-600 scale-110" : state === "found" || state === "processing" || state === "complete" ? "bg-green-500" : "bg-gray-200"
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
                ? "text-blue-600 font-medium"
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
              state === "found" ? "bg-blue-600 scale-110" : state === "processing" || state === "complete" ? "bg-green-500" : "bg-gray-200"
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
                ? "text-blue-600 font-medium"
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
              state === "processing" ? "bg-blue-600 scale-110" : state === "complete" ? "bg-green-500" : "bg-gray-200"
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
                ? "text-blue-600 font-medium"
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
            <p className="text-sm text-gray-600 font-medium">Mencari jurnal ilmiah...</p>
          </div>
        )}
        
        {state === "found" && (
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <Search className="h-6 w-6 text-blue-600 animate-bounce" />
            </div>
            <p className="text-sm text-gray-600 font-medium">Mengumpulkan sumber akademis...</p>
          </div>
        )}
        
        {state === "processing" && (
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <Brain className="h-6 w-6 text-blue-600 animate-bounce" />
            </div>
            <p className="text-sm text-gray-600 font-medium">Menganalisis konten...</p>
          </div>
        )}
      </div>
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
  const [showFullAbstract, setShowFullAbstract] = useState(false);
  const [showBibliography, setShowBibliography] = useState(false);
  
  // Get bibliography entry that matches this reference's index

  const getBibliographyEntry = (): string => {
    if (!allBibliography || allBibliography.length === 0) {
      // Jika tidak ada data bibliography, gunakan format fallback
      return `${reference.authors.join(', ')}. (${reference.year}). ${reference.title}. ${reference.journal}.`;
    }
    
    // Cari entri bibliography yang cocok dengan referensi ini
    const titleLower = reference.title.toLowerCase();
    const authorLastNames = reference.authors.map(author => {
      const nameParts = author.split(' ');
      return nameParts[nameParts.length - 1].toLowerCase();
    });
    const yearStr = reference.year.toString();
    
    // Coba temukan kecocokan berdasarkan judul, penulis, atau tahun
    const matchingEntry = allBibliography.find(entry => {
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
      
      return false;
    });
    
    // Gunakan entri yang cocok atau fallback ke format standar
    return matchingEntry || `${reference.authors.join(', ')}. (${reference.year}). ${reference.title}. ${reference.journal}.`;
  };
  
  // Get bibliography entry for this reference
  const bibliographyEntry = getBibliographyEntry();
  
  // Toggle bibliography visibility
  const toggleBibliography = () => {
    setShowBibliography(!showBibliography);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-medium text-lg">{reference.title}</h3>
          <p className="text-gray-600 mt-1">
            {reference.authors.join(", ")} ({reference.year})
          </p>
          
          {/* External links - PDF and URL */}
          {(reference.pdfUrl || reference.url) && (
            <div className="flex space-x-2 mt-2">
              {reference.pdfUrl && (
                <a 
                  href={reference.pdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-xs hover:bg-red-100 transition-colors border border-red-200"
                >
                  <Download size={14} className="mr-1" />
                  PDF
                </a>
              )}
              {reference.url && (
                <a 
                  href={reference.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  <ExternalLink size={14} className="mr-1" />
                  Link
                </a>
              )}
            </div>
          )}
          
          <div
            className="mt-2 bg-gray-50 p-2.5 border-l-2 border-blue-500 italic relative group cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setShowFullAbstract(true)}
          >
            <p className="text-gray-700 text-sm line-clamp-3">
              {reference.abstract ? (
                `"${reference.abstract.slice(0, 150)}${reference.abstract.length > 150 ? '...' : '"'}`
              ) : (
                `"${reference.journal}"`
              )}
            </p>
            <p className="text-gray-500 text-xs mt-1 non-italic">
              {reference.journal}
            </p>
            
            {reference.abstract && reference.abstract.length > 150 && (
              <div className="absolute bottom-1 right-1 text-xs text-blue-500 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="mr-1">Lihat lengkap</span>
                <BookOpen size={14} />
              </div>
            )}
          </div>
          
          {/* Bibliography section toggle button */}
          <div className="mt-3">
            <button
              onClick={toggleBibliography}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
            >
              {showBibliography ? "Sembunyikan Daftar Pustaka" : "Tampilkan Daftar Pustaka"}
              <span className="ml-1 text-xs">
                {showBibliography ? "▲" : "▼"}
              </span>
            </button>
            
            {/* Bibliography content */}
            {showBibliography && (
              <div className="mt-2 bg-gray-50 p-3 rounded-md border border-gray-200 text-sm">
                <h4 className="font-medium mb-2 text-xs text-gray-600">Daftar Pustaka:</h4>
                <ul className="list-disc pl-4 space-y-2">
                  <li className="text-xs text-gray-700">{bibliographyEntry}</li>
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="ml-4 flex flex-col items-center justify-center bg-gray-50 rounded-lg p-3 text-center min-w-[60px]">
          <span className="text-2xl font-bold text-blue-600">{index + 1}</span>
          <span className="text-xs text-gray-500">Ref</span>
        </div>
      </div>
      
      {/* Modal for full abstract */}
      {showFullAbstract && reference.abstract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={(e) => {
          if (e.target === e.currentTarget) setShowFullAbstract(false);
        }}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{reference.title}</h3>
              <p className="text-gray-600 mb-4">
                {reference.authors.join(", ")} ({reference.year})
              </p>
              <div className="bg-gray-50 p-4 rounded-md border-l-4 border-blue-500 mb-4">
                <p className="text-gray-800">{reference.abstract}</p>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                <span className="font-medium">Sumber:</span> {reference.journal}
              </p>
              
              {/* Bibliography section in modal */}
              <div className="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
                <h4 className="font-medium mb-3 text-sm text-gray-700">Daftar Pustaka:</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li className="text-sm text-gray-700">{bibliographyEntry}</li>
                </ul>
              </div>
              
              {/* External links in modal */}
              <div className="flex space-x-3 mb-6">
                {reference.pdfUrl && (
                  <a 
                    href={reference.pdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 rounded-md bg-red-50 text-red-700 text-sm hover:bg-red-100 transition-colors border border-red-200"
                  >
                    <Download size={16} className="mr-2" />
                    Unduh PDF
                  </a>
                )}
                {reference.url && (
                  <a 
                    href={reference.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 rounded-md bg-blue-50 text-blue-700 text-sm hover:bg-blue-100 transition-colors border border-blue-200"
                  >
                    <ExternalLink size={16} className="mr-2" />
                    Buka Link
                  </a>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={() => setShowFullAbstract(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Function to format answer text with proper styling and handle numbered points
function formatAnswerText(text: string): string {
  // Check if text is already HTML
  if (text.includes('<p>') || text.includes('<div>')) {
    // For HTML content, add CSS classes to paragraphs and lists
    return text
      .replace(/<p>/g, '<p class="text-justify mb-4">')
      .replace(/<ul>/g, '<ul class="list-disc pl-6 space-y-2 mb-4">')
      .replace(/<ol>/g, '<ol class="list-decimal pl-6 space-y-2 mb-4">')
      .replace(/<li>/g, '<li class="mb-1">');
  }

  // Handle text with special formatting like "**1. Point:**"
  const specialFormatRegex = /\*\*(\d+)\.\s*(.*?)(:)?\*\*/g;
  if (specialFormatRegex.test(text)) {
    let html = '';
    
    // First, process the introduction (text before first numbered point)
    const introEndIndex = text.indexOf('**1.');
    if (introEndIndex > 0) {
      const intro = text.substring(0, introEndIndex).trim();
      if (intro) {
        html += `<p class="text-justify mb-4">${intro}</p>`;
      }
    }
    
    // Split text by numbered points
    const sections = text.split(/\*\*\d+\./);
    
    // Skip the first section (intro) since we already processed it
    for (let i = 1; i < sections.length; i++) {
      const section = sections[i];
      
      // Extract the title and content
      const titleEndIndex = section.indexOf('**');
      if (titleEndIndex === -1) continue;
      
      const title = section.substring(0, titleEndIndex).trim();
      const content = section.substring(titleEndIndex + 2).trim();
      
      // Add the formatted title
      html += `<h3 class="font-bold text-blue-700 mt-5 mb-3">${i}. ${title}</h3>`;
      
      // Process the content - handle bullet points if present
      if (content.includes('* ') || content.match(/\n\s*\*/)) {
        // Split content by lines to identify bullet points
        const lines = content.split('\n');
        let bulletList = [];
        let currentParagraph = '';
        
        for (let line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('*')) {
            // If we have accumulated paragraph text, add it first
            if (currentParagraph) {
              html += `<p class="text-justify mb-4">${currentParagraph}</p>`;
              currentParagraph = '';
            }
            
            // Add this line to bullet list
            bulletList.push(`<li class="mb-2">${trimmedLine.substring(1).trim()}</li>`);
          } else if (bulletList.length > 0) {
            // We've finished a bullet list, add it
            html += `<ul class="list-disc pl-6 space-y-2 mb-4">${bulletList.join('')}</ul>`;
            bulletList = [];
            
            // Start a new paragraph
            if (trimmedLine) {
              currentParagraph = trimmedLine;
            }
          } else {
            // Add to current paragraph or start new one
            if (currentParagraph && trimmedLine) {
              currentParagraph += ' ' + trimmedLine;
            } else if (trimmedLine) {
              currentParagraph = trimmedLine;
            } else if (currentParagraph) {
              // Empty line after paragraph - add the paragraph
              html += `<p class="text-justify mb-4">${currentParagraph}</p>`;
              currentParagraph = '';
            }
          }
        }
        
        // Add any remaining bullet list
        if (bulletList.length > 0) {
          html += `<ul class="list-disc pl-6 space-y-2 mb-4">${bulletList.join('')}</ul>`;
        }
        
        // Add any remaining paragraph
        if (currentParagraph) {
          html += `<p class="text-justify mb-4">${currentParagraph}</p>`;
        }
      } else {
        // Just regular text content - add as paragraph
        html += `<p class="text-justify mb-4">${content}</p>`;
      }
    }
    
    return html;
  }
  
  // Standard processing for text without special formatting
  let html = '';
  const paragraphs = text.split(/\n\n+/);
  
  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) continue;
    
    if (paragraph.match(/^\d+\.\s/m)) {
      // This looks like a numbered list
      const items = paragraph
        .split(/\n/)
        .filter(line => line.trim())
        .map(line => {
          // Extract just the content after the number
          const content = line.replace(/^\d+\.\s+/, '').trim();
          return `<li class="mb-2">${content}</li>`;
        });
      
      html += `<ol class="list-decimal pl-6 space-y-2 mb-4">${items.join('')}</ol>`;
    } else if (paragraph.match(/^\*\s/m)) {
      // This looks like a bullet list
      const items = paragraph
        .split(/\n/)
        .filter(line => line.trim())
        .map(line => {
          // Extract just the content after the asterisk
          const content = line.replace(/^\*\s+/, '').trim();
          return `<li class="mb-2">${content}</li>`;
        });
      
      html += `<ul class="list-disc pl-6 space-y-2 mb-4">${items.join('')}</ul>`;
    } else {
      // Regular paragraph
      html += `<p class="text-justify mb-4">${paragraph}</p>`;
    }
  }

  return html;
}
