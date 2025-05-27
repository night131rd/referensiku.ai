import { JournalReference } from "@/types/search";
import { searchJournals } from "@/app/actions";
import { ExternalLink, Download, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SearchResultsProps {
  query: string;
  startYear: string;
  endYear: string;
  mode: string;
}

export default async function SearchResults({
  query,
  startYear,
  endYear,
  mode,
}: SearchResultsProps) {
  // Fetch search results using the server action
  const { answer, references } = await searchJournals(
    query,
    startYear,
    endYear,
    mode,
  );

  if (!answer) {
    return (
      <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-gray-100 text-center">
        <p className="text-gray-600">
          No results found. Please try a different search query.
        </p>
      </div>
    );
  }

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
