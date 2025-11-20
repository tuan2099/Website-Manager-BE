const express = require('express');
const controller = require('./setting.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const activityLogger = require('../../middlewares/activityLogger');

const router = express.Router();

router.use(authMiddleware, activityLogger);

router.get('/alerts', controller.getAlerts);
router.put('/alerts', controller.updateAlerts);

module.exports = router;
