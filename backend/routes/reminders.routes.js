const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reminders.controller');
const auth = require('../middleware/auth.middleware');

router.get('/',           auth, ctrl.getReminders);
router.post('/',          auth, ctrl.createReminder);
router.put('/:id',        auth, ctrl.updateReminder);
router.delete('/:id',     auth, ctrl.deleteReminder);
router.post('/:id/trigger', auth, ctrl.triggerReminder);

module.exports = router;
