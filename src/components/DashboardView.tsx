import React from 'react';
import {
  Scale,
  Flame,
  TrendingDown,
  TrendingUp,
  Target,
  Plus,
  Sparkles,
  Droplet,
  Utensils,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { UserProfile, WeightEntry, DailyCalorieLog, SuggestedFood } from '../types';
import { formatWeight, calculateBMI, kgToLbs } from '../utils/nutrition';
import { CURATED_SUGGESTED_FOODS } from '../utils/nutrition';

interface DashboardViewProps {
  userProfile: UserProfile;
  weightEntries: WeightEntry[];
  todayCalorieLog: DailyCalorieLog;
  onNavigateTo: (tab: 'weight' | 'calories' | 'ai_chat' | 'ai_suggestions' | 'food_library') => void;
  onOpenLogWeight: () => void;
  onOpenLogMeal: () => void;
  onAddFoodToLog: (food: SuggestedFood) => void;
  onUpdateWater: (amountMl: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userProfile,
  weightEntries,
  todayCalorieLog,
  onNavigateTo,
  onOpenLogWeight,
  onOpenLogMeal,
  onAddFoodToLog,
  onUpdateWater,
}) => {
  const latestWeight = weightEntries[weightEntries.length - 1]?.weightKg || userProfile.currentWeightKg;
  const startWeight = userProfile.startWeightKg;
  const targetWeight = userProfile.targetWeightKg;

  // Weight Progress Math
  const isLossGoal = userProfile.goal === 'lose';
  const totalChangeNeeded = Math.abs(startWeight - targetWeight);
  const currentProgressKg = isLossGoal
    ? Math.max(0, startWeight - latestWeight)
    : Math.max(0, latestWeight - startWeight);

  const progressPercentage = totalChangeNeeded > 0
    ? Math.min(100, Math.round((currentProgressKg / totalChangeNeeded) * 100))
    : 100;

  const remainingKg = Math.abs(latestWeight - targetWeight);

  // Calorie Math
  const consumedCalories = todayCalorieLog.items.reduce((acc, item) => acc + item.calories, 0);
  const targetCalories = userProfile.dailyCalorieTarget;
  const remainingCalories = targetCalories - consumedCalories;
  const caloriePercent = Math.min(100, Math.round((consumedCalories / targetCalories) * 100));

  // Macros
  const proteinG = todayCalorieLog.items.reduce((acc, item) => acc + item.proteinG, 0);
  const carbsG = todayCalorieLog.items.reduce((acc, item) => acc + item.carbsG, 0);
  const fatG = todayCalorieLog.items.reduce((acc, item) => acc + item.fatG, 0);

  // BMI
  const bmiInfo = calculateBMI(latestWeight, userProfile.heightCm);

  // Chart data
  const chartData = weightEntries.slice(-10).map((e) => ({
    date: e.date.substring(5), // MM-DD
    weight: userProfile.unit === 'lbs' ? kgToLbs(e.weightKg) : e.weightKg,
  }));

  // Featured Food Suggestion (Pick 1 that fits remaining calories)
  const quickSuggestion = CURATED_SUGGESTED_FOODS.find(
    (f) => f.calories <= Math.max(250, remainingCalories)
  ) || CURATED_SUGGESTED_FOODS[0];

  return (
    <div className="space-y-8 text-[#1A1A1A]">
      {/* Welcome & Overview Editorial Banner */}
      <div className="bg-[#FFFFFF] p-8 border border-[#1A1A1A]/10 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-2xl">
          <div className="text-[10px] uppercase font-sans font-bold tracking-[0.25em] text-[#1A1A1A]/50 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#1A1A1A]"></span>
            <span>NUTRITION ARCHIVE — OVERVIEW</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-light text-[#1A1A1A] leading-tight">
            Welcome back, <span className="italic font-normal">{userProfile.name}</span>.
          </h2>
          <p className="text-sm font-serif text-[#1A1A1A]/70 leading-relaxed">
            Your current weight trajectory is mapped toward a target of{' '}
            <span className="font-semibold text-[#1A1A1A] underline decoration-[#1A1A1A]/20">
              {formatWeight(targetWeight, userProfile.unit)}
            </span>
            . Daily nourishment allowance is active.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-sans">
          <button
            onClick={() => onNavigateTo('ai_chat')}
            className="flex-1 md:flex-initial flex items-center justify-center space-x-2 px-4 py-3 bg-[#1A1A1A] text-[#F8F5F2] hover:bg-black text-xs uppercase tracking-widest font-bold transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Ask AI: What to Eat</span>
          </button>
          <button
            onClick={onOpenLogWeight}
            className="flex-1 md:flex-initial flex items-center justify-center space-x-2 px-4 py-3 border border-[#1A1A1A]/30 hover:bg-[#1A1A1A] hover:text-[#F8F5F2] text-xs uppercase tracking-widest font-bold transition"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Add Weight</span>
          </button>
          <button
            onClick={onOpenLogMeal}
            className="flex-1 md:flex-initial flex items-center justify-center space-x-2 px-5 py-3 border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F8F5F2] text-xs uppercase tracking-widest font-bold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Food</span>
          </button>
        </div>
      </div>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Weight Goal Progress */}
        <div className="bg-[#FFFFFF] p-6 border border-[#1A1A1A]/10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-2 mb-3">
              <span className="text-[10px] uppercase font-sans font-bold tracking-[0.2em] text-[#1A1A1A]/50">01 / Weight Goal</span>
              <Target className="w-3.5 h-3.5 text-[#1A1A1A]/40" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <div className="text-3xl font-serif font-light text-[#1A1A1A]">
                  {formatWeight(latestWeight, userProfile.unit)}
                </div>
                <div className="text-[11px] font-sans text-[#1A1A1A]/50 mt-1">
                  Start: {formatWeight(startWeight, userProfile.unit)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-sans font-bold text-emerald-800 uppercase tracking-wider">
                  Target: {formatWeight(targetWeight, userProfile.unit)}
                </div>
                <div className="text-[11px] font-sans text-[#1A1A1A]/50 mt-0.5">
                  {remainingKg.toFixed(1)} {userProfile.unit} remaining
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-[10px] uppercase font-sans font-bold text-[#1A1A1A]/60 mb-1.5 tracking-wider">
              <span>Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#EAE7E4] overflow-hidden">
              <div
                className="h-full bg-[#1A1A1A] transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Daily Calorie Budget */}
        <div className="bg-[#FFFFFF] p-6 border border-[#1A1A1A]/10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-2 mb-3">
              <span className="text-[10px] uppercase font-sans font-bold tracking-[0.2em] text-[#1A1A1A]/50">02 / Calorie Budget</span>
              <Flame className="w-3.5 h-3.5 text-[#1A1A1A]/40" />
            </div>
            <div className="mt-2">
              <div className="text-3xl font-serif font-light text-[#1A1A1A]">
                {consumedCalories}{' '}
                <span className="text-xs font-sans font-normal text-[#1A1A1A]/50 uppercase">/ {targetCalories} kcal</span>
              </div>
              <div className={`text-[11px] font-sans font-bold uppercase tracking-wider mt-1 ${remainingCalories >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                {remainingCalories >= 0 ? `${remainingCalories} kcal left` : `${Math.abs(remainingCalories)} kcal over target`}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-[10px] uppercase font-sans font-bold text-[#1A1A1A]/60 mb-1.5 tracking-wider">
              <span>Consumed</span>
              <span>{caloriePercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#EAE7E4] overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${caloriePercent > 100 ? 'bg-rose-800' : 'bg-[#1A1A1A]'}`}
                style={{ width: `${Math.min(100, caloriePercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Macros Today */}
        <div className="bg-[#FFFFFF] p-6 border border-[#1A1A1A]/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-2 mb-3">
            <span className="text-[10px] uppercase font-sans font-bold tracking-[0.2em] text-[#1A1A1A]/50">03 / Macronutrients</span>
            <span className="text-[9px] uppercase font-sans font-bold text-[#1A1A1A]/40">Today</span>
          </div>

          <div className="space-y-3 mt-1 font-sans">
            {/* Protein */}
            <div>
              <div className="flex justify-between text-[11px] text-[#1A1A1A] font-medium mb-1">
                <span className="uppercase tracking-wider text-[10px] font-bold text-[#1A1A1A]/70">Protein</span>
                <span className="font-serif italic">{proteinG}g / {userProfile.proteinTargetG}g</span>
              </div>
              <div className="w-full h-1 bg-[#EAE7E4] overflow-hidden">
                <div
                  className="h-full bg-emerald-800"
                  style={{ width: `${Math.min(100, (proteinG / userProfile.proteinTargetG) * 100)}%` }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div>
              <div className="flex justify-between text-[11px] text-[#1A1A1A] font-medium mb-1">
                <span className="uppercase tracking-wider text-[10px] font-bold text-[#1A1A1A]/70">Carbs</span>
                <span className="font-serif italic">{carbsG}g / {userProfile.carbsTargetG}g</span>
              </div>
              <div className="w-full h-1 bg-[#EAE7E4] overflow-hidden">
                <div
                  className="h-full bg-amber-800"
                  style={{ width: `${Math.min(100, (carbsG / userProfile.carbsTargetG) * 100)}%` }}
                />
              </div>
            </div>

            {/* Fat */}
            <div>
              <div className="flex justify-between text-[11px] text-[#1A1A1A] font-medium mb-1">
                <span className="uppercase tracking-wider text-[10px] font-bold text-[#1A1A1A]/70">Fat</span>
                <span className="font-serif italic">{fatG}g / {userProfile.fatTargetG}g</span>
              </div>
              <div className="w-full h-1 bg-[#EAE7E4] overflow-hidden">
                <div
                  className="h-full bg-[#1A1A1A]"
                  style={{ width: `${Math.min(100, (fatG / userProfile.fatTargetG) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: BMI & Water */}
        <div className="bg-[#FFFFFF] p-6 border border-[#1A1A1A]/10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-2 mb-3">
              <span className="text-[10px] uppercase font-sans font-bold tracking-[0.2em] text-[#1A1A1A]/50">04 / BMI & Hydration</span>
              <span className="text-[10px] uppercase font-sans font-bold text-emerald-800">{bmiInfo.category}</span>
            </div>

            <div className="mt-2">
              <div className="text-3xl font-serif font-light text-[#1A1A1A]">{bmiInfo.bmi}</div>
              <div className="text-[11px] font-sans text-[#1A1A1A]/50 mt-1">
                Height: {userProfile.heightCm} cm
              </div>
            </div>
          </div>

          {/* Water Tracker Mini */}
          <div className="mt-4 pt-3 border-t border-[#1A1A1A]/10 flex items-center justify-between font-sans">
            <div className="flex items-center space-x-1.5 text-xs text-[#1A1A1A]">
              <Droplet className="w-3.5 h-3.5 text-blue-700" />
              <span className="font-serif italic font-semibold">{todayCalorieLog.waterMl || 0} ml</span>
            </div>
            <button
              onClick={() => onUpdateWater((todayCalorieLog.waterMl || 0) + 250)}
              className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 bg-[#EAE7E4] hover:bg-[#1A1A1A] hover:text-[#F8F5F2] border border-[#1A1A1A]/10 transition"
            >
              +250ml
            </button>
          </div>
        </div>
      </div>

      {/* Middle Grid: Weight Trend Chart & AI Quick Food Suggestion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weight Trend Chart */}
        <div className="lg:col-span-2 bg-[#FFFFFF] p-8 border border-[#1A1A1A]/10 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1A1A1A]/10">
            <div>
              <div className="text-[10px] uppercase font-sans font-bold tracking-[0.2em] text-[#1A1A1A]/50">HISTORICAL METRICS</div>
              <h3 className="text-xl font-serif font-light text-[#1A1A1A] mt-1">
                Weight Trajectory
              </h3>
            </div>
            <button
              onClick={() => onNavigateTo('weight')}
              className="text-xs uppercase font-sans tracking-widest font-bold text-[#1A1A1A] hover:opacity-60 flex items-center space-x-1.5 transition"
            >
              <span>Full Archive</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Chart */}
          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="editorialGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A1A1A" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#1A1A1A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#1A1A1A" opacity={0.4} fontSize={11} tickLine={false} />
                <YAxis stroke="#1A1A1A" opacity={0.4} fontSize={11} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#1A1A1A', color: '#F8F5F2', borderRadius: '0px' }}
                  labelStyle={{ color: '#F8F5F2', opacity: 0.6, fontSize: '10px', textTransform: 'uppercase' }}
                  formatter={(val: any) => [`${val} ${userProfile.unit}`, 'Weight']}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="#1A1A1A"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#editorialGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Suggested Food Inverted Editorial Card */}
        <div className="bg-[#1A1A1A] text-[#F8F5F2] p-8 shadow-md flex flex-col justify-between relative">
          <div>
            <div className="flex items-center justify-between border-b border-[#F8F5F2]/15 pb-3 mb-4">
              <span className="text-[10px] uppercase font-sans font-bold tracking-[0.25em] text-[#F8F5F2]/60 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> NOURISHMENT IDEA
              </span>
              <span className="text-[10px] font-sans font-bold bg-[#F8F5F2]/10 text-[#F8F5F2] px-2.5 py-0.5 uppercase tracking-wider">
                {quickSuggestion.calories} kcal
              </span>
            </div>

            <h4 className="text-2xl font-serif italic font-normal text-[#F8F5F2] leading-tight">
              {quickSuggestion.name}
            </h4>
            <p className="text-xs font-serif text-[#F8F5F2]/70 mt-3 leading-relaxed line-clamp-3">
              {quickSuggestion.description}
            </p>

            <div className="flex items-center space-x-3 mt-6 text-[10px] font-sans uppercase font-bold text-[#F8F5F2]/80">
              <span className="border-b border-[#F8F5F2]/30 pb-0.5">P: {quickSuggestion.proteinG}g</span>
              <span className="border-b border-[#F8F5F2]/30 pb-0.5">C: {quickSuggestion.carbsG}g</span>
              <span className="border-b border-[#F8F5F2]/30 pb-0.5">F: {quickSuggestion.fatG}g</span>
            </div>
          </div>

          <div className="mt-8 space-y-2.5 font-sans">
            <button
              onClick={() => onAddFoodToLog(quickSuggestion)}
              className="w-full py-3 px-4 bg-[#F8F5F2] text-[#1A1A1A] hover:bg-white font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Log Item (+{quickSuggestion.calories} kcal)</span>
            </button>

            <button
              onClick={() => onNavigateTo('ai_suggestions')}
              className="w-full py-2.5 px-4 border border-[#F8F5F2]/30 hover:bg-[#F8F5F2]/10 text-[#F8F5F2] text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>More AI Food Ideas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Today's Logged Meals Editorial Table */}
      <div className="bg-[#FFFFFF] p-8 border border-[#1A1A1A]/10 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1A1A1A]/10">
          <div>
            <div className="text-[10px] uppercase font-sans font-bold tracking-[0.2em] text-[#1A1A1A]/50">DAILY DIARY</div>
            <h3 className="text-xl font-serif font-light text-[#1A1A1A] mt-1">
              Logged Nourishment Today
            </h3>
          </div>
          <button
            onClick={() => onNavigateTo('calories')}
            className="text-xs uppercase font-sans tracking-widest font-bold text-[#1A1A1A] hover:opacity-60 flex items-center space-x-1.5 transition"
          >
            <span>Full Calorie Diary</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todayCalorieLog.items.length === 0 ? (
          <div className="text-center py-12 bg-[#F8F5F2]/50 border border-dashed border-[#1A1A1A]/20">
            <p className="font-serif italic text-[#1A1A1A]/60 text-base">No food entries recorded for today.</p>
            <button
              onClick={onOpenLogMeal}
              className="mt-4 inline-flex items-center space-x-2 px-6 py-2.5 bg-[#1A1A1A] text-[#F8F5F2] hover:bg-black font-sans text-xs uppercase tracking-widest font-bold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log First Entry</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayCalorieLog.items.map((item) => (
              <div
                key={item.id}
                className="bg-[#F8F5F2] p-5 border border-[#1A1A1A]/10 flex items-center justify-between hover:border-[#1A1A1A]/30 transition"
              >
                <div>
                  <div className="text-[9px] font-sans uppercase font-bold tracking-[0.2em] text-[#1A1A1A]/50">{item.mealType}</div>
                  <div className="text-base font-serif italic font-medium text-[#1A1A1A] mt-0.5 line-clamp-1">{item.name}</div>
                  <div className="text-[11px] font-sans text-[#1A1A1A]/60 mt-1">
                    {item.portion} • P: {item.proteinG}g | C: {item.carbsG}g | F: {item.fatG}g
                  </div>
                </div>
                <div className="text-right ml-3 font-serif">
                  <div className="text-lg font-light text-[#1A1A1A]">{item.calories}</div>
                  <div className="text-[9px] font-sans uppercase font-bold text-[#1A1A1A]/40">kcal</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
