import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Plus,
  Scale,
  MessageSquare,
  ThumbsUp,
  Flame,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { UserProfile, SuggestedFood } from '../types';

interface AINutritionAdviceResult {
  headline: string;
  verdict: string;
  recommendation: string;
  comparison?: Array<{
    foodName: string;
    portion?: string;
    calories: string;
    proteinG: number;
    carbsG: number;
    fatG: number;
    pros: string[];
    cons: string[];
  }>;
  keyTakeaways: string[];
  suggestedMeal?: {
    name: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    portionSize?: string;
    description?: string;
  };
  suggestedFollowUpQuestions?: string[];
}

interface ChatHistoryItem {
  id: string;
  question: string;
  advice: AINutritionAdviceResult;
  timestamp: string;
}

interface AINutritionChatViewProps {
  userProfile: UserProfile;
  onAddFoodToLog: (food: SuggestedFood) => void;
}

const SAMPLE_QUESTIONS = [
  'Salmon vs Chicken Breast for dinner?',
  'White Rice vs Brown Rice vs Quinoa?',
  'What should I eat before & after a workout?',
  'Is peanut butter good for a calorie deficit?',
  'Eggs vs Greek Yogurt for high-protein breakfast?',
  'What are low-calorie high-volume snacks for late night?',
];

export const AINutritionChatView: React.FC<AINutritionChatViewProps> = ({
  userProfile,
  onAddFoodToLog,
}) => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [addedItemName, setAddedItemName] = useState<string | null>(null);

  const [history, setHistory] = useState<ChatHistoryItem[]>([]);

  const handleAskAI = async (queryToAsk?: string) => {
    const q = (queryToAsk || question).trim();
    if (!q) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/nutrition-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          userProfile,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch nutrition advice');
      }

      const newItem: ChatHistoryItem = {
        id: `chat_${Date.now()}`,
        question: q,
        advice: data.advice,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setHistory((prev) => [newItem, ...prev]);
      setQuestion('');
    } catch (err: any) {
      console.error('Error in AI nutrition chat:', err);
      setErrorMsg(err.message || 'Error connecting to AI Nutritionist');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMealToJournal = (meal: Required<AINutritionAdviceResult>['suggestedMeal']) => {
    const food: SuggestedFood = {
      id: `ai_adv_${Date.now()}`,
      name: meal.name,
      calories: meal.calories,
      proteinG: meal.proteinG,
      carbsG: meal.carbsG,
      fatG: meal.fatG,
      mealType: meal.mealType || 'lunch',
      portionSize: meal.portionSize || '1 serving',
      description: meal.description || 'AI Recommended Meal',
      tags: ['AI Recommended', 'Optimal Nutrition'],
    };

    onAddFoodToLog(food);
    setAddedItemName(meal.name);
    setTimeout(() => setAddedItemName(null), 3500);
  };

  return (
    <div className="space-y-8 text-[#1A1A1A]">
      {/* Toast Notification */}
      {addedItemName && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1A1A] text-[#F8F5F2] px-5 py-3 shadow-2xl flex items-center space-x-3 border border-[#1A1A1A]/20 font-sans">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Added "{addedItemName}" to today's log!
          </span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#1A1A1A] text-[#F8F5F2] p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-[#F8F5F2]/60 text-[10px] font-sans font-bold uppercase tracking-[0.2em]">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>INTERACTIVE NUTRITIONIST</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-light text-[#F8F5F2] mt-1">
            Ask AI: What is Better to Eat?
          </h2>
          <p className="text-xs font-serif text-[#F8F5F2]/70 mt-1 max-w-xl leading-relaxed">
            Get instant food comparisons, meal advice, calorie & macro tradeoffs, and personalized recommendations tailored to your {userProfile.goal} goal ({userProfile.dailyCalorieTarget} kcal daily allowance).
          </p>
        </div>

        <div className="bg-[#F8F5F2]/10 p-4 border border-[#F8F5F2]/15 text-right font-sans self-start md:self-auto min-w-[180px]">
          <div className="text-[9px] uppercase font-bold tracking-widest text-[#F8F5F2]/60">Your Active Target</div>
          <div className="text-lg font-serif font-light text-[#F8F5F2] mt-0.5">
            {userProfile.dailyCalorieTarget} kcal/day
          </div>
          <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">
            Goal: {userProfile.goal === 'lose' ? 'Calorie Deficit' : userProfile.goal === 'gain' ? 'Surplus' : 'Maintenance'}
          </div>
        </div>
      </div>

      {/* Question Input Card */}
      <div className="bg-[#FFFFFF] p-8 border border-[#1A1A1A]/10 shadow-sm space-y-6">
        <div>
          <div className="text-[10px] uppercase font-sans font-bold tracking-[0.2em] text-[#1A1A1A]/50">INQUIRY FORM</div>
          <h3 className="text-xl font-serif font-light text-[#1A1A1A]">Ask a Nutrition Question or Compare Foods</h3>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskAI();
          }}
          className="space-y-4 font-sans"
        >
          <div className="relative">
            <textarea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Is salmon or chicken breast better for dinner when trying to lose weight? Or ask: What should I eat before working out?"
              className="w-full p-4 bg-[#F8F5F2] border border-[#1A1A1A]/20 text-sm text-[#1A1A1A] placeholder-[#1A1A1A]/40 focus:outline-none focus:border-[#1A1A1A] font-serif leading-relaxed"
            />
            <button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="absolute right-3 bottom-4 px-6 py-2.5 bg-[#1A1A1A] text-[#F8F5F2] hover:bg-black disabled:opacity-40 font-sans font-bold text-xs uppercase tracking-widest flex items-center space-x-2 transition shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Consulting AI...' : 'Ask AI'}</span>
            </button>
          </div>
        </form>

        {/* 1-Click Sample Question Pills */}
        <div className="pt-2 border-t border-[#1A1A1A]/10 font-sans">
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#1A1A1A]/50 mb-2.5">
            Quick Prompts (Click to ask):
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.map((sq, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuestion(sq);
                  handleAskAI(sq);
                }}
                disabled={isLoading}
                className="px-3 py-1.5 bg-[#F8F5F2] hover:bg-[#1A1A1A] hover:text-[#F8F5F2] text-xs text-[#1A1A1A]/80 font-medium border border-[#1A1A1A]/15 transition flex items-center space-x-1"
              >
                <HelpCircle className="w-3 h-3 text-[#1A1A1A]/40" />
                <span>{sq}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-sans">
          <AlertCircle className="w-4 h-4 text-rose-800" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="py-16 bg-[#FFFFFF] border border-[#1A1A1A]/10 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-[#1A1A1A] animate-spin mx-auto" />
          <p className="text-base font-serif italic text-[#1A1A1A]">
            AI Nutritionist analyzing macronutrients, satiety index, and dietary tradeoffs...
          </p>
          <p className="text-[10px] font-sans uppercase font-bold text-[#1A1A1A]/40 tracking-widest">
            Powered by Gemini AI 3.6
          </p>
        </div>
      )}

      {/* Answers History Feed */}
      {history.length > 0 && (
        <div className="space-y-8">
          <div className="border-b border-[#1A1A1A]/10 pb-3">
            <div className="text-[10px] uppercase font-sans font-bold tracking-[0.2em] text-[#1A1A1A]/50">
              NUTRITION ADVICE RESPONSE
            </div>
            <h3 className="text-2xl font-serif font-light text-[#1A1A1A]">
              AI Advisor Insights ({history.length})
            </h3>
          </div>

          {history.map((item) => {
            const advice = item.advice;
            return (
              <div
                key={item.id}
                className="bg-[#FFFFFF] border border-[#1A1A1A]/15 shadow-sm p-8 space-y-6"
              >
                {/* User Question Header */}
                <div className="flex items-start justify-between border-b border-[#1A1A1A]/10 pb-4">
                  <div>
                    <div className="text-[9px] font-sans uppercase font-bold tracking-widest text-[#1A1A1A]/50">
                      Query • {item.timestamp}
                    </div>
                    <h4 className="text-xl font-serif italic text-[#1A1A1A] mt-1">
                      "{item.question}"
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 bg-[#1A1A1A] text-[#F8F5F2] text-[9px] font-sans uppercase font-bold tracking-widest">
                    AI Verified
                  </span>
                </div>

                {/* Verdict Headline Card */}
                <div className="bg-[#1A1A1A] text-[#F8F5F2] p-6 space-y-2">
                  <div className="text-[9px] font-sans font-bold uppercase tracking-[0.25em] text-amber-300 flex items-center gap-1.5">
                    <ThumbsUp className="w-3.5 h-3.5" /> VERDICT & RECOMMENDATION
                  </div>
                  <h5 className="text-lg sm:text-xl font-serif font-normal text-[#F8F5F2]">
                    {advice.headline}
                  </h5>
                  <p className="text-xs font-serif text-[#F8F5F2]/80 leading-relaxed pt-1">
                    {advice.verdict}
                  </p>
                  <p className="text-xs font-serif italic text-[#F8F5F2]/70 pt-2 border-t border-[#F8F5F2]/15">
                    <strong>Tailored Advice:</strong> {advice.recommendation}
                  </p>
                </div>

                {/* Side-by-Side Food Comparison Cards (If present) */}
                {advice.comparison && advice.comparison.length > 0 && (
                  <div className="space-y-3 font-sans">
                    <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#1A1A1A]/50">
                      SIDE-BY-SIDE NUTRITION BREAKDOWN
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {advice.comparison.map((c, idx) => (
                        <div
                          key={idx}
                          className="bg-[#F8F5F2] p-5 border border-[#1A1A1A]/10 shadow-xs flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-2 mb-3">
                              <h6 className="font-serif text-lg font-normal text-[#1A1A1A]">
                                {c.foodName}
                              </h6>
                              <span className="text-xs font-serif font-bold text-[#1A1A1A]">
                                {c.calories}
                              </span>
                            </div>

                            {/* Macros pills */}
                            <div className="flex items-center space-x-2 text-[10px] font-bold mb-4">
                              <span className="bg-[#FFFFFF] px-2 py-0.5 border border-[#1A1A1A]/10 text-[#1A1A1A]">
                                P: {c.proteinG}g
                              </span>
                              <span className="bg-[#FFFFFF] px-2 py-0.5 border border-[#1A1A1A]/10 text-[#1A1A1A]">
                                C: {c.carbsG}g
                              </span>
                              <span className="bg-[#FFFFFF] px-2 py-0.5 border border-[#1A1A1A]/10 text-[#1A1A1A]">
                                F: {c.fatG}g
                              </span>
                            </div>

                            {/* Pros */}
                            <div className="space-y-1.5 mb-3">
                              <div className="text-[9px] uppercase font-bold tracking-wider text-emerald-800">
                                Benefits & Advantages:
                              </div>
                              <ul className="text-xs font-serif text-[#1A1A1A]/80 space-y-1 list-disc list-inside">
                                {c.pros.map((p, pIdx) => (
                                  <li key={pIdx}>{p}</li>
                                ))}
                              </ul>
                            </div>

                            {/* Cons */}
                            {c.cons && c.cons.length > 0 && (
                              <div className="space-y-1.5">
                                <div className="text-[9px] uppercase font-bold tracking-wider text-amber-800">
                                  Considerations:
                                </div>
                                <ul className="text-xs font-serif text-[#1A1A1A]/70 space-y-1 list-disc list-inside">
                                  {c.cons.map((con, cIdx) => (
                                    <li key={cIdx}>{con}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Takeaways */}
                {advice.keyTakeaways && advice.keyTakeaways.length > 0 && (
                  <div className="bg-[#F8F5F2] p-5 border border-[#1A1A1A]/10 space-y-3 font-sans">
                    <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#1A1A1A]/60 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>KEY TAKEAWAYS & SATIETY TIPS</span>
                    </div>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-serif text-[#1A1A1A]/80">
                      {advice.keyTakeaways.map((t, tIdx) => (
                        <li key={tIdx} className="flex items-start space-x-2">
                          <span className="text-[#1A1A1A] font-bold">•</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommended Meal Card (If present) */}
                {advice.suggestedMeal && (
                  <div className="border border-[#1A1A1A]/20 bg-[#F8F5F2] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
                    <div>
                      <div className="text-[9px] uppercase font-bold tracking-widest text-[#1A1A1A]/50">
                        RECOMMENDED MEAL OPTION
                      </div>
                      <h6 className="text-lg font-serif font-normal text-[#1A1A1A] mt-0.5">
                        {advice.suggestedMeal.name}
                      </h6>
                      <p className="text-xs font-serif italic text-[#1A1A1A]/70 mt-1">
                        {advice.suggestedMeal.calories} kcal • P: {advice.suggestedMeal.proteinG}g | C: {advice.suggestedMeal.carbsG}g | F: {advice.suggestedMeal.fatG}g ({advice.suggestedMeal.portionSize || '1 portion'})
                      </p>
                    </div>

                    <button
                      onClick={() => handleAddMealToJournal(advice.suggestedMeal!)}
                      className="px-5 py-2.5 bg-[#1A1A1A] text-[#F8F5F2] hover:bg-black font-sans font-bold text-xs uppercase tracking-widest flex items-center space-x-2 transition self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Log Meal ({advice.suggestedMeal.calories} kcal)</span>
                    </button>
                  </div>
                )}

                {/* Follow-up Question Pills */}
                {advice.suggestedFollowUpQuestions && advice.suggestedFollowUpQuestions.length > 0 && (
                  <div className="pt-2 font-sans">
                    <div className="text-[9px] uppercase font-bold tracking-wider text-[#1A1A1A]/50 mb-2">
                      Suggested Follow-up Questions:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {advice.suggestedFollowUpQuestions.map((fq, fIdx) => (
                        <button
                          key={fIdx}
                          onClick={() => {
                            setQuestion(fq);
                            handleAskAI(fq);
                          }}
                          disabled={isLoading}
                          className="px-3 py-1 bg-[#F8F5F2] hover:bg-[#1A1A1A] hover:text-[#F8F5F2] text-xs text-[#1A1A1A]/70 font-medium border border-[#1A1A1A]/10 transition flex items-center space-x-1"
                        >
                          <ArrowRight className="w-3 h-3" />
                          <span>{fq}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
