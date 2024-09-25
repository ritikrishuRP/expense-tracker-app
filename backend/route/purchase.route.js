const express = require('express');
const userauthentication = require('../middleware/auth');
const purchaseController = require('../controller/purchase.controller')

const router = express.Router();

router.get('/premiummembership', userauthentication.authenticate, purchaseController.purchasePremium);

router.post('/updatetransactionstatus', userauthentication.authenticate, purchaseController.updateTransactionStatus);

module.exports = router;