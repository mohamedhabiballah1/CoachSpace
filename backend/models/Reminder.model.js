const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    default: null,
  },
  type: {
    type: String,
    enum: ['session', 'checkin', 'payment', 'custom'],
    required: true,
  },
  channel: {
    type: String,
    enum: ['whatsapp', 'email', 'both'],
    required: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  scheduledFor: {
    type: Date,
    required: true,
  },
  repeat: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly'],
    default: 'none',
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending',
  },
  whatsappLink: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Reminder', reminderSchema);
