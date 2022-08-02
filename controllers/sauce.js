const Sauce = require('../models/Sauce');
const fs = require('fs');

//controller qui récupere toutes les sauces
// renvoie un tableau de toutes les sauces 
exports.getAllSauce = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

//controller qui récupere une sauce selon l'id selectionné
// renvoie la sauce avec l'id selectionné
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({ error }));
};

//controller qui crée une sauce
// { sauce: String,
//   image: File } recu par le frontend
exports.createSauce = (req, res, next) => {
    //transforme en objet sauce
    const sauceObject = JSON.parse(req.body.sauce);
    //supprime l'id car créé par mongodn automatiquement
    delete sauceObject._id;
    //supprime le userId pour mettre le userID authentifié 
    delete sauceObject._userId;
    // crée une instance du modèle Sauce
    const sauce = new Sauce({
        // 
        ...sauceObject,
        // initialise le userId avec le userId authentifié
        userId: req.auth.userId,
        // définit l url de l'image
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        // initialise likes/dislikes à zéro
        likes: 0,
        dislikes: 0,
        // initialise les tableaux like, dislike à vide
        usersLiked: [],
        usersDisliked: []
    });
    // enregistre la sauce dans la bdd
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
        .catch(error => res.status(400).json({ error }));
};


//controller qui modifie une sauce
//deux possibilités : une modif avec un fichier image ou sans fichier image
exports.modifySauce = (req, res, next) => {
    //on verifie la présence du fichier image
    const sauceObject = req.file ? {
        // si fichier image,  transforme en objet sauce et récupère le chemin du fichier image sinon recupere les données modifiées de la sauce
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    //supprime le userId pour mettre le userID authentifié 
    delete sauceObject._userId;
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            //controle si l'utilisateur a le droit de modifier le fichier
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                //met à jour la sauce
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => {
                        //si image modifiée,supprime l'ancienne image du repertoire image
                        if (req.file) {
                            const filename = sauce.imageUrl.split('/images/')[1];
                            fs.unlink(`images/${filename}`, () => { });
                        }
                        res.status(200).json({ message: 'sauce modifiée !' });
                    })
                    .catch(error => res.status(400).json({ error }));
            }
        })
        .catch(error => res.status(400).json({ error }));
};

//controller qui supprime une sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            //controle si l'utilisateur a le droit de supprimer le fichier
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                //supprime l'image du repertoire
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    //supprime la sauce de la bdd
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
                        .catch(error => res.status(400).json({ error }));
                })
            }
        })
        .catch(error => res.status(500).json({ error }));
};

//controller qui definit le statut like/dislike
// je recois :  { userId: String,
//              like: Number }
//3 possibilités selon like
//like = 1 aime la sauce - ajoute 1 à likes + ajoute le userid dans tableau usersLiked
//like = 0 annule le like ou le dislike - enlever 1 like/dislike + supprimer dans tableau usersLiked/usersDisliked
//like = -1 n'aime pas la sauce - ajoute 1 à disLikes + ajoute le userId dans tableau usersDisliked
exports.modifyLike = (req, res, next) => {
    switch (req.body.like) {
        case 1:
            //recherche la sauce
            Sauce.findOne({ _id: req.params.id })
                .then(sauce => {
                    //recupere le nombre de like déjà enregistré
                    let likes = sauce.likes;
                    //ajoute un like
                    likes++;
                    // recupere le tableau des users qui ont liké
                    let usersLiked = sauce.usersLiked;
                    //ajoute le userId qui like
                    usersLiked.push(req.body.userId);
                    //met à jour likes et usersLiked dans la bdd
                    Sauce.updateOne({ _id: req.params.id }, { likes: likes, usersLiked: usersLiked })
                        .then(() => res.status(200).json({ message: 'like ajouté !' }))
                        .catch(error => res.status(400).json({ error }));
                })
                .catch(error => res.status(500).json({ error }));
            break;
        case 0:
            Sauce.findOne({ _id: req.params.id })
                .then(sauce => {
                    //recupere le tableau des users qui ont aimé
                    let usersLiked = sauce.usersLiked;
                    //cherche si le userID est dans le tableau
                    let myIndexLike = usersLiked.indexOf(req.body.userId);
                    // si userId est dans le tableau usersLiked alors je l'enleve et met à jour likes (-1)
                    if (myIndexLike !== -1) {
                        usersLiked.splice(myIndexLike, 1);
                        let likes = sauce.likes;
                        likes--;
                        Sauce.updateOne({ _id: req.params.id }, { likes: likes, usersLiked: usersLiked })
                            .then(() => res.status(200).json({ message: 'like supprimé !' }))
                            .catch(error => res.status(400).json({ error }));
                    } else {
                        //sinon userId est dans le tableau usersDisliked, l'enlever et mettre à jour dislikes (-1)
                        let usersDisliked = sauce.usersDisliked;
                        let myIndexDislike = usersDisliked.indexOf(req.body.userId);
                        if (myIndexDislike !== -1) {
                            usersDisliked.splice(myIndexDislike, 1);
                            let dislikes = sauce.dislikes;
                            dislikes--;
                            Sauce.updateOne({ _id: req.params.id }, { dislikes: dislikes, usersDisliked: usersDisliked })
                                .then(() => res.status(200).json({ message: 'dislike supprimé !' }))
                                .catch(error => res.status(400).json({ error }));
                        }
                    }

                })
                .catch(error => res.status(500).json({ error }));
            break;
        case -1:
            Sauce.findOne({ _id: req.params.id })
                .then(sauce => {
                    //recupere le nombre de dislike déjà enregistré
                    let dislikes = sauce.dislikes;
                    //ajoute un dislike
                    dislikes++;
                    // recupere le tableau des users qui ont disliké
                    let usersDisliked = sauce.usersDisliked;
                     //ajoute le userId qui dislike
                    usersDisliked.push(req.body.userId);
                    //met à jour likes et usersLiked dans la bdd
                    Sauce.updateOne({ _id: req.params.id }, { dislikes: dislikes, usersDisliked: usersDisliked })
                        .then(() => res.status(200).json({ message: 'dislike ajouté !' }))
                        .catch(error => res.status(400).json({ error }));
                })
                .catch(error => res.status(500).json({ error }));
            break;
    }
};