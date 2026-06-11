const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/payments.controller');
const auth = require('../middleware/auth.middleware');

router.post('/subscriptions',            auth, ctrl.createSubscription);
router.get('/subscriptions',             auth, ctrl.getSubscriptions);
router.get('/subscriptions/:clientId',   auth, ctrl.getClientSubscription);
router.put('/subscriptions/:id',         auth, ctrl.updateSubscription);
router.post('/payments',                 auth, ctrl.logPayment);
router.get('/payments',                  auth, ctrl.getPayments);
router.get('/revenue',                   auth, ctrl.getRevenue);

module.exports = router;
