const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/sessions.controller');
const auth = require('../middleware/auth.middleware');

router.post('/',       auth, ctrl.createSession);
router.get('/',        auth, ctrl.getSessions);
router.put('/:id',     auth, ctrl.updateSession);
router.delete('/:id',  auth, ctrl.deleteSession);

module.exports = router;
