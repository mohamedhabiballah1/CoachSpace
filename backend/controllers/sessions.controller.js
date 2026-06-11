const Session = require('../models/Session.model');

exports.createSession = async (req, res) => {
  try {
    const session = new Session({ ...req.body, coach: req.user._id });
    await session.save();
    const populated = await session.populate('client', 'firstName lastName number');
    res.status(201).json({ success: true, session: populated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const filter = { coach: req.user._id };
    if (req.query.date) {
      const d = new Date(req.query.date);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      filter.date = { $gte: d, $lt: next };
    }
    if (req.query.clientId) filter.client = req.query.clientId;
    const sessions = await Session.find(filter)
      .populate('client', 'firstName lastName number')
      .sort({ date: 1, time: 1 });
    res.json({ success: true, sessions });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.updateSession = async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, coach: req.user._id },
      req.body,
      { new: true }
    ).populate('client', 'firstName lastName number');
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.json({ success: true, session });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findOneAndDelete({ _id: req.params.id, coach: req.user._id });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.json({ success: true, message: 'Session deleted' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
