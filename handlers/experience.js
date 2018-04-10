const express = require('express');
const {
  User,
  Company,
  Experience
} = require('../models');
const router = express.Router();
const {
  Validator
} = require('jsonschema');
const v = new Validator();
const {
  experienceSchema
} = require('../schemas');
const {
  APIError,
  ensureCorrectUser,
} = require("../helpers");

async function createExperience(req, res, next) {
  let username = req.params.username;
  let correctUser = ensureCorrectUser(
    req.headers.authorization,
    username
  );
  if (correctUser !== 'OK') {
    return next(correctUser);
  }

  let valid = v.validate(req.body, experienceSchema);

  if (valid.errors.length === 0) {
    try {
      req.body.username = username;
      let newExperience = await Experience.createExperience(new Experience(req.body))
      let correctId = await Experience.getMongoId(newExperience.experienceId)
      let foundUser = await User.findOne({
        username
      })
      foundUser.experience.push(correctId)
      await foundUser.save()
      return res.status(201).redirect(`/users/${req.params.username}`);
    } catch (err) {
      return next(err)
    }
  }
}

function updateExperience(req, res, next) {
  let username = req.params.username;
  let correctUser = ensureCorrectUser(
    req.headers.authorization,
    username
  );
  if (correctUser !== 'OK') {
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
  return Experience.findOneAndUpdate({
      username: `${req.params.username}`
    }, reqBody)
    .then(() => {
      return res.redirect(`/users/${req.params.username}`);
    })
    .catch(err => {
      return next(err);
    });
}

function deleteExperience(req, res, next) {
  let username = req.params.username;
  let correctUser = ensureCorrectUser(
    req.headers.authorization,
    username
  );
  if (correctUser !== 'OK') {
    return next(correctUser);
  }
  return Experience.findOneAndRemove({
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
  createExperience,
  updateExperience,
  deleteExperience
};