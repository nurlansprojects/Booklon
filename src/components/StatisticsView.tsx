import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { LibraryItem, ReadingSession, ReadingGoal } from '../types';
import { useAuth } from '../context/AuthContext';
import { setReadingGoal, deleteReadingGoal } from '../services/firestoreService';
import {
  BarChart3,
  Clock,
  BookOpen,
  CheckCircle,
  Flame,
  Target,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  TrendingUp,
  X
} from 'lucide-react';

interface StatisticsViewProps {
  library: LibraryItem[];
  sessions: ReadingSession[];
  goals: ReadingGoal[];
  onNavigateToDiscover: () => void;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  library,
  sessions,
  goals,
  onNavigateToDiscover,
}) => {
  const { t } = useTranslation();
  const { language, formatDays, formatDuration, formatBooks, formatPages } = useLanguage();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);
  const [newGoalType, setNewGoalType] = useState<'books_per_year' | 'pages_per_day' | 'minutes_per_day'>('books_per_year');
  const [newGoalTarget, setNewGoalTarget] = useState<number>(12);

  // Time-filtered sessions
  const now = new Date();
  const filteredSessions = sessions.filter((s) => {
    if (timeRange === 'all') return true;
    const sessionTime = new Date(s.createdAt).getTime();
    if (timeRange === 'week') {
      const oneWeekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
      return sessionTime >= oneWeekAgo;
    }
    if (timeRange === 'month') {
      const oneMonthAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;
      return sessionTime >= oneMonthAgo;
    }
    return true;
  });

  // Calculate REAL Metrics
  const booksFinished = library.filter((b) => b.status === 'finished').length;
  const booksReading = library.filter((b) => b.status === 'currently_reading').length;
  const totalSeconds = filteredSessions.reduce((acc, s) => acc + s.durationSeconds, 0);

  // Pages read from actual sessions
  const totalPagesRead = filteredSessions.reduce((acc, s) => acc + (s.pagesRead || 0), 0);

  // Calculate REAL Reading Streak
  const calculateStreak = (): number => {
    if (sessions.length === 0) return 0;
    const uniqueDates = Array.from(new Set(sessions.map((s) => s.sessionDate || s.createdAt.split('T')[0]))).sort().reverse();
    if (uniqueDates.length === 0) return 0;

    const todayStr = now.toISOString().split('T')[0];
    const yesterday = new Date(now.getTime() - 86400000);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
      return 0;
    }

    let streak = 0;
    let checkDate = new Date(uniqueDates[0]);

    for (const dateStr of uniqueDates) {
      const d = new Date(dateStr);
      const diffDays = Math.round((checkDate.getTime() - d.getTime()) / (1000 * 3600 * 24));
      if (diffDays <= 1) {
        streak++;
        checkDate = d;
      } else {
        break;
      }
    }

    return streak;
  };

  const streakDays = calculateStreak();

  // Weekly Activity Bar Chart Data (last 7 days)
  const localeTag = language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US';
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = new Intl.DateTimeFormat(localeTag, { weekday: 'short' }).format(d);
    const dayMinutes = Math.round(
      sessions
        .filter((s) => (s.sessionDate || s.createdAt.split('T')[0]) === dateStr)
        .reduce((sum, s) => sum + s.durationSeconds, 0) / 60
    );
    return { dayLabel, dayMinutes, dateStr };
  });

  const totalMinutesInWeek = last7Days.reduce((acc, d) => acc + d.dayMinutes, 0);
  const maxMinutesInWeek = Math.max(...last7Days.map((d) => d.dayMinutes), 30);

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || newGoalTarget <= 0) return;
    try {
      await setReadingGoal(user.uid, newGoalType, newGoalTarget);
      setShowGoalModal(false);
    } catch (err) {
      console.error('Failed to set reading goal:', err);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteReadingGoal(goalId);
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  const hasReadingData = sessions.length > 0 || library.length > 0;

  return (
    <div className="space-y-8 pb-20">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
            {t('stats.statsTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            {t('stats.statsSubtitle')}
          </p>
        </div>

        {/* Time Filter Pills */}
        <div className="flex items-center space-x-1 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-2xl border border-neutral-200 dark:border-white/10 self-start sm:self-auto">
          {(['week', 'month', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition cursor-pointer ${
                timeRange === r
                  ? 'bg-white dark:bg-neutral-800 text-[#6546D7] shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {r === 'week' ? t('stats.last7Days') : r === 'month' ? t('stats.thisMonth') : t('stats.allTime')}
            </button>
          ))}
        </div>
      </div>

      {!hasReadingData ? (
        <div className="py-20 text-center space-y-4 max-w-sm mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-[#6546D7]/10 flex items-center justify-center mx-auto text-[#6546D7]">
            <BarChart3 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
            {t('stats.noStatsTitle')}
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            {t('stats.noStatsDesc')}
          </p>
          <button
            onClick={onNavigateToDiscover}
            className="px-5 py-2.5 bg-[#6546D7] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#5638c4] transition cursor-pointer"
          >
            {t('stats.startReadingBook')}
          </button>
        </div>
      ) : (
        <>
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Streak */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-neutral-400">
                  {t('stats.currentStreak')}
                </span>
                <Flame className={`w-5 h-5 ${streakDays > 0 ? 'text-amber-500 fill-amber-500' : 'text-neutral-400'}`} />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
                {formatDays(streakDays)}
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                {streakDays > 0 ? t('stats.activeStreak') : t('stats.startStreakNotice')}
              </p>
            </div>

            {/* Total Time Read */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-neutral-400">
                  {t('stats.timeRead')}
                </span>
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
                {formatDuration(totalSeconds)}
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                {t('stats.loggedSessions', { count: filteredSessions.length })}
              </p>
            </div>

            {/* Books Completed */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-neutral-400">
                  {t('stats.completed')}
                </span>
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
                {formatBooks(booksFinished)}
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                {t('stats.inProgress', { count: booksReading })}
              </p>
            </div>

            {/* Pages Read */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-neutral-400">
                  {t('stats.pagesTracked')}
                </span>
                <BookOpen className="w-5 h-5 text-[#6546D7]" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
                {formatPages(totalPagesRead)}
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                {t('stats.measuredInActiveReader')}
              </p>
            </div>
          </div>

          {/* Activity Breakdown Trend */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  {t('stats.dailyReadingTrend')}
                </h3>
                <p className="text-xs text-neutral-500">
                  {t('stats.minutesReadLast7')}
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#6546D7]/10 text-[#6546D7]">
                {t('stats.totalMinutesTrend', { count: totalMinutesInWeek })}
              </span>
            </div>

            <div className="h-44 pt-6 flex items-end justify-between gap-2 sm:gap-4">
              {last7Days.map((day) => {
                const heightPercent = maxMinutesInWeek > 0 ? (day.dayMinutes / maxMinutesInWeek) * 100 : 0;
                return (
                  <div key={day.dateStr} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full h-32 bg-neutral-100 dark:bg-neutral-800 rounded-xl relative flex items-end justify-center overflow-hidden p-1">
                      <div
                        style={{ height: `${Math.max(heightPercent, 4)}%` }}
                        className={`w-full rounded-lg transition-all duration-500 ${
                          day.dayMinutes > 0
                            ? 'bg-gradient-to-t from-[#6546D7] to-purple-400 group-hover:brightness-110 shadow-sm'
                            : 'bg-neutral-200 dark:bg-neutral-700/50'
                        }`}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-neutral-500 capitalize">
                      {day.dayLabel}
                    </span>
                    <span className="text-[10px] text-neutral-400 -mt-1">
                      {day.dayMinutes}m
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reading Goals Section */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-[#6546D7]" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  {t('stats.readingGoals')}
                </h3>
              </div>
              <button
                onClick={() => setShowGoalModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#6546D7] text-white text-xs font-semibold flex items-center space-x-1 shadow-sm hover:bg-[#5638c4] transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('stats.setGoal')}</span>
              </button>
            </div>

            {goals.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-500 border border-dashed border-neutral-200 dark:border-white/10 rounded-2xl p-4">
                {t('stats.noGoalsSet')}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {goals.map((g) => {
                  let currentProgress = 0;
                  let targetLabel = '';
                  let progressPercent = 0;

                  if (g.type === 'books_per_year') {
                    currentProgress = booksFinished;
                    progressPercent = Math.min(Math.round((currentProgress / g.target) * 100), 100);
                    targetLabel = t('stats.completedGoal', { current: currentProgress, target: g.target });
                  } else if (g.type === 'pages_per_day') {
                    const todayStr = now.toISOString().split('T')[0];
                    currentProgress = sessions
                      .filter((s) => (s.sessionDate || s.createdAt.split('T')[0]) === todayStr)
                      .reduce((sum, s) => sum + (s.pagesRead || 0), 0);
                    progressPercent = Math.min(Math.round((currentProgress / g.target) * 100), 100);
                    targetLabel = t('stats.readPagesGoal', { current: currentProgress, target: g.target });
                  } else {
                    const todayStr = now.toISOString().split('T')[0];
                    const todayMinutes = Math.round(
                      sessions
                        .filter((s) => (s.sessionDate || s.createdAt.split('T')[0]) === todayStr)
                        .reduce((sum, s) => sum + s.durationSeconds, 0) / 60
                    );
                    currentProgress = todayMinutes;
                    progressPercent = Math.min(Math.round((currentProgress / g.target) * 100), 100);
                    targetLabel = t('stats.readMinutesGoal', { current: currentProgress, target: g.target });
                  }

                  return (
                    <div
                      key={g.id}
                      className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-white/5 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-900 dark:text-white capitalize">
                          {g.type === 'books_per_year'
                            ? t('stats.goalBooksPerYear')
                            : g.type === 'pages_per_day'
                            ? t('stats.goalPagesPerDay')
                            : t('stats.goalMinutesPerDay')}
                        </span>
                        <button
                          onClick={() => handleDeleteGoal(g.id)}
                          className="text-neutral-400 hover:text-rose-500 cursor-pointer"
                          title={t('common.delete')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-neutral-500 mb-1">
                          <span>{targetLabel}</span>
                          <span className="font-semibold text-[#6546D7]">{progressPercent}%</span>
                        </div>
                        <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#6546D7] rounded-full transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Set Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveGoal}
            className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <h4 className="text-base font-bold text-neutral-900 dark:text-white">
                {t('stats.setGoal')}
              </h4>
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
                {t('stats.goalType')}
              </label>
              <select
                value={newGoalType}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setNewGoalType(val);
                  setNewGoalTarget(val === 'books_per_year' ? 12 : val === 'pages_per_day' ? 30 : 25);
                }}
                className="w-full px-3.5 py-2.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6546D7]"
              >
                <option value="books_per_year">{t('stats.goalBooksPerYear')}</option>
                <option value="pages_per_day">{t('stats.goalPagesPerDay')}</option>
                <option value="minutes_per_day">{t('stats.goalMinutesPerDay')}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
                {t('stats.targetValue')}
              </label>
              <input
                type="number"
                min={1}
                max={5000}
                required
                value={newGoalTarget}
                onChange={(e) => setNewGoalTarget(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6546D7]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-500 hover:text-white cursor-pointer"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#6546D7] text-white text-xs font-bold cursor-pointer"
              >
                {t('stats.saveGoal')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
