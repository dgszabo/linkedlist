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
  APIError,
  ensureCorrectUser,
} = require("../helpers");

function readUsers(req, res, next) {
  return User.find().then(users => {
    return res.json({
      users
    });
  });
}

function createUser(req, res, next) {
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
}

function readUser(req, res, next) {
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
}

function updateUser(req, res, next) {
  let username = req.params.username;
  let correctUser = ensureCorrectUser(
    req.headers.authorization,
    username
  );
  if(correctUser !== 'OK') {
    return next(correctUser);
  }
  let reqBody = { ...req.body
  };
  delete reqBody.username;
  let valid = v.validate(reqBody, userUpdateSchema);
  if (valid.errors.length) {
    return next({
      message: valid.errors.map(e => e.message).join(', ')
    })
  }
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

function deleteUser(req, res, next) {
  let username = req.params.username;
  console.log('THIS IS RUNNING')
  let correctUser = ensureCorrectUser(
    req.headers.authorization,
    username
  );
  if(correctUser !== 'OK') {
    return next(correctUser);
  }
  return User.findOneAndRemove({
      username: `${req.params.username}`
    })
    .then(() => {
      return res.redirect('/users');
    })
    .catch(err => {
      return next(err);
    });
}

module.exports = {
  readUsers,
  createUser,
  readUser,
  updateUser,
  deleteUser
};