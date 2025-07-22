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
          No results found. Please try a different search query.
        </p>
      </div>
    );
  }

  const { answer, references } = result;

  return (
    <div className="mt-8 space-y-6">
      {/* AI-generated answer section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold mb-4">Research Answer</h2>
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: answer }} />
        </div>
      </div>

      {/* References section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold mb-4">References</h2>
        <div className="space-y-4">
          {references.map((reference, index) => (
            <JournalCard key={index} reference={reference} index={index} />
          ))}

          {references.length === 0 && (
            <p className="text-gray-600 text-center py-4">
              No references available for this search.
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
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-blue-100 p-3 rounded-full">
          <Brain className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-medium">Analyzing academic sources...</h2>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-gray-500">Found: </span>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-blue-600">
                {journalsFound}
              </span>
              <span className="text-sm text-gray-500">journals</span>
              <span className="ml-4 text-sm font-medium text-gray-500">
                {progress}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative h-2 bg-blue-100 rounded-full overflow-hidden mt-2">
        <div
          className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between mt-4">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center",
              state === "searching" ? "bg-blue-600" : "bg-green-500",
            )}
          >
            {state === "searching" ? (
              <Search className="h-3 w-3 text-white" />
            ) : (
              <CheckCircle2 className="h-3 w-3 text-white" />
            )}
          </div>
          <span
            className={cn(
              "text-sm",
              state === "searching"
                ? "text-blue-600 font-medium"
                : "text-green-500 font-medium",
            )}
          >
            Searching
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center",
              state === "found"
                ? "bg-blue-600"
                : state === "searching"
                  ? "bg-gray-200"
                  : "bg-green-500",
            )}
          >
            {state === "found" ? (
              <Search className="h-3 w-3 text-white" />
            ) : state !== "searching" ? (
              <CheckCircle2 className="h-3 w-3 text-white" />
            ) : null}
          </div>
          <span
            className={cn(
              "text-sm",
              state === "found"
                ? "text-blue-600 font-medium"
                : state === "searching"
                  ? "text-gray-400"
                  : "text-green-500 font-medium",
            )}
          >
            Found Sources
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center",
              state === "processing"
                ? "bg-blue-600"
                : state === "complete"
                  ? "bg-green-500"
                  : "bg-gray-200",
            )}
          >
            {state === "processing" ? (
              <Brain className="h-3 w-3 text-white" />
            ) : state === "complete" ? (
              <CheckCircle2 className="h-3 w-3 text-white" />
            ) : null}
          </div>
          <span
            className={cn(
              "text-sm",
              state === "processing"
                ? "text-blue-600 font-medium"
                : state === "complete"
                  ? "text-green-500 font-medium"
                  : "text-gray-400",
            )}
          >
            Processing
          </span>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
            <Brain className="h-6 w-6 text-blue-600 animate-bounce" />
          </div>
          <p className="text-sm text-gray-500">Analyzing content...</p>
        </div>
      </div>
    </div>
  );
}

function JournalCard({
  reference,
  index,
}: {
  reference: JournalReference;
  index: number;
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-medium text-lg">{reference.title}</h3>
          <p className="text-gray-600 mt-1">
            {reference.authors.join(", ")} ({reference.year})
          </p>
          <p className="text-gray-500 text-sm mt-2">{reference.journal}</p>
          {reference.abstract && (
            <p className="text-gray-700 mt-3 text-sm line-clamp-3">
              {reference.abstract}
            </p>
          )}
        </div>
        <div className="ml-4 flex flex-col items-center justify-center bg-gray-50 rounded-lg p-3 text-center min-w-[60px]">
          <span className="text-2xl font-bold text-blue-600">{index + 1}</span>
          <span className="text-xs text-gray-500">Ref</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {reference.doi && (
          <Button variant="outline" size="sm" asChild>
            <a
              href={`https://doi.org/${reference.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" /> DOI
            </a>
          </Button>
        )}

        {reference.pdfUrl && (
          <Button variant="outline" size="sm" asChild>
            <a
              href={reference.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <Download className="h-3 w-3" /> PDF
            </a>
          </Button>
        )}

        {reference.url && (
          <Button variant="outline" size="sm" asChild>
            <a
              href={reference.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <BookOpen className="h-3 w-3" /> View
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
