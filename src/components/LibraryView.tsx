import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { LibraryItem, Collection, BookCatalogItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { BookCard } from './BookCard';
import {
  createCollection,
  deleteCollection,
  updateCollectionDetails
} from '../services/firestoreService';
import {
  BookmarkCheck,
  BookOpen,
  CheckCircle2,
  Clock,
  Folder,
  Plus,
  Trash2,
  Edit2,
  LayoutGrid,
  List as ListIcon,
  Search,
  FolderPlus,
  X,
  Compass,
  AlertTriangle
} from 'lucide-react';

interface LibraryViewProps {
  library: LibraryItem[];
  collections: Collection[];
  onSelectLibraryBook: (item: LibraryItem) => void;
  onOpenReader: (item: LibraryItem) => void;
  onNavigateToDiscover: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  library,
  collections,
  onSelectLibraryBook,
  onOpenReader,
  onNavigateToDiscover,
}) => {
  const { t } = useTranslation();
  const { formatBooks } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'reading' | 'want' | 'finished' | 'collections'>('all');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  // New Collection Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newColName, setNewColName] = useState<string>('');
  const [newColDesc, setNewColDesc] = useState<string>('');
  const [newColColor, setNewColColor] = useState<string>('#6546D7');

  // Edit Collection Modal State
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  // In-app Delete Collection Confirmation State
  const [collectionToDelete, setCollectionToDelete] = useState<string | null>(null);
  const [deletingCol, setDeletingCol] = useState<boolean>(false);

  // Filter items
  const filteredLibrary = library.filter((item) => {
    // Search filter
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.authors && item.authors.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase())));

    if (!matchesSearch) return false;

    // Status filter
    if (activeTab === 'reading') return item.status === 'currently_reading';
    if (activeTab === 'want') return item.status === 'want_to_read';
    if (activeTab === 'finished') return item.status === 'finished';

    // If within a collection view
    if (activeTab === 'collections' && selectedCollectionId) {
      const col = collections.find((c) => c.id === selectedCollectionId);
      return col?.bookIds?.includes(item.bookId);
    }

    return true;
  });

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newColName.trim()) return;
    try {
      await createCollection(user.uid, newColName.trim(), newColDesc.trim(), newColColor);
      setNewColName('');
      setNewColDesc('');
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to create collection:', err);
    }
  };

  const handleUpdateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingCollection || !editingCollection.name.trim()) return;
    try {
      await updateCollectionDetails(
        user.uid,
        editingCollection.id,
        editingCollection.name.trim(),
        editingCollection.description,
        editingCollection.color
      );
      setEditingCollection(null);
    } catch (err) {
      console.error('Failed to update collection:', err);
    }
  };

  const confirmDeleteCollection = async () => {
    if (!collectionToDelete) return;
    setDeletingCol(true);
    try {
      await deleteCollection(collectionToDelete);
      if (selectedCollectionId === collectionToDelete) {
        setSelectedCollectionId(null);
      }
      setCollectionToDelete(null);
    } catch (err) {
      console.error('Failed to delete collection:', err);
    } finally {
      setDeletingCol(false);
    }
  };

  const selectedCollection = collections.find((c) => c.id === selectedCollectionId);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
            {t('library.libraryTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            {t('library.booksSaved', { count: library.length })}
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {activeTab === 'collections' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[#6546D7] text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm hover:bg-[#5638c4] transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('library.newCollection')}</span>
            </button>
          )}

          <div className="flex items-center bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-xl p-1">
            <button
              onClick={() => setLayout('grid')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                layout === 'grid'
                  ? 'bg-white dark:bg-neutral-800 text-[#6546D7] shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayout('list')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                layout === 'list'
                  ? 'bg-white dark:bg-neutral-800 text-[#6546D7] shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="List view"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none border-b border-neutral-200 dark:border-white/10">
        {[
          { id: 'all', label: t('library.allBooksTab'), count: library.length },
          { id: 'reading', label: t('library.currentlyReadingTab'), count: library.filter((i) => i.status === 'currently_reading').length },
          { id: 'want', label: t('library.wantToReadTab'), count: library.filter((i) => i.status === 'want_to_read').length },
          { id: 'finished', label: t('library.finishedTab'), count: library.filter((i) => i.status === 'finished').length },
          { id: 'collections', label: t('library.collectionsTab'), count: collections.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              if (tab.id !== 'collections') setSelectedCollectionId(null);
            }}
            className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition -mb-px flex items-center space-x-1.5 cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#6546D7] text-[#6546D7]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id
                  ? 'bg-[#6546D7]/15 text-[#6546D7]'
                  : 'bg-neutral-100 dark:bg-white/5 text-neutral-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Collections Management View */}
      {activeTab === 'collections' && !selectedCollectionId && (
        <div className="space-y-4">
          {collections.length === 0 ? (
            <div className="py-16 text-center space-y-3 max-w-sm mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
                <FolderPlus className="w-8 h-8 text-[#6546D7]" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                {t('library.noCollectionsTitle')}
              </h3>
              <p className="text-xs text-neutral-500">
                {t('library.noCollectionsDesc')}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-[#6546D7] text-white rounded-xl text-xs font-semibold shadow-md inline-flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('library.createFirstCollection')}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {collections.map((col) => (
                <div
                  key={col.id}
                  onClick={() => setSelectedCollectionId(col.id)}
                  className="group relative p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 hover:border-[#6546D7]/50 transition cursor-pointer shadow-sm hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: col.color || '#6546D7' }}
                      >
                        <Folder className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-[#6546D7] transition">
                          {col.name}
                        </h4>
                        <span className="text-xs text-neutral-400">
                          {formatBooks(col.bookIds?.length || 0)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setEditingCollection(col)}
                        className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                        title={t('common.edit')}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setCollectionToDelete(col.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 cursor-pointer"
                        title={t('common.delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {col.description && (
                    <p className="text-xs text-neutral-500 mt-3 line-clamp-2">{col.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected Collection Banner */}
      {activeTab === 'collections' && selectedCollectionId && selectedCollection && (
        <div className="flex items-center justify-between p-4 bg-neutral-100 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-white/5">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedCollectionId(null)}
              className="text-xs text-[#6546D7] font-semibold hover:underline cursor-pointer"
            >
              ← {t('library.allCollectionsBack')}
            </button>
            <span className="text-neutral-400">•</span>
            <span className="text-sm font-bold text-neutral-900 dark:text-white">
              {selectedCollection.name}
            </span>
          </div>
          <span className="text-xs text-neutral-500">
            {formatBooks(filteredLibrary.length)}
          </span>
        </div>
      )}

      {/* Search within library (for books views) */}
      {(activeTab !== 'collections' || selectedCollectionId) && library.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('library.filterLibraryPlaceholder')}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#6546D7]"
          />
        </div>
      )}

      {/* Books Display */}
      {(activeTab !== 'collections' || selectedCollectionId) && (
        <>
          {filteredLibrary.length === 0 ? (
            <div className="py-20 text-center space-y-3 max-w-sm mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
                <BookmarkCheck className="w-8 h-8 text-[#6546D7]" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                {searchQuery ? t('library.noMatchingBooks') : t('library.emptyLibraryTitle')}
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {searchQuery
                  ? t('library.noMatchingDesc')
                  : t('library.emptyLibraryDesc')}
              </p>
              {!searchQuery && (
                <button
                  onClick={onNavigateToDiscover}
                  className="px-5 py-2.5 bg-[#6546D7] text-white rounded-xl text-xs font-semibold shadow-md inline-flex items-center space-x-1.5 cursor-pointer hover:bg-[#5638c4] transition"
                >
                  <Compass className="w-4 h-4" />
                  <span>{t('library.discoverBooksBtn')}</span>
                </button>
              )}
            </div>
          ) : layout === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredLibrary.map((item) => (
                <BookCard
                  key={item.id}
                  book={item as any}
                  libraryItem={item}
                  onClick={() => onSelectLibraryBook(item)}
                  onQuickRead={() => onOpenReader(item)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLibrary.map((item) => (
                <BookCard
                  key={item.id}
                  book={item as any}
                  libraryItem={item}
                  layout="list"
                  onClick={() => onSelectLibraryBook(item)}
                  onQuickRead={() => onOpenReader(item)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Collection Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCollection}
            className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <h4 className="text-base font-bold text-neutral-900 dark:text-white">
                {t('library.createNewCollection')}
              </h4>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
                {t('library.collectionName')}
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                placeholder="e.g. Sci-Fi Masterpieces, Summer 2026"
                className="w-full px-3.5 py-2.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6546D7]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
                {t('library.collectionDesc')}
              </label>
              <textarea
                rows={2}
                maxLength={500}
                value={newColDesc}
                onChange={(e) => setNewColDesc(e.target.value)}
                placeholder="A shelf for books exploring cosmic ideas and alternate realities."
                className="w-full px-3.5 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6546D7]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                {t('library.colorTheme')}
              </label>
              <div className="flex space-x-2">
                {['#6546D7', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewColColor(c)}
                    className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                      newColColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-80'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-500 hover:text-white cursor-pointer"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={!newColName.trim()}
                className="px-5 py-2 rounded-xl bg-[#6546D7] text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
              >
                {t('library.create')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Collection Modal */}
      {editingCollection && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleUpdateCollection}
            className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <h4 className="text-base font-bold text-neutral-900 dark:text-white">
                {t('library.editCollection')}
              </h4>
              <button
                type="button"
                onClick={() => setEditingCollection(null)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
                {t('library.collectionName')}
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={editingCollection.name}
                onChange={(e) => setEditingCollection({ ...editingCollection, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6546D7]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
                {t('library.collectionDesc')}
              </label>
              <textarea
                rows={2}
                maxLength={500}
                value={editingCollection.description || ''}
                onChange={(e) => setEditingCollection({ ...editingCollection, description: e.target.value })}
                className="w-full px-3.5 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6546D7]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingCollection(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-500 hover:text-white cursor-pointer"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#6546D7] text-white text-xs font-bold cursor-pointer"
              >
                {t('library.saveChanges')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Collection In-App Confirmation Modal */}
      {collectionToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-left shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">
                {t('library.deleteConfirmTitle')}
              </h4>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                {t('library.deleteConfirmDesc')}
              </p>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                disabled={deletingCol}
                onClick={() => setCollectionToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white cursor-pointer"
              >
                {t('common.cancel')}
              </button>
              <button
                disabled={deletingCol}
                onClick={confirmDeleteCollection}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                {deletingCol ? t('common.loading') : t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
