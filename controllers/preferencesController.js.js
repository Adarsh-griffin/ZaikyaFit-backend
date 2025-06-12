const mongoose = require('mongoose');
const UserProfile = require('../models/UserProfile');
const jwt = require('jsonwebtoken');

// In-memory temporary storage for guest users
const temporaryStore = new Map();

const createUserPreference = async (req, res) => {
  try {
    const {
      bmi,
      calorieSplit,
      category,
      dailyCalories,
      diet,
      healthConditions,
      intolerances
    } = req.body;

    // Validate required fields
    if (!diet || !dailyCalories) {
      return res.status(400).json({ error: 'Diet and daily calories are required' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }

    // Check if profile already exists
    const existing = await UserProfile.findOne({ user: req.user.id });
    if (existing) {
      return res.status(400).json({ error: 'Preference already exists for this user. Use update instead.' });
    }

    const newProfile = await UserProfile.create({
      user: req.user.id,
      bmi,
      calorieSplit: calorieSplit || {
        breakfast: 25,
        lunch: 35,
        dinner: 30,
        snacks: 10
      },
      category,
      dailyCalories,
      diet,
      healthConditions: healthConditions || [],
      intolerances: intolerances || []
    });

    return res.status(201).json({
      message: 'Preference created successfully',
      data: newProfile
    });
  } catch (error) {
    console.error('Error creating preferences:', error);
    return res.status(500).json({
      error: 'Failed to create preferences',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


const saveUserPreferences = async (req, res) => {
  console.log("step0");

  try {
    const {
      bmi,
      calorieSplit,
      category,
      dailyCalories,
      diet,
      healthConditions,
      intolerances

    } = req.body;
    console.log("step1");

    // Validate required fields
    if (!diet || !dailyCalories) {
      return res.status(400).json({ error: 'Diet and daily calories are required' });
    }
console.log("user id is " , req.user.id)
    // ✅ If user is authenticated (has valid token)
    if (req.user) {
      const profile = await UserProfile.findOneAndUpdate(
        { user: req.user.id },
        
        {
          bmi,
          calorieSplit: calorieSplit || {
            breakfast: 25,
            lunch: 35,
            dinner: 30,
            snacks: 10
          },
          category,
          dailyCalories,
          diet,
          healthConditions: healthConditions || [],
          intolerances: intolerances || [],

        },
        { 
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );

      return res.status(200).json({
        message: 'Profile updated successfully',
        data: profile
      });
    }
    // ✅ Handle guest session (no authentication)
    else {
      const sessionId = req.cookies.sessionId || generateSessionId();

      const guestData = {
        bmi: bmi || null,
        calorieSplit: calorieSplit || {
          breakfast: 30,
          lunch: 40,
          dinner: 20,
          snacks: 10
        },
        category: category || null,
        dailyCalories,
        diet,
        healthConditions: healthConditions || [],
        intolerances: intolerances || [],

        savedAt: new Date(),
        sessionId
      };

      temporaryStore.set(sessionId, guestData);

      if (!req.cookies.sessionId) {
        res.cookie('sessionId', sessionId, {
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
      }

      return res.status(200).json({
        message: 'Guest preferences saved temporarily',
        data: guestData,
        sessionId
      });
    }
  } catch (error) {
    console.error('Error saving preferences:', error);
    return res.status(500).json({ 
      error: 'Failed to save preferences',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getUserPreferences = async (req, res) => {
  try {
    // ✅ If user is authenticated
    if (req.user) {
      const profile = await UserProfile.findOne({ user: req.user.id });
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      return res.status(200).json(profile);
    }
    // ✅ If guest session
    else if (req.cookies.sessionId) {
      const sessionId = req.cookies.sessionId;
      const guestData = temporaryStore.get(sessionId);
      
      if (!guestData) {
        return res.status(404).json({ error: 'Guest session not found' });
      }
      
      return res.status(200).json(guestData);
    }
    // ❌ No valid session
    else {
      return res.status(401).json({ error: 'No active session found' });
    }
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch preferences',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper functions
function generateSessionId() {
  return 'guest_' + Math.random().toString(36).substr(2, 12) + '_' + Date.now().toString(36);
}

function cleanupOldSessions() {
  const now = new Date();
  temporaryStore.forEach((value, key) => {
    const ageInDays = (now - new Date(value.savedAt)) / (1000 * 60 * 60 * 24);
    if (ageInDays > 7) {
      temporaryStore.delete(key);
    }
  });
}

// Clean up old sessions every hour
setInterval(cleanupOldSessions, 60 * 60 * 1000);

module.exports = {
  saveUserPreferences,
  getUserPreferences,
  createUserPreference
};