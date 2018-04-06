const express = require('express');


const {
  jobHandler,
  authRequired,
  companyAuthRequired,
} = require('../handlers');
const {
  readJobs,
  createJob,
  readJob,
  updateJob,
  deleteJob
} = jobHandler;
const router = express.Router();
router
  .route('/')
  .get(readJobs)
  .post(companyAuthRequired, createJob);

router
  .route('/:jobId')
  .get(authRequired, readJob)
  .patch(companyAuthRequired, updateJob)
  .delete(companyAuthRequired, deleteJob);

module.exports = router;