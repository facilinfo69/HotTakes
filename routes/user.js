const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');

//route POST pour créer un compte 
router.post('/signup', userCtrl.signup); 
//route POST pour se connecter
router.post('/login', userCtrl.login);

module.exports = router;