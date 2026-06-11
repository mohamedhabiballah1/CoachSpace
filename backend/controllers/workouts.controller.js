const Exercise   = require('../models/Exercise.model');
const WorkoutPlan = require('../models/WorkoutPlan.model');
const ClientPlan  = require('../models/ClientPlan.model');

// Exercises
exports.getExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find({ coach: req.user._id }).sort({ name: 1 });
    res.json({ success: true, exercises });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.createExercise = async (req, res) => {
  try {
    const ex = new Exercise({ ...req.body, coach: req.user._id });
    await ex.save();
    res.status(201).json({ success: true, exercise: ex });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.updateExercise = async (req, res) => {
  try {
    const ex = await Exercise.findOneAndUpdate({ _id: req.params.id, coach: req.user._id }, req.body, { new: true });
    if (!ex) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, exercise: ex });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.deleteExercise = async (req, res) => {
  try {
    await Exercise.findOneAndDelete({ _id: req.params.id, coach: req.user._id });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// Plans
exports.getPlans = async (req, res) => {
  try {
    const plans = await WorkoutPlan.find({ coach: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, plans });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.createPlan = async (req, res) => {
  try {
    const plan = new WorkoutPlan({ ...req.body, coach: req.user._id });
    await plan.save();
    res.status(201).json({ success: true, plan });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.updatePlan = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findOneAndUpdate({ _id: req.params.id, coach: req.user._id }, req.body, { new: true });
    if (!plan) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, plan });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.deletePlan = async (req, res) => {
  try {
    await WorkoutPlan.findOneAndDelete({ _id: req.params.id, coach: req.user._id });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// Assign plan to client
exports.assignPlan = async (req, res) => {
  try {
    await ClientPlan.updateMany({ client: req.body.clientId, coach: req.user._id, status: 'active' }, { status: 'completed' });
    const cp = new ClientPlan({ client: req.body.clientId, coach: req.user._id, plan: req.body.planId, startDate: req.body.startDate || Date.now(), endDate: req.body.endDate });
    await cp.save();
    res.status(201).json({ success: true, clientPlan: cp });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getClientPlan = async (req, res) => {
  try {
    const cp = await ClientPlan.findOne({ client: req.params.clientId, coach: req.user._id, status: 'active' }).populate('plan');
    res.json({ success: true, clientPlan: cp });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
