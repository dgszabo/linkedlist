const mongoose = require('mongoose');
const uuid4 = require('uuid/v4');

const Company = require('./company')

const experienceSchema = new mongoose.Schema({
    experienceId: {
        type: String,
        index: true
    }, 
    username: String,
    jobTitle: {
        type: String,
        required: true,
    },
    companyName: {
        type: String,
        required: true,
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    },
    startDate: String,
    endDate: String,
    },
)

// pre hook for getting company ID (if company in DB) and saving employee to company.employees
experienceSchema.pre('save', function (monNext) {

    let companyName = this.companyName;
    return Company.findOne({
        name: `${companyName}`
    })
    .then(company => {
        if(!company) {
            return this.companyId = null;
        }
        return Company.getMongoId(company.companyId);
    })
    .then(id => {
        return this.companyId = id;
    })
    .catch(err => {
        this.companyId = null;
    })
});

// userSchema.pre('findOneAndUpdate', function (monNext) {
//     if (this.getUpdate().currentCompanyName) {
//         return User.findOne({
//                 username: this._conditions.username
//             })
//             .then(user => {
//                 return Company.findOneAndUpdate({
//                     companyId: user.currentCompanyId
//                 }, {
//                     $pull: {
//                         employees: user.username
//                     }
//                 })
//             })
//             .then(() => {
//                 let username = this._conditions["username"];
//                 let currentCompanyName = this.getUpdate().currentCompanyName;
//                 return Company.findOneAndUpdate({
//                     name: `${currentCompanyName}`
//                 }, {
//                     $addToSet: {
//                         employees: username
//                     }
//                 })
//             })
//             .then(company => {
//                 return Company.getMongoId(company.companyId);
//             })
//             .then(id => {
//                 return this.getUpdate().currentCompanyId = id;
//             })
//             .catch(err => {
//                 this.getUpdate().currentCompanyId = null;
//             })
//     }
// });

// experienceSchema.methods
experienceSchema.statics = {
    createExperience(newExperience) {
        newExperience.experienceId = uuid4();
        return newExperience
            .save()
            .then(experience => {
                return experience.toObject();
            })
    },
    getMongoId(experienceId) {
        return Experience.findOne({
                experienceId
            }, {
                _id: 1
            })
            .exec()
            .then(experience => {
                return experience._id;
            })
    }
}

const Experience = mongoose.model('Experience', experienceSchema, 'experiences');

// This code removes _id and __v from query results
if (!experienceSchema.options.toObject) experienceSchema.options.toObject = {};
experienceSchema.options.toObject.transform = (doc, ret) => {
    const transformed = ret;
    delete transformed._id;
    delete transformed.__v;
    delete transformed.password;
    return transformed;
};

module.exports = Experience;