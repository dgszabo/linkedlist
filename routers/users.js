const express = require('express');

const {
    userHandler
} = require('../handlers');
const {
    readUsers,
    createUser,
    readUser,
    updateUser,
    deleteUser
} = userHandler;
const router = express.Router();
router
    .route('/')
    .get(readUsers)
    .post(createUser);

router
    .route('/:username')
    .get(readUser)
    .patch(updateUser)
    .delete(deleteUser);

module.exports = router;