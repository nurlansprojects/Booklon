import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { BookCatalogItem, LibraryItem, Collection, Bookmark, Note } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  addOrUpdateBookInLibrary,
  removeBookFromLibrary,
  toggleBookInCollection
} from '../services/firestoreService';
import {
  X,
  BookOpen,
  Trash2,
  Share2,
  FolderPlus,
  Check,
  Calendar,
  Layers,
  Globe,
  Hash,
  Sparkles
} from 'lucide-react';

interface BookDetailModalProps {
  book: BookCatalogItem;
  libraryItem?: LibraryItem;
  collections: Collection[];
  bookmarks: Bookmark[];
  notes: Note[];
  onClose: () => void;
  onOpenReader: () => void;
  onRefreshLibrary?: () => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  libraryItem,
  collections,
  bookmarks,
  notes,
  onClose,
  onOpenReader,
  onRefreshLibrary,
}) => {
  const { t } = useTranslation();
  const { formatNumber, formatDate } = useLanguage();
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<string>(libraryItem?.status || '');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [showCollectionModal, setShowCollectionModal] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  const bookBookmarks = bookmarks.filter((b) => b.bookId === book.id);
  const bookNotes = notes.filter((n) => n.bookId === book.id);

  const handleStatusChange = async (newStatus: any) => {
    if (!user) return;
    setIsUpdating(true);
    try {
      await addOrUpdateBookInLibrary(user.uid, book, newStatus, book.pageCount);
      setSelectedStatus(newStatus);
      if (onRefreshLibrary) onRefreshLibrary();
    } catch (e) {
      console.error('Failed to update library item:', e);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveFromLibrary = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      await removeBookFromLibrary(user.uid, book.id);
      setSelectedStatus('');
      if (onRefreshLibrary) onRefreshLibrary();
      onClose();
    } catch (e) {
      console.error('Failed to remove book:', e);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: book.title,
      text: `Check out "${book.title}" by ${book.authors.join(', ')} on Booklon!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(
          `"${book.title}" by ${book.authors.join(', ')} - Read on Booklon: ${window.location.href}`
        );
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2500);
      } catch (e) {
        console.error('Clipboard copy failed:', e);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 sm:rounded-3xl rounded-t-3xl border border-neutral-200 dark:border-white/10 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-200 dark:border-white/10 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#6546D7]/15 text-[#6546D7]">
              {book.categories[0] || 'Book'}
            </span>
            {book.isFullTextAvailable && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>{t('bookDetail.fullText')}</span>
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition cursor-pointer"
              title={t('bookDetail.shareBook')}
            >
              {copiedShare ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Hero Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative w-36 sm:w-44 aspect-[2/3] shrink-0 rounded-2xl overflow-hidden shadow-2xl bg-neutral-200 dark:bg-neutral-800">
              <img
                src={book.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600'}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white leading-snug">
                {book.title}
              </h2>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {book.authors && book.authors.length > 0 ? book.authors.join(', ') : t('bookDetail.unknown')}
              </p>

              {/* Progress display if already started */}
              {libraryItem?.progressPercent !== undefined && libraryItem.progressPercent > 0 && (
                <div className="pt-2">
                  <div className="flex justify-between text-xs text-neutral-500 mb-1">
                    <span>{t('bookDetail.readingProgress')}</span>
                    <span className="font-semibold text-[#6546D7]">{libraryItem.progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#6546D7] rounded-full"
                      style={{ width: `${libraryItem.progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                <button
                  onClick={onOpenReader}
                  className="px-5 py-2.5 rounded-xl bg-[#6546D7] text-white text-xs sm:text-sm font-semibold flex items-center space-x-2 shadow-lg shadow-[#6546D7]/25 hover:bg-[#5638c4] transition cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>
                    {libraryItem?.progressPercent && libraryItem.progressPercent > 0
                      ? t('bookDetail.continueReading')
                      : t('bookDetail.startReading')}
                  </span>
                </button>

                <button
                  onClick={() => setShowCollectionModal(true)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/5 text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>{t('bookDetail.collection')}</span>
                </button>

                {libraryItem && (
                  <button
                    onClick={handleRemoveFromLibrary}
                    disabled={isUpdating}
                    className="p-2.5 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                    title={t('common.delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Library Status Selector */}
              <div className="pt-3">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400 block mb-1.5">
                  {t('bookDetail.libraryStatus')}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'want_to_read', label: t('bookDetail.wantToRead') },
                    { id: 'currently_reading', label: t('bookDetail.currentlyReading') },
                    { id: 'finished', label: t('bookDetail.finished') },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleStatusChange(s.id)}
                      disabled={isUpdating}
                      className={`py-2 px-2 rounded-xl text-xs font-medium transition cursor-pointer border ${
                        selectedStatus === s.id
                          ? 'border-[#6546D7] bg-[#6546D7]/15 text-[#6546D7] font-bold'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-white/5'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-2xl border border-neutral-200/60 dark:border-white/5">
            <div className="flex items-center space-x-2.5">
              <Layers className="w-4 h-4 text-[#6546D7]" />
              <div>
                <div className="text-[10px] text-neutral-400">{t('bookDetail.pages')}</div>
                <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                  {book.pageCount ? formatNumber(book.pageCount) : t('bookDetail.unlisted')}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <Calendar className="w-4 h-4 text-[#6546D7]" />
              <div>
                <div className="text-[10px] text-neutral-400">{t('bookDetail.published')}</div>
                <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                  {book.publishedDate || t('bookDetail.unknown')}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <Globe className="w-4 h-4 text-[#6546D7]" />
              <div>
                <div className="text-[10px] text-neutral-400">{t('bookDetail.language')}</div>
                <div className="text-xs font-semibold uppercase text-neutral-900 dark:text-white">
                  {book.language || 'EN'}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <Hash className="w-4 h-4 text-[#6546D7]" />
              <div>
                <div className="text-[10px] text-neutral-400">{t('bookDetail.isbn')}</div>
                <div className="text-xs font-semibold truncate text-neutral-900 dark:text-white">
                  {book.isbn || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-2">
              {t('bookDetail.synopsis')}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">
              {book.description || t('bookDetail.noSynopsis')}
            </p>
            {book.publisher && (
              <p className="text-xs text-neutral-400 mt-2">
                {t('bookDetail.publishedBy', { publisher: book.publisher })}
              </p>
            )}
          </div>

          {/* User Bookmarks & Notes for this book */}
          {(bookBookmarks.length > 0 || bookNotes.length > 0) && (
            <div className="pt-4 border-t border-neutral-200 dark:border-white/10 space-y-4">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                {t('bookDetail.myBookmarksAndNotes', { count: bookBookmarks.length + bookNotes.length })}
              </h3>

              {bookBookmarks.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-neutral-400">{t('bookDetail.savedBookmarks')}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {bookBookmarks.map((bm) => (
                      <div
                        key={bm.id}
                        className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs border border-neutral-200 dark:border-white/5"
                      >
                        <div className="font-semibold text-neutral-900 dark:text-white">{bm.label}</div>
                        <div className="text-neutral-500 text-[11px] mt-0.5">{bm.chapterTitle}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {bookNotes.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-neutral-400">{t('bookDetail.personalNotes')}</div>
                  <div className="space-y-2">
                    {bookNotes.map((nt) => (
                      <div
                        key={nt.id}
                        className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs border border-neutral-200 dark:border-white/5"
                      >
                        {nt.selectedText && (
                          <div className="text-[11px] text-neutral-500 italic mb-1 border-l-2 border-[#6546D7] pl-2">
                            "{nt.selectedText}"
                          </div>
                        )}
                        <div className="text-neutral-800 dark:text-neutral-200">{nt.content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add to Collection Sub-Modal */}
      {showCollectionModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-base font-bold text-neutral-900 dark:text-white">{t('bookDetail.addToCollectionTitle')}</h4>
              <button
                onClick={() => setShowCollectionModal(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {collections.length === 0 ? (
              <p className="text-xs text-neutral-500 py-4 text-center leading-relaxed">
                {t('bookDetail.noCollectionsYet')}
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                {collections.map((col) => {
                  const isIn = col.bookIds?.includes(book.id);
                  return (
                    <button
                      key={col.id}
                      onClick={async () => {
                        if (!user) return;
                        await toggleBookInCollection(user.uid, col.id, book.id);
                      }}
                      className={`w-full p-3 rounded-xl text-xs font-semibold flex items-center justify-between border transition cursor-pointer ${
                        isIn
                          ? 'border-[#6546D7] bg-[#6546D7]/15 text-[#6546D7]'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <span>{col.name}</span>
                      {isIn && <Check className="w-4 h-4 text-[#6546D7]" />}
                    </button>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => setShowCollectionModal(false)}
              className="w-full py-2.5 bg-[#6546D7] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-[#5638c4] transition"
            >
              {t('common.done')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
