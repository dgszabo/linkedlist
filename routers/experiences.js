const express = require('express');

const {
    experienceHandler,
    authRequired
} = require('../handlers');
const {
    createExperience,
    updateExperience,
    deleteExperience
} = experienceHandler;
const router = express.Router({ mergeParams: true });
router
    .route('/')
    .post(createExperience);

router
    .route('/:experienceId')
    .patch(authRequired, updateExperience)
    .delete(authRequired, deleteExperience);

module.exports = router;