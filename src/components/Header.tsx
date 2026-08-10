import React from 'react';
import { Scale, Flame, User, Plus, Sparkles, Utensils } from 'lucide-react';
import { UserProfile, WeightUnit } from '../types';
import { formatWeight } from '../utils/nutrition';

interface HeaderProps {
  userProfile: UserProfile;
  todayWeightKg?: number;
  todayCaloriesConsumed: number;
  onOpenProfile: () => void;
  onOpenLogWeight: () => void;
  onOpenLogMeal: () => void;
  onOpenAISuggestions: () => void;
  onToggleUnit: (unit: WeightUnit) => void;
}

export const Header: React.FC<HeaderProps> = ({
  userProfile,
  todayWeightKg,
  todayCaloriesConsumed,
  onOpenProfile,
  onOpenLogWeight,
  onOpenLogMeal,
  onOpenAISuggestions,
  onToggleUnit,
}) => {
  const calorieTarget = userProfile.dailyCalorieTarget;
  const caloriesRemaining = Math.max(0, calorieTarget - todayCaloriesConsumed);
  const isOver = todayCaloriesConsumed > calorieTarget;

  return (
    <header className="sticky top-0 z-30 bg-[#F8F5F2]/95 backdrop-blur-md border-b border-[#1A1A1A]/10 text-[#1A1A1A] py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-[#1A1A1A] text-[#F8F5F2] flex items-center justify-center font-serif text-lg italic font-bold">
            V
          </div>
          <div>
            <h1 className="text-2xl font-light tracking-tighter uppercase font-serif text-[#1A1A1A]">
              NutriTrack
            </h1>
            <p className="text-[9px] uppercase tracking-[0.2em] font-sans font-bold opacity-60">
              Personal Nutrition Archive
            </p>
          </div>
        </div>

        {/* Status Pill Summary (Desktop & Tablet) */}
        <div className="hidden lg:flex items-center space-x-6 bg-[#EAE7E4] px-5 py-1.5 border border-[#1A1A1A]/10 text-xs font-sans">
          {/* Today Weight */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">Current Weight:</span>
            <span className="font-serif italic font-semibold text-sm text-[#1A1A1A]">
              {todayWeightKg ? formatWeight(todayWeightKg, userProfile.unit) : 'Not logged'}
            </span>
          </div>

          <div className="w-px h-4 bg-[#1A1A1A]/15" />

          {/* Today Calories */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">Allowance:</span>
            <span className="font-serif italic font-semibold text-sm text-[#1A1A1A]">
              {todayCaloriesConsumed} / {calorieTarget} <span className="text-[9px] uppercase font-sans not-italic font-bold opacity-50">kcal</span>
            </span>
            <span className={`text-[10px] px-2 py-0.5 font-sans font-bold uppercase tracking-wider ${isOver ? 'bg-rose-900/10 text-rose-800' : 'bg-emerald-900/10 text-emerald-800'}`}>
              {isOver ? `${todayCaloriesConsumed - calorieTarget} over` : `${caloriesRemaining} remaining`}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3 font-sans">
          {/* Unit Toggle */}
          <button
            onClick={() => onToggleUnit(userProfile.unit === 'kg' ? 'lbs' : 'kg')}
            className="px-2.5 py-1.5 border border-[#1A1A1A]/20 text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F8F5F2] transition"
            title="Toggle weight unit"
          >
            {userProfile.unit.toUpperCase()}
          </button>

          {/* AI Meal Generator Quick Action */}
          <button
            onClick={onOpenAISuggestions}
            className="flex items-center space-x-1.5 px-3 py-1.5 border border-[#1A1A1A]/20 bg-[#EAE7E4]/60 hover:bg-[#1A1A1A] hover:text-[#F8F5F2] text-[10px] uppercase tracking-wider font-bold transition group"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700 group-hover:text-[#F8F5F2]" />
            <span className="hidden sm:inline">AI Nourishment</span>
            <span className="sm:hidden">AI Ideas</span>
          </button>

          {/* Quick Add Weight */}
          <button
            onClick={onOpenLogWeight}
            className="flex items-center space-x-1 px-3 py-1.5 border border-[#1A1A1A]/20 hover:bg-[#1A1A1A] hover:text-[#F8F5F2] text-[10px] uppercase tracking-wider font-bold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <Scale className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Weight</span>
          </button>

          {/* Quick Add Meal */}
          <button
            onClick={onOpenLogMeal}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#1A1A1A] text-[#F8F5F2] text-[10px] uppercase tracking-widest font-bold hover:bg-black transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <Utensils className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log Food</span>
          </button>

          {/* Profile Button */}
          <button
            onClick={onOpenProfile}
            className="p-2 border border-[#1A1A1A]/20 hover:bg-[#1A1A1A] hover:text-[#F8F5F2] transition"
            title="Profile & Diet Goals"
          >
            <User className="w-4 h-4 text-[#1A1A1A] hover:text-[#F8F5F2]" />
          </button>
        </div>
      </div>
    </header>
  );
};
