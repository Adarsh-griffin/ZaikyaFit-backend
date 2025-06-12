const calculateBmi = async (req, res) => {
  const { age, gender, height, weight, activity } = req.body;

  try {
    if (!age || !gender || !height || !weight || !activity) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // 1. BMI Calculation
    const bmi = weight / ((height / 100) ** 2);

    // 2. BMI Category
    let category = "Unknown";
    if (bmi < 18.5) category = "Underweight";
    else if (bmi < 25) category = "Healthy";
    else if (bmi < 30) category = "Overweight";
    else category = "Obese";

    // 3. BMR (Basal Metabolic Rate)
    const bmr =
      gender === "male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    // 4. Activity Level Multipliers
    const activityLevels = {
      normal: 1.2,
      walking: 1.4,
      jogging: 1.55,
      athlete: 1.75,
    };

    const multiplier = activityLevels[activity.toLowerCase()] || 1.2;
    const dailyCalories = bmr * multiplier;
    const roundedCalories = Math.round(dailyCalories);

    // 5. Calorie Split (B/L/D)
    const calorieSplit = {
      breakfast: Math.round(roundedCalories * 0.25),
      lunch: Math.round(roundedCalories * 0.35),
      dinner: Math.round(roundedCalories * 0.30),
      snacks: Math.round(roundedCalories * 0.10),
    };

    // ✅ Final Response
    return res.json({
      bmi: bmi.toFixed(1),
      category,
      dailyCalories: roundedCalories,
      calorieSplit, // Make sure this is included
    });

  } catch (err) {
    console.error("❌ Error calculating BMI/calories:", err.message);
    return res.status(500).json({ error: "Something went wrong during calculation" });
  }
};

module.exports = { calculateBmi };
