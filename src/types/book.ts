export type ReadingStatus = 'currently-reading' | 'finished' | 'for-later' | 'paused';

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  totalPages: number;
  pagesRead: number;
  publishDate: string;
  description: string;
  note: string;
  status: ReadingStatus;
  openLibraryKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult {
  key: string;
  title: string;
  author: string;
  coverUrl: string;
  firstPublishYear?: number;
  editionCount?: number;
}

export interface BookDetails {
  title: string;
  author: string;
  coverUrl: string;
  totalPages: number;
  publishDate: string;
  description: string;
  openLibraryKey: string;
}

export type CoverSize = 'small' | 'medium' | 'large';

export type ProgressInputMode = 'slider' | 'manual';

export type ThemeColor = 'purple' | 'blue' | 'teal' | 'green' | 'lime' | 'yellow' | 'orange' | 'red' | 'pink' | 'rose' | 'slate' | 'brown';
