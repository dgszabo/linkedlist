const express = require('express');


const {
  jobHandler,
  authRequired
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
  .post(authRequired, createJob);

router
  .route('/:jobId')
  .get(authRequired, readJob)
  .patch(authRequired, updateJob)
  .delete(authRequired, deleteJob);

module.exports = router;