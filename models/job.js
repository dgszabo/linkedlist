const mongoose = require('mongoose');
const uuid4 = require('uuid/v4');
const bcrypt = require("bcrypt");

const SALT_WORK_FACTOR = 1;

const jobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    index: true
  },
  title: {
    type: String,
  },
  company: {
    type: String,
  },
  salary: {
    type: Number,
  },
  equity: {
    type: Number,
  }
}, {
  timestamps: true
}, )

// jobSchema.method

jobSchema.statics = {
  createJob(newJob) {
    newJob.jobId = uuid4();
    return newJob
      .save()
      .then(job => {
        return job.toObject();
      })
  }
}

const Job = mongoose.model('Job', jobSchema, 'jobs');

// This code removes _id and __v from query results
if (!jobSchema.options.toObject) jobSchema.options.toObject = {};
jobSchema.options.toObject.transform = (doc, ret) => {
  const transformed = ret;
  delete transformed._id;
  delete transformed.__v;
  return transformed;
};

module.exports = Job;