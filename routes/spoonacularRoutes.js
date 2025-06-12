const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

// 🔹 Route: Search and get ingredients dynamically
router.get('/ingredients', async (req, res) => {
  const query = req.query.query || 'a'; // fallback to 'a' to get some default results

  try {
    const response = await axios.get(
      `https://api.spoonacular.com/food/ingredients/autocomplete`,
      {
        params: {
          query,
          number: 20,
          metaInformation: true,
          apiKey: SPOONACULAR_API_KEY,
        },
      }
    );

    res.json(response.data); // includes name and image
  } catch (err) {
    console.error('Spoonacular ingredients fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch ingredients' });
  }
});

// 🔹 Route: Generate recipes from selected ingredients
router.post('/generate-recipes', async (req, res) => {
  const { ingredients, mealType, diet, allergies } = req.body;

  try {
    const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
      params: {
        apiKey: SPOONACULAR_API_KEY,
        includeIngredients: ingredients.join(','),
        number: 5,
        diet,
        intolerances: allergies.join(','),
        type: mealType,
        addRecipeInformation: true,
        instructionsRequired: true,
      },
    });

    res.json(response.data);
  } catch (err) {
    console.error('Spoonacular recipe generation error:', err.message);
    res.status(500).json({ error: 'Failed to generate recipes' });
  }
});

module.exports = router;
