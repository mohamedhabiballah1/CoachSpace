const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  weight: {
    type: Number,
  },
  height: {
    type: Number,
  },
  bodyFat: {
    type: Number,
  },
  muscleMass: {
    type: Number,
  },
  neck: {
    type: Number,
  },
  shoulders: {
    type: Number,
  },
  chest: {
    type: Number,
  },
  waist: {
    type: Number,
  },
  hips: {
    type: Number,
  },
  leftArm: {
    type: Number,
  },
  rightArm: {
    type: Number,
  },
  leftForearm: {
    type: Number,
  },
  rightForearm: {
    type: Number,
  },
  leftThigh: {
    type: Number,
  },
  rightThigh: {
    type: Number,
  },
  leftCalf: {
    type: Number,
  },
  rightCalf: {
    type: Number,
  },
  notes: {
    type: String,
    trim: true,
  },
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Measurement', measurementSchema);
