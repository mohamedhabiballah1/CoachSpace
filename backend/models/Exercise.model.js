const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  muscleGroup: { type: String, trim: true },
  description: { type: String, trim: true },
  images:      { type: [String], default: [] },
  video:       { type: String, trim: true },
  coach:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Exercise', exerciseSchema);
