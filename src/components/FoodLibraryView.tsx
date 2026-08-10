import React, { useState } from 'react';
import { BookOpen, Search, Plus, Utensils, CheckCircle2, Filter } from 'lucide-react';
import { SuggestedFood, MealType } from '../types';
import { CURATED_SUGGESTED_FOODS } from '../utils/nutrition';

interface FoodLibraryViewProps {
  onAddFoodToLog: (food: SuggestedFood) => void;
}

export const FoodLibraryView: React.FC<FoodLibraryViewProps> = ({ onAddFoodToLog }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [mealFilter, setMealFilter] = useState<string>('all');
  const [addedItemName, setAddedItemName] = useState<string | null>(null);

  const filtered = CURATED_SUGGESTED_FOODS.filter((item) => {
    const matchesMeal = mealFilter === 'all' || item.mealType === mealFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMeal && matchesSearch;
  });

  const handleAdd = (food: SuggestedFood) => {
    onAddFoodToLog(food);
    setAddedItemName(food.name);
    setTimeout(() => {
      setAddedItemName(null);
    }, 2500);
  };

  return (
    <div className="space-y-8 text-[#1A1A1A]">
      {addedItemName && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1A1A] text-[#F8F5F2] px-5 py-3 shadow-2xl flex items-center space-x-3 border border-[#1A1A1A]/20 font-sans">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider">Added "{addedItemName}" to today's log!</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#FFFFFF] p-8 border border-[#1A1A1A]/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="text-[10px] uppercase font-sans font-bold tracking-[0.2em] text-[#1A1A1A]/50">INDEXED NUTRITION</div>
          <h2 className="text-2xl sm:text-3xl font-serif font-light text-[#1A1A1A] mt-1">
            Food Reference Database
          </h2>
          <p className="text-xs font-serif text-[#1A1A1A]/60 mt-1 max-w-xl">
            Browse nutrient-dense foods with verified calorie counts and complete macronutrient profiles.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 font-sans">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#1A1A1A]/40 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search food or ingredient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-[#F8F5F2] border border-[#1A1A1A]/20 text-xs text-[#1A1A1A] placeholder-[#1A1A1A]/40 focus:outline-none focus:border-[#1A1A1A]"
            />
          </div>

          <div className="flex space-x-1 bg-[#F8F5F2] p-1 border border-[#1A1A1A]/10 text-xs w-full sm:w-auto">
            {['all', 'breakfast', 'lunch', 'dinner', 'snack'].map((m) => (
              <button
                key={m}
                onClick={() => setMealFilter(m)}
                className={`px-3 py-1.5 capitalize font-bold text-xs tracking-wider transition ${
                  mealFilter === m ? 'bg-[#1A1A1A] text-[#F8F5F2]' : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Food Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-[#1A1A1A]/50 font-serif italic text-sm bg-[#FFFFFF] border border-[#1A1A1A]/10">
            No foods found matching "{searchTerm}".
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-[#FFFFFF] p-6 border border-[#1A1A1A]/10 shadow-sm flex flex-col justify-between hover:border-[#1A1A1A]/30 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-[#1A1A1A] bg-[#EAE7E4] px-2.5 py-1 border border-[#1A1A1A]/10">
                    {item.mealType}
                  </span>
                  <span className="text-xs font-serif font-bold text-[#1A1A1A] bg-[#F8F5F2] px-2.5 py-1 border border-[#1A1A1A]/10">
                    {item.calories} kcal
                  </span>
                </div>

                <h4 className="text-lg font-serif font-normal text-[#1A1A1A]">{item.name}</h4>
                <p className="text-xs font-serif italic text-[#1A1A1A]/70 mt-2 line-clamp-2 leading-relaxed">{item.description}</p>

                {/* Portion size & tags */}
                <div className="mt-3 flex flex-wrap gap-1.5 font-sans">
                  {item.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] uppercase tracking-wider bg-[#F8F5F2] text-[#1A1A1A]/70 px-2 py-0.5 border border-[#1A1A1A]/10 font-bold"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Macros */}
                <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-[#1A1A1A]/10 text-xs font-sans">
                  <span className="text-[#1A1A1A] font-bold text-[10px]">P: {item.proteinG}g</span>
                  <span className="text-[#1A1A1A]/30">•</span>
                  <span className="text-[#1A1A1A] font-bold text-[10px]">C: {item.carbsG}g</span>
                  <span className="text-[#1A1A1A]/30">•</span>
                  <span className="text-[#1A1A1A] font-bold text-[10px]">F: {item.fatG}g</span>
                </div>
              </div>

              <button
                onClick={() => handleAdd(item)}
                className="mt-6 w-full py-2.5 px-4 bg-[#1A1A1A] text-[#F8F5F2] hover:bg-black font-sans font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log to Calorie Journal</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
