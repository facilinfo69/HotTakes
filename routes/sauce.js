const express = require('express');
const router = express.Router();

// besoin d'une autorisation pour les routes sauce "bearer token envoyé par le frontend"
const auth = require('../middleware/auth');
// permet de gérer les fichiers entrants pour le téléchargement d'image
const multer = require('../middleware/multer-config');

const sauceCtrl = require('../controllers/sauce');

//route get qui récupere toutes les sauces avec authentification
router.get('/', auth, sauceCtrl.getAllSauce); 
//route post qui crée une sauce avec authentification
router.post('/', auth, multer, sauceCtrl.createSauce);
//route get qui récupere une sauce avec son id avec authentification
router.get('/:id', auth, sauceCtrl.getOneSauce); 
//route put qui met à jour la sauce avec son id avec authentification
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
//route delete qui supprimer la sauce avec son id avec authentification
router.delete('/:id', auth, sauceCtrl.deleteSauce);
//route post qui permet de modifier like/dislike 
router.post('/:id/like', auth, sauceCtrl.modifyLike);

module.exports = router;