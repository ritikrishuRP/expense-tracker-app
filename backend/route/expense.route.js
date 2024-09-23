const express = require('express');

const router = express.Router();

const expenseController = require('../controller/expense.controller')

router.post('/addExpense', expenseController.expenseDetail);

router.get('/getExpense', expenseController.fetchExpense);

router.delete('/deleteExpense/:expenseId', expenseController.deleteExpense);

module.exports = router;