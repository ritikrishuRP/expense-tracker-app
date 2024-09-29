const express = require('express');


const resetpasswordController = require('../controller/forgotpassword.controller');

const router = express.Router();

//const userauthentication = require('../middleware/auth.js');
const resetPassword = require('../controller/forgotpassword.controller');

router.post('/forgotpassword', resetPassword.forgotpassword);

router.get('/updatepassword/:resetpasswordid', resetpasswordController.updatepassword)

router.get('/resetpassword/:id', resetpasswordController.resetpassword)




module.exports = router;