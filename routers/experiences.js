const express = require('express');

const {
    experienceHandler,
    authRequired
} = require('../handlers');
const {
    createExperience,
    readExperience,
    updateExperience,
    deleteExperience
} = experienceHandler;
const router = express.Router({
    mergeParams: true
});
router
    .route('/')
    .post(authRequired, createExperience);

router
    .route('/:experienceId')
    .get(authRequired, readExperience)
    .patch(authRequired, updateExperience)
    .delete(authRequired, deleteExperience);

module.exports = router;