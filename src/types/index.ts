export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  createdAt: string;
  updatedAt: string;
  readingTheme?: 'dark' | 'light' | 'sepia';
  fontSize?: number;
  lineHeight?: number;
  fontFamily?: 'system' | 'serif' | 'sans' | 'mono';
  marginSize?: 'compact' | 'normal' | 'spacious';
  language?: 'en' | 'uz' | 'ru';
}

export type Language = 'en' | 'uz' | 'ru';

export type ReadingStatus = 'want_to_read' | 'currently_reading' | 'finished';

export interface LibraryItem {
  id: string;
  userId: string;
  bookId: string;
  title: string;
  authors?: string[];
  coverUrl?: string;
  status: ReadingStatus;
  pageCount?: number;
  currentPage?: number;
  progressPercent?: number;
  rating?: number;
  lastReadAt?: string;
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  bookIds?: string[];
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  bookId: string;
  bookTitle: string;
  location: string;
  chapterTitle?: string;
  label?: string;
  textSnippet?: string;
  createdAt: string;
}

export interface Note {
  id: string;
  userId: string;
  bookId: string;
  bookTitle: string;
  chapterTitle?: string;
  selectedText?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type GoalType = 'books_per_year' | 'pages_per_day' | 'minutes_per_day';

export interface ReadingGoal {
  id: string;
  userId: string;
  type: GoalType;
  target: number;
  year?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingSession {
  id: string;
  userId: string;
  bookId: string;
  bookTitle: string;
  durationSeconds: number;
  pagesRead?: number;
  sessionDate?: string;
  createdAt: string;
}

export interface BookCatalogItem {
  id: string;
  title: string;
  authors: string[];
  description: string;
  coverUrl: string;
  publisher?: string;
  publishedDate?: string;
  pageCount?: number;
  categories: string[];
  language?: string;
  isbn?: string;
  previewLink?: string;
  isFullTextAvailable?: boolean;
  contentChapters?: {
    title: string;
    content: string[];
  }[];
}
