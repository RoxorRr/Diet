import { UserProfile, SuggestedFood } from '../types';

export function kgToLbs(kg: number): number {
  return Math.round((kg * 2.20462) * 10) / 10;
}

export function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.20462) * 10) / 10;
}

export function cmToFeetInches(cm: number): string {
  if (!cm || cm <= 0) return '';
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}' ${inches}"`;
}

export function formatWeight(kg: number, unit: 'kg' | 'lbs'): string {
  if (unit === 'lbs') {
    return `${kgToLbs(kg)} lbs`;
  }
  return `${kg.toFixed(1)} kg`;
}

export function calculateBMI(weightKg: number, heightCm: number): { bmi: number; category: string; color: string } {
  if (!heightCm || heightCm <= 0 || !weightKg || weightKg <= 0) {
    return { bmi: 0, category: 'Unknown', color: 'text-gray-500' };
  }
  const heightM = heightCm / 100;
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;

  if (bmi < 18.5) return { bmi, category: 'Underweight', color: 'text-amber-600' };
  if (bmi < 25) return { bmi, category: 'Normal weight', color: 'text-emerald-600' };
  if (bmi < 30) return { bmi, category: 'Overweight', color: 'text-amber-600' };
  return { bmi, category: 'Obesity', color: 'text-rose-600' };
}

export function calculateMacroTargets(calories: number, goal: string) {
  let proteinRatio = 0.3;
  let carbsRatio = 0.45;
  let fatRatio = 0.25;

  if (goal === 'lose') {
    proteinRatio = 0.35;
    carbsRatio = 0.35;
    fatRatio = 0.30;
  } else if (goal === 'gain') {
    proteinRatio = 0.25;
    carbsRatio = 0.50;
    fatRatio = 0.25;
  }

  return {
    proteinG: Math.round((calories * proteinRatio) / 4),
    carbsG: Math.round((calories * carbsRatio) / 4),
    fatG: Math.round((calories * fatRatio) / 9),
  };
}

export function calculateTDEE(profile: Partial<UserProfile>): number {
  const {
    gender = 'male',
    currentWeightKg = 75,
    heightCm = 175,
    age = 30,
    activityLevel = 'moderate',
    goal = 'lose'
  } = profile;

  // Mifflin-St Jeor Formula for BMR
  let bmr = 10 * currentWeightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'female') {
    bmr -= 161;
  } else {
    bmr += 5;
  }

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

  let targetCalories = tdee;
  if (goal === 'lose') {
    targetCalories -= 500; // ~0.5kg per week loss
  } else if (goal === 'gain') {
    targetCalories += 400; // ~0.4kg per week gain
  }

  return Math.max(1200, Math.round(targetCalories));
}

export const CURATED_SUGGESTED_FOODS: SuggestedFood[] = [
  {
    id: 's1',
    name: 'Greek Yogurt Berry Bowl & Chia',
    calories: 320,
    proteinG: 24,
    carbsG: 38,
    fatG: 7,
    mealType: 'breakfast',
    portionSize: '1 bowl (300g)',
    prepTimeMin: 5,
    description: 'Creamy high-protein plain Greek yogurt topped with fresh berries, a drizzle of honey, and chia seeds.',
    tags: ['High Protein', 'Quick & Easy', 'Probiotic'],
    benefits: 'Sustained morning energy, digestive health, rich in antioxidants.',
    recipeInstructions: [
      'Spoon 200g of plain 0% or 2% Greek yogurt into a bowl.',
      'Top with 1/2 cup fresh blueberries and strawberries.',
      'Sprinkle 1 tbsp chia seeds and drizzle 1 tsp raw honey.'
    ]
  },
  {
    id: 's2',
    name: 'Avocado & Poached Egg Whole Grain Toast',
    calories: 380,
    proteinG: 18,
    carbsG: 32,
    fatG: 20,
    mealType: 'breakfast',
    portionSize: '2 slices',
    prepTimeMin: 10,
    description: 'Toasted sprouted grain bread topped with mashed avocado, poached eggs, and chili flakes.',
    tags: ['Healthy Fats', 'Fiber Rich', 'Vegetarian'],
    benefits: 'Heart-healthy monounsaturated fats and essential micronutrients.',
    recipeInstructions: [
      'Toast 2 slices of whole grain bread.',
      'Mash 1/2 ripe avocado with lemon juice, salt, and black pepper.',
      'Poach or gently fry 2 eggs.',
      'Spread avocado on toast, top with eggs, and sprinkle red pepper flakes.'
    ]
  },
  {
    id: 's3',
    name: 'Grilled Salmon with Quinoa & Asparagus',
    calories: 510,
    proteinG: 42,
    carbsG: 36,
    fatG: 21,
    mealType: 'dinner',
    portionSize: '1 plate',
    prepTimeMin: 20,
    description: 'Herb-crusted wild salmon fillet served over fluffy cooked quinoa and steamed garlic asparagus.',
    tags: ['Omega-3', 'High Protein', 'Gluten-Free'],
    benefits: 'Promotes muscle recovery and joint health with rich Omega-3 fatty acids.',
    recipeInstructions: [
      'Season 150g salmon fillet with olive oil, lemon juice, salt, and dill.',
      'Pan-sear salmon for 4 minutes per side until flaky.',
      'Cook 1/2 cup quinoa in vegetable broth.',
      'Saute asparagus spears with garlic and olive oil.'
    ]
  },
  {
    id: 's4',
    name: 'Mediterranean Chicken Quinoa Bowl',
    calories: 480,
    proteinG: 38,
    carbsG: 44,
    fatG: 16,
    mealType: 'lunch',
    portionSize: '1 bowl',
    prepTimeMin: 15,
    description: 'Grilled chicken breast with cucumbers, cherry tomatoes, kalamata olives, feta, and tahini drizzle over quinoa.',
    tags: ['Mediterranean', 'High Protein', 'Meal Prep'],
    benefits: 'Balanced macros for lunch focus and metabolic boost.',
    recipeInstructions: [
      'Grill sliced chicken breast with oregano and garlic powder.',
      'Combine cooked quinoa, diced cucumber, cherry tomatoes, and 30g crumbed feta.',
      'Top with chicken and drizzle with 1 tbsp lemon tahini dressing.'
    ]
  },
  {
    id: 's5',
    name: 'Turkey & Hummus Lettuce Wraps',
    calories: 290,
    proteinG: 28,
    carbsG: 14,
    fatG: 12,
    mealType: 'lunch',
    portionSize: '3 large wraps',
    prepTimeMin: 8,
    description: 'Lean sliced turkey breast, hummus, shredded carrots, and cucumber rolled in crisp romaine lettuce leaves.',
    tags: ['Low Carb', 'Keto Friendly', 'Quick'],
    benefits: 'Light, low-calorie lunch option high in lean protein.',
    recipeInstructions: [
      'Lay out 3 crisp romaine lettuce leaves.',
      'Spread 1 tbsp roasted garlic hummus over each leaf.',
      'Add 2 slices turkey breast, shredded carrots, and cucumber sticks.',
      'Roll tightly and serve immediately.'
    ]
  },
  {
    id: 's6',
    name: 'Apple Slices with Almond Butter & Cinnamon',
    calories: 210,
    proteinG: 6,
    carbsG: 26,
    fatG: 11,
    mealType: 'snack',
    portionSize: '1 medium apple + 1.5 tbsp butter',
    prepTimeMin: 3,
    description: 'Crisp Honeycrisp apple slices paired with natural almond butter and Ceylon cinnamon.',
    tags: ['Snack', 'Clean Eating', 'Fiber'],
    benefits: 'Satiating afternoon snack that staves off sugar cravings.',
    recipeInstructions: [
      'Slice 1 fresh crisp apple.',
      'Serve with 1.5 tbsp smooth, sugar-free almond butter.',
      'Dust lightly with Ceylon cinnamon.'
    ]
  },
  {
    id: 's7',
    name: 'Cottage Cheese & Pineapple Protein Pot',
    calories: 190,
    proteinG: 22,
    carbsG: 18,
    fatG: 3,
    mealType: 'snack',
    portionSize: '1 cup (200g)',
    prepTimeMin: 2,
    description: 'Low-fat cottage cheese paired with juicy fresh pineapple chunks and walnuts.',
    tags: ['High Protein', 'Low Fat', 'Snack'],
    benefits: 'Casein protein provides slow-release amino acids ideal for muscle preservation.',
    recipeInstructions: [
      'Scoop 180g low-fat cottage cheese into a dish.',
      'Top with 80g fresh pineapple chunks and 1 tsp chopped walnuts.'
    ]
  },
  {
    id: 's8',
    name: 'Tofu & Vegetable Stir-Fry with Brown Rice',
    calories: 430,
    proteinG: 22,
    carbsG: 56,
    fatG: 14,
    mealType: 'dinner',
    portionSize: '1 bowl',
    prepTimeMin: 20,
    description: 'Crispy pan-seared tofu stir-fried with broccoli, bell peppers, snap peas, and ginger soy sauce over brown rice.',
    tags: ['Vegan', 'Plant Protein', 'Fiber Rich'],
    benefits: 'High fiber and plant-based antioxidant rich dinner.',
    recipeInstructions: [
      'Cube extra firm tofu and sear in 1 tsp sesame oil until golden.',
      'Stir fry broccoli, red bell pepper, and snap peas with grated ginger and garlic.',
      'Add low-sodium tamari and toss with tofu.',
      'Serve over 1/2 cup cooked long-grain brown rice.'
    ]
  }
];
