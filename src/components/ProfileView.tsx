import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { LibraryItem, ReadingSession } from '../types';
import { LanguageSelector } from './LanguageSelector';
import { exportAllUserData, deleteAllUserData } from '../services/firestoreService';
import {
  User,
  Mail,
  Shield,
  Download,
  Trash2,
  LogOut,
  Moon,
  Sun,
  Globe,
  Check,
  AlertTriangle,
  X,
  BookOpen,
  Award,
  Clock
} from 'lucide-react';

interface ProfileViewProps {
  library: LibraryItem[];
  sessions: ReadingSession[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({ library, sessions }) => {
  const { t } = useTranslation();
  const { user, profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { formatDuration, formatBooks } = useLanguage();

  const [exporting, setExporting] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'terms' | 'privacy' | 'help' | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const displayName = profile?.displayName || user?.displayName || 'Reader';
  const email = profile?.email || user?.email || '';
  const photoUrl = profile?.photoURL || user?.photoURL;

  // Real stats
  const finishedCount = library.filter((b) => b.status === 'finished').length;
  const totalSeconds = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);

  const handleExportData = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const data = await exportAllUserData(user.uid);
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `booklon-export-${user.uid}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setFeedbackMsg(t('profile.dataExportSuccess'));
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error('Export error:', err);
      setFeedbackMsg(t('profile.dataExportFailed'));
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteAllUserData(user.uid);
      await logout();
    } catch (err) {
      console.error('Account deletion error:', err);
      setFeedbackMsg(t('profile.dataExportFailed'));
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-24">
      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#6546D7] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-xl flex items-center space-x-1.5 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Profile Card */}
      <section className="relative overflow-hidden rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={displayName}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-[#6546D7]/30 shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-[#6546D7] text-white flex items-center justify-center text-2xl font-bold shadow-md">
              {displayName.charAt(0)}
            </div>
          )}

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                {displayName}
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                {t('profile.googleVerified')}
              </span>
            </div>
            <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-xs text-neutral-500">
              <Mail className="w-3.5 h-3.5" />
              <span>{email}</span>
            </div>

            {/* Quick summary metrics */}
            <div className="pt-4 flex items-center justify-center sm:justify-start space-x-6 text-xs">
              <div className="flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-[#6546D7]" />
                <span className="font-semibold text-neutral-900 dark:text-white">{library.length}</span>
                <span className="text-neutral-400">{t('profile.savedShort')}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold text-neutral-900 dark:text-white">{finishedCount}</span>
                <span className="text-neutral-400">{t('profile.finishedShort')}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="font-semibold text-neutral-900 dark:text-white">{formatDuration(totalSeconds)}</span>
                <span className="text-neutral-400">{t('profile.readShort')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Preferences & Settings */}
      <section className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 p-6 shadow-sm space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          {t('profile.appPreferences')}
        </h3>

        {/* Working Apple-inspired Language Selector with Native Names */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#6546D7]/10 flex items-center justify-center text-[#6546D7]">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {t('profile.interfaceLanguage')}
                </div>
                <div className="text-xs text-neutral-400">
                  {t('profile.selectLanguage')}
                </div>
              </div>
            </div>
          </div>

          <LanguageSelector variant="full" />
        </div>

        <div className="pt-2 border-t border-neutral-200 dark:border-white/5 space-y-2">
          {/* Theme Toggle Item */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50">
            <div className="flex items-center space-x-3">
              {theme === 'dark' ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
              <div>
                <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {t('profile.interfaceTheme')}
                </div>
                <div className="text-xs text-neutral-400">
                  {theme === 'dark' ? t('profile.currentThemeDark') : t('profile.currentThemeLight')}
                </div>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="px-3.5 py-1.5 rounded-xl bg-neutral-200 dark:bg-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-[#6546D7] hover:text-white transition cursor-pointer"
            >
              {t('profile.toggle')}
            </button>
          </div>
        </div>
      </section>

      {/* Account & Data Management */}
      <section className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          {t('profile.accountAndData')}
        </h3>

        <div className="space-y-2">
          {/* Data Export */}
          <button
            onClick={handleExportData}
            disabled={exporting}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <Download className="w-5 h-5 text-[#6546D7]" />
              <div>
                <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {t('profile.exportMyData')}
                </div>
                <div className="text-xs text-neutral-400">
                  {t('profile.exportDesc')}
                </div>
              </div>
            </div>
            <span className="text-xs text-[#6546D7] font-semibold">
              {exporting ? t('profile.exporting') : t('profile.download')}
            </span>
          </button>

          {/* Account Deletion */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 transition text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <Trash2 className="w-5 h-5 text-rose-500" />
              <div>
                <div className="text-sm font-semibold text-rose-500">
                  {t('profile.deleteAccount')}
                </div>
                <div className="text-xs text-rose-400">
                  {t('profile.deleteAccountDesc')}
                </div>
              </div>
            </div>
            <span className="text-xs text-rose-500 font-semibold">
              {t('profile.deleteBtn')}
            </span>
          </button>
        </div>
      </section>

      {/* Support & Legal */}
      <section className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          {t('profile.infoAndSupport')}
        </h3>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setModalType('privacy')}
            className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-[#6546D7] transition text-center"
          >
            {t('profile.privacyPolicy')}
          </button>
          <button
            onClick={() => setModalType('terms')}
            className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-[#6546D7] transition text-center"
          >
            {t('profile.termsOfService')}
          </button>
          <button
            onClick={() => setModalType('help')}
            className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-[#6546D7] transition text-center"
          >
            {t('profile.helpAndFaq')}
          </button>
        </div>
      </section>

      {/* Logout Button */}
      <div className="pt-2">
        <button
          onClick={logout}
          className="w-full py-4 rounded-2xl bg-neutral-100 dark:bg-neutral-900 hover:bg-rose-500/10 hover:text-rose-500 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-white/10 font-bold text-sm flex items-center justify-center space-x-2 transition cursor-pointer shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('profile.signOutBooklon')}</span>
        </button>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-left shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">
                {t('profile.deleteAccountModalTitle')}
              </h4>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                {t('profile.deleteAccountModalDesc')}
              </p>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                disabled={deleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white"
              >
                {t('common.cancel')}
              </button>
              <button
                disabled={deleting}
                onClick={handleDeleteAccount}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md"
              >
                {deleting ? t('profile.deleting') : t('profile.yesDeleteEverything')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Information Modals */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-left shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h4 className="text-base font-bold text-white">
                {modalType === 'privacy'
                  ? t('profile.privacyPolicy')
                  : modalType === 'terms'
                  ? t('profile.termsOfService')
                  : t('profile.helpAndFaq')}
              </h4>
              <button
                onClick={() => setModalType(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-neutral-300 space-y-2.5 max-h-72 overflow-y-auto pr-2 leading-relaxed">
              {modalType === 'help' ? (
                <>
                  <p>{t('auth.helpAndFaqContent1')}</p>
                  <p>{t('auth.helpAndFaqContent2')}</p>
                </>
              ) : modalType === 'privacy' ? (
                <>
                  <p>{t('auth.privacyPolicyContent1')}</p>
                  <p>{t('auth.privacyPolicyContent2')}</p>
                  <p>{t('auth.privacyPolicyContent3')}</p>
                </>
              ) : (
                <>
                  <p>{t('auth.termsOfServiceContent1')}</p>
                  <p>{t('auth.termsOfServiceContent2')}</p>
                  <p>{t('auth.termsOfServiceContent3')}</p>
                </>
              )}
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setModalType(null)}
                className="px-5 py-2 rounded-xl bg-[#6546D7] text-white text-xs font-bold"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
