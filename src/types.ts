export type WeightUnit = 'kg' | 'lbs';

export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  notes?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  mealType: MealType;
  portion: string;
  category?: string;
}

export interface DailyCalorieLog {
  id: string;
  date: string; // YYYY-MM-DD
  items: FoodItem[];
  waterMl?: number;
}

export type DietGoal = 'lose' | 'maintain' | 'gain';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type DietPreference = 'balanced' | 'high_protein' | 'keto' | 'low_carb' | 'vegetarian' | 'vegan' | 'mediterranean';

export interface UserProfile {
  name: string;
  heightCm: number;
  startWeightKg: number;
  currentWeightKg: number;
  targetWeightKg: number;
  unit: WeightUnit;
  age: number;
  gender: 'male' | 'female' | 'other';
  activityLevel: ActivityLevel;
  goal: DietGoal;
  dietPreference: DietPreference;
  dailyCalorieTarget: number;
  proteinTargetG: number;
  carbsTargetG: number;
  fatTargetG: number;
}

export interface SuggestedFood {
  id: string;
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  mealType: MealType;
  description: string;
  portionSize: string;
  prepTimeMin?: number;
  tags: string[];
  recipeInstructions?: string[];
  benefits?: string;
}

export interface AIFoodRequest {
  mealType: MealType | 'any';
  remainingCalories?: number;
  dietPreference?: string;
  ingredientsToInclude?: string;
  dietaryRestrictions?: string;
  goal?: DietGoal;
}
