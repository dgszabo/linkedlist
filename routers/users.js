const express = require('express');
const {
    User,
    Company
} = require('../models');
const router = express.Router();

router
    .route('/')
    .get((req, res, next) => {
        return User.find().then(users => {
            // return res.render('users/index', {
            //     users
            // });
            return res.json({
                users
            });
        });
    })
    .post((req, res, next) => {

        // return User.create(req.body).then(() => {
        //     return res.status(201).redirect('/users');
        // });
        // console.log("Here is res.body " + res.body);
        return User.createUser(new User(req.body))
            .then(() => {
                return res.status(201).redirect('/users');
            });
    });

// router.get('/new', (req, res, next) => {
//     return res.render('users/new')
// });

router
    .route('/:username')
    .get((req, res, next) => {
        return User.findOne({
                username: `${req.params.username}`,
            })
            // add populate when applications and messages added later
            .then(user => {
                return res.json({
                    user
                })
            })
    })
    .patch((req, res, next) => {
        return User.findOneAndUpdate({ username: `${req.params.username}` }, req.body)
            .then(() => {
                return res.redirect(`/users/${req.params.username}`);
            })
    })
    .delete((req, res, next) => {
        return User.findOneAndRemove({ username: `${req.params.username}` })
            .then(() => {
                return res.redirect('/users');
            })
    })

module.exports = router;