import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { BooklonLogo } from './BooklonLogo';
import { LanguageSelector } from './LanguageSelector';
import { ShieldCheck, BookOpen, Sparkles, AlertCircle, X } from 'lucide-react';

export const WelcomeAuth: React.FC = () => {
  const { t } = useTranslation();
  const { signInWithGoogle, loading, authError, clearError } = useAuth();
  const [modalContent, setModalContent] = useState<'privacy' | 'terms' | null>(null);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-black text-white px-6 py-8 selection:bg-[#6546D7] selection:text-white overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#6546D7]/25 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 right-0 w-[400px] h-[400px] bg-[#6546D7]/15 rounded-full blur-[130px] pointer-events-none" />

      {/* Top Bar / Brand & Language Selector */}
      <header className="relative z-10 flex items-center justify-between max-w-md w-full mx-auto">
        <div className="flex items-center space-x-3">
          <BooklonLogo size="sm" withContainer />
          <span className="text-xl font-bold tracking-tight text-white font-sans">{t('common.appName')}</span>
        </div>
        <div className="flex items-center space-x-2">
          {/* Working language selector before authentication */}
          <LanguageSelector variant="compact" />
          <div className="hidden sm:flex items-center space-x-1.5 text-xs text-neutral-400 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-full backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t('auth.cloudSync')}</span>
          </div>
        </div>
      </header>

      {/* Center Hero Section */}
      <main className="relative z-10 flex flex-col items-center text-center max-w-md w-full mx-auto my-auto py-6">
        {/* Brand Icon Showcase */}
        <div className="relative mb-6 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#6546D7] to-purple-400 rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition duration-500" />
          <div className="relative w-24 h-24 rounded-3xl bg-[#6546D7] flex items-center justify-center shadow-2xl shadow-[#6546D7]/50 border border-white/20">
            <BooklonLogo size="xl" />
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight font-sans">
          {t('auth.brandTagline1')} <br />
          <span className="bg-gradient-to-r from-white via-neutral-200 to-purple-300 bg-clip-text text-transparent">
            {t('auth.brandTagline2')}
          </span>
        </h1>

        <p className="text-neutral-400 text-sm sm:text-base mb-6 max-w-sm font-normal leading-relaxed">
          {t('auth.brandDescription')}
        </p>

        {/* Feature Badges */}
        <div className="grid grid-cols-3 gap-2 w-full mb-8 text-left">
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-3 backdrop-blur-sm">
            <BookOpen className="w-4 h-4 text-[#6546D7] mb-1.5" />
            <div className="text-xs font-semibold text-white">{t('auth.featureReaderTitle')}</div>
            <div className="text-[10px] text-neutral-400 mt-0.5 leading-snug">{t('auth.featureReaderDesc')}</div>
          </div>
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-3 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-purple-400 mb-1.5" />
            <div className="text-xs font-semibold text-white">{t('auth.featureStatsTitle')}</div>
            <div className="text-[10px] text-neutral-400 mt-0.5 leading-snug">{t('auth.featureStatsDesc')}</div>
          </div>
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-3 backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1.5" />
            <div className="text-xs font-semibold text-white">{t('auth.featureAuthTitle')}</div>
            <div className="text-[10px] text-neutral-400 mt-0.5 leading-snug">{t('auth.featureAuthDesc')}</div>
          </div>
        </div>

        {/* Error notification if any */}
        {authError && (
          <div className="w-full mb-5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl p-3.5 flex items-start space-x-2 text-xs text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1">{authError}</div>
            <button
              onClick={clearError}
              className="text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* MANDATORY: Single Primary Action CONTINUE WITH GOOGLE */}
        <div className="w-full space-y-3">
          <button
            onClick={() => signInWithGoogle()}
            disabled={loading}
            className="w-full relative flex items-center justify-center space-x-3.5 bg-white text-neutral-900 hover:bg-neutral-100 active:scale-[0.98] py-4 px-6 rounded-2xl font-semibold text-base transition duration-200 shadow-xl shadow-white/10 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {/* Recognized official Google "G" logo */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="tracking-wide text-neutral-900 font-bold uppercase text-sm sm:text-base">
              {loading ? t('auth.connecting') : t('auth.continueWithGoogle')}
            </span>
          </button>

          <p className="text-[12px] text-neutral-500 text-center">
            {t('auth.zeroPassword')}
          </p>
        </div>
      </main>

      {/* Footer Links */}
      <footer className="relative z-10 text-center text-xs text-neutral-500 max-w-md w-full mx-auto pt-6 border-t border-white/5">
        <p className="mb-2">{t('auth.legalDisclaimer')}</p>
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setModalContent('privacy')}
            className="hover:text-neutral-300 underline underline-offset-4 cursor-pointer"
          >
            {t('auth.privacyPolicy')}
          </button>
          <span>•</span>
          <button
            onClick={() => setModalContent('terms')}
            className="hover:text-neutral-300 underline underline-offset-4 cursor-pointer"
          >
            {t('auth.termsOfService')}
          </button>
        </div>
      </footer>

      {/* Legal Modal Dialog */}
      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-left shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-4">
              <h3 className="text-lg font-bold text-white">
                {modalContent === 'privacy' ? t('auth.privacyPolicy') : t('auth.termsOfService')}
              </h3>
              <button
                onClick={() => setModalContent(null)}
                className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-neutral-300 space-y-3 max-h-72 overflow-y-auto pr-2 leading-relaxed">
              {modalContent === 'privacy' ? (
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
            <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-end">
              <button
                onClick={() => setModalContent(null)}
                className="px-5 py-2 rounded-xl bg-[#6546D7] hover:bg-[#5638c4] text-white text-xs font-semibold"
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
