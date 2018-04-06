const mongoose = require('mongoose');
const uuid4 = require('uuid/v4');
const bcrypt = require("bcrypt");

const SALT_WORK_FACTOR = 1;

const companySchema = new mongoose.Schema({
    comapnyId: {
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
    jobs: {
        type: Array,
        default: [],
    }
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
    }
}

const Company = mongoose.model('Company', companySchema, 'companies');

// This code removes _id and __v from query results
if (!companySchema.options.toObject) companySchema.options.toObject = {};
companySchema.options.toObject.transform = (doc, ret) => {
    const transformed = ret;
    delete transformed._id;
    delete transformed.__v;
    return transformed;
};

module.exports = Company;