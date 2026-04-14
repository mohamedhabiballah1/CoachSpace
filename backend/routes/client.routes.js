const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');
const authMiddleware = require('../middleware/auth.middleware');


router.post('/clients', authMiddleware, clientController.createClient);
router.get('/clients', authMiddleware, clientController.getClients);
router.get('/clients/:id', authMiddleware, clientController.getClientById);
router.post('/clients/:clientId/measurements', authMiddleware, clientController.addMeasurement);
router.put('/clients/:clientId/measurements/:measurementId', authMiddleware, clientController.updateMeasurement);
router.get('/clients/:clientId/measurements/progress', authMiddleware, clientController.getProgressReport);
router.delete('/clients/:clientId', authMiddleware, clientController.deleteClient);
router.delete('/clients/:clientId/measurements/:measurementId', authMiddleware, clientController.deleteMeasurement);

module.exports = router;