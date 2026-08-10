import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// AI Suggested Food Endpoint
app.post('/api/suggest-food', async (req, res) => {
  try {
    const {
      mealType = 'any',
      targetCalories = 400,
      dietPreference = 'balanced',
      ingredients = '',
      dietaryRestrictions = '',
      goal = 'lose',
      userWeightKg,
    } = req.body;

    const systemInstruction = `You are an expert nutritionist and meal planner AI. 
Provide realistic, delicious, nutrient-dense food suggestions with accurate calorie and macronutrient counts.
Tailor suggestions to the user's diet goal (${goal}), preferred meal type (${mealType}), target calorie budget (~${targetCalories} kcal), diet preference (${dietPreference}), and available ingredients or restrictions (${ingredients} ${dietaryRestrictions}).
Return JSON output adhering strictly to the requested schema.`;

    const prompt = `Generate 3 distinct meal or food suggestions with exact calorie and macro estimates.
Meal Type: ${mealType}
Calorie Budget per meal: around ${targetCalories} calories
Diet Preference: ${dietPreference}
Specific Ingredients/Notes: ${ingredients || 'None specified'}
Dietary Restrictions: ${dietaryRestrictions || 'None'}
Dietary Goal: ${goal}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: 'List of suggested food options',
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Meal or food name' },
              calories: { type: Type.INTEGER, description: 'Estimated calories' },
              proteinG: { type: Type.INTEGER, description: 'Protein in grams' },
              carbsG: { type: Type.INTEGER, description: 'Carbohydrates in grams' },
              fatG: { type: Type.INTEGER, description: 'Fat in grams' },
              mealType: { type: Type.STRING, description: 'breakfast, lunch, dinner, or snack' },
              description: { type: Type.STRING, description: 'Short delicious description' },
              portionSize: { type: Type.STRING, description: 'Portion size (e.g., 1 bowl, 200g, 2 slices)' },
              prepTimeMin: { type: Type.INTEGER, description: 'Prep time in minutes' },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Tags like High Protein, Low Carb, Quick, Keto',
              },
              benefits: { type: Type.STRING, description: 'Why this food fits their health goal' },
              recipeInstructions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Step by step simple preparation instructions',
              },
            },
            required: ['name', 'calories', 'proteinG', 'carbsG', 'fatG', 'description', 'portionSize'],
          },
        },
      },
    });

    const jsonText = response.text ? response.text.trim() : '[]';
    const suggestions = JSON.parse(jsonText);
    res.json({ success: true, suggestions });
  } catch (error: any) {
    console.error('Error generating AI food suggestions:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate food suggestions',
    });
  }
});

// AI Food Calorie Estimator
app.post('/api/estimate-food', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: 'Food description text is required' });
    }

    const systemInstruction = `You are a precision nutrition estimator. Given a natural language description of food or meal, estimate its name, portion size, calories, and macronutrient profile (protein, carbs, fat).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Estimate calories and nutrition for: "${text}"`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Clean formatted food name' },
            portion: { type: Type.STRING, description: 'Estimated portion size' },
            calories: { type: Type.INTEGER, description: 'Total estimated calories' },
            proteinG: { type: Type.INTEGER, description: 'Grams of protein' },
            carbsG: { type: Type.INTEGER, description: 'Grams of carbohydrates' },
            fatG: { type: Type.INTEGER, description: 'Grams of fat' },
            suggestedMealType: { type: Type.STRING, description: 'breakfast, lunch, dinner, or snack' },
            notes: { type: Type.STRING, description: 'Nutrition notes or health highlight' },
          },
          required: ['name', 'portion', 'calories', 'proteinG', 'carbsG', 'fatG'],
        },
      },
    });

    const jsonText = response.text ? response.text.trim() : '{}';
    const estimate = JSON.parse(jsonText);
    res.json({ success: true, estimate });
  } catch (error: any) {
    console.error('Error estimating food calories:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to estimate food calories' });
  }
});

// AI Nutrition Advice & Food Comparison Endpoint
app.post('/api/nutrition-advice', async (req, res) => {
  try {
    const { question, userProfile } = req.body;
    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ success: false, error: 'Question string is required' });
    }

    const goal = userProfile?.goal || 'lose';
    const dailyCalorieTarget = userProfile?.dailyCalorieTarget || 2000;
    const currentWeightKg = userProfile?.currentWeightKg || 70;
    const heightCm = userProfile?.heightCm || 170;

    const systemInstruction = `You are a world-class AI Nutritionist, Food Scientist, and Personal Diet Coach.
Answer user questions regarding food choices, comparisons ("what is better to eat?"), dietary advice, macronutrient optimization, and healthy meal selections.
Provide helpful, objective, evidence-based nutrition advice.
When comparing foods (e.g., salmon vs chicken, white rice vs brown rice, whole eggs vs egg whites):
- Give a clear, direct recommendation/verdict.
- Provide macronutrient comparison (calories, protein, carbs, fat, pros, cons) for the items.
- Provide key takeaways and satiety/health tips.
- Consider user's current goal: ${goal}, Daily Calorie Target: ${dailyCalorieTarget} kcal/day, Weight: ${currentWeightKg} kg, Height: ${heightCm} cm.
Return output in strictly valid JSON conforming to the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Question from user: "${question.trim()}"`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING, description: 'Short catchy headline answering the query' },
            verdict: { type: Type.STRING, description: 'Clear direct verdict and takeaway' },
            recommendation: { type: Type.STRING, description: 'Actionable recommendation tailored to user profile' },
            comparison: {
              type: Type.ARRAY,
              description: 'List of foods compared if applicable',
              items: {
                type: Type.OBJECT,
                properties: {
                  foodName: { type: Type.STRING },
                  portion: { type: Type.STRING, description: 'Serving size estimate' },
                  calories: { type: Type.STRING, description: 'e.g. 165 kcal per 100g' },
                  proteinG: { type: Type.INTEGER },
                  carbsG: { type: Type.INTEGER },
                  fatG: { type: Type.INTEGER },
                  pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                  cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['foodName', 'calories', 'proteinG', 'carbsG', 'fatG', 'pros', 'cons'],
              },
            },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3-4 actionable key bullet points',
            },
            suggestedMeal: {
              type: Type.OBJECT,
              description: 'Optional recommended meal option with exact calories',
              properties: {
                name: { type: Type.STRING },
                calories: { type: Type.INTEGER },
                proteinG: { type: Type.INTEGER },
                carbsG: { type: Type.INTEGER },
                fatG: { type: Type.INTEGER },
                mealType: { type: Type.STRING, description: 'breakfast, lunch, dinner, or snack' },
                portionSize: { type: Type.STRING },
                description: { type: Type.STRING },
              },
            },
            suggestedFollowUpQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 follow-up questions the user can ask next',
            },
          },
          required: ['headline', 'verdict', 'recommendation', 'keyTakeaways'],
        },
      },
    });

    const jsonText = response.text ? response.text.trim() : '{}';
    const advice = JSON.parse(jsonText);
    res.json({ success: true, advice });
  } catch (error: any) {
    console.error('Error generating AI nutrition advice:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate nutrition advice' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
