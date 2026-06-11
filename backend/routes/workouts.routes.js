const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/workouts.controller');
const auth = require('../middleware/auth.middleware');

router.get('/exercises',            auth, ctrl.getExercises);
router.post('/exercises',           auth, ctrl.createExercise);
router.put('/exercises/:id',        auth, ctrl.updateExercise);
router.delete('/exercises/:id',     auth, ctrl.deleteExercise);

router.get('/plans',                auth, ctrl.getPlans);
router.post('/plans',               auth, ctrl.createPlan);
router.put('/plans/:id',            auth, ctrl.updatePlan);
router.delete('/plans/:id',         auth, ctrl.deletePlan);

router.post('/assign',              auth, ctrl.assignPlan);
router.get('/client/:clientId',     auth, ctrl.getClientPlan);

module.exports = router;
