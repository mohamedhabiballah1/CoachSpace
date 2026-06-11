const mongoose = require('mongoose');

const exerciseEntrySchema = new mongoose.Schema({
  exercise:    { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
  name:        { type: String }, // fallback when not referencing library
  sets:        { type: Number },
  reps:        { type: String },
  restSeconds: { type: Number },
  notes:       { type: String },
}, { _id: false });

const daySchema = new mongoose.Schema({
  dayName:   { type: String },
  exercises: [exerciseEntrySchema],
}, { _id: false });

const weekSchema = new mongoose.Schema({
  weekNumber: { type: Number },
  days:       [daySchema],
}, { _id: false });

const workoutPlanSchema = new mongoose.Schema({
  coach:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:        { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  goalType:    { type: String, enum: ['lose_fat','gain_muscle','body_recomp','maintenance'] },
  weeks:       [weekSchema],
}, { timestamps: true });

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);
