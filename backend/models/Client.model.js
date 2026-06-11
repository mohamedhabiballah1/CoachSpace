const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  number: {
    type: String,
    trim: true,
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  goalType: {
    type: String,
    enum: ['lose_fat', 'gain_muscle', 'body_recomp', 'maintenance'],
  },
  notes: {
    type: String,
    trim: true,
  },
  medicalNotes: {
    type: String,
    trim: true,
  },
  injuries: {
    type: [String],
    default: [],
  },
  healthQuestionnaire: {
    hasHeartCondition: { type: Boolean, default: false },
    hasDiabetes: { type: Boolean, default: false },
    hasJointIssues: { type: Boolean, default: false },
    medications: { type: String, trim: true },
    otherNotes: { type: String, trim: true },
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Client', clientSchema);
