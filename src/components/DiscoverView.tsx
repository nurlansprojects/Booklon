import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { BookCatalogItem, LibraryItem } from '../types';
import { searchBooks } from '../services/catalogService';
import { BookCard } from './BookCard';
import { Search, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface DiscoverViewProps {
  library: LibraryItem[];
  initialCategory?: string;
  onSelectBook: (book: BookCatalogItem) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  library,
  initialCategory = 'All',
  onSelectBook,
}) => {
  const { t } = useTranslation();
  const { formatBooks } = useLanguage();
  const [query, setQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [sortBy, setSortBy] = useState<'relevance' | 'title' | 'date'>('relevance');
  const [books, setBooks] = useState<BookCatalogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { key: 'All', label: t('categories.all') },
    { key: 'Fiction', label: t('categories.fiction') },
    { key: 'Classic', label: t('categories.classic') },
    { key: 'Science Fiction', label: t('categories.scienceFiction') },
    { key: 'Mystery', label: t('categories.mystery') },
    { key: 'Romance', label: t('categories.romance') },
    { key: 'Philosophy', label: t('categories.philosophy') },
    { key: 'Biography', label: t('categories.biography') },
    { key: 'History', label: t('categories.history') },
    { key: 'Poetry', label: t('categories.poetry') },
  ];

  const fetchResults = async (q: string, cat: string) => {
    setLoading(true);
    setError(null);
    try {
      const results = await searchBooks(q, cat === 'All' ? undefined : cat);
      setBooks(results);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(t('discover.failedLoad'));
    } finally {
      setLoading(false);
    }
  };

  // Debounced search on query or category change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResults(query, selectedCategory);
    }, 350);

    return () => clearTimeout(timer);
  }, [query, selectedCategory]);

  // Sort logic
  const sortedBooks = [...books].sort((a, b) => {
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'date') {
      return (b.publishedDate || '').localeCompare(a.publishedDate || '');
    }
    return 0; // relevance
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Search */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
            {t('discover.title')}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            {t('discover.subtitle')}
          </p>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('discover.searchInputPlaceholder')}
            className="w-full pl-11 pr-14 py-3.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-2xl text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#6546D7] transition shadow-sm"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-white cursor-pointer"
            >
              {t('common.clear')}
            </button>
          )}
        </div>

        {/* Filter Categories Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                selectedCategory === cat.key
                  ? 'bg-[#6546D7] text-white border-[#6546D7] shadow-sm shadow-[#6546D7]/30'
                  : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-white/5 hover:border-[#6546D7]/40'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort & Results Count */}
        <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-200 dark:border-white/5">
          <span>{loading ? t('discover.searchingCatalog') : `${formatBooks(sortedBooks.length)}`}</span>
          <div className="flex items-center space-x-2">
            <span>{t('discover.sortBy')}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-neutral-700 dark:text-neutral-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="relevance">{t('discover.sortRelevance')}</option>
              <option value="title">{t('discover.sortTitle')}</option>
              <option value="date">{t('discover.sortDate')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#6546D7] animate-spin" />
          <span className="text-xs text-neutral-500 font-medium">{t('discover.searchingCatalog')}</span>
        </div>
      )}

      {/* Error State with Retry */}
      {!loading && error && (
        <div className="p-8 text-center bg-rose-500/10 border border-rose-500/20 rounded-3xl max-w-md mx-auto space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-sm font-bold text-rose-500">{t('discover.failedLoad')}</h3>
          <p className="text-xs text-neutral-400">{error}</p>
          <button
            onClick={() => fetchResults(query, selectedCategory)}
            className="px-4 py-2 bg-[#6546D7] text-white rounded-xl text-xs font-semibold inline-flex items-center space-x-1.5 cursor-pointer shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('common.tryAgain')}</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && sortedBooks.length === 0 && (
        <div className="py-20 text-center space-y-3 max-w-sm mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">{t('discover.noBooksFound')}</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            {t('discover.noBooksDesc')}
          </p>
          <button
            onClick={() => {
              setQuery('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 bg-[#6546D7] text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            {t('discover.resetFilters')}
          </button>
        </div>
      )}

      {/* Books Grid */}
      {!loading && !error && sortedBooks.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {sortedBooks.map((book) => {
            const libItem = library.find((l) => l.bookId === book.id);
            return (
              <BookCard
                key={book.id}
                book={book}
                libraryItem={libItem}
                onClick={() => onSelectBook(book)}
                onQuickRead={() => onSelectBook(book)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
