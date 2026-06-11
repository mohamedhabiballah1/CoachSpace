const Subscription = require('../models/Subscription.model');
const Payment      = require('../models/Payment.model');

exports.createSubscription = async (req, res) => {
  try {
    const sub = new Subscription({ ...req.body, coach: req.user._id });
    await sub.save();
    res.status(201).json({ success: true, subscription: sub });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getSubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.find({ coach: req.user._id })
      .populate('client', 'firstName lastName number email')
      .sort({ endDate: 1 });
    res.json({ success: true, subscriptions: subs });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getClientSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ client: req.params.clientId, coach: req.user._id, status: 'active' })
      .populate('client', 'firstName lastName');
    res.json({ success: true, subscription: sub });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.updateSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOneAndUpdate(
      { _id: req.params.id, coach: req.user._id },
      req.body,
      { new: true }
    );
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });
    res.json({ success: true, subscription: sub });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.logPayment = async (req, res) => {
  try {
    const payment = new Payment({ ...req.body, coach: req.user._id });
    await payment.save();
    res.status(201).json({ success: true, payment });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ coach: req.user._id })
      .populate('client', 'firstName lastName')
      .sort({ date: -1 });
    res.json({ success: true, payments });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getRevenue = async (req, res) => {
  try {
    const now   = new Date();
    const som   = new Date(now.getFullYear(), now.getMonth(), 1);       // start of this month
    const solm  = new Date(now.getFullYear(), now.getMonth() - 1, 1);   // start of last month
    const eolm  = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59); // end of last month

    const [allPayments] = await Promise.all([
      Payment.find({ coach: req.user._id }),
    ]);

    const sum = (arr) => arr.reduce((acc, p) => acc + (p.amount || 0), 0);

    const allTime  = sum(allPayments);
    const thisMonth = sum(allPayments.filter(p => new Date(p.date) >= som));
    const lastMonth = sum(allPayments.filter(p => new Date(p.date) >= solm && new Date(p.date) <= eolm));

    // Also count from subscriptions
    const subs = await Subscription.find({ coach: req.user._id });
    const subAllTime  = sum(subs);
    const subThisMonth = sum(subs.filter(s => new Date(s.createdAt) >= som));
    const subLastMonth = sum(subs.filter(s => new Date(s.createdAt) >= solm && new Date(s.createdAt) <= eolm));

    res.json({
      success: true,
      revenue: {
        thisMonth: thisMonth + subThisMonth,
        lastMonth: lastMonth + subLastMonth,
        allTime:   allTime   + subAllTime,
        currency:  'MAD',
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
