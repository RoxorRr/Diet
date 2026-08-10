import React, { useState } from 'react';
import {
  Flame,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Utensils,
  Search,
  X,
  Droplet,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { UserProfile, DailyCalorieLog, FoodItem, MealType } from '../types';
import { getTodayDateString } from '../utils/storage';
import { CURATED_SUGGESTED_FOODS } from '../utils/nutrition';

interface CalorieTrackerViewProps {
  userProfile: UserProfile;
  calorieLogs: DailyCalorieLog[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onAddFoodItem: (date: string, item: FoodItem) => void;
  onDeleteFoodItem: (date: string, itemId: string) => void;
  onUpdateWater: (date: string, amountMl: number) => void;
  onNavigateToAISuggestions: () => void;
}

export const CalorieTrackerView: React.FC<CalorieTrackerViewProps> = ({
  userProfile,
  calorieLogs,
  selectedDate,
  onSelectDate,
  onAddFoodItem,
  onDeleteFoodItem,
  onUpdateWater,
  onNavigateToAISuggestions,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeMealType, setActiveMealType] = useState<MealType>('breakfast');

  // Manual Food Form State
  const [foodName, setFoodName] = useState('');
  const [caloriesInput, setCaloriesInput] = useState('');
  const [proteinInput, setProteinInput] = useState('');
  const [carbsInput, setCarbsInput] = useState('');
  const [fatInput, setFatInput] = useState('');
  const [portionInput, setPortionInput] = useState('1 serving');

  // AI Estimator State
  const [aiText, setAiText] = useState('');
  const [isEstimating, setIsEstimating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Search Library inside modal
  const [librarySearch, setLibrarySearch] = useState('');

  // Find or default log for selected date
  const activeLog = calorieLogs.find((l) => l.date === selectedDate) || {
    id: `c_${selectedDate}`,
    date: selectedDate,
    items: [],
    waterMl: 0,
  };

  const consumedCalories = activeLog.items.reduce((acc, item) => acc + item.calories, 0);
  const targetCalories = userProfile.dailyCalorieTarget;
  const remainingCalories = targetCalories - consumedCalories;

  const proteinG = activeLog.items.reduce((acc, item) => acc + item.proteinG, 0);
  const carbsG = activeLog.items.reduce((acc, item) => acc + item.carbsG, 0);
  const fatG = activeLog.items.reduce((acc, item) => acc + item.fatG, 0);

  // Change Date Handler
  const handleDateShift = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    onSelectDate(d.toISOString().split('T')[0]);
  };

  const handleOpenAddModal = (meal: MealType) => {
    setActiveMealType(meal);
    setShowAddModal(true);
  };

  const handleSaveCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim() || !caloriesInput) return;

    onAddFoodItem(selectedDate, {
      id: `fi_${Date.now()}`,
      name: foodName.trim(),
      calories: parseInt(caloriesInput) || 0,
      proteinG: parseInt(proteinInput) || 0,
      carbsG: parseInt(carbsInput) || 0,
      fatG: parseInt(fatInput) || 0,
      mealType: activeMealType,
      portion: portionInput.trim() || '1 serving',
    });

    setShowAddModal(false);
    setFoodName('');
    setCaloriesInput('');
    setProteinInput('');
    setCarbsInput('');
    setFatInput('');
    setPortionInput('1 serving');
  };

  // AI Calorie Estimator API Call
  const handleAIEstimate = async () => {
    if (!aiText.trim()) return;
    setIsEstimating(true);
    setAiError(null);

    try {
      const res = await fetch('/api/estimate-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aiText }),
      });
      const data = await res.json();
      if (data.success && data.estimate) {
        setFoodName(data.estimate.name || aiText);
        setCaloriesInput(data.estimate.calories?.toString() || '0');
        setProteinInput(data.estimate.proteinG?.toString() || '0');
        setCarbsInput(data.estimate.carbsG?.toString() || '0');
        setFatInput(data.estimate.fatG?.toString() || '0');
        setPortionInput(data.estimate.portion || '1 serving');
        setAiText('');
      } else {
        setAiError('Could not parse calories. Try typing e.g. "1 bowl of oatmeal with berries"');
      }
    } catch (e: any) {
      setAiError('AI Service error. Please enter details manually.');
    } finally {
      setIsEstimating(false);
    }
  };

  const meals: { type: MealType; label: string; iconColor: string }[] = [
    { type: 'breakfast', label: 'Breakfast', iconColor: 'text-amber-400' },
    { type: 'lunch', label: 'Lunch', iconColor: 'text-emerald-400' },
    { type: 'dinner', label: 'Dinner', iconColor: 'text-indigo-400' },
    { type: 'snack', label: 'Snacks & Extras', iconColor: 'text-teal-400' },
  ];

  const filteredLibrary = CURATED_SUGGESTED_FOODS.filter(
    (f) =>
      f.name.toLowerCase().includes(librarySearch.toLowerCase()) ||
      f.tags.some((t) => t.toLowerCase().includes(librarySearch.toLowerCase()))
  );

  return (
    <div className="space-y-8 text-[#1A1A1A]">
      {/* Date Header Switcher */}
      <div className="bg-[#FFFFFF] p-5 border border-[#1A1A1A]/10 flex items-center justify-between shadow-sm">
        <button
          onClick={() => handleDateShift(-1)}
          className="p-2 border border-[#1A1A1A]/15 hover:bg-[#1A1A1A] hover:text-[#F8F5F2] transition text-[#1A1A1A]"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 font-sans">
          <Calendar className="w-4 h-4 text-[#1A1A1A]/50" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onSelectDate(e.target.value)}
            className="bg-[#F8F5F2] border border-[#1A1A1A]/20 text-[#1A1A1A] font-serif font-bold text-sm px-3 py-1.5 focus:outline-none focus:border-[#1A1A1A]"
          />
          {selectedDate === getTodayDateString() && (
            <span className="text-[9px] px-2 py-0.5 font-bold uppercase tracking-widest bg-[#1A1A1A] text-[#F8F5F2]">
              TODAY
            </span>
          )}
        </div>

        <button
          onClick={() => handleDateShift(1)}
          className="p-2 border border-[#1A1A1A]/15 hover:bg-[#1A1A1A] hover:text-[#F8F5F2] transition text-[#1A1A1A]"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Daily Progress Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calorie Goal Summary */}
        <div className="bg-[#FFFFFF] p-6 border border-[#1A1A1A]/10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-2.5 mb-3">
              <span className="text-[10px] uppercase font-sans font-bold tracking-[0.2em] text-[#1A1A1A]/50">
                DAILY ALLOWANCE
              </span>
              <Flame className="w-4 h-4 text-[#1A1A1A]/40" />
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-serif font-light text-[#1A1A1A]">{consumedCalories}</span>
                <span className="text-xs font-sans text-[#1A1A1A]/50 ml-1 uppercase">/ {targetCalories} kcal</span>
              </div>

              <div
                className={`text-xs font-sans font-bold uppercase tracking-wider ${
                  remainingCalories >= 0 ? 'text-emerald-800' : 'text-rose-800'
                }`}
              >
                {remainingCalories >= 0 ? `${remainingCalories} kcal remaining` : `${Math.abs(remainingCalories)} kcal over`}
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="w-full h-1.5 bg-[#EAE7E4] overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  consumedCalories > targetCalories
                    ? 'bg-rose-800'
                    : 'bg-[#1A1A1A]'
                }`}
                style={{ width: `${Math.min(100, (consumedCalories / targetCalories) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Macro Targets */}
        <div className="bg-[#FFFFFF] p-6 border border-[#1A1A1A]/10 shadow-sm space-y-3 font-sans">
          <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#1A1A1A]/50 border-b border-[#1A1A1A]/10 pb-2 mb-2">
            MACRONUTRIENT BALANCE
          </div>

          <div>
            <div className="flex justify-between text-xs text-[#1A1A1A] mb-1">
              <span className="font-bold text-[10px] uppercase tracking-wider text-[#1A1A1A]/70">Protein</span>
              <span className="font-serif italic text-xs">{proteinG}g / {userProfile.proteinTargetG}g</span>
            </div>
            <div className="w-full h-1 bg-[#EAE7E4] overflow-hidden">
              <div
                className="h-full bg-emerald-800"
                style={{ width: `${Math.min(100, (proteinG / userProfile.proteinTargetG) * 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-[#1A1A1A] mb-1">
              <span className="font-bold text-[10px] uppercase tracking-wider text-[#1A1A1A]/70">Carbs</span>
              <span className="font-serif italic text-xs">{carbsG}g / {userProfile.carbsTargetG}g</span>
            </div>
            <div className="w-full h-1 bg-[#EAE7E4] overflow-hidden">
              <div
                className="h-full bg-amber-800"
                style={{ width: `${Math.min(100, (carbsG / userProfile.carbsTargetG) * 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-[#1A1A1A] mb-1">
              <span className="font-bold text-[10px] uppercase tracking-wider text-[#1A1A1A]/70">Fat</span>
              <span className="font-serif italic text-xs">{fatG}g / {userProfile.fatTargetG}g</span>
            </div>
            <div className="w-full h-1 bg-[#EAE7E4] overflow-hidden">
              <div
                className="h-full bg-[#1A1A1A]"
                style={{ width: `${Math.min(100, (fatG / userProfile.fatTargetG) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* AI Meal Generator Inverted Card */}
        <div className="bg-[#1A1A1A] text-[#F8F5F2] p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-[#F8F5F2]/60 text-[10px] font-sans font-bold uppercase tracking-[0.2em]">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>INTELLIGENT NOURISHMENT</span>
            </div>
            <h4 className="text-xl font-serif italic font-normal text-[#F8F5F2] mt-2">Need Meal Ideas?</h4>
            <p className="text-xs font-serif text-[#F8F5F2]/70 mt-1 leading-relaxed">
              Generate tailored food recommendations matching your remaining calorie allowance ({remainingCalories} kcal).
            </p>
          </div>

          <button
            onClick={onNavigateToAISuggestions}
            className="mt-4 w-full py-2.5 px-4 bg-[#F8F5F2] text-[#1A1A1A] hover:bg-white font-sans font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Food Ideas</span>
          </button>
        </div>
      </div>

      {/* Meals Logging Sections */}
      <div className="space-y-6">
        {meals.map((meal) => {
          const mealItems = activeLog.items.filter((item) => item.mealType === meal.type);
          const mealCalories = mealItems.reduce((acc, item) => acc + item.calories, 0);

          return (
            <div
              key={meal.type}
              className="bg-[#FFFFFF] p-6 border border-[#1A1A1A]/10 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-4 mb-4">
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-serif font-light text-[#1A1A1A] capitalize">{meal.label}</h3>
                  <span className="text-xs font-sans uppercase font-bold text-[#1A1A1A]/50">
                    ({mealCalories} kcal)
                  </span>
                </div>

                <button
                  onClick={() => handleOpenAddModal(meal.type)}
                  className="flex items-center space-x-1.5 text-xs font-sans uppercase tracking-widest font-bold px-3.5 py-1.5 border border-[#1A1A1A]/20 hover:bg-[#1A1A1A] hover:text-[#F8F5F2] transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Entry</span>
                </button>
              </div>

              {mealItems.length === 0 ? (
                <div className="py-6 text-center text-xs font-serif italic text-[#1A1A1A]/50">
                  No food entries logged for {meal.label.toLowerCase()} yet.
                </div>
              ) : (
                <div className="divide-y divide-[#1A1A1A]/10">
                  {mealItems.map((item) => (
                    <div
                      key={item.id}
                      className="py-3 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-serif italic text-base text-[#1A1A1A]">{item.name}</div>
                        <div className="font-sans text-[11px] text-[#1A1A1A]/60 mt-0.5">
                          {item.portion} • P: {item.proteinG}g | C: {item.carbsG}g | F: {item.fatG}g
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className="font-serif text-base text-[#1A1A1A]">{item.calories} <span className="text-[9px] font-sans uppercase font-bold text-[#1A1A1A]/40">kcal</span></span>
                        <button
                          onClick={() => onDeleteFoodItem(selectedDate, item.id)}
                          className="text-[#1A1A1A]/40 hover:text-rose-800 p-1 transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Food Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#F8F5F2] border border-[#1A1A1A]/20 max-w-lg w-full p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto text-[#1A1A1A]">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-[#1A1A1A]/50 hover:text-[#1A1A1A] p-1 border border-[#1A1A1A]/10"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="text-[9px] font-sans uppercase font-bold tracking-[0.25em] text-[#1A1A1A]/50">ENTRY LOG</div>
              <h3 className="text-2xl font-serif font-light text-[#1A1A1A] capitalize mt-0.5">Add {activeMealType}</h3>
            </div>

            {/* AI Calorie Estimator Box */}
            <div className="bg-[#FFFFFF] p-5 border border-[#1A1A1A]/15 space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]">
                <Sparkles className="w-3.5 h-3.5 text-emerald-800" />
                <span>AI Calorie Estimator</span>
              </div>
              <p className="text-xs font-serif text-[#1A1A1A]/70">
                Describe your meal (e.g., "1 bowl oatmeal with honey") and AI will calculate calories & macros:
              </p>

              <div className="flex space-x-2 pt-1 font-sans">
                <input
                  type="text"
                  placeholder="e.g., 2 eggs, avocado, toast"
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#F8F5F2] border border-[#1A1A1A]/20 text-xs text-[#1A1A1A] placeholder-[#1A1A1A]/40 focus:outline-none focus:border-[#1A1A1A]"
                />
                <button
                  type="button"
                  onClick={handleAIEstimate}
                  disabled={isEstimating || !aiText.trim()}
                  className="px-4 py-2 bg-[#1A1A1A] text-[#F8F5F2] hover:bg-black disabled:opacity-50 text-xs font-bold uppercase tracking-wider transition"
                >
                  {isEstimating ? 'Analyzing...' : 'Estimate'}
                </button>
              </div>
              {aiError && <p className="text-xs font-sans text-rose-800 mt-1">{aiError}</p>}
            </div>

            {/* Quick Pick from Curated Library */}
            <div className="font-sans">
              <label className="block text-[10px] uppercase tracking-wider font-bold text-[#1A1A1A]/70 mb-1.5">
                Quick Select Suggested Foods
              </label>
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 text-[#1A1A1A]/40 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search curated foods..."
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#FFFFFF] border border-[#1A1A1A]/20 text-xs text-[#1A1A1A] placeholder-[#1A1A1A]/40 focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {filteredLibrary.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onAddFoodItem(selectedDate, {
                        id: `fi_${Date.now()}`,
                        name: item.name,
                        calories: item.calories,
                        proteinG: item.proteinG,
                        carbsG: item.carbsG,
                        fatG: item.fatG,
                        mealType: activeMealType,
                        portion: item.portionSize,
                      });
                      setShowAddModal(false);
                    }}
                    className="p-2.5 bg-[#FFFFFF] hover:bg-[#EAE7E4] border border-[#1A1A1A]/10 flex items-center justify-between cursor-pointer transition text-xs"
                  >
                    <div>
                      <div className="font-serif italic text-sm text-[#1A1A1A]">{item.name}</div>
                      <div className="text-[10px] text-[#1A1A1A]/60">
                        P:{item.proteinG}g | C:{item.carbsG}g | F:{item.fatG}g
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-serif text-sm font-semibold">{item.calories} kcal</span>
                      <div className="text-[9px] font-sans font-bold uppercase text-emerald-800 tracking-wider">+ Add</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Manual Form Entry */}
            <form onSubmit={handleSaveCustomItem} className="space-y-3 pt-3 border-t border-[#1A1A1A]/10 font-sans">
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#1A1A1A]/70">Manual Item Details:</div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#1A1A1A]/60 mb-1">Food Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Grilled Chicken Salad"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#1A1A1A]/20 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] font-serif italic"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#1A1A1A]/60 mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 350"
                    value={caloriesInput}
                    onChange={(e) => setCaloriesInput(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#1A1A1A]/20 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] font-serif font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#1A1A1A]/60 mb-1">Portion Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 serving"
                    value={portionInput}
                    onChange={(e) => setPortionInput(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#1A1A1A]/20 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-[#1A1A1A]/60 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={proteinInput}
                    onChange={(e) => setProteinInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#1A1A1A]/20 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-[#1A1A1A]/60 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={carbsInput}
                    onChange={(e) => setCarbsInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#1A1A1A]/20 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-[#1A1A1A]/60 mb-1">Fat (g)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={fatInput}
                    onChange={(e) => setFatInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#1A1A1A]/20 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2 border border-[#1A1A1A]/20 text-[#1A1A1A] text-xs font-bold uppercase tracking-wider hover:bg-[#EAE7E4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#1A1A1A] text-[#F8F5F2] hover:bg-black text-xs font-bold uppercase tracking-wider"
                >
                  Save to Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
