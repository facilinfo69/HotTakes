const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');

//route POST pour recuperer la création d'un objet
router.post('/signup', userCtrl.signup); 
router.post('/login', userCtrl.login);


module.exports = router;