const express = require('express');


const {
    companyHandler,
    authRequired
} = require('../handlers');
const {
    readCompanies,
    createCompany,
    readCompany,
    updateCompany,
    deleteCompany
} = companyHandler;
const router = express.Router();
router
    .route('/')
    .get(readCompanies)
    .post(createCompany);

router
    .route('/:handle')
    .get(authRequired, readCompany)
    .patch(authRequired, updateCompany)
    .delete(authRequired, deleteCompany);

module.exports = router;