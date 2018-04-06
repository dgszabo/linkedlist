const express = require('express');
const jwt = require('jsonwebtoken');
const {
  Job
} = require('../models');
const router = express.Router();
const {
  Validator
} = require('jsonschema');
const v = new Validator();
const {
  jobSchema
} = require('../schemas');
const {
  APIError,
  ensureCorrectCompanyById,
} = require("../helpers");

function readJobs(req, res, next) {
  return Job.find().then(jobs => {
    return res.json({
      jobs
    });
  });
}

function createJob(req, res, next) {
  let token = req.headers.authorization.split(' ')[1];
  let companyId = jwt.decode(token, { json: true }).companyId;
  req.body.company = companyId;
  let valid = v.validate(req.body, jobSchema);
  if (valid.errors.length === 0) {
    return Job.createJob(new Job(req.body))
      .then(() => {
        return res.status(201).redirect('/jobs');
      })
      .catch(err => {
        return next(
          new APIError(501, 'Not implemented', err)
        );
      })
  } else {
    return next(
      new APIError(400, 'Bad request', 'Required field(s) not correctly completed or additional fields added.')
    );
  }
}

function readJob(req, res, next) {
  return Job.findOne({
      jobId: `${req.params.jobId}`,
    })
    // add populate when applications and messages added later
    .then(job => {
      if (job === null) {
        throw new APIError(500, 'Server broken!', 'Bad things happened');
      }
      return res.json({
        job
      })
    })
    .catch(err => {
      return next(
        new APIError(400, 'Bad request', err)
      );
    });
}

function updateJob(req, res, next) {
  let companyId = req.body.company;
  let correctCompany;
  correctCompany = ensureCorrectCompanyById(
    req.headers.authorization,
    companyId
  );
  if (correctCompany !== 'OK') {
    return next(correctCompany);
  }
  let reqBody = { ...req.body
  };
  delete reqBody.jobId;
  delete reqBody.createdAt;
  delete reqBody.updatedAt;
  let valid = v.validate(reqBody, jobSchema);
  if (valid.errors.length) {
    return next({
      message: valid.errors.map(e => e.message).join(', ')
    })
  }
  return Job.findOneAndUpdate({
      jobId: `${req.params.jobId}`
    }, req.body)
    .then(() => {
      return res.redirect(`/jobs/${req.params.jobId}`);
    })
    .catch(err => {
      return next(err);
    });
}

function deleteJob(req, res, next) {
  let jobId = req.params.jobId;
  let correctCompany = ensureCorrectCompany(
    req.headers.authorization,
    jobId
  );
  if (correctCompany !== 'OK') {
    return next(correctCompany);
  }
  return Job.findOneAndRemove({
      jobId: `${req.params.jobId}`
    })
    .then(() => {
      return res.redirect('/jobs');
    })
    .catch(err => {
      return next(err);
    });
}

module.exports = {
  readJobs,
  createJob,
  readJob,
  updateJob,
  deleteJob
};