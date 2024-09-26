const express = require('express');

const premiumFeatureController = require('../controller/premiumFeature.controller')

const authenticatedmiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/showLeaderBoard', authenticatedmiddleware.authenticate, premiumFeatureController.getUserLeaderBoard);

module.exports = router;