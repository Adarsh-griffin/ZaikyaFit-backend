require('dotenv').config();
const express = require('express');
const router = express.Router();
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const multer = require('multer');
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // Limit to 5MB

// Validate environment variables on startup
const validateEnv = () => {
  const requiredVars = ['GCP_CLIENT_EMAIL', 'GCP_PRIVATE_KEY', 'GCP_PROJECT_ID'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

try {
  validateEnv();
  
  // Initialize the Google Vision client
  const visionClient = new ImageAnnotatorClient({
    credentials: {
      client_email: process.env.GCP_CLIENT_EMAIL,
      private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    projectId: process.env.GCP_PROJECT_ID,
  });

  // Enhanced ingredient detection with better filtering
  const detectIngredientsFromText = (text) => {
    if (!text) return [];
    
    const commonNonIngredients = [
      'nutrition', 'ingredients', 'serving', 'servings', 'facts',
      'amount', 'per', 'daily', 'value', 'container'
    ];
    
    return text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .filter(line => {
        const lower = line.toLowerCase();
        return !commonNonIngredients.some(term => lower.includes(term)) &&
               !/\d/.test(line) && // Exclude lines with numbers
               line.length < 50; // Exclude very long lines (likely not ingredients)
      })
      .slice(0, 20); // Limit to top 20 potential ingredients
  };

  router.post('/detect-ingredients', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false,
          error: 'No image file provided' 
        });
      }

      // Validate image type
      if (!req.file.mimetype.startsWith('image/')) {
        return res.status(400).json({
          success: false,
          error: 'Uploaded file is not an image'
        });
      }

      // Process image with Google Vision
      const [result] = await visionClient.textDetection({
        image: { content: req.file.buffer },
        imageContext: { languageHints: ['en'] } // Improve English text detection
      });

      const detections = result.textAnnotations;
      
      if (!detections || detections.length === 0) {
        return res.json({ 
          success: true,
          ingredients: [],
          message: 'No text detected in the image'
        });
      }

      const ingredients = detectIngredientsFromText(detections[0].description);
      
      res.json({
        success: true,
        ingredients,
        detectedText: detections[0].description // For debugging
      });

    } catch (error) {
      console.error('Vision API error:', error);
      
      // Handle specific Google API errors
      let errorMessage = 'Failed to process image';
      if (error.details) {
        errorMessage = error.details;
      } else if (error.message.includes('UNAUTHENTICATED')) {
        errorMessage = 'Authentication failed - check your Google Cloud credentials';
      }

      res.status(500).json({ 
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

} catch (error) {
  console.error('Initialization error:', error);
  // Create a health check route that will fail if initialization failed
  router.post('/detect-ingredients', (req, res) => {
    res.status(500).json({
      success: false,
      error: 'Service not properly initialized',
      details: error.message
    });
  });
}

module.exports = router;