import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { BookCatalogItem, LibraryItem } from '../types';
import { BookCard } from './BookCard';
import { Search, Compass, BookOpen, Sparkles, ArrowRight } from 'lucide-react';

interface HomeDashboardProps {
  library: LibraryItem[];
  catalogClassics: BookCatalogItem[];
  onSelectBook: (book: BookCatalogItem) => void;
  onOpenReaderForLibraryItem: (item: LibraryItem) => void;
  onNavigateToDiscover: (category?: string) => void;
  onNavigateToLibrary: () => void;
  onOpenSearch: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  library,
  catalogClassics,
  onSelectBook,
  onOpenReaderForLibraryItem,
  onNavigateToDiscover,
  onNavigateToLibrary,
  onOpenSearch,
}) => {
  const { t } = useTranslation();
  const { profile, user } = useAuth();

  const displayName = profile?.displayName || user?.displayName || 'Reader';
  const firstName = displayName.split(' ')[0];

  // Continue reading: items currently being read or with > 0 progress
  const continueReadingItems = library.filter(
    (item) => item.status === 'currently_reading' || (item.progressPercent && item.progressPercent > 0 && item.progressPercent < 100)
  );

  // Categories
  const categories = [
    { key: 'Fiction', label: t('categories.fiction') },
    { key: 'Classic', label: t('categories.classic') },
    { key: 'Mystery', label: t('categories.mystery') },
    { key: 'Romance', label: t('categories.romance') },
    { key: 'Science Fiction', label: t('categories.scienceFiction') },
    { key: 'Philosophy', label: t('categories.philosophy') },
    { key: 'Biography', label: t('categories.biography') },
    { key: 'History', label: t('categories.history') },
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Welcome Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6546D7]/15 via-purple-900/10 to-transparent p-6 sm:p-8 border border-[#6546D7]/20 backdrop-blur-md">
        <div className="max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6546D7] mb-2 block">
            {t('home.welcomeBack')}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            {t('home.happyReading', { name: firstName })}
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
            {t('home.homeSubtitle')}
          </p>

          {/* Search Trigger */}
          <div
            onClick={onOpenSearch}
            className="mt-6 flex items-center space-x-3 bg-white dark:bg-neutral-900/90 border border-neutral-200 dark:border-white/10 px-4 py-3 rounded-2xl shadow-sm cursor-pointer hover:border-[#6546D7]/50 transition group"
          >
            <Search className="w-4 h-4 text-neutral-400 group-hover:text-[#6546D7] transition" />
            <span className="text-sm text-neutral-400">{t('home.searchHomePlaceholder')}</span>
          </div>
        </div>
      </section>

      {/* Continue Reading Section (VISIBLE ONLY WHEN ACTUAL PROGRESS EXISTS) */}
      {continueReadingItems.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-[#6546D7]" />
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
                {t('home.continueReading')}
              </h2>
            </div>
            <button
              onClick={onNavigateToLibrary}
              className="text-xs font-semibold text-[#6546D7] hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <span>{t('home.seeLibrary')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {continueReadingItems.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => onOpenReaderForLibraryItem(item)}
                className="group relative flex items-center space-x-4 p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 hover:border-[#6546D7]/40 shadow-sm hover:shadow-lg transition cursor-pointer"
              >
                <div className="w-16 h-22 aspect-[2/3] shrink-0 rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 shadow">
                  <img
                    src={item.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white truncate group-hover:text-[#6546D7] transition">
                    {item.title}
                  </h4>
                  <p className="text-xs text-neutral-500 truncate mt-0.5">
                    {item.authors?.join(', ') || 'Author'}
                  </p>
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] text-neutral-500 mb-1">
                      <span>{t('home.progress')}</span>
                      <span className="font-semibold text-[#6546D7]">{item.progressPercent || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#6546D7] rounded-full"
                        style={{ width: `${item.progressPercent || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Explore Popular Categories */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
          {t('home.exploreGenres')}
        </h2>
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => onNavigateToDiscover(cat.key)}
              className="px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 text-neutral-700 dark:text-neutral-300 hover:border-[#6546D7] hover:text-[#6546D7] transition cursor-pointer"
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Curated Discover Books (Full Text Available) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
              {t('home.curatedMasterpieces')}
            </h2>
          </div>
          <button
            onClick={() => onNavigateToDiscover()}
            className="text-xs font-semibold text-[#6546D7] hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <span>{t('home.exploreAll')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {catalogClassics.map((book) => {
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
      </section>
    </div>
  );
};
