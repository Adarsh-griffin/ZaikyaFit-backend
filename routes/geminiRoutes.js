// const express = require('express');
// const router = express.Router();
// require('dotenv').config(); // Load environment variables
// const { GoogleGenerativeAI } = require('@google/generative-ai'); // Official Gemini client

// // --- Gemini API Configuration ---
// // Ensure the GOOGLE_API_KEY environment variable is set
// const GEMINI_API_KEY = process.env.GOOGLE_API_KEY; // Using GOOGLE_API_KEY as per standard client setup
// if (!GEMINI_API_KEY) {
//     console.error("Error: GOOGLE_API_KEY environment variable is not set.");
//     // In a real app, you might want to exit or throw a more graceful error here.
//     // For now, we'll let it proceed and the API call will fail.
// }

// const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
// // Choose the model: 'gemini-pro' (as per your original code), 'gemini-1.5-flash', or 'gemini-1.5-pro'
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// router.post('/generate-recipe', async (req, res) => {
//     try {
//         const { ingredients, mealType, diet, allergies, calorieTarget,cusine } = req.body;

//         if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
//             return res.status(400).json({ error: 'Ingredients array is required and cannot be empty.' });
//         }

//         // Construct a more robust prompt to encourage JSON output
//         const prompt = `You are a culinary AI assistant. Your task is to create a detailed recipe based on user specifications.
// Strictly adhere to the following JSON format for your response, and provide ONLY the JSON object, with no additional text, markdown, or comments outside the JSON:

// \`\`\`json
// {
//   "title": "Creative recipe name",
//   "summary": "Brief description including dietary info and estimated calorie count.",
//   "ingredients": [
//     {"name": "ingredient1", "amount": "quantity e.g., 2 cups"},
//     {"name": "ingredient2", "amount": "quantity e.g., 1 tbsp"}
//   ],
//   "instructions": [
//     "Step 1: Detailed instruction.",
//     "Step 2: Next step."
//   ],
//   "nutrition": {
//     "calories": 0,
//     "protein": "0g",
//     "carbohydrates": "0g",
//     "fat": "0g"
//   },
//   "cookingTime": "X minutes",
//   "servings": 0,
//   "tips": "Optional cooking tips, comma separated."
// }
// \`\`\`

// Now, create a recipe with these requirements:
// - **Must use these ingredients:** ${ingredients.join(', ')}
// - **Meal type:** ${mealType || 'any type of meal'}
// - **Target calories:** ${calorieTarget ? `${calorieTarget} calories` : 'not specified but should be balanced'}
// - **Dietary preference:** ${diet || 'none'}
// - **Allergies to avoid:** ${allergies?.join(', ') || 'none'}

// **Important Rules:**
// - The recipe MUST strictly avoid all specified allergies.
// - Ensure nutrition facts (especially calories) align with the target calories if provided.
// - Include exact, specific measurements for all ingredients (e.g., "1 cup", "2 tbsp", "100g").
// - Make instructions extremely clear, numbered, and step-by-step.
// - If a target calorie is provided, ensure the 'calories' field in the JSON matches it closely.
// - Provide a realistic 'cookingTime' and 'servings' number.
// - The entire response must be a single, valid JSON object as specified above. DO NOT include any introductory or concluding text, or markdown other than the JSON object itself.`;

//         // Use the official @google/generative-ai client
//         const result = await model.generateContent(prompt);
//         const response = result.response;
//         let content = response.text();

//         // --- Robust JSON Parsing ---
//         // LLMs sometimes wrap JSON in markdown ```json ... ``` blocks
//         // Or might add extraneous text. This helps extract the JSON.
//         const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
//         if (jsonMatch && jsonMatch[1]) {
//             content = jsonMatch[1]; // Extract content within the markdown block
//         } else {
//             // If no markdown block, try to trim whitespace/newlines
//             content = content.trim();
//         }

//         let recipe;
//         try {
//             recipe = JSON.parse(content);
//         } catch (jsonError) {
//             console.error('Failed to parse JSON from Gemini response:', jsonError);
//             console.error('Raw content received:', content);
//             // This is a common issue. You might want to retry, or prompt Gemini again
//             // with a stronger emphasis on JSON output.
//             return res.status(500).json({
//                 error: 'Gemini did not return valid JSON. Please try again.',
//                 details: jsonError.message,
//                 rawGeminiResponse: content // Send raw response for debugging
//             });
//         }

//         // Validate essential fields after parsing
//         if (!recipe || !recipe.title || !Array.isArray(recipe.ingredients) || !Array.isArray(recipe.instructions)) {
//             return res.status(500).json({
//                 error: 'Generated recipe is missing essential fields after parsing. Please try again.',
//                 details: 'Missing title, ingredients, or instructions.',
//                 parsedRecipe: recipe // Send parsed data for debugging
//             });
//         }

//         const formattedRecipe = {
//             id: Date.now(), // Unique ID for this generated recipe
//             title: recipe.title,
//             summary: recipe.summary,
//             // Convert instructions to the desired Spoonacular-like format if needed by frontend
//             analyzedInstructions: [{
//                 name: "", // You might not need a name for the instructions list itself
//                 steps: recipe.instructions.map((step, i) => ({
//                     number: i + 1,
//                     step: step
//                 }))
//             }],
//             image: "https://via.placeholder.com/600x400?text=Recipe+Image", // A better placeholder
//             nutrition: recipe.nutrition,
//             servings: recipe.servings,
//             // Ensure cookingTime is a number for 'readyInMinutes'
//             readyInMinutes: parseInt(recipe.cookingTime) || 30,
//             extendedIngredients: recipe.ingredients // Keep original ingredients for easier display
//         };

//         res.json({ recipe: formattedRecipe });

//     } catch (error) {
//         // More specific error handling for Gemini API issues
//         if (error.response && error.response.promptFeedback) {
//             console.error('Gemini Safety Block Error:', error.response.promptFeedback.safetyRatings);
//             return res.status(400).json({
//                 error: 'Recipe generation failed due to safety concerns with the prompt or generated content. Please modify your request.',
//                 details: error.response.promptFeedback.safetyRatings
//             });
//         }
//         console.error('Server Error:', error.message);
//         console.error('Detailed Error Object:', error); // Log full error for debugging

//         res.status(500).json({
//             error: 'An unexpected error occurred during recipe generation.',
//             details: error.message
//         });
//     }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
require('dotenv').config(); // Load environment variables
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Official Gemini client

// --- Gemini API Configuration ---
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("Error: GOOGLE_API_KEY environment variable is not set.");
    // In a real app, you might want to exit or throw a more graceful error here.
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

router.post('/generate-recipe', async (req, res) => {
    try {
        const { ingredients, mealType, diet, allergies, calorieTarget, cuisine } = req.body; // Added cusine here

        if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            return res.status(400).json({ error: 'Ingredients array is required and cannot be empty.' });
        }

        const prompt = `You are a culinary AI assistant. Your task is to create a detailed recipe based on user specifications.
Strictly adhere to the following JSON format for your response, and provide ONLY the JSON object, with no additional text, markdown, or comments outside the JSON:

\`\`\`json
{
  "title": "Creative recipe name",
  "summary": "Brief description including dietary info and estimated calorie count.",
  "ingredients": [
    {"name": "ingredient1", "amount": "quantity e.g., 2 cups"},
    {"name": "ingredient2", "amount": "quantity e.g., 1 tbsp"}
  ],
  "instructions": [
    "Step 1: Detailed instruction.",
    "Step 2: Next step."
  ],
  "nutrition": {
    "calories": 0,
    "protein": "0g",
    "carbohydrates": "0g",
    "fat": "0g"
  },
  "cookingTime": "X minutes",
  "servings": 0,
  "tips": "Optional cooking tips, comma separated."
}
\`\`\`

Now, create a recipe with these requirements:
- **Must use these ingredients:** ${ingredients.join(', ')}
- **Meal type:** ${mealType || 'any type of meal'}
- **Target calories:** ${calorieTarget ? `${calorieTarget} calories` : 'not specified but should be balanced'}
- **Dietary preference:** ${diet || 'none'}
- **Allergies to avoid:** ${allergies?.join(', ') || 'none'}
${cuisine ? `- **Cuisine preference:** ${cuisine}` : ''}

**Important Rules:**
- The recipe MUST strictly avoid all specified allergies.
- Ensure nutrition facts (especially calories) align with the target calories if provided.
- Include exact, specific measurements for all ingredients (e.g., "1 cup", "2 tbsp", "100g").
- Make instructions extremely clear, numbered, and step-by-step.
- If a target calorie is provided, ensure the 'calories' field in the JSON matches it closely.
- Provide a realistic 'cookingTime' and 'servings' number.
- The entire response must be a single, valid JSON object as specified above. DO NOT include any introductory or concluding text, or markdown other than the JSON object itself.`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        let content = response.text();

        // --- Robust JSON Parsing ---
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
            content = jsonMatch[1];
        } else {
            content = content.trim();
        }

        let recipe;
        try {
            recipe = JSON.parse(content);
        } catch (jsonError) {
            console.error('Failed to parse JSON from Gemini response:', jsonError);
            console.error('Raw content received:', content);
            return res.status(500).json({
                error: 'Gemini did not return valid JSON. Please try again.',
                details: jsonError.message,
                rawGeminiResponse: content
            });
        }

        if (!recipe || !recipe.title || !Array.isArray(recipe.ingredients) || !Array.isArray(recipe.instructions)) {
            return res.status(500).json({
                error: 'Generated recipe is missing essential fields after parsing. Please try again.',
                details: 'Missing title, ingredients, or instructions.',
                parsedRecipe: recipe
            });
        }

        // --- IMPORTANT CHANGE HERE: Formatting the recipe for frontend ---
        const formattedRecipe = {
            id: Date.now(),
            title: recipe.title,
            summary: recipe.summary,
            // Now, we directly use 'instructions' from Gemini as 'steps'
            // Assumes recipe.instructions is already an array of strings like ["Step 1:...", "Step 2:..."]
            steps: recipe.instructions || [], 
            extendedIngredients: recipe.ingredients || [], // Mapped 'ingredients' from Gemini to 'extendedIngredients'
            image: "https://via.placeholder.com/600x400?text=Recipe+Image", // Consider getting a real image URL from Gemini if possible
            nutrition: recipe.nutrition || { calories: 'N/A', protein: 'N/A', carbohydrates: 'N/A', fat: 'N/A' },
            servings: recipe.servings || 2,
            readyInMinutes: parseInt(recipe.cookingTime) || 30,
            tips: recipe.tips || '' // Include tips if Gemini provides them
        };

        res.json({ recipe: formattedRecipe }); // Send this formatted recipe to your frontend

    } catch (error) {
        if (error.response && error.response.promptFeedback) {
            console.error('Gemini Safety Block Error:', error.response.promptFeedback.safetyRatings);
            return res.status(400).json({
                error: 'Recipe generation failed due to safety concerns with the prompt or generated content. Please modify your request.',
                details: error.response.promptFeedback.safetyRatings
            });
        }
        console.error('Server Error:', error.message);
        console.error('Detailed Error Object:', error);

        res.status(500).json({
            error: 'An unexpected error occurred during recipe generation.',
            details: error.message
        });
    }
});

module.exports = router;