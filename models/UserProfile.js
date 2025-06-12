const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bmi: {
    type: Number,
    min: [10, 'BMI too low'],
    max: [50, 'BMI too high']
  },
  calorieSplit: {
    breakfast: { type: Number },
    lunch: { type: Number },
    dinner: { type: Number },
    snacks: { type: Number }
  },
  category: {
    type: String,
    enum: ['Underweight', 'Healthy', 'Overweight', 'Obese']
  },
  dailyCalories: {
    type: Number,
    min: [1000, 'Calories too low'],
    max: [5000, 'Calories too high']
  },
  diet: {
    type: String,
    enum: [
      "gluten free",
      "ketogenic",
      "vegetarian",
      "lacto-vegetarian",
      "ovo-vegetarian",
      "vegan",
      "pescetarian",
      "paleo",
      "primal",
      "low FODMAP",
      "whole30",
      "none"
    ],
    default: "none"
  },
  healthConditions: {
    type: [String],
    enum: [
      "diabetes",
      "hypertension",
      "heart disease",
      "celiac",
      "lactose intolerance",
      "ibs",
      "cholesterol",
      "pcos",
      "thyroid",
      "arthritis",
      "none"
    ],
    default: ["none"]
  },
  intolerances: {
    type: [String],
    enum: [
      "dairy",
      "egg",
      "gluten",
      "grain",
      "peanut",
      "seafood",
      "sesame",
      "shellfish",
      "soy",
      "sulfite",
      "tree nut",
      "wheat",
      "none"
    ],
    default: ["none"]
  }
}, {
  timestamps: true
});



module.exports = mongoose.model('UserProfile', userProfileSchema);
