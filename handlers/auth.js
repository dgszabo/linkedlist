// npm packages
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const {
  Validator
} = require("jsonschema");
const bcrypt = require("bcrypt");
// app imports
const JWT_SECRET_KEY = 'abc';
const {
  User
} = require("../models");
const {
  APIError
} = require("../helpers");

const {
  userAuthSchema
} = require("../schemas");

// global constants
const v = new Validator();

function auth(req, res, next) {

  let valid = v.validate(req.body, userAuthSchema);

  if (valid.errors.length) {
    return next({
      message: valid.errors.map(e => e.message).join(', ')
    })
  }
  return User.findOne({
      username: req.body.username
    })
    .then(user => {
      const isValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      if (!isValid) {
        throw new APIError(401, "Unauthorized", "Invalid password.");
      }
      const newToken = {
        token: jwt.sign({
          username: user.username
        }, JWT_SECRET_KEY)
      };
      return res.json(newToken);
    })
    .catch(err => {
      next(err);
    });
}

module.exports = auth;