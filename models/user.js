const mongoose = require('mongoose');
const uuid4 = require('uuid/v4');
const bcrypt = require("bcrypt");

const Company = require('./company')

const SALT_WORK_FACTOR = 1;

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        index: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    emailAddress: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    firstName: String,
    lastName: String,
    currentCompanyName: String,
    currentCompanyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company"
    },
    photo: String,
    experience: [{
        _id: false,
        jobTitle: String,
        companyName: String,
        companyId: String,
        startDate: String,
        endDate: String,
    }],
    education: [{
        _id: false,
        institution: String,
        degree: String,
        endDate: String,
    }],
    skills: {
        type: Array,
        default: [],
    }
}, {
    timestamps: true
}, )


// user pre hooks for hashing or modifying the password
userSchema.pre('save', function (monNext) {

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

userSchema.pre('findOneAndUpdate', function (monNext) {
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

// post hook for getting company ID (if company in DB) and saving employee to company.employees
userSchema.pre('findOneAndUpdate', function (monNext) {
    if (this.getUpdate().currentCompanyName) {
        return User.findOne({
                username: this._conditions.username
            })
            .then(user => {
                return Company.findOneAndUpdate({
                    companyId: user.currentCompanyId
                }, {
                    $pull: {
                        employees: user.username
                    }
                })
            })
            .then(() => {
                let username = this._conditions["username"];
                let currentCompanyName = this.getUpdate().currentCompanyName;
                return Company.findOneAndUpdate({
                    name: `${currentCompanyName}`
                }, {
                    $addToSet: {
                        employees: username
                    }
                })
            })
            .then(company => {
                return Company.getMongoId(company.companyId);
            })
            .then(id => {
                return this.getUpdate().currentCompanyId = id;
            })
            .catch(err => {
                this.getUpdate().currentCompanyId = null;
            })
    }
});

// storySchema.post('remove', story => {
//   // remove from posting user's list of stories
//   mongoose
//     .model('User')
//     .updateUser(story.username, { $pull: { stories: story._id } });
//   // remove from favorites for all users who have favorited the story
//   mongoose.model('User').removeFavoriteFromAll(story._id);
// }); 

// userSchema.method

userSchema.statics = {
    createUser(newUser) {
        newUser.userId = uuid4();
        return newUser
            .save()
            .then(user => {
                return user.toObject();
            })
    },
    getMongoId(username) {
        return User.findOne({
                username
            }, {
                _id: 1
            })
            .exec()
            .then(user => {
                return user._id;
            })
    }
}

const User = mongoose.model('User', userSchema, 'users');

// This code removes _id and __v from query results
if (!userSchema.options.toObject) userSchema.options.toObject = {};
userSchema.options.toObject.transform = (doc, ret) => {
    const transformed = ret;
    delete transformed._id;
    delete transformed.__v;
    delete transformed.password;
    return transformed;
};

module.exports = User;