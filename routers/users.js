const express = require('express');
const {
    User,
    Company
} = require('../models');
const router = express.Router();
const {
    Validator
} = require('jsonschema');
const v = new Validator();
const {
    userNewSchema,
    userUpdateSchema
} = require('../schemas');
const {
    APIError
} = require("../helpers");
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
        if (valid.errors.length === 0) {
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
                if (user === null) {
                    throw new APIError(500, 'Server broken!', 'Bad things happened');
                }
                return res.json({
                    user
                })
            })
            .catch(err => {
                return next(err);
            });
    })
    .patch((req, res, next) => {
        let reqBody = { ...req.body
        };
        delete reqBody.username;
        let valid = v.validate(reqBody, userUpdateSchema);
        console.log(valid)
        if (valid.errors.length === 0) {
            return User.findOneAndUpdate({
                    username: `${req.params.username}`
                }, reqBody)
                .then(() => {
                    return res.redirect(`/users/${req.params.username}`);
                })
                .catch(err => {
                    return next(err);
                });
        }
    })
    .delete((req, res, next) => {
        return User.findOneAndRemove({
                username: `${req.params.username}`
            })
            .then(() => {
                return res.redirect('/users');
            })
            .catch(err => {
                return next(err);
            });
    })

module.exports = router;