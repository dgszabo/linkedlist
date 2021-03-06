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
  companyNewSchema,
  companyUpdateSchema
} = require('../schemas');
const {
  APIError,
  ensureCorrectCompanyByHandle
} = require("../helpers");

function readCompanies(req, res, next) {
  return Company.find()
    .populate('jobs', 'title jobId createdAt updatedAt')
    .exec()
    .then(companies => {
      return res.json({
        companies
      });
    });
}

function createCompany(req, res, next) {
  let valid = v.validate(req.body, companyNewSchema);
  if (valid.errors.length === 0) {
    return Company.createCompany(new Company(req.body))
      .then(() => {
        return res.status(201).redirect('/companies');
      })
      .catch(err => {
        console.log("IN CATCH")
        console.log(req.body)
        return next(err);
      })
  } else {
    return next(valid.errors)
  }
}

function readCompany(req, res, next) {
  return Company.findOne({
      handle: `${req.params.handle}`,
    })
    // add populate when applications and messages added later
    .populate('jobs', 'title jobId createdAt updatedAt')
    .exec()
    .then(company => {
      if (company === null) {
        throw new APIError(500, 'Server broken!', 'Bad things happened');
      }
      return res.json({
        company
      })
    })
    .catch(err => {
      return next(err);
    });
}

function updateCompany(req, res, next) {
  let handle = req.params.handle;
  let correctCompany = ensureCorrectCompanyByHandle(
    req.headers.authorization,
    handle
  );
  if (correctCompany !== 'OK') {
    return next(correctCompany);
  }
  let reqBody = { ...req.body
  };
  delete reqBody.handle;
  let valid = v.validate(reqBody, companyUpdateSchema);
  if (valid.errors.length) {
    return next({
      message: valid.errors.map(e => e.message).join(', ')
    })
  }
  return Company.findOneAndUpdate({
      handle: `${req.params.handle}`
    }, reqBody)
    .then(() => {
      return res.redirect(`/companies/${req.params.handle}`);
    })
    .catch(err => {
      return next(err);
    });
}

function deleteCompany(req, res, next) {
  let handle = req.params.handle;
  let correctCompany = ensureCorrectCompanyByHandle(
    req.headers.authorization,
    handle
  );
  if (correctCompany !== 'OK') {
    return next(correctCompany);
  }
  return Company.findOneAndRemove({
      handle: `${req.params.handle}`
    })
    .then(() => {
      return res.redirect('/companies');
    })
    .catch(err => {
      return next(err);
    });
}

module.exports = {
  readCompanies,
  createCompany,
  readCompany,
  updateCompany,
  deleteCompany
};