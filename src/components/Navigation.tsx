import React from 'react';
import { LayoutDashboard, Scale, Flame, Sparkles, BookOpen } from 'lucide-react';

export type NavTab = 'dashboard' | 'weight' | 'calories' | 'ai_chat' | 'ai_suggestions' | 'food_library';

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab }) => {
  const tabs: Array<{ id: NavTab; label: string; icon: React.ElementType; badge?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'weight', label: 'Weight Log', icon: Scale },
    { id: 'calories', label: 'Calorie Tracker', icon: Flame },
    { id: 'ai_chat', label: 'Ask AI: What to Eat?', icon: Sparkles, badge: 'NEW' },
    { id: 'ai_suggestions', label: 'Meal Suggestions', icon: Sparkles },
    { id: 'food_library', label: 'Food Library', icon: BookOpen },
  ];

  return (
    <nav className="bg-[#F8F5F2] border-b border-[#1A1A1A]/10 text-[#1A1A1A]/70 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-2 sm:space-x-6 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center space-x-2 py-3 px-3 text-xs uppercase tracking-[0.15em] font-bold border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-[#1A1A1A] text-[#1A1A1A] bg-[#1A1A1A]/5'
                  : 'border-transparent text-[#1A1A1A]/50 hover:text-[#1A1A1A] hover:border-[#1A1A1A]/30'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#1A1A1A]' : 'text-[#1A1A1A]/40'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="ml-1 text-[9px] px-1.5 py-0.2 font-bold bg-[#1A1A1A] text-[#F8F5F2] uppercase tracking-wider">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
