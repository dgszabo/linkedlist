const mongoose = require('mongoose');
const uuid4 = require('uuid/v4');
const bcrypt = require("bcrypt");

const {
    Job
} = require('../models');

const SALT_WORK_FACTOR = 1;

const companySchema = new mongoose.Schema({
    companyId: {
        type: String,
        index: true
    },
    name: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    handle: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    logo: {
        type: String
    },
    employees: {
        type: Array,
        default: [],
    },
    jobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job"
    }],
}, {
    timestamps: true
}, )

companySchema.pre('save', function (monNext) {

    if (!this.isModified('password')) {
        return monNext();
    }
    return bcrypt
        .hash(this.password, SALT_WORK_FACTOR)
        .then(hash => {
            this.password = hash;
            return monNext();
        })
        .catch(err => next(err));
})

companySchema.pre('findOneAndUpdate', function (monNext) {
    const password = this.getUpdate().password;
    if (!password) {
        return monNext();
    }
    try {
        const salt = bcrypt.genSaltSync();
        const hash = bcrypt.hashSync(password, salt);
        this.getUpdate().password = hash;
        return monNext();
    } catch (error) {
        return next(error);
    }
});


// companySchema.method

companySchema.statics = {
    createCompany(newCompany) {
        newCompany.companyId = uuid4();
        return newCompany
            .save()
            .then(company => {
                return company.toObject();
            })
    },
    getMongoId(companyId) {
        return Company.findOne({
                companyId
            }, {
                _id: 1
            })
            .exec()
            .then(company => {
                return company._id;
            })
    }
}

const Company = mongoose.model('Company', companySchema, 'companies');

// This code removes _id and __v from query results
if (!companySchema.options.toObject) companySchema.options.toObject = {};
companySchema.options.toObject.transform = (doc, ret) => {
    const transformed = ret;
    delete transformed._id;
    delete transformed.__v;
    delete transformed.password;
    return transformed;
};

module.exports = Company;