import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  LibraryItem,
  Collection,
  Bookmark,
  Note,
  ReadingGoal,
  ReadingSession,
  ReadingStatus,
  BookCatalogItem
} from '../types';

// ==================== USER LIBRARY ====================

export function subscribeToUserLibrary(
  userId: string,
  onUpdate: (items: LibraryItem[]) => void,
  onError?: (err: any) => void
) {
  const q = query(
    collection(db, 'library'),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: LibraryItem[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as LibraryItem);
      });
      // Sort by updatedAt descending
      items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      onUpdate(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, 'library');
    }
  );
}

function cleanObject<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

export async function addOrUpdateBookInLibrary(
  userId: string,
  book: BookCatalogItem,
  status: ReadingStatus = 'want_to_read',
  pageCount?: number
): Promise<LibraryItem> {
  const libraryItemId = `lib_${userId}_${book.id.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  const docRef = doc(db, 'library', libraryItemId);
  const now = new Date().toISOString();

  try {
    let existingItem: LibraryItem | null = null;
    try {
      const existing = await getDoc(docRef);
      if (existing.exists()) {
        existingItem = existing.data() as LibraryItem;
      }
    } catch {
      // Document may not exist or permission fallback
    }

    if (existingItem) {
      const current = existingItem;
      const updated: LibraryItem = cleanObject({
        ...current,
        status,
        updatedAt: now,
        ...(status === 'currently_reading' && !current.startedAt ? { startedAt: now } : {}),
        ...(status === 'finished' ? { finishedAt: now, progressPercent: 100, currentPage: current.pageCount || book.pageCount || 100 } : {}),
      });
      await setDoc(docRef, updated);
      return updated;
    } else {
      const newItem: LibraryItem = cleanObject({
        id: libraryItemId,
        userId,
        bookId: book.id,
        title: (book.title || 'Untitled').substring(0, 256),
        authors: book.authors || [],
        coverUrl: book.coverUrl ? book.coverUrl.substring(0, 1024) : undefined,
        status,
        pageCount: pageCount || book.pageCount || 200,
        currentPage: status === 'finished' ? (pageCount || book.pageCount || 200) : 0,
        progressPercent: status === 'finished' ? 100 : 0,
        rating: 0,
        startedAt: status === 'currently_reading' ? now : undefined,
        finishedAt: status === 'finished' ? now : undefined,
        createdAt: now,
        updatedAt: now,
      });
      await setDoc(docRef, newItem);
      return newItem;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `library/${libraryItemId}`);
  }
}

export async function updateReadingProgress(
  userId: string,
  bookId: string,
  currentPage: number,
  pageCount: number
): Promise<void> {
  const libraryItemId = `lib_${userId}_${bookId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  const docRef = doc(db, 'library', libraryItemId);
  const now = new Date().toISOString();
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentPage / (pageCount || 1)) * 100)));
  const isFinished = progressPercent >= 100;

  try {
    const existing = await getDoc(docRef);
    if (existing.exists()) {
      const current = existing.data() as LibraryItem;
      await updateDoc(docRef, {
        currentPage,
        pageCount,
        progressPercent,
        lastReadAt: now,
        updatedAt: now,
        status: isFinished ? 'finished' : 'currently_reading',
        ...(isFinished && !current.finishedAt ? { finishedAt: now } : {}),
        ...(!current.startedAt ? { startedAt: now } : {}),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `library/${libraryItemId}`);
  }
}

export async function removeBookFromLibrary(userId: string, bookId: string): Promise<void> {
  const libraryItemId = `lib_${userId}_${bookId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  const docRef = doc(db, 'library', libraryItemId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `library/${libraryItemId}`);
  }
}

// ==================== COLLECTIONS ====================

export function subscribeToCollections(
  userId: string,
  onUpdate: (collections: Collection[]) => void
) {
  const q = query(
    collection(db, 'collections'),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Collection[] = [];
      snapshot.forEach((d) => items.push(d.data() as Collection));
      items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      onUpdate(items);
    },
    (err) => handleFirestoreError(err, OperationType.GET, 'collections')
  );
}

export async function createCollection(
  userId: string,
  name: string,
  description: string = '',
  color: string = '#6546D7'
): Promise<Collection> {
  const colId = `col_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const newCol: Collection = {
    id: colId,
    userId,
    name: name.trim().substring(0, 100),
    description: description.trim().substring(0, 500),
    bookIds: [],
    color,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, 'collections', colId), newCol);
    return newCol;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `collections/${colId}`);
  }
}

export async function updateCollectionDetails(
  userId: string,
  collectionId: string,
  name: string,
  description?: string,
  color?: string
): Promise<void> {
  const now = new Date().toISOString();
  try {
    await updateDoc(doc(db, 'collections', collectionId), {
      name: name.trim().substring(0, 100),
      ...(description !== undefined ? { description: description.trim().substring(0, 500) } : {}),
      ...(color ? { color } : {}),
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `collections/${collectionId}`);
  }
}

export async function toggleBookInCollection(
  userId: string,
  collectionId: string,
  bookId: string
): Promise<boolean> {
  const docRef = doc(db, 'collections', collectionId);
  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) return false;
    const data = snap.data() as Collection;
    const existing = data.bookIds || [];
    let updated: string[];
    let isAdded = false;

    if (existing.includes(bookId)) {
      updated = existing.filter(id => id !== bookId);
      isAdded = false;
    } else {
      updated = [...existing, bookId];
      isAdded = true;
    }

    await updateDoc(docRef, {
      bookIds: updated,
      updatedAt: new Date().toISOString(),
    });
    return isAdded;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `collections/${collectionId}`);
  }
}

export async function deleteCollection(collectionId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'collections', collectionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `collections/${collectionId}`);
  }
}

// ==================== BOOKMARKS ====================

export function subscribeToBookmarks(
  userId: string,
  onUpdate: (bookmarks: Bookmark[]) => void
) {
  const q = query(
    collection(db, 'bookmarks'),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Bookmark[] = [];
      snapshot.forEach(d => items.push(d.data() as Bookmark));
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(items);
    },
    (err) => handleFirestoreError(err, OperationType.GET, 'bookmarks')
  );
}

export async function addBookmark(
  userId: string,
  bookId: string,
  bookTitle: string,
  location: string,
  chapterTitle?: string,
  label?: string,
  textSnippet?: string
): Promise<Bookmark> {
  const id = `bm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const bookmark: Bookmark = {
    id,
    userId,
    bookId,
    bookTitle: bookTitle.substring(0, 256),
    location: location.substring(0, 128),
    chapterTitle: chapterTitle?.substring(0, 256),
    label: label?.substring(0, 128) || `Bookmark at ${location}`,
    textSnippet: textSnippet?.substring(0, 512),
    createdAt: now,
  };

  try {
    await setDoc(doc(db, 'bookmarks', id), cleanObject(bookmark));
    return bookmark;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `bookmarks/${id}`);
  }
}

export async function deleteBookmark(bookmarkId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'bookmarks', bookmarkId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `bookmarks/${bookmarkId}`);
  }
}

// ==================== NOTES ====================

export function subscribeToNotes(
  userId: string,
  onUpdate: (notes: Note[]) => void
) {
  const q = query(
    collection(db, 'notes'),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Note[] = [];
      snapshot.forEach(d => items.push(d.data() as Note));
      items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      onUpdate(items);
    },
    (err) => handleFirestoreError(err, OperationType.GET, 'notes')
  );
}

export async function addNote(
  userId: string,
  bookId: string,
  bookTitle: string,
  content: string,
  chapterTitle?: string,
  selectedText?: string
): Promise<Note> {
  const id = `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const note: Note = {
    id,
    userId,
    bookId,
    bookTitle: bookTitle.substring(0, 256),
    content: content.substring(0, 2048),
    chapterTitle: chapterTitle?.substring(0, 256),
    selectedText: selectedText?.substring(0, 1024),
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, 'notes', id), cleanObject(note));
    return note;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `notes/${id}`);
  }
}

export async function updateNote(noteId: string, content: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'notes', noteId), {
      content: content.substring(0, 2048),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `notes/${noteId}`);
  }
}

export async function deleteNote(noteId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'notes', noteId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `notes/${noteId}`);
  }
}

// ==================== READING SESSIONS & STATS ====================

export function subscribeToReadingSessions(
  userId: string,
  onUpdate: (sessions: ReadingSession[]) => void
) {
  const q = query(
    collection(db, 'readingSessions'),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: ReadingSession[] = [];
      snapshot.forEach(d => items.push(d.data() as ReadingSession));
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(items);
    },
    (err) => handleFirestoreError(err, OperationType.GET, 'readingSessions')
  );
}

export async function recordReadingSession(
  userId: string,
  bookId: string,
  bookTitle: string,
  durationSeconds: number,
  pagesRead: number = 0
): Promise<ReadingSession | null> {
  // Only record real reading sessions with at least 5 seconds of active reading
  if (durationSeconds < 5) return null;

  const id = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date();
  const sessionDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const session: ReadingSession = {
    id,
    userId,
    bookId,
    bookTitle: bookTitle.substring(0, 256),
    durationSeconds: Math.round(durationSeconds),
    pagesRead: Math.max(0, Math.round(pagesRead)),
    sessionDate,
    createdAt: now.toISOString(),
  };

  try {
    await setDoc(doc(db, 'readingSessions', id), session);
    return session;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `readingSessions/${id}`);
  }
}

// ==================== READING GOALS ====================

export function subscribeToGoals(
  userId: string,
  onUpdate: (goals: ReadingGoal[]) => void
) {
  const q = query(
    collection(db, 'readingGoals'),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: ReadingGoal[] = [];
      snapshot.forEach(d => items.push(d.data() as ReadingGoal));
      onUpdate(items);
    },
    (err) => handleFirestoreError(err, OperationType.GET, 'readingGoals')
  );
}

export async function setReadingGoal(
  userId: string,
  type: 'books_per_year' | 'pages_per_day' | 'minutes_per_day',
  target: number
): Promise<ReadingGoal> {
  const goalId = `goal_${userId}_${type}`;
  const now = new Date().toISOString();
  const year = new Date().getFullYear();
  const goal: ReadingGoal = {
    id: goalId,
    userId,
    type,
    target: Math.max(1, Math.round(target)),
    year,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, 'readingGoals', goalId), goal);
    return goal;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `readingGoals/${goalId}`);
  }
}

export async function deleteReadingGoal(goalId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'readingGoals', goalId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `readingGoals/${goalId}`);
  }
}

// ==================== DATA EXPORT & ACCOUNT PURGE ====================

export async function exportAllUserData(userId: string) {
  const [libSnap, colSnap, bmSnap, noteSnap, sesSnap, goalSnap] = await Promise.all([
    getDocs(query(collection(db, 'library'), where('userId', '==', userId))),
    getDocs(query(collection(db, 'collections'), where('userId', '==', userId))),
    getDocs(query(collection(db, 'bookmarks'), where('userId', '==', userId))),
    getDocs(query(collection(db, 'notes'), where('userId', '==', userId))),
    getDocs(query(collection(db, 'readingSessions'), where('userId', '==', userId))),
    getDocs(query(collection(db, 'readingGoals'), where('userId', '==', userId))),
  ]);

  const library: any[] = [];
  libSnap.forEach(d => library.push(d.data()));
  const collections: any[] = [];
  colSnap.forEach(d => collections.push(d.data()));
  const bookmarks: any[] = [];
  bmSnap.forEach(d => bookmarks.push(d.data()));
  const notes: any[] = [];
  noteSnap.forEach(d => notes.push(d.data()));
  const sessions: any[] = [];
  sesSnap.forEach(d => sessions.push(d.data()));
  const goals: any[] = [];
  goalSnap.forEach(d => goals.push(d.data()));

  return {
    exportDate: new Date().toISOString(),
    userId,
    library,
    collections,
    bookmarks,
    notes,
    readingSessions: sessions,
    readingGoals: goals,
  };
}

export async function deleteAllUserData(userId: string): Promise<void> {
  // Fetch and delete all user records securely
  const collectionsToPurge = ['library', 'collections', 'bookmarks', 'notes', 'readingSessions', 'readingGoals'];
  for (const colName of collectionsToPurge) {
    const q = query(collection(db, colName), where('userId', '==', userId));
    const snap = await getDocs(q);
    const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);
  }

  // Delete user profile doc
  await deleteDoc(doc(db, 'users', userId));
}
