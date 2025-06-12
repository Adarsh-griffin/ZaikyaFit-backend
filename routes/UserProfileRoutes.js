const express = require("express");
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
  saveUserPreferences,
  getUserPreferences,
  createUserPreference
} = require("../controllers/preferencesController.js");

// ✅ Authenticated user
router.post('/profile', protect, saveUserPreferences);
router.get('/profile', protect, getUserPreferences);
router.post('/profile/create' , protect, createUserPreference );

// ✅ Guest fallback (no token required)
router.post('/guest/preferences', saveUserPreferences);
router.get('/guest/preferences', getUserPreferences);

module.exports = router;