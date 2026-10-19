import React from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Compass, BookmarkCheck, BarChart3, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useTranslation();

  const tabs = [
    { id: 'home', label: t('nav.home'), icon: BookOpen },
    { id: 'discover', label: t('nav.discover'), icon: Compass },
    { id: 'library', label: t('nav.library'), icon: BookmarkCheck },
    { id: 'stats', label: t('nav.stats'), icon: BarChart3 },
    { id: 'profile', label: t('nav.profile'), icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-t border-neutral-200 dark:border-white/10 px-2 py-1.5 pb-safe">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                isActive ? 'text-[#6546D7]' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <div
                className={`relative p-1 rounded-xl transition-all ${
                  isActive ? 'bg-[#6546D7]/10' : ''
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#6546D7]" />
                )}
              </div>
              <span className={`text-[10px] mt-0.5 font-medium ${isActive ? 'font-semibold text-[#6546D7]' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
