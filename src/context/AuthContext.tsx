import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, testConnection, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfileSettings: (settings: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  authError: null,
  signInWithGoogle: async () => {},
  logout: async () => {},
  updateProfileSettings: async () => {},
  clearError: () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Initial connection test on boot
  useEffect(() => {
    testConnection();
  }, []);

  const syncUserProfile = async (currentUser: FirebaseUser): Promise<UserProfile> => {
    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setProfile(data);
        if (data.language && (data.language === 'en' || data.language === 'uz' || data.language === 'ru')) {
          localStorage.setItem('booklon-language', data.language);
          const i18nModule = await import('../lib/i18n');
          i18nModule.default.changeLanguage(data.language);
        }
        return data;
      } else {
        const now = new Date().toISOString();
        const savedLang = localStorage.getItem('booklon-language');
        const langToUse: 'en' | 'uz' | 'ru' = savedLang === 'uz' || savedLang === 'ru' ? savedLang : 'en';
        const newProfile: UserProfile = {
          id: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || 'Reader',
          photoURL: currentUser.photoURL || null,
          createdAt: now,
          updatedAt: now,
          readingTheme: 'dark',
          fontSize: 18,
          lineHeight: 1.7,
          fontFamily: 'serif',
          marginSize: 'normal',
          language: langToUse,
        };
        await setDoc(userDocRef, newProfile);
        setProfile(newProfile);
        return newProfile;
      }
    } catch (err: unknown) {
      console.warn('Could not sync user profile to firestore:', err);
      // Fallback local memory profile so user isn't locked out if rules are initializing
      const savedLang = localStorage.getItem('booklon-language');
      const langToUse: 'en' | 'uz' | 'ru' = savedLang === 'uz' || savedLang === 'ru' ? savedLang : 'en';
      const localProfile: UserProfile = {
        id: currentUser.uid,
        email: currentUser.email || '',
        displayName: currentUser.displayName || 'Reader',
        photoURL: currentUser.photoURL || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        readingTheme: 'dark',
        fontSize: 18,
        lineHeight: 1.7,
        fontFamily: 'serif',
        marginSize: 'normal',
        language: langToUse,
      };
      setProfile(localProfile);
      return localProfile;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          await syncUserProfile(currentUser);
        } catch (e) {
          console.error('Error loading user profile:', e);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await syncUserProfile(result.user);
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      let userFriendlyMessage = 'Failed to sign in with Google. Please try again.';
      if (error?.code === 'auth/popup-closed-by-user') {
        userFriendlyMessage = 'Sign-in window was closed before completing.';
      } else if (error?.code === 'auth/popup-blocked') {
        userFriendlyMessage = 'The Google sign-in pop-up was blocked by your browser. Please allow popups for this site.';
      } else if (error?.code === 'auth/cancelled-popup-request') {
        userFriendlyMessage = 'Sign-in process was cancelled.';
      } else if (error?.code === 'auth/network-request-failed') {
        userFriendlyMessage = 'Network error. Please check your internet connection.';
      } else if (error?.message) {
        userFriendlyMessage = error.message;
      }
      setAuthError(userFriendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
    } catch (error: any) {
      console.error('Sign out error:', error);
      setAuthError('Failed to sign out. Please try again.');
    }
  };

  const updateProfileSettings = async (settings: Partial<UserProfile>) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    const updatedData = {
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    try {
      await setDoc(userDocRef, updatedData, { merge: true });
      setProfile(prev => (prev ? { ...prev, ...updatedData } : null));
    } catch (err: unknown) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await syncUserProfile(user);
    }
  };

  const clearError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        authError,
        signInWithGoogle,
        logout,
        updateProfileSettings,
        clearError,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
