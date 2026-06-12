const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/uploads.controller');
const auth = require('../middleware/auth.middleware');

router.post('/image', auth, ctrl.uploadImageHandler);
router.post('/video', auth, ctrl.uploadVideoHandler);

module.exports = router;
