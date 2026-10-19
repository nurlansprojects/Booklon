import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { Language } from '../types';

interface LanguageSelectorProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentOption = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  if (variant === 'full') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {SUPPORTED_LANGUAGES.map((opt) => {
            const isSelected = opt.code === language;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => setLanguage(opt.code)}
                className={`relative flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer text-left ${
                  isSelected
                    ? 'border-[#6546D7] bg-[#6546D7]/10 dark:bg-[#6546D7]/15 text-neutral-900 dark:text-white ring-2 ring-[#6546D7]/30 shadow-sm'
                    : 'border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800/40 text-neutral-700 dark:text-neutral-300 hover:border-[#6546D7]/40 hover:bg-neutral-100 dark:hover:bg-neutral-800/70'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold font-mono ${
                      isSelected
                        ? 'bg-[#6546D7] text-white shadow-sm'
                        : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    {opt.flagLabel}
                  </div>
                  <div>
                    <div className="text-sm font-semibold leading-tight">{opt.nativeName}</div>
                    <div className="text-[11px] text-neutral-400 capitalize">{opt.code}</div>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#6546D7] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Compact Header / Pill Dropdown Variant
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white/60 dark:bg-neutral-900/60 hover:bg-neutral-100 dark:hover:bg-white/10 text-xs font-semibold text-neutral-700 dark:text-neutral-200 transition backdrop-blur-md cursor-pointer"
        title="Change language / Tilni tanlash / Выбрать язык"
      >
        <Globe className="w-3.5 h-3.5 text-[#6546D7]" />
        <span className="font-medium">{currentOption.nativeName}</span>
        <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 shadow-2xl py-1.5 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Language / Til / Язык
          </div>
          {SUPPORTED_LANGUAGES.map((opt) => {
            const isSelected = opt.code === language;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => {
                  setLanguage(opt.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#6546D7]/15 text-[#6546D7] font-bold'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-[10px] px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                    {opt.flagLabel}
                  </span>
                  <span>{opt.nativeName}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#6546D7]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
