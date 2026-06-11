const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/nutrition.controller');
const auth = require('../middleware/auth.middleware');

router.post('/plans',               auth, ctrl.createPlan);
router.get('/plans/:clientId',      auth, ctrl.getClientPlan);
router.put('/plans/:id',            auth, ctrl.updatePlan);

module.exports = router;
