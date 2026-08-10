import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  CheckCircle2,
  Clock,
  ChefHat,
  Utensils,
  Flame,
  Search,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { UserProfile, SuggestedFood, MealType, DietGoal } from '../types';
import { CURATED_SUGGESTED_FOODS } from '../utils/nutrition';

interface AIFoodSuggestionsViewProps {
  userProfile: UserProfile;
  remainingDailyCalories: number;
  onAddFoodToLog: (food: SuggestedFood) => void;
}

export const AIFoodSuggestionsView: React.FC<AIFoodSuggestionsViewProps> = ({
  userProfile,
  remainingDailyCalories,
  onAddFoodToLog,
}) => {
  // AI Generator Form State
  const [selectedMealType, setSelectedMealType] = useState<MealType | 'any'>('any');
  const [targetCalories, setTargetCalories] = useState<number>(
    remainingDailyCalories > 0 ? Math.min(600, remainingDailyCalories) : 450
  );
  const [dietStyle, setDietStyle] = useState<string>(userProfile.dietPreference || 'balanced');
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');

  // AI Loading & Output State
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<SuggestedFood[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Accordion state for recipe steps
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);

  // Tab: AI Generator vs Curated Library
  const [activeTab, setActiveTab] = useState<'ai' | 'curated'>('ai');
  const [curatedMealFilter, setCuratedMealFilter] = useState<string>('all');
  const [curatedSearch, setCuratedSearch] = useState('');

  // Added Success Notification Toast
  const [addedItemName, setAddedItemName] = useState<string | null>(null);

  const handleGenerateAISuggestions = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/suggest-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealType: selectedMealType,
          targetCalories,
          dietPreference: dietStyle,
          ingredients: ingredientsInput,
          dietaryRestrictions,
          goal: userProfile.goal,
          userWeightKg: userProfile.currentWeightKg,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        const formattedSuggestions: SuggestedFood[] = data.suggestions.map(
          (item: any, idx: number) => ({
            id: `ai_sugg_${Date.now()}_${idx}`,
            name: item.name,
            calories: item.calories || 400,
            proteinG: item.proteinG || 25,
            carbsG: item.carbsG || 35,
            fatG: item.fatG || 12,
            mealType: (item.mealType as MealType) || (selectedMealType !== 'any' ? selectedMealType : 'lunch'),
            description: item.description || 'Nutrient-rich balanced meal suggestion.',
            portionSize: item.portionSize || '1 serving',
            prepTimeMin: item.prepTimeMin || 15,
            tags: item.tags || ['AI Suggested', 'Healthy'],
            recipeInstructions: item.recipeInstructions || [],
            benefits: item.benefits || 'High nutritional density supporting your diet goals.',
          })
        );
        setAiSuggestions(formattedSuggestions);
      } else {
        setErrorMsg('Failed to fetch custom AI suggestions. Showing recommended curated meals below.');
        setAiSuggestions(CURATED_SUGGESTED_FOODS.slice(0, 3));
      }
    } catch (err: any) {
      console.error('AI Suggestion error:', err);
      setErrorMsg('AI Service temporary busy. Loaded featured diet recommendations.');
      setAiSuggestions(CURATED_SUGGESTED_FOODS.slice(0, 3));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddAndNotify = (food: SuggestedFood) => {
    onAddFoodToLog(food);
    setAddedItemName(food.name);
    setTimeout(() => {
      setAddedItemName(null);
    }, 3000);
  };

  const filteredCurated = CURATED_SUGGESTED_FOODS.filter((item) => {
    const matchesMeal = curatedMealFilter === 'all' || item.mealType === curatedMealFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(curatedSearch.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(curatedSearch.toLowerCase()));
    return matchesMeal && matchesSearch;
  });

  return (
    <div className="space-y-8 text-[#1A1A1A]">
      {/* Toast Notification */}
      {addedItemName && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1A1A] text-[#F8F5F2] px-5 py-3 shadow-2xl flex items-center space-x-3 border border-[#1A1A1A]/20 font-sans">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider">Added "{addedItemName}" to today's log!</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#1A1A1A] text-[#F8F5F2] p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-[#F8F5F2]/60 text-[10px] font-sans font-bold uppercase tracking-[0.2em]">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>INTELLIGENT NOURISHMENT</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-light text-[#F8F5F2] mt-1">Suggested Foods with Exact Calories</h2>
          <p className="text-xs font-serif text-[#F8F5F2]/70 mt-1 max-w-xl leading-relaxed">
            Get personalized meal ideas tailored to your remaining budget ({remainingDailyCalories} kcal remaining today), target macros, and dietary preferences.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-[#F8F5F2]/10 p-1 border border-[#F8F5F2]/20 self-start md:self-auto font-sans">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold uppercase tracking-widest transition ${
              activeTab === 'ai'
                ? 'bg-[#F8F5F2] text-[#1A1A1A]'
                : 'text-[#F8F5F2]/70 hover:text-[#F8F5F2]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Generator</span>
          </button>
          <button
            onClick={() => setActiveTab('curated')}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold uppercase tracking-widest transition ${
              activeTab === 'curated'
                ? 'bg-[#F8F5F2] text-[#1A1A1A]'
                : 'text-[#F8F5F2]/70 hover:text-[#F8F5F2]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Curated Library ({CURATED_SUGGESTED_FOODS.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'ai' ? (
        <div className="space-y-6">
          {/* AI Request Form Box */}
          <div className="bg-[#FFFFFF] p-8 border border-[#1A1A1A]/10 shadow-sm space-y-6">
            <div>
              <div className="text-[10px] uppercase font-sans font-bold tracking-[0.2em] text-[#1A1A1A]/50">PARAMETERS</div>
              <h3 className="text-xl font-serif font-light text-[#1A1A1A]">Customize AI Generator</h3>
            </div>

            <form onSubmit={handleGenerateAISuggestions} className="space-y-5 font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Meal Type */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                    Meal Type
                  </label>
                  <select
                    value={selectedMealType}
                    onChange={(e) => setSelectedMealType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#F8F5F2] border border-[#1A1A1A]/20 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  >
                    <option value="any">Any Meal Type</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>

                {/* Calorie Budget */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                    Target Meal Calories (kcal)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="25"
                      min="100"
                      max="1500"
                      value={targetCalories}
                      onChange={(e) => setTargetCalories(parseInt(e.target.value) || 400)}
                      className="w-full px-3.5 py-2.5 bg-[#F8F5F2] border border-[#1A1A1A]/20 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] font-serif font-bold"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setTargetCalories(Math.max(200, remainingDailyCalories))
                      }
                      className="absolute right-2 top-2 px-2 py-0.5 bg-[#1A1A1A] text-[#F8F5F2] text-[9px] font-bold uppercase tracking-wider hover:bg-black"
                    >
                      Remaining
                    </button>
                  </div>
                </div>

                {/* Diet Style */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                    Diet Style
                  </label>
                  <select
                    value={dietStyle}
                    onChange={(e) => setDietStyle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8F5F2] border border-[#1A1A1A]/20 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] capitalize"
                  >
                    <option value="balanced">Balanced Macros</option>
                    <option value="high_protein">High Protein (Muscle Building)</option>
                    <option value="low_carb">Low Carb / Keto</option>
                    <option value="mediterranean">Mediterranean</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan / Plant-based</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                    Available Ingredients / Cravings
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., chicken breast, avocado, berries"
                    value={ingredientsInput}
                    onChange={(e) => setIngredientsInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8F5F2] border border-[#1A1A1A]/20 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] font-serif italic"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                    Dietary Restrictions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., dairy-free, gluten-free, under 15 mins"
                    value={dietaryRestrictions}
                    onChange={(e) => setDietaryRestrictions(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8F5F2] border border-[#1A1A1A]/20 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-6 py-3 bg-[#1A1A1A] text-[#F8F5F2] hover:bg-black disabled:opacity-50 font-bold text-xs uppercase tracking-widest flex items-center space-x-2 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGenerating ? 'Analyzing Nutrients...' : 'Generate AI Meal Suggestions'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* AI Results Output Grid */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-[#1A1A1A]/10 pb-3">
              <div>
                <div className="text-[10px] uppercase font-sans font-bold tracking-[0.2em] text-[#1A1A1A]/50">GENERATED CATALOG</div>
                <h3 className="text-xl font-serif font-light text-[#1A1A1A]">Suggested Food Results</h3>
              </div>
              {aiSuggestions.length > 0 && (
                <span className="text-xs font-sans text-[#1A1A1A]/50">
                  {aiSuggestions.length} custom meal options
                </span>
              )}
            </div>

            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs mb-4 flex items-center gap-2 font-sans">
                <AlertCircle className="w-4 h-4 text-rose-800" />
                <span>{errorMsg}</span>
              </div>
            )}

            {isGenerating ? (
              <div className="py-16 bg-[#FFFFFF] border border-[#1A1A1A]/10 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-[#1A1A1A] animate-spin mx-auto" />
                <p className="text-sm font-serif italic text-[#1A1A1A]">
                  Calculating macronutrients & generating chef-crafted recipe suggestions...
                </p>
                <p className="text-[10px] font-sans uppercase font-bold text-[#1A1A1A]/40 tracking-widest">Powered by Gemini AI</p>
              </div>
            ) : aiSuggestions.length === 0 ? (
              <div className="py-12 bg-[#FFFFFF] border border-dashed border-[#1A1A1A]/20 text-center space-y-3">
                <ChefHat className="w-10 h-10 text-[#1A1A1A]/30 mx-auto" />
                <p className="text-[#1A1A1A]/70 text-sm font-serif italic">
                  Click "Generate AI Meal Suggestions" above to receive custom diet recommendations with calories.
                </p>
                <button
                  onClick={() => handleGenerateAISuggestions()}
                  className="px-5 py-2.5 bg-[#1A1A1A] text-[#F8F5F2] hover:bg-black font-sans font-bold text-xs uppercase tracking-wider transition"
                >
                  Instant AI Generator
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiSuggestions.map((item) => {
                  const isExpanded = expandedRecipeId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="bg-[#FFFFFF] p-6 border border-[#1A1A1A]/10 shadow-sm flex flex-col justify-between hover:border-[#1A1A1A]/30 transition group"
                    >
                      <div>
                        {/* Tags & Calorie badge */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-[#1A1A1A] bg-[#EAE7E4] px-2.5 py-1 border border-[#1A1A1A]/10">
                            {item.mealType}
                          </span>
                          <span className="text-xs font-serif font-bold text-[#1A1A1A] bg-[#F8F5F2] px-2.5 py-1 border border-[#1A1A1A]/10">
                            {item.calories} kcal
                          </span>
                        </div>

                        <h4 className="text-lg font-serif font-normal text-[#1A1A1A] group-hover:text-black transition">
                          {item.name}
                        </h4>
                        <p className="text-xs font-serif italic text-[#1A1A1A]/70 mt-2 leading-relaxed line-clamp-3">
                          {item.description}
                        </p>

                        {/* Portion & Prep time */}
                        <div className="flex items-center space-x-3 mt-4 text-[11px] font-sans text-[#1A1A1A]/60 border-t border-[#1A1A1A]/10 pt-3">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-[#1A1A1A]/40" />
                            <span>{item.prepTimeMin || 10} mins prep</span>
                          </span>
                          <span>•</span>
                          <span>{item.portionSize}</span>
                        </div>

                        {/* Macros Pill Bar */}
                        <div className="flex items-center space-x-2 mt-3 text-xs font-sans">
                          <span className="bg-[#F8F5F2] px-2 py-0.5 border border-[#1A1A1A]/10 text-[#1A1A1A] text-[10px] font-bold">
                            P: {item.proteinG}g
                          </span>
                          <span className="bg-[#F8F5F2] px-2 py-0.5 border border-[#1A1A1A]/10 text-[#1A1A1A] text-[10px] font-bold">
                            C: {item.carbsG}g
                          </span>
                          <span className="bg-[#F8F5F2] px-2 py-0.5 border border-[#1A1A1A]/10 text-[#1A1A1A] text-[10px] font-bold">
                            F: {item.fatG}g
                          </span>
                        </div>

                        {/* Recipe instructions accordion */}
                        {item.recipeInstructions && item.recipeInstructions.length > 0 && (
                          <div className="mt-4 font-sans">
                            <button
                              onClick={() =>
                                setExpandedRecipeId(isExpanded ? null : item.id)
                              }
                              className="text-[10px] uppercase font-bold tracking-wider text-[#1A1A1A] hover:underline flex items-center space-x-1"
                            >
                              <span>{isExpanded ? 'Hide Preparation Steps' : 'View Preparation Steps'}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>

                            {isExpanded && (
                              <ol className="mt-2 text-xs font-serif text-[#1A1A1A]/80 space-y-1.5 bg-[#F8F5F2] p-4 border border-[#1A1A1A]/10 list-decimal list-inside">
                                {item.recipeInstructions.map((step, idx) => (
                                  <li key={idx} className="leading-relaxed">
                                    {step}
                                  </li>
                                ))}
                              </ol>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Log Button */}
                      <button
                        onClick={() => handleAddAndNotify(item)}
                        className="mt-6 w-full py-2.5 px-4 bg-[#1A1A1A] text-[#F8F5F2] hover:bg-black font-sans font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Log to Calorie Journal</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Curated Library Tab */
        <div className="space-y-6 font-sans">
          <div className="bg-[#FFFFFF] p-5 border border-[#1A1A1A]/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Meal Filter Pills */}
            <div className="flex space-x-1 bg-[#F8F5F2] p-1 border border-[#1A1A1A]/10 text-xs">
              {['all', 'breakfast', 'lunch', 'dinner', 'snack'].map((m) => (
                <button
                  key={m}
                  onClick={() => setCuratedMealFilter(m)}
                  className={`px-3 py-1.5 capitalize font-bold text-xs tracking-wider transition ${
                    curatedMealFilter === m
                      ? 'bg-[#1A1A1A] text-[#F8F5F2]'
                      : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Search input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#1A1A1A]/40 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search food or tag..."
                value={curatedSearch}
                onChange={(e) => setCuratedSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-[#F8F5F2] border border-[#1A1A1A]/20 text-xs text-[#1A1A1A] placeholder-[#1A1A1A]/40 focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCurated.map((item) => (
              <div
                key={item.id}
                className="bg-[#FFFFFF] p-6 border border-[#1A1A1A]/10 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#1A1A1A] bg-[#EAE7E4] px-2.5 py-1 border border-[#1A1A1A]/10">
                      {item.mealType}
                    </span>
                    <span className="text-xs font-serif font-bold text-[#1A1A1A] bg-[#F8F5F2] px-2.5 py-1 border border-[#1A1A1A]/10">
                      {item.calories} kcal
                    </span>
                  </div>

                  <h4 className="text-lg font-serif font-normal text-[#1A1A1A]">{item.name}</h4>
                  <p className="text-xs font-serif italic text-[#1A1A1A]/70 mt-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-center space-x-2 mt-4 text-xs">
                    <span className="bg-[#F8F5F2] px-2 py-0.5 border border-[#1A1A1A]/10 text-[#1A1A1A] text-[10px] font-bold">
                      P: {item.proteinG}g
                    </span>
                    <span className="bg-[#F8F5F2] px-2 py-0.5 border border-[#1A1A1A]/10 text-[#1A1A1A] text-[10px] font-bold">
                      C: {item.carbsG}g
                    </span>
                    <span className="bg-[#F8F5F2] px-2 py-0.5 border border-[#1A1A1A]/10 text-[#1A1A1A] text-[10px] font-bold">
                      F: {item.fatG}g
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleAddAndNotify(item)}
                  className="mt-6 w-full py-2.5 px-4 bg-[#1A1A1A] text-[#F8F5F2] hover:bg-black font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Food ({item.calories} kcal)</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
