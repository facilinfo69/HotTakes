//application Express
const express = require('express');
//importer mongoose pour faciliter l'accès à la base de données
const mongoose = require('mongoose');
// importer le routeur pour les sauces
const saucesRoutes = require('./routes/sauce');
// importer le routeur pour la connexion/inscription des utilisateurs
const userRoutes = require('./routes/user');
// permet l'accès au path du serveur
const path = require('path');
// protège l'application de certaines vulnérabilités (en-têtes HTTP)
const helmet = require('helmet');
// permet d'externaliser les variables de configuration
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

// connexion à la base de données mongoDb (_USER, _PASSWORD dans le fichier .env)
mongoose.connect(`mongodb+srv://${process.env._USER}:${process.env._PASSWORD}@cluster0.gho6a.mongodb.net/?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));


const app = express();

app.use(helmet());

//réponse du serveur
//recupere le corps JSON
app.use(express.json());



//implémentation CORS communication entre les deux serveurs
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    //permet l'affichage des images avec la protection helmet
    res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
    next();
});

// enregister les routes
app.use('/api/auth', userRoutes);
app.use('/api/sauces', saucesRoutes);

//gérer la ressource images de manière statique 
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;