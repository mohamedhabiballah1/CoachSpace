const NutritionPlan = require('../models/NutritionPlan.model');

exports.createPlan = async (req, res) => {
  try {
    const plan = new NutritionPlan({ ...req.body, coach: req.user._id });
    await plan.save();
    res.status(201).json({ success: true, plan });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getClientPlan = async (req, res) => {
  try {
    const plan = await NutritionPlan.findOne({ client: req.params.clientId, coach: req.user._id }).sort({ createdAt: -1 });
    if (!plan) return res.status(404).json({ success: false, message: 'No nutrition plan found' });
    res.json({ success: true, ...plan.toObject() });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.updatePlan = async (req, res) => {
  try {
    const plan = await NutritionPlan.findOneAndUpdate(
      { _id: req.params.id, coach: req.user._id },
      req.body,
      { new: true }
    );
    if (!plan) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, plan });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
