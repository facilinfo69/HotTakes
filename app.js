//application Expresss
const express = require('express');
//importer mongoose
const mongoose = require('mongoose');
// const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');
// const path = require('path');

// connexion à la base de données mongoDb
mongoose.connect('mongodb+srv://PhilippeS:PhilTest@cluster0.gho6a.mongodb.net/?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));


const app = express();



//réponse du serveur
//recupere le corps JSON
app.use(express.json());

//implémentation CORS communication entre les deux serveurs
app.use((req, res, next) => {
    //  res.json({ message: 'Votre requête a bien été reçue !' });
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use('/api/auth', userRoutes);

module.exports = app;