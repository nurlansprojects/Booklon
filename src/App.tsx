import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, AuthProvider } from './context/AuthContext';
import { useTheme, ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { WelcomeAuth } from './components/WelcomeAuth';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomeDashboard } from './components/HomeDashboard';
import { DiscoverView } from './components/DiscoverView';
import { LibraryView } from './components/LibraryView';
import { StatisticsView } from './components/StatisticsView';
import { ProfileView } from './components/ProfileView';
import { ReaderModal } from './components/ReaderModal';
import { BookDetailModal } from './components/BookDetailModal';
import { SearchModal } from './components/SearchModal';
import { BooklonLogo } from './components/BooklonLogo';
import {
  LibraryItem,
  Collection,
  Bookmark,
  Note,
  ReadingSession,
  ReadingGoal,
  BookCatalogItem,
} from './types';
import { PUBLIC_DOMAIN_CLASSICS, getBookById } from './services/catalogService';
import {
  subscribeToUserLibrary,
  subscribeToCollections,
  subscribeToBookmarks,
  subscribeToNotes,
  subscribeToReadingSessions,
  subscribeToGoals,
} from './services/firestoreService';

function MainApp() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('home');
  const [discoverCategory, setDiscoverCategory] = useState<string>('All');

  // Real data state synced from Firestore
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [goals, setGoals] = useState<ReadingGoal[]>([]);

  // Modals
  const [selectedBook, setSelectedBook] = useState<BookCatalogItem | null>(null);
  const [readingBook, setReadingBook] = useState<BookCatalogItem | null>(null);
  const [readingLibraryItem, setReadingLibraryItem] = useState<LibraryItem | undefined>(undefined);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Subscribe to real Firestore collections when user is authenticated
  useEffect(() => {
    if (!user) {
      setLibrary([]);
      setCollections([]);
      setBookmarks([]);
      setNotes([]);
      setSessions([]);
      setGoals([]);
      return;
    }

    const unsubLibrary = subscribeToUserLibrary(user.uid, setLibrary, (err) => {
      console.warn('Library subscription notice:', err);
    });
    const unsubCollections = subscribeToCollections(user.uid, setCollections);
    const unsubBookmarks = subscribeToBookmarks(user.uid, setBookmarks);
    const unsubNotes = subscribeToNotes(user.uid, setNotes);
    const unsubSessions = subscribeToReadingSessions(user.uid, setSessions);
    const unsubGoals = subscribeToGoals(user.uid, setGoals);

    return () => {
      unsubLibrary();
      unsubCollections();
      unsubBookmarks();
      unsubNotes();
      unsubSessions();
      unsubGoals();
    };
  }, [user]);

  // Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center space-y-4">
        <BooklonLogo size="lg" withContainer className="animate-pulse" />
        <span className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">
          {t('common.loading')}
        </span>
      </div>
    );
  }

  // Not authenticated -> Show Welcome & CONTINUE WITH GOOGLE screen
  if (!user) {
    return <WelcomeAuth />;
  }

  // Helpers to open reader
  const handleOpenReaderForBook = (book: BookCatalogItem) => {
    const libItem = library.find((l) => l.bookId === book.id);
    setReadingBook(book);
    setReadingLibraryItem(libItem);
    setSelectedBook(null);
  };

  const handleOpenReaderForLibraryItem = async (item: LibraryItem) => {
    // Look up book catalog metadata or construct item
    const fullBook = await getBookById(item.bookId);
    if (fullBook) {
      setReadingBook(fullBook);
    } else {
      setReadingBook({
        id: item.bookId,
        title: item.title,
        authors: item.authors || ['Author'],
        description: 'Enjoy your reading session in Booklon.',
        coverUrl: item.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
        categories: ['Reading'],
        pageCount: item.pageCount || 200,
        contentChapters: [
          {
            title: 'Chapter 1: Reading View',
            content: [
              `Currently reading "${item.title}" by ${item.authors?.join(', ') || 'Author'}.`,
              'Use the distraction-free reader to record notes, create bookmarks, and log your reading streak.',
            ]
          }
        ]
      });
    }
    setReadingLibraryItem(item);
    setSelectedBook(null);
  };

  const handleSelectLibraryBook = async (item: LibraryItem) => {
    const fullBook = await getBookById(item.bookId);
    if (fullBook) {
      setSelectedBook(fullBook);
    } else {
      setSelectedBook({
        id: item.bookId,
        title: item.title,
        authors: item.authors || ['Author'],
        description: 'Saved in your Booklon library.',
        coverUrl: item.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
        categories: ['Library'],
        pageCount: item.pageCount || 200,
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-neutral-50 dark:bg-black text-neutral-900 dark:text-neutral-100 flex flex-col transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 pb-24 md:pb-12">
        {activeTab === 'home' && (
          <HomeDashboard
            library={library}
            catalogClassics={PUBLIC_DOMAIN_CLASSICS}
            onSelectBook={(book) => setSelectedBook(book)}
            onOpenReaderForLibraryItem={handleOpenReaderForLibraryItem}
            onNavigateToDiscover={(cat) => {
              if (cat) setDiscoverCategory(cat);
              setActiveTab('discover');
            }}
            onNavigateToLibrary={() => setActiveTab('library')}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        )}

        {activeTab === 'discover' && (
          <DiscoverView
            library={library}
            initialCategory={discoverCategory}
            onSelectBook={(book) => setSelectedBook(book)}
          />
        )}

        {activeTab === 'library' && (
          <LibraryView
            library={library}
            collections={collections}
            onSelectLibraryBook={handleSelectLibraryBook}
            onOpenReader={handleOpenReaderForLibraryItem}
            onNavigateToDiscover={() => setActiveTab('discover')}
          />
        )}

        {activeTab === 'stats' && (
          <StatisticsView
            library={library}
            sessions={sessions}
            goals={goals}
            onNavigateToDiscover={() => setActiveTab('discover')}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView library={library} sessions={sessions} />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Modals */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          libraryItem={library.find((l) => l.bookId === selectedBook.id)}
          collections={collections}
          bookmarks={bookmarks}
          notes={notes}
          onClose={() => setSelectedBook(null)}
          onOpenReader={() => handleOpenReaderForBook(selectedBook)}
        />
      )}

      {readingBook && (
        <ReaderModal
          book={readingBook}
          libraryItem={readingLibraryItem}
          onClose={() => {
            setReadingBook(null);
            setReadingLibraryItem(undefined);
          }}
        />
      )}

      {/* Quick Search Modal */}
      <SearchModal
        library={library}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectBook={(book) => {
          setSelectedBook(book);
          setIsSearchOpen(false);
        }}
        onSelectLibraryItem={(item) => {
          handleSelectLibraryBook(item);
          setIsSearchOpen(false);
        }}
      />
    </div>
  );
}

function AppContent() {
  const { profile, updateProfileSettings } = useAuth();
  return (
    <LanguageProvider
      userLanguage={profile?.language}
      onLanguageChange={async (lang) => {
        if (profile) {
          await updateProfileSettings({ language: lang });
        }
      }}
    >
      <MainApp />
    </LanguageProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
