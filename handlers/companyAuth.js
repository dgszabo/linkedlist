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
  Company
} = require("../models");
const {
  APIError
} = require("../helpers");

const {
  companyAuthSchema
} = require("../schemas");

// global constants
const v = new Validator();

function companyAuth(req, res, next) {

  let valid = v.validate(req.body, companyAuthSchema);

  if (valid.errors.length) {
    return next({
      message: valid.errors.map(e => e.message).join(', ')
    })
  }
  return Company.findOne({
      handle: req.body.handle
    })
    .then(company => {
      const isValid = bcrypt.compareSync(
        req.body.password,
        company.password
      );
      if (!isValid) {
        throw new APIError(401, "Unauthorized", "Invalid password.");
      }
      const newToken = {
        token: jwt.sign({
          handle: company.handle
        }, JWT_SECRET_KEY)
      };
      return res.json(newToken);
    })
    .catch(err => {
      next(err);
    });
}

module.exports = companyAuth;