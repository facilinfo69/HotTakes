const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

/** 
 * route qui permet de s'inscrire
   {
    "email": "sivignonp@free.fr",
    "password": "test"
 }*/
exports.signup = (req, res, next) => {
    //hachage du mot de passe
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            //ajour de l'utilisateur dans la base de données
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                // réponse attendue : { message: string }
                .then(() => res.status(201).json({ message: 'compte enregistré !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};


/** 
 * route qui permet de se connecter
   {
    "email": "sivignonp@free.fr",
    "password": "test"
 }
 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 *
 */
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Paire login/mot de passe incorrecte'});
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                    }
                    // réponse attendue :
                    //{ userId: string,
                    // token: string }
                    res.status(200).json({
                        userId: user._id,
                        // token web JSON signé
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
 };