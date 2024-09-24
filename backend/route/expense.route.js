const express = require('express');
const userauthentication = require('../middleware/auth')

const router = express.Router();

const expenseController = require('../controller/expense.controller')

router.post('/addExpense', userauthentication.authenticate, expenseController.expenseDetail);

router.get('/getExpense', userauthentication.authenticate , expenseController.fetchExpense);

router.delete('/deleteExpense/:expenseId', userauthentication.authenticate, expenseController.deleteExpense);

module.exports = router;