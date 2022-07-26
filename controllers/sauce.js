const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.getAllSauce = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({ error }));
};

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;

    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
        .catch(error => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {

    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete sauceObject._userId;
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
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

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
                        .catch(error => res.status(400).json({ error }));
                })
            }
        })
        .catch(error => res.status(500).json({ error }));
};

exports.modifyLike = (req, res, next) => {
    console.log('UserId : ', req.body.userId);
    console.log('like', req.body.like);
    switch (req.body.like) {
        case 1:
            console.log('UserId : ', req.body.userId);
            console.log('like', req.body.like);

            Sauce.findOne({ _id: req.params.id })
                .then(sauce => {
                    let likes = sauce.likes;
                    likes++;
                    console.log(likes);
                    let usersLiked = sauce.usersLiked;
                    usersLiked.push(req.body.userId);
                    console.log(likes, usersLiked);

                    Sauce.updateOne({ _id: req.params.id }, { likes: likes, usersLiked: usersLiked })
                        .then(() => res.status(200).json({ message: 'like ajouté !' }))
                        .catch(error => res.status(400).json({ error }));
                })
                .catch(error => res.status(500).json({ error }));
            break;
        case 0:
            // console.log('UserId : ', req.body.userId);
            // console.log('like', req.body.like);
            Sauce.findOne({ _id: req.params.id })
                .then(sauce => {
                    let usersLiked = sauce.usersLiked;
                    let myIndexLike = usersLiked.indexOf(req.body.userId);
                    console.log(myIndexLike);
                    if (myIndexLike !== -1) {
                        usersLiked.splice(myIndexLike, 1);
                        let likes = sauce.likes;
                        likes--;
                        Sauce.updateOne({ _id: req.params.id }, { likes: likes, usersLiked: usersLiked })
                            .then(() => res.status(200).json({ message: 'like supprimé !' }))
                            .catch(error => res.status(400).json({ error }));
                    } else {
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
            // console.log('UserId : ', req.body.userId);
            // console.log('like', req.body.like);
            Sauce.findOne({ _id: req.params.id })
                .then(sauce => {
                    let dislikes = sauce.dislikes;
                    dislikes++;
                    console.log(dislikes);
                    let usersDisliked = sauce.usersDisliked;
                    usersDisliked.push(req.body.userId);
                    console.log(dislikes, usersDisliked);

                    Sauce.updateOne({ _id: req.params.id }, { dislikes: dislikes, usersDisliked: usersDisliked })
                        .then(() => res.status(200).json({ message: 'dislike ajouté !' }))
                        .catch(error => res.status(400).json({ error }));
                })
                .catch(error => res.status(500).json({ error }));
            break;
    }
};