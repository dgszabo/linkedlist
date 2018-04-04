const express = require('express');
const { User, Company } = require('../models');
const router = express.Router();

router
    .route('/')
    .get((req, res, next) => {
        return Company.find().then(companies => {
            return res.render('companies/index', {companies});
        });
    });

module.exports = router;