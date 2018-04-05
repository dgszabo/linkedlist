const express = require('express');


const {
    userHandler,
    authRequired
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
    .get(authRequired, readUser)
    .patch(authRequired, updateUser)
    .delete(authRequired, deleteUser);

module.exports = router;