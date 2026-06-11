const mongoose = require('mongoose');

const clientPlanSchema = new mongoose.Schema({
  client:    { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  coach:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
  plan:      { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutPlan', required: true },
  startDate: { type: Date, required: true },
  endDate:   { type: Date },
  status:    { type: String, enum: ['active','completed'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('ClientPlan', clientPlanSchema);
