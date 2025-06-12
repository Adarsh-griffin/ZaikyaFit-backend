const express = require('express');
const { signup, login } = require('../controllers/authController');  // Use require for importing controller functions

const router = express.Router();

// POST routes for signup and login
router.post('/signup', signup);
router.post('/login', login);

module.exports = router;  // Use module.exports for exporting the router
