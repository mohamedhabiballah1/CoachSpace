const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  client:   { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  coach:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
  date:     { type: Date, required: true },
  time:     { type: String, required: true },
  duration: { type: Number, default: 60 },
  type:     { type: String, enum: ['in-person','online'], default: 'in-person' },
  status:   { type: String, enum: ['scheduled','completed','cancelled','no-show'], default: 'scheduled' },
  notes:    { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
