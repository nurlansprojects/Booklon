import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BookCatalogItem, LibraryItem } from '../types';
import { searchBooks } from '../services/catalogService';
import { Search, X, Loader2, BookOpen, BookmarkCheck, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  library: LibraryItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelectBook: (book: BookCatalogItem) => void;
  onSelectLibraryItem: (item: LibraryItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  library,
  isOpen,
  onClose,
  onSelectBook,
  onSelectLibraryItem,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState<string>('');
  const [activeScope, setActiveScope] = useState<'all' | 'library'>('all');
  const [results, setResults] = useState<BookCatalogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const books = await searchBooks(query);
        setResults(books);
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  // Filter user library items matching query
  const matchingLibraryItems = library.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      (item.authors && item.authors.some((a) => a.toLowerCase().includes(query.toLowerCase())))
  );

  const getStatusLabel = (st: string) => {
    if (st === 'finished') return t('bookDetail.finished');
    if (st === 'currently_reading') return t('bookDetail.currentlyReading');
    if (st === 'want_to_read') return t('bookDetail.wantToRead');
    return st.replace(/_/g, ' ');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-white/10 shadow-2xl overflow-hidden mt-6 sm:mt-12 flex flex-col max-h-[85vh]">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-white/10 flex items-center space-x-3">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.modalPlaceholder')}
            className="flex-1 bg-transparent text-sm sm:text-base text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-white cursor-pointer"
          >
            {t('common.esc')}
          </button>
        </div>

        {/* Scope switcher */}
        <div className="px-5 py-2.5 bg-neutral-50 dark:bg-neutral-800/50 flex items-center space-x-3 border-b border-neutral-200 dark:border-white/5">
          <button
            onClick={() => setActiveScope('all')}
            className={`text-xs font-semibold px-3 py-1 rounded-lg transition cursor-pointer ${
              activeScope === 'all'
                ? 'bg-[#6546D7] text-white'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {t('search.globalCatalog')}
          </button>
          <button
            onClick={() => setActiveScope('library')}
            className={`text-xs font-semibold px-3 py-1 rounded-lg transition flex items-center space-x-1 cursor-pointer ${
              activeScope === 'library'
                ? 'bg-[#6546D7] text-white'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <span>{t('search.mySavedLibrary')}</span>
            {matchingLibraryItems.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#6546D7]/30 text-white text-[10px] flex items-center justify-center font-bold">
                {matchingLibraryItems.length}
              </span>
            )}
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-6 h-6 text-[#6546D7] animate-spin" />
              <span className="text-xs text-neutral-400">{t('discover.searchingCatalog')}</span>
            </div>
          )}

          {!loading && !query && (
            <div className="py-12 text-center text-xs text-neutral-400 space-y-1">
              <p>{t('search.typeKeywords')}</p>
              <p className="text-[11px] text-neutral-500">{t('search.sampleQueries')}</p>
            </div>
          )}

          {!loading && query && activeScope === 'library' && (
            <>
              {matchingLibraryItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-400">
                  {t('search.noLibraryMatch', { query })}
                </div>
              ) : (
                <div className="space-y-2">
                  {matchingLibraryItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelectLibraryItem(item);
                        onClose();
                      }}
                      className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 hover:bg-[#6546D7]/10 border border-neutral-200 dark:border-white/5 flex items-center space-x-3 cursor-pointer transition"
                    >
                      <img
                        src={item.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400'}
                        alt={item.title}
                        className="w-10 h-14 object-cover rounded-lg shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                          {item.title}
                        </div>
                        <div className="text-xs text-neutral-400 truncate">
                          {item.authors?.join(', ') || 'Author'}
                        </div>
                        <div className="text-[10px] text-[#6546D7] font-semibold mt-0.5">
                          {t('bookDetail.inLibrary')} • {getStatusLabel(item.status)}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-400" />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {!loading && query && activeScope === 'all' && (
            <>
              {results.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-400">
                  {t('search.noCatalogMatch', { query })}
                </div>
              ) : (
                <div className="space-y-2">
                  {results.map((book) => (
                    <div
                      key={book.id}
                      onClick={() => {
                        onSelectBook(book);
                        onClose();
                      }}
                      className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 hover:bg-[#6546D7]/10 border border-neutral-200 dark:border-white/5 flex items-center space-x-3 cursor-pointer transition"
                    >
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-10 h-14 object-cover rounded-lg shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                          {book.title}
                        </div>
                        <div className="text-xs text-neutral-400 truncate">
                          {book.authors?.join(', ')}
                        </div>
                        <div className="text-[10px] text-neutral-500 mt-0.5">
                          {book.categories[0] || 'General'} {book.pageCount ? `• ${book.pageCount} ${t('bookDetail.pages').toLowerCase()}` : ''}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-400" />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
