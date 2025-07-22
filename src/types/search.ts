export interface JournalReference {
  title: string;
  authors: string[];
  year: number;
  journal: string;
  doi?: string;
  url?: string;
  pdfUrl?: string;
  abstract?: string;
}

export interface SearchResult {
  answer: string;
  references: JournalReference[];
  taskId?: string; // Task ID for tracking search with backend
}
