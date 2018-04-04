const express = require('express');
const { User, Company } = require('../models');
const router = express.Router();

router
    .route('/')
    .get((req, res, next) => {
        return User.find().then(users => {
            return res.render('users/index', {users});
        });
    })
    .post((req, res, next) => {
        console.log(req.body)
        return User.create(req.body).then(() => {
            return res.status(201).redirect('/users');
        });
    });

router.get('/new', (req, res, next) => {
    return res.render('users/new')
});

module.exports = router;