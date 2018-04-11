const mongoose = require('mongoose');
const uuid4 = require('uuid/v4');

const Company = require('./company')
const User = require('./user')

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
}, )

// pre hook for getting company ID (if company in DB) and saving employee to company.employees
experienceSchema.pre('save', function (monNext) {

    let companyName = this.companyName;
    return Company.findOne({
            name: `${companyName}`
        })
        .then(company => {
            if (!company) {
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

experienceSchema.pre('findOneAndUpdate', function (monNext) {
    let companyName = this.getUpdate().companyName;
    return Company.findOne({
            name: `${companyName}`
        })
        .then(company => {
            if (!company) {
                return this.getUpdate().companyId = null;
            }
            return Company.getMongoId(company.companyId);
        })
        .then(id => {
            return this.getUpdate().companyId = id;
        })
        .catch(err => {
            this.companyId = null;
        })
});

// experienceSchema.post('save', async experience => {
//     let mongoId = await Experience.getMongoId(experience.experienceId)
//     User.findOneAndUpdate({ username: experience.username }, { $addToSet: { experience: mongoId }})
//     .then(() => eval(require('locus')), console.log("reached here"))
//     .catch(err => {
//        return err;
//     })
//     // remove from favorites for all users who have favorited the story
//     // mongoose.model('User').removeFavoriteFromAll(experience._id);
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