import { UserProfile, WeightEntry, DailyCalorieLog, FoodItem } from '../types';
import { calculateTDEE, calculateMacroTargets } from './nutrition';

const PROFILE_KEY = 'nutritrack_user_profile';
const WEIGHT_LOG_KEY = 'nutritrack_weight_entries';
const CALORIE_LOG_KEY = 'nutritrack_calorie_logs';

export function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function getDateOffsetString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex',
  heightCm: 175,
  startWeightKg: 84.5,
  currentWeightKg: 80.2,
  targetWeightKg: 74.0,
  unit: 'kg',
  age: 29,
  gender: 'male',
  activityLevel: 'moderate',
  goal: 'lose',
  dietPreference: 'balanced',
  dailyCalorieTarget: 2100,
  proteinTargetG: 160,
  carbsTargetG: 210,
  fatTargetG: 65,
};

export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load profile from storage:', e);
  }
  return DEFAULT_PROFILE;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile to storage:', e);
  }
}

export function loadWeightEntries(): WeightEntry[] {
  try {
    const raw = localStorage.getItem(WEIGHT_LOG_KEY);
    if (raw) {
      const parsed: WeightEntry[] = JSON.parse(raw);
      if (parsed && parsed.length > 0) {
        return parsed.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      }
    }
  } catch (e) {
    console.error('Failed to load weight entries from storage:', e);
  }

  // Seed data over 14 days showing realistic healthy weight loss progress
  const seedEntries: WeightEntry[] = [
    { id: 'w1', date: getDateOffsetString(14), weightKg: 82.8, notes: 'Starting fresh journey!' },
    { id: 'w2', date: getDateOffsetString(12), weightKg: 82.3, notes: 'Feeling energized' },
    { id: 'w3', date: getDateOffsetString(10), weightKg: 81.9, notes: 'Post morning workout' },
    { id: 'w4', date: getDateOffsetString(8), weightKg: 81.5, notes: 'Stayed hydrated' },
    { id: 'w5', date: getDateOffsetString(6), weightKg: 81.1, notes: 'Weekend check-in' },
    { id: 'w6', date: getDateOffsetString(4), weightKg: 80.7, notes: 'Great dietary discipline' },
    { id: 'w7', date: getDateOffsetString(2), weightKg: 80.4, notes: 'Fasted morning weight' },
    { id: 'w8', date: getTodayDateString(), weightKg: 80.2, notes: 'On track to target goal!' },
  ];

  saveWeightEntries(seedEntries);
  return seedEntries;
}

export function saveWeightEntries(entries: WeightEntry[]): void {
  try {
    localStorage.setItem(WEIGHT_LOG_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save weight entries:', e);
  }
}

export function loadCalorieLogs(): DailyCalorieLog[] {
  try {
    const raw = localStorage.getItem(CALORIE_LOG_KEY);
    if (raw) {
      const parsed: DailyCalorieLog[] = JSON.parse(raw);
      if (parsed && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load calorie logs:', e);
  }

  const today = getTodayDateString();
  const yesterday = getDateOffsetString(1);

  const seedLogs: DailyCalorieLog[] = [
    {
      id: `c_${yesterday}`,
      date: yesterday,
      waterMl: 2200,
      items: [
        { id: 'fi1', name: 'Oatmeal with Blueberries & Honey', calories: 350, proteinG: 12, carbsG: 62, fatG: 6, mealType: 'breakfast', portion: '1 bowl' },
        { id: 'fi2', name: 'Whey Protein Shake', calories: 160, proteinG: 30, carbsG: 4, fatG: 2, mealType: 'snack', portion: '1 scoop' },
        { id: 'fi3', name: 'Chicken Breast & Quinoa Salad', calories: 520, proteinG: 45, carbsG: 48, fatG: 14, mealType: 'lunch', portion: '1 plate' },
        { id: 'fi4', name: 'Greek Yogurt with Almonds', calories: 220, proteinG: 18, carbsG: 12, fatG: 10, mealType: 'snack', portion: '150g' },
        { id: 'fi5', name: 'Baked Salmon with Sweet Potato & Broccoli', calories: 580, proteinG: 42, carbsG: 45, fatG: 22, mealType: 'dinner', portion: '1 plate' },
      ],
    },
    {
      id: `c_${today}`,
      date: today,
      waterMl: 1500,
      items: [
        { id: 'fit1', name: 'Scrambled Eggs (3) with Spinach & Whole Toast', calories: 380, proteinG: 24, carbsG: 28, fatG: 18, mealType: 'breakfast', portion: '2 slices toast' },
        { id: 'fit2', name: 'Mediterranean Chicken Quinoa Bowl', calories: 480, proteinG: 38, carbsG: 44, fatG: 16, mealType: 'lunch', portion: '1 bowl' },
        { id: 'fit3', name: 'Apple with Almond Butter', calories: 210, proteinG: 6, carbsG: 26, fatG: 11, mealType: 'snack', portion: '1 medium apple' },
      ],
    },
  ];

  saveCalorieLogs(seedLogs);
  return seedLogs;
}

export function saveCalorieLogs(logs: DailyCalorieLog[]): void {
  try {
    localStorage.setItem(CALORIE_LOG_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save calorie logs:', e);
  }
}
