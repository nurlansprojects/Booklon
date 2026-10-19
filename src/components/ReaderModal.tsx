import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { BookCatalogItem, LibraryItem } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  updateReadingProgress,
  recordReadingSession,
  addBookmark,
  addNote
} from '../services/firestoreService';
import {
  X,
  Settings,
  Bookmark,
  Edit3,
  ChevronLeft,
  ChevronRight,
  List,
  Check,
  Sun,
  Moon,
  Clock
} from 'lucide-react';

interface ReaderModalProps {
  book: BookCatalogItem;
  libraryItem?: LibraryItem;
  onClose: () => void;
  onBookmarkAdded?: () => void;
  onNoteAdded?: () => void;
}

export const ReaderModal: React.FC<ReaderModalProps> = ({
  book,
  libraryItem,
  onClose,
  onBookmarkAdded,
  onNoteAdded,
}) => {
  const { t } = useTranslation();
  const { formatDuration } = useLanguage();
  const { user, profile, updateProfileSettings } = useAuth();

  // Reader Settings (Light, Dark, Sepia)
  const [readingTheme, setReadingTheme] = useState<'dark' | 'light' | 'sepia'>(
    profile?.readingTheme || 'dark'
  );
  const [fontSize, setFontSize] = useState<number>(profile?.fontSize || 18);
  const [lineHeight, setLineHeight] = useState<number>(profile?.lineHeight || 1.75);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono'>(
    (profile?.fontFamily as any) || 'serif'
  );
  const [marginSize, setMarginSize] = useState<'compact' | 'normal' | 'spacious'>(
    profile?.marginSize || 'normal'
  );

  // Reader Navigation State
  const chapters = book.contentChapters && book.contentChapters.length > 0
    ? book.contentChapters
    : [
        {
          title: t('reader.previewOverview'),
          content: [
            book.description || 'Welcome to Booklon Reader.',
            'Enjoy customizable typography, distraction-free reading, and automatic progress synchronization.'
          ]
        }
      ];

  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(() => {
    if (libraryItem?.currentPage && book.pageCount) {
      const ratio = libraryItem.currentPage / book.pageCount;
      const index = Math.floor(ratio * chapters.length);
      return Math.min(chapters.length - 1, Math.max(0, index));
    }
    return 0;
  });

  const [showControls, setShowControls] = useState<boolean>(true);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);
  const [showTocDrawer, setShowTocDrawer] = useState<boolean>(false);
  const [showNoteModal, setShowNoteModal] = useState<boolean>(false);
  const [newNoteContent, setNewNoteContent] = useState<string>('');
  const [selectedQuote, setSelectedQuote] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Reading Session Tracker
  const [secondsSpent, setSecondsSpent] = useState<number>(0);
  const isTrackingRef = useRef<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Track real active reading time (pauses if user leaves tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      isTrackingRef.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const interval = setInterval(() => {
      if (isTrackingRef.current) {
        setSecondsSpent((prev) => prev + 1);
      }
    }, 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  // Save reading progress on chapter navigation
  useEffect(() => {
    if (!user) return;
    const totalChapters = chapters.length;
    const estimatedCurrentPage = Math.round(((currentChapterIndex + 1) / totalChapters) * (book.pageCount || 200));

    updateReadingProgress(user.uid, book.id, estimatedCurrentPage, book.pageCount || 200).catch(console.error);
  }, [currentChapterIndex, user, book.id, book.pageCount, chapters.length]);

  // Clean close handler saving reading session to Firestore
  const handleExitReader = async () => {
    if (user && secondsSpent >= 5) {
      const estimatedPages = Math.max(1, Math.round(secondsSpent / 60)); // ~1 page per minute
      try {
        await recordReadingSession(user.uid, book.id, book.title, secondsSpent, estimatedPages);
      } catch (e) {
        console.error('Failed to log reading session:', e);
      }
    }
    onClose();
  };

  // Quick Bookmark
  const handleCreateBookmark = async () => {
    if (!user) return;
    const chapter = chapters[currentChapterIndex];
    const snippet = chapter.content[0] || '';
    const loc = `Chapter ${currentChapterIndex + 1}`;
    try {
      await addBookmark(
        user.uid,
        book.id,
        book.title,
        loc,
        chapter.title,
        `Page ${Math.round(((currentChapterIndex + 1) / chapters.length) * (book.pageCount || 100))}`,
        snippet.substring(0, 200)
      );
      showToast(t('reader.bookmarkSaved'));
      if (onBookmarkAdded) onBookmarkAdded();
    } catch (e) {
      showToast(t('reader.errorSaving'));
    }
  };

  // Quick Note creation
  const handleSaveNote = async () => {
    if (!user || !newNoteContent.trim()) return;
    const chapter = chapters[currentChapterIndex];
    try {
      await addNote(
        user.uid,
        book.id,
        book.title,
        newNoteContent.trim(),
        chapter.title,
        selectedQuote || undefined
      );
      setNewNoteContent('');
      setSelectedQuote('');
      setShowNoteModal(false);
      showToast(t('reader.noteSaved'));
      if (onNoteAdded) onNoteAdded();
    } catch (e) {
      showToast(t('reader.errorSaving'));
    }
  };

  // Theme styles
  const themeClasses = {
    dark: 'bg-[#0E0E10] text-[#D8D8DC]',
    light: 'bg-[#F9F9FB] text-[#1A1A1E]',
    sepia: 'bg-[#F5EEDB] text-[#433422]',
  }[readingTheme];

  const headerFooterBg = {
    dark: 'bg-[#0E0E10]/90 border-white/10 text-white',
    light: 'bg-[#F9F9FB]/90 border-neutral-200 text-neutral-900',
    sepia: 'bg-[#F5EEDB]/90 border-[#E4D8BE] text-[#433422]',
  }[readingTheme];

  const marginClasses = {
    compact: 'max-w-xl px-4',
    normal: 'max-w-2xl px-6',
    spacious: 'max-w-3xl px-8',
  }[marginSize];

  const fontClass = {
    serif: 'font-serif',
    sans: 'font-sans',
    mono: 'font-mono',
  }[fontFamily];

  const currentChapter = chapters[currentChapterIndex];

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col justify-between select-text transition-colors duration-200 ${themeClasses}`}
      style={{ overflowY: 'auto' }}
    >
      {/* Toast feedback */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#6546D7] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg shadow-[#6546D7]/40 flex items-center space-x-1.5 animate-bounce">
          <Check className="w-3.5 h-3.5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Floating App Bar */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 border-b backdrop-blur-md px-4 py-3 flex items-center justify-between ${headerFooterBg} ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
        }`}
      >
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExitReader}
            className="p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer"
            title={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-[200px] sm:max-w-md truncate">
            <h3 className="text-xs sm:text-sm font-bold truncate">{book.title}</h3>
            <p className="text-[10px] opacity-60 truncate">{currentChapter?.title}</p>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Real Session Timer Indicator */}
          <div className="hidden sm:flex items-center space-x-1 text-[11px] opacity-70 px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5">
            <Clock className="w-3 h-3 text-[#6546D7]" />
            <span>{formatDuration(secondsSpent)}</span>
          </div>

          <button
            onClick={() => setShowTocDrawer(true)}
            className="p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer"
            title={t('reader.tableOfContents')}
          >
            <List className="w-4 h-4" />
          </button>

          <button
            onClick={handleCreateBookmark}
            className="p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer text-[#6546D7]"
            title={t('reader.addBookmark')}
          >
            <Bookmark className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowNoteModal(true)}
            className="p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer"
            title={t('reader.addReadingNote')}
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className="p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer"
            title={t('reader.readingSettings')}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Reading Text Flow */}
      <main
        onClick={() => setShowControls((prev) => !prev)}
        className={`flex-1 w-full mx-auto py-12 cursor-pointer ${marginClasses}`}
      >
        <div className="mb-10 text-center border-b border-black/10 dark:border-white/10 pb-6">
          <span className="text-xs uppercase tracking-widest text-[#6546D7] font-semibold">
            {t('reader.chapterOf', { current: currentChapterIndex + 1, total: chapters.length })}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2 tracking-tight">
            {currentChapter?.title}
          </h2>
        </div>

        <article
          className={`space-y-6 ${fontClass} leading-relaxed`}
          style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}
        >
          {currentChapter?.content.map((para, i) => (
            <p
              key={i}
              className="text-justify transition-opacity hover:opacity-90"
              onMouseUp={() => {
                const sel = window.getSelection()?.toString();
                if (sel && sel.trim().length > 3) {
                  setSelectedQuote(sel.trim());
                }
              }}
            >
              {para}
            </p>
          ))}
        </article>

        {/* End of Chapter Navigation Trigger */}
        <div className="mt-16 pt-8 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
          <button
            disabled={currentChapterIndex === 0}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentChapterIndex((prev) => Math.max(0, prev - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 disabled:opacity-30 disabled:pointer-events-none hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t('reader.previousChapter')}</span>
          </button>

          <span className="text-xs opacity-60">
            {t('reader.finishedPercent', { percent: Math.round(((currentChapterIndex + 1) / chapters.length) * 100) })}
          </span>

          <button
            disabled={currentChapterIndex === chapters.length - 1}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentChapterIndex((prev) => Math.min(chapters.length - 1, prev + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#6546D7] text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-[#5638c4] text-xs font-semibold cursor-pointer"
          >
            <span>{t('reader.nextChapter')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* Bottom Progress Bar */}
      <footer
        className={`sticky bottom-0 z-40 transition-all duration-300 border-t backdrop-blur-md px-6 py-3 flex items-center justify-between ${headerFooterBg} ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
        }`}
      >
        <button
          disabled={currentChapterIndex === 0}
          onClick={() => setCurrentChapterIndex((prev) => Math.max(0, prev - 1))}
          className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Progress Slider */}
        <div className="flex-1 mx-4 max-w-md">
          <div className="flex justify-between text-[10px] opacity-70 mb-1">
            <span>{t('reader.chapterOf', { current: currentChapterIndex + 1, total: chapters.length })}</span>
            <span>{Math.round(((currentChapterIndex + 1) / chapters.length) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#6546D7] rounded-full transition-all duration-300"
              style={{ width: `${((currentChapterIndex + 1) / chapters.length) * 100}%` }}
            />
          </div>
        </div>

        <button
          disabled={currentChapterIndex === chapters.length - 1}
          onClick={() => setCurrentChapterIndex((prev) => Math.min(chapters.length - 1, prev + 1))}
          className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </footer>

      {/* Reader Settings Drawer Modal */}
      {showSettingsDrawer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-sm h-full bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800 mb-6">
                <h4 className="text-base font-bold text-neutral-900 dark:text-white">{t('reader.readingSettings')}</h4>
                <button
                  onClick={() => setShowSettingsDrawer(false)}
                  className="p-1 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Theme Choices */}
              <div className="mb-6">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-2.5">
                  {t('reader.theme')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setReadingTheme('dark');
                      updateProfileSettings({ readingTheme: 'dark' });
                    }}
                    className={`py-3 px-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 border cursor-pointer ${
                      readingTheme === 'dark'
                        ? 'border-[#6546D7] bg-black text-white ring-2 ring-[#6546D7]/40'
                        : 'border-neutral-700 bg-neutral-900 text-neutral-400'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>{t('reader.themeDark')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setReadingTheme('sepia');
                      updateProfileSettings({ readingTheme: 'sepia' });
                    }}
                    className={`py-3 px-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 border cursor-pointer ${
                      readingTheme === 'sepia'
                        ? 'border-[#6546D7] bg-[#F5EEDB] text-[#433422] ring-2 ring-[#6546D7]/40'
                        : 'border-[#E4D8BE] bg-[#F5EEDB]/80 text-[#433422]'
                    }`}
                  >
                    <span>{t('reader.themeSepia')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setReadingTheme('light');
                      updateProfileSettings({ readingTheme: 'light' });
                    }}
                    className={`py-3 px-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 border cursor-pointer ${
                      readingTheme === 'light'
                        ? 'border-[#6546D7] bg-white text-neutral-900 ring-2 ring-[#6546D7]/40'
                        : 'border-neutral-300 bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>{t('reader.themeLight')}</span>
                  </button>
                </div>
              </div>

              {/* Font Size */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2.5">
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    {t('reader.fontSize')}
                  </label>
                  <span className="text-xs font-mono text-neutral-400">{fontSize}px</span>
                </div>
                <div className="flex items-center space-x-3 bg-neutral-100 dark:bg-neutral-800 p-2.5 rounded-2xl">
                  <button
                    onClick={() => {
                      const newSize = Math.max(14, fontSize - 2);
                      setFontSize(newSize);
                      updateProfileSettings({ fontSize: newSize });
                    }}
                    className="p-2 rounded-xl bg-white dark:bg-neutral-700 text-xs font-bold text-neutral-800 dark:text-white cursor-pointer"
                  >
                    A-
                  </button>
                  <input
                    type="range"
                    min="14"
                    max="28"
                    step="1"
                    value={fontSize}
                    onChange={(e) => {
                      const newSize = Number(e.target.value);
                      setFontSize(newSize);
                      updateProfileSettings({ fontSize: newSize });
                    }}
                    className="flex-1 accent-[#6546D7]"
                  />
                  <button
                    onClick={() => {
                      const newSize = Math.min(28, fontSize + 2);
                      setFontSize(newSize);
                      updateProfileSettings({ fontSize: newSize });
                    }}
                    className="p-2 rounded-xl bg-white dark:bg-neutral-700 text-sm font-bold text-neutral-800 dark:text-white cursor-pointer"
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* Typography Family */}
              <div className="mb-6">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-2.5">
                  {t('reader.typeface')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['serif', 'sans', 'mono'] as const).map((fam) => (
                    <button
                      key={fam}
                      onClick={() => {
                        setFontFamily(fam);
                        updateProfileSettings({ fontFamily: fam });
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-medium capitalize border cursor-pointer ${
                        fontFamily === fam
                          ? 'border-[#6546D7] bg-[#6546D7]/15 text-[#6546D7] font-bold'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {fam}
                    </button>
                  ))}
                </div>
              </div>

              {/* Margins */}
              <div className="mb-6">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-2.5">
                  {t('reader.margins')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['compact', 'normal', 'spacious'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setMarginSize(m);
                        updateProfileSettings({ marginSize: m });
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-medium capitalize border cursor-pointer ${
                        marginSize === m
                          ? 'border-[#6546D7] bg-[#6546D7]/15 text-[#6546D7] font-bold'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {m === 'compact' ? t('reader.compact') : m === 'normal' ? t('reader.normal') : t('reader.spacious')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSettingsDrawer(false)}
              className="w-full py-3 bg-[#6546D7] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#5638c4] transition cursor-pointer"
            >
              {t('common.done')}
            </button>
          </div>
        </div>
      )}

      {/* Table of Contents Drawer */}
      {showTocDrawer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-start">
          <div className="w-full max-w-sm h-full bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800 mb-4">
                <h4 className="text-base font-bold text-neutral-900 dark:text-white">{t('reader.tableOfContents')}</h4>
                <button
                  onClick={() => setShowTocDrawer(false)}
                  className="p-1 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1.5 overflow-y-auto max-h-[75vh] pr-1">
                {chapters.map((ch, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentChapterIndex(idx);
                      setShowTocDrawer(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full text-left p-3 rounded-xl text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                      idx === currentChapterIndex
                        ? 'bg-[#6546D7] text-white font-bold shadow-sm'
                        : 'hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <span className="truncate pr-2">{ch.title}</span>
                    <span className="text-[10px] opacity-70 shrink-0">Ch. {idx + 1}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Note Creation Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-base font-bold text-neutral-900 dark:text-white">{t('reader.addReadingNote')}</h4>
              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setSelectedQuote('');
                }}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedQuote && (
              <div className="p-3 mb-4 rounded-xl bg-[#6546D7]/10 border-l-2 border-[#6546D7] text-xs text-neutral-700 dark:text-neutral-300 italic">
                "{selectedQuote}"
              </div>
            )}

            <textarea
              rows={4}
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder={t('reader.notePlaceholder')}
              className="w-full p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#6546D7] mb-4"
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setSelectedQuote('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSaveNote}
                disabled={!newNoteContent.trim()}
                className="px-5 py-2 rounded-xl bg-[#6546D7] text-white text-xs font-bold disabled:opacity-40 hover:bg-[#5638c4] transition cursor-pointer"
              >
                {t('reader.saveNote')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
