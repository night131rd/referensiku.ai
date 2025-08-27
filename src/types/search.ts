export interface JournalReference {
  title: string;
  authors: string[];
  year: number;
  journal: string; // Will be stored in uppercase format
  doi?: string;
  url?: string;
  pdfUrl?: string;
  abstract?: string;
  
  // Helper method to ensure journal name is always uppercase
  // This is a computed property and doesn't need to be provided when creating objects
  journalUppercase?: string;
}

export interface SearchResult {
  answer: string;
  references: JournalReference[];
  taskId?: string; // Task ID for tracking search with backend
  bibliography?: string[]; // Bibliography entries returned from the backend
  phase?: 'waiting' | 'sources' | 'answer' | 'completed'; // Current phase of search process
  answerPending?: boolean; // Whether the answer is still being generated
  bibliographyPending?: boolean; // Whether the bibliography is still being generated
}
