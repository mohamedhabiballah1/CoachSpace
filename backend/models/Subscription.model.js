const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  client:       { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  coach:        { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
  packageName:  { type: String, required: true, trim: true },
  price:        { type: Number, required: true },
  currency:     { type: String, default: 'MAD' },
  startDate:    { type: Date,   required: true },
  endDate:      { type: Date,   required: true },
  sessionCount: { type: Number, default: 0 },
  sessionsUsed: { type: Number, default: 0 },
  status:       { type: String, enum: ['active','expired','cancelled'], default: 'active' },
  paymentMethod:{ type: String, enum: ['cash','cmi','other'], default: 'cash' },
  paidAt:       { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
