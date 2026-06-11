const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  client:   { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  coach:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
  amount:   { type: Number, required: true },
  currency: { type: String, default: 'MAD' },
  method:   { type: String, enum: ['cash','cmi','other'], default: 'cash' },
  note:     { type: String, trim: true },
  date:     { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
