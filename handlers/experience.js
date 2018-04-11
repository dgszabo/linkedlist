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
      return res.status(201).redirect(`/users/${req.params.username}/experiences/${newExperience.experienceId}`);
    } catch (err) {
      return next(err)
    }
  }
}

function readExperience(req, res, next) {
  return Experience.findOne({
      experienceId: `${req.params.experienceId}`,
    })
    .populate('companyId', 'companyId')
    .exec()
    .then(experience => {
      if (experience === null) {
        throw new APIError(500, 'Server broken!', 'Bad things happened');
      }
      return res.json({
        experience
      })
    })
    .catch(err => {
      return next(err);
    });
}

async function updateExperience(req, res, next) {
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
  try {
    req.body.username = username;

    let experience = await Experience.findOne({
      experienceId: req.params.experienceId
    })
    if (experience.username !== username) {
      return new APIError(401, 'Unauthorized', 'You are not authorized to update this experience!!!');
    }
  } catch (err) {
    return next(err)
  }
  let valid = v.validate(reqBody, experienceSchema);
  if (valid.errors.length) {

    return next({
      message: valid.errors.map(e => e.message).join(', ')
    })
  }
  return Experience.findOneAndUpdate({
      experienceId: `${req.params.experienceId}`
    }, reqBody)
    .then(() => {
      return res.redirect(`/users/${req.params.username}/experiences/${req.params.experienceId}`);
    })
    .catch(err => {
      return next(err);
    });
}

async function deleteExperience(req, res, next) {
  let expId;
  let experience;
  let username = req.params.username;
  let correctUser = ensureCorrectUser(
    req.headers.authorization,
    username
  );
  if (correctUser !== 'OK') {
    return next(correctUser);
  }
  try {
    experience = await Experience.findOne({
      experienceId: req.params.experienceId
    })
    expId = await Experience.getMongoId(experience.experienceId);

    if (experience.username !== username) {
      return new APIError(401, 'Unauthorized', 'You are not authorized to update this experience!!!');
    }
  } catch (err) {
    return next(err)
  }
  try {
    let foundUser = await User.findOne({username})
    foundUser.experience.remove(expId)
    await foundUser.save()
    await Experience.findOneAndRemove({ experienceId: `${req.params.experienceId}` })
    return res.redirect(`/users/${req.params.username}`);
  }
    catch(err) {
      return next(err);
    }
}

module.exports = {
  createExperience,
  readExperience,
  updateExperience,
  deleteExperience
};