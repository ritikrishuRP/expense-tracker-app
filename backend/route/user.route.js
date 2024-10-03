const express = require('express');
const userauthentication = require('../middleware/auth')

const router = express.Router();

const userController = require('../controller/user.controller')
const expenseController = require('../controller/expense.controller')

router.post('/signup', userController.signupDetail);

router.post('/login', userController.loginDetail);

router.get('/download', userauthentication.authenticate, expenseController.downloadExpense);


module.exports = router;