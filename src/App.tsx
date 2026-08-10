import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { WeightTrackerView } from './components/WeightTrackerView';
import { CalorieTrackerView } from './components/CalorieTrackerView';
import { AIFoodSuggestionsView } from './components/AIFoodSuggestionsView';
import { AINutritionChatView } from './components/AINutritionChatView';
import { FoodLibraryView } from './components/FoodLibraryView';
import { UserProfileModal } from './components/UserProfileModal';

import { UserProfile, WeightEntry, DailyCalorieLog, FoodItem, SuggestedFood, WeightUnit } from './types';
import {
  loadUserProfile,
  saveUserProfile,
  loadWeightEntries,
  saveWeightEntries,
  loadCalorieLogs,
  saveCalorieLogs,
  getTodayDateString,
} from './utils/storage';

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile>(loadUserProfile);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>(loadWeightEntries);
  const [calorieLogs, setCalorieLogs] = useState<DailyCalorieLog[]>(loadCalorieLogs);

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedCalorieDate, setSelectedCalorieDate] = useState<string>(getTodayDateString());

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Sync Profile Changes
  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    saveUserProfile(updatedProfile);
  };

  // Toggle Weight Unit (kg vs lbs)
  const handleToggleUnit = (newUnit: WeightUnit) => {
    const updated = { ...userProfile, unit: newUnit };
    setUserProfile(updated);
    saveUserProfile(updated);
  };

  // Add / Delete Weight Entries
  const handleAddWeightEntry = (newEntry: WeightEntry) => {
    // Check if date already exists; update or add
    const existsIndex = weightEntries.findIndex((e) => e.date === newEntry.date);
    let updated: WeightEntry[];
    if (existsIndex >= 0) {
      updated = [...weightEntries];
      updated[existsIndex] = newEntry;
    } else {
      updated = [...weightEntries, newEntry];
    }
    updated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setWeightEntries(updated);
    saveWeightEntries(updated);

    // Also update current weight in profile if entry date is latest
    const latest = updated[updated.length - 1];
    if (latest) {
      const updatedProfile = { ...userProfile, currentWeightKg: latest.weightKg };
      setUserProfile(updatedProfile);
      saveUserProfile(updatedProfile);
    }
  };

  const handleDeleteWeightEntry = (id: string) => {
    const updated = weightEntries.filter((e) => e.id !== id);
    setWeightEntries(updated);
    saveWeightEntries(updated);
  };

  // Calorie Log Items
  const handleAddFoodItem = (dateStr: string, item: FoodItem) => {
    const logIndex = calorieLogs.findIndex((l) => l.date === dateStr);
    let updatedLogs = [...calorieLogs];

    if (logIndex >= 0) {
      const existingLog = updatedLogs[logIndex];
      updatedLogs[logIndex] = {
        ...existingLog,
        items: [...existingLog.items, item],
      };
    } else {
      updatedLogs.push({
        id: `c_${dateStr}`,
        date: dateStr,
        items: [item],
        waterMl: 0,
      });
    }

    setCalorieLogs(updatedLogs);
    saveCalorieLogs(updatedLogs);
  };

  const handleDeleteFoodItem = (dateStr: string, itemId: string) => {
    const logIndex = calorieLogs.findIndex((l) => l.date === dateStr);
    if (logIndex < 0) return;

    let updatedLogs = [...calorieLogs];
    const existingLog = updatedLogs[logIndex];
    updatedLogs[logIndex] = {
      ...existingLog,
      items: existingLog.items.filter((i) => i.id !== itemId),
    };

    setCalorieLogs(updatedLogs);
    saveCalorieLogs(updatedLogs);
  };

  const handleUpdateWater = (amountMl: number, dateStr = selectedCalorieDate) => {
    const logIndex = calorieLogs.findIndex((l) => l.date === dateStr);
    let updatedLogs = [...calorieLogs];

    if (logIndex >= 0) {
      updatedLogs[logIndex] = {
        ...updatedLogs[logIndex],
        waterMl: amountMl,
      };
    } else {
      updatedLogs.push({
        id: `c_${dateStr}`,
        date: dateStr,
        items: [],
        waterMl: amountMl,
      });
    }

    setCalorieLogs(updatedLogs);
    saveCalorieLogs(updatedLogs);
  };

  // Add Suggested Food Directly to Today's Calorie Log
  const handleAddSuggestedFoodToLog = (food: SuggestedFood) => {
    const today = getTodayDateString();
    handleAddFoodItem(today, {
      id: `fi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: food.name,
      calories: food.calories,
      proteinG: food.proteinG,
      carbsG: food.carbsG,
      fatG: food.fatG,
      mealType: food.mealType,
      portion: food.portionSize,
    });
  };

  // Today Calorie Log object
  const todayStr = getTodayDateString();
  const todayCalorieLog = calorieLogs.find((l) => l.date === todayStr) || {
    id: `c_${todayStr}`,
    date: todayStr,
    items: [],
    waterMl: 0,
  };

  const todayCaloriesConsumed = todayCalorieLog.items.reduce(
    (acc, item) => acc + item.calories,
    0
  );

  const latestWeightKg = weightEntries[weightEntries.length - 1]?.weightKg || userProfile.currentWeightKg;

  return (
    <div className="min-h-screen bg-[#F8F5F2] text-[#1A1A1A] font-serif selection:bg-[#1A1A1A] selection:text-[#F8F5F2] flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <Header
          userProfile={userProfile}
          todayWeightKg={latestWeightKg}
          todayCaloriesConsumed={todayCaloriesConsumed}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenLogWeight={() => setActiveTab('weight')}
          onOpenLogMeal={() => {
            setSelectedCalorieDate(getTodayDateString());
            setActiveTab('calories');
          }}
          onOpenAISuggestions={() => setActiveTab('ai_suggestions')}
          onToggleUnit={handleToggleUnit}
        />

        {/* Main Tab Navigation */}
        <Navigation activeTab={activeTab} onSelectTab={(tab) => setActiveTab(tab)} />

        {/* Container Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              userProfile={userProfile}
              weightEntries={weightEntries}
              todayCalorieLog={todayCalorieLog}
              onNavigateTo={(tab) => {
                if (tab === 'calories') setSelectedCalorieDate(getTodayDateString());
                setActiveTab(tab);
              }}
              onOpenLogWeight={() => setActiveTab('weight')}
              onOpenLogMeal={() => {
                setSelectedCalorieDate(getTodayDateString());
                setActiveTab('calories');
              }}
              onAddFoodToLog={handleAddSuggestedFoodToLog}
              onUpdateWater={(amount) => handleUpdateWater(amount, todayStr)}
            />
          )}

          {activeTab === 'weight' && (
            <WeightTrackerView
              userProfile={userProfile}
              weightEntries={weightEntries}
              onAddWeightEntry={handleAddWeightEntry}
              onDeleteWeightEntry={handleDeleteWeightEntry}
              onUpdateProfile={handleSaveProfile}
              onOpenProfile={() => setIsProfileModalOpen(true)}
            />
          )}

          {activeTab === 'calories' && (
            <CalorieTrackerView
              userProfile={userProfile}
              calorieLogs={calorieLogs}
              selectedDate={selectedCalorieDate}
              onSelectDate={setSelectedCalorieDate}
              onAddFoodItem={handleAddFoodItem}
              onDeleteFoodItem={handleDeleteFoodItem}
              onUpdateWater={(date, amount) => handleUpdateWater(amount, date)}
              onNavigateToAISuggestions={() => setActiveTab('ai_suggestions')}
            />
          )}

          {activeTab === 'ai_chat' && (
            <AINutritionChatView
              userProfile={userProfile}
              onAddFoodToLog={handleAddSuggestedFoodToLog}
            />
          )}

          {activeTab === 'ai_suggestions' && (
            <AIFoodSuggestionsView
              userProfile={userProfile}
              remainingDailyCalories={Math.max(0, userProfile.dailyCalorieTarget - todayCaloriesConsumed)}
              onAddFoodToLog={handleAddSuggestedFoodToLog}
            />
          )}

          {activeTab === 'food_library' && (
            <FoodLibraryView onAddFoodToLog={handleAddSuggestedFoodToLog} />
          )}
        </main>
      </div>

      {/* Editorial Archive Footer */}
      <footer className="border-t border-[#1A1A1A]/10 py-6 px-4 sm:px-8 mt-12 bg-[#F8F5F2] text-[#1A1A1A]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs">
          <div className="flex items-center space-x-3">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span className="uppercase tracking-[0.2em] font-bold text-[10px] text-[#1A1A1A]/70">
              Personal Nutrition Archive — NutriTrack
            </span>
          </div>
          <div className="text-[11px] italic font-serif text-[#1A1A1A]/60">
            "The body is a temple, but also a laboratory."
          </div>
          <div className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#1A1A1A]/40">
            ESTABLISHED MMXXVI — ARCHIVE NO. 812
          </div>
        </div>
      </footer>

      {/* Profile & Goals Settings Modal */}
      <UserProfileModal
        userProfile={userProfile}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSaveProfile={handleSaveProfile}
      />
    </div>
  );
}
