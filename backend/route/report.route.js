const express = require('express');

const reportController = require('../controller/report.controller')

const authenticatedmiddleware = require('../middleware/auth');

const router = express.Router();


router.post('/getdate', authenticatedmiddleware.authenticate, reportController.getDailyReport);

router.post('/getYearly', authenticatedmiddleware.authenticate, reportController.getYearlyReport);

router.post('getMonthly', authenticatedmiddleware.authenticate, reportController.getMonthlyReport);


router.post('/getweekly', authenticatedmiddleware.authenticate, reportController.getWeeklyReport);

module.exports = router;