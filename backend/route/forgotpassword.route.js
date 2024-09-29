const express = require('express');

const router = express.Router();

//const userauthentication = require('../middleware/auth.js');
const resetPassword = require('../controller/forgotpassword.controller');

router.post('/forgotpassword', resetPassword.forgotpassword)


module.exports = router;