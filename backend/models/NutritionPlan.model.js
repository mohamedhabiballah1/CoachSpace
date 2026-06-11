const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name:     { type: String },
  amount:   { type: Number },
  unit:     { type: String, default: 'g' },
  calories: { type: Number },
  protein:  { type: Number },
  carbs:    { type: Number },
  fat:      { type: Number },
}, { _id: false });

const mealSchema = new mongoose.Schema({
  name:  { type: String },
  time:  { type: String },
  foods: [foodSchema],
}, { _id: false });

const nutritionPlanSchema = new mongoose.Schema({
  coach:          { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
  client:         { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  dailyCalories:  { type: Number },
  protein:        { type: Number },
  carbs:          { type: Number },
  fat:            { type: Number },
  meals:          [mealSchema],
  startDate:      { type: Date },
  endDate:        { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('NutritionPlan', nutritionPlanSchema);
