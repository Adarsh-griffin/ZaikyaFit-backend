const express = require("express");
const { calculateBmi } = require("../controllers/bmiController");
//const { saveUserPreferences } = require("../controllers/preferencesController.js");

const router = express.Router();

router.post("/calculate", calculateBmi);


module.exports = router;
