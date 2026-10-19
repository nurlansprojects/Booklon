import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { BooklonLogo } from './BooklonLogo';
import { LanguageSelector } from './LanguageSelector';
import { Sun, Moon, LogOut, Search, BookOpen, Compass, BookmarkCheck, BarChart3, User } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenSearch }) => {
  const { t } = useTranslation();
  const { user, profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'home', label: t('nav.home'), icon: BookOpen },
    { id: 'discover', label: t('nav.discover'), icon: Compass },
    { id: 'library', label: t('nav.library'), icon: BookmarkCheck },
    { id: 'stats', label: t('nav.stats'), icon: BarChart3 },
    { id: 'profile', label: t('nav.profile'), icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-black/80 border-b border-neutral-200 dark:border-white/10 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => setActiveTab('home')}>
          <BooklonLogo size="sm" withContainer />
          <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white font-sans">
            {t('common.appName')}
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'text-white bg-[#6546D7] shadow-sm shadow-[#6546D7]/30'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Language Selector Dropdown */}
          <LanguageSelector variant="compact" />

          {/* Quick Search */}
          <button
            onClick={onOpenSearch}
            className="p-2 sm:p-2.5 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition"
            title={t('nav.searchTooltip')}
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition"
            title={theme === 'dark' ? t('nav.switchThemeLight') : t('nav.switchThemeDark')}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-neutral-700" />}
          </button>

          {/* User Avatar */}
          <div
            onClick={() => setActiveTab('profile')}
            className="flex items-center space-x-2 pl-2 border-l border-neutral-200 dark:border-white/10 cursor-pointer"
          >
            {profile?.photoURL || user?.photoURL ? (
              <img
                src={profile?.photoURL || user?.photoURL || ''}
                alt={profile?.displayName || 'User'}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[#6546D7]/40"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#6546D7] text-white flex items-center justify-center text-xs font-bold">
                {profile?.displayName?.charAt(0) || user?.email?.charAt(0) || 'B'}
              </div>
            )}
            <span className="hidden lg:inline text-xs font-medium text-neutral-700 dark:text-neutral-300 max-w-[100px] truncate">
              {profile?.displayName || 'Reader'}
            </span>
          </div>

          {/* Logout Action */}
          <button
            onClick={logout}
            className="hidden sm:flex p-2.5 rounded-xl text-neutral-500 hover:text-rose-500 hover:bg-rose-500/10 transition"
            title={t('nav.signOut')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
