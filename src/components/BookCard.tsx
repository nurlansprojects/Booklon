import React from 'react';
import { useTranslation } from 'react-i18next';
import { BookCatalogItem, LibraryItem } from '../types';
import { BookOpen, CheckCircle, BookmarkPlus } from 'lucide-react';

interface BookCardProps {
  book: BookCatalogItem | (LibraryItem & { categories?: string[]; description?: string });
  libraryItem?: LibraryItem;
  onClick: () => void;
  onQuickRead?: (e: React.MouseEvent) => void;
  onQuickAdd?: (e: React.MouseEvent) => void;
  layout?: 'grid' | 'list';
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  libraryItem,
  onClick,
  onQuickRead,
  onQuickAdd,
  layout = 'grid',
}) => {
  const { t } = useTranslation();
  const title = book.title;
  const authors = book.authors && book.authors.length > 0 ? book.authors.join(', ') : t('bookDetail.unknown');
  const coverUrl = book.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600';
  const status = libraryItem?.status || (('status' in book) ? (book as LibraryItem).status : null);
  const progressPercent = libraryItem?.progressPercent !== undefined ? libraryItem.progressPercent : (('progressPercent' in book) ? (book as LibraryItem).progressPercent : null);

  const getStatusLabel = (st: string) => {
    if (st === 'finished') return t('bookDetail.finished');
    if (st === 'currently_reading') return t('bookDetail.currentlyReading');
    if (st === 'want_to_read') return t('bookDetail.wantToRead');
    return st.replace(/_/g, ' ');
  };

  if (layout === 'list') {
    return (
      <div
        onClick={onClick}
        className="group relative flex items-center space-x-4 p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 hover:border-[#6546D7]/40 dark:hover:border-[#6546D7]/40 hover:shadow-lg hover:shadow-[#6546D7]/5 transition-all duration-200 cursor-pointer"
      >
        <div className="relative w-16 h-24 shrink-0 rounded-xl overflow-hidden shadow-md bg-neutral-200 dark:bg-neutral-800">
          <img
            src={coverUrl}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          {status === 'finished' && (
            <div className="absolute top-1 right-1 p-0.5 rounded-full bg-emerald-500 text-white shadow-sm">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            {status && (
              <span
                className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md ${
                  status === 'finished'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : status === 'currently_reading'
                    ? 'bg-[#6546D7]/15 text-[#6546D7]'
                    : 'bg-neutral-200 dark:bg-white/10 text-neutral-600 dark:text-neutral-300'
                }`}
              >
                {getStatusLabel(status)}
              </span>
            )}
          </div>
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white truncate group-hover:text-[#6546D7] transition">
            {title}
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">{authors}</p>

          {progressPercent !== null && progressPercent !== undefined && progressPercent > 0 && (
            <div className="mt-2.5 max-w-xs">
              <div className="flex justify-between text-[11px] text-neutral-500 mb-1">
                <span>{t('home.progress')}</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#6546D7] rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 flex items-center space-x-2">
          {onQuickRead && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickRead(e);
              }}
              className="p-2 rounded-xl bg-[#6546D7]/10 text-[#6546D7] hover:bg-[#6546D7] hover:text-white transition cursor-pointer"
              title={t('bookDetail.read')}
            >
              <BookOpen className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col rounded-2xl bg-white dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-white/5 hover:border-[#6546D7]/40 dark:hover:border-[#6546D7]/40 hover:shadow-xl hover:shadow-[#6546D7]/10 transition-all duration-200 overflow-hidden cursor-pointer p-3"
    >
      {/* Cover Image */}
      <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 shadow-inner mb-3">
        <img
          src={coverUrl}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
          {onQuickRead && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickRead(e);
              }}
              className="w-full py-1.5 px-3 bg-[#6546D7] text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 shadow-md hover:bg-[#5638c4] transition"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t('bookDetail.read')}</span>
            </button>
          )}
        </div>

        {/* Status Badge */}
        {status && (
          <div className="absolute top-2 left-2">
            <span
              className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full shadow-sm backdrop-blur-md ${
                status === 'finished'
                  ? 'bg-emerald-500/90 text-white'
                  : status === 'currently_reading'
                  ? 'bg-[#6546D7]/90 text-white'
                  : 'bg-black/60 text-white'
              }`}
            >
              {getStatusLabel(status)}
            </span>
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white line-clamp-1 group-hover:text-[#6546D7] transition">
            {title}
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
            {authors}
          </p>
        </div>

        {/* Progress Bar */}
        {progressPercent !== null && progressPercent !== undefined && progressPercent > 0 ? (
          <div className="mt-2.5 pt-2 border-t border-neutral-100 dark:border-white/5">
            <div className="flex justify-between text-[10px] text-neutral-500 mb-1">
              <span>{progressPercent}%</span>
              <span>{status === 'finished' ? t('bookDetail.finished') : t('bookDetail.currentlyReading')}</span>
            </div>
            <div className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#6546D7] rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        ) : onQuickAdd ? (
          <div className="mt-2.5 pt-2 border-t border-neutral-100 dark:border-white/5 flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd(e);
              }}
              className="text-[11px] text-neutral-500 hover:text-[#6546D7] flex items-center space-x-1"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>{t('bookDetail.addToLibrary')}</span>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
