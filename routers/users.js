const express = require('express');
const {
    User,
    Company
} = require('../models');
const router = express.Router();
const { Validator } = require('jsonschema');
const v = new Validator();
const { userNewSchema } = require('../schemas');

router
    .route('/')
    .get((req, res, next) => {
        return User.find().then(users => {
            return res.json({
                users
            });
        });
    })
    .post((req, res, next) => {
        let valid = v.validate(req.body, userNewSchema);
        if(valid.errors.length === 0) {
            return User.createUser(new User(req.body))
                .then(() => {
                    return res.status(201).redirect('/users');
                })
                .catch(err => {
                    return next(err);
            })
        } else {
            return next(valid.errors)
        }
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
                if(user === null) {
                    return next("no_user");
                }
                return res.json({ user })
            })
            .catch(err => {
                return next(err);
            });
    })
    .patch((req, res, next) => {
        let valid = v.validate(req.body, userNewSchema)
        console.log(valid.errors)
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