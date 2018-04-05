const mongoose = require('mongoose');
const uuid4 = require('uuid/v4');
const bcrypt = require("bcrypt");

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
    currentCompanyId: String,
    photo: String,
	experience: [{
        _id: false,
		jobTitle: String,
		companyName: String,
		companyId: String,
		startDate: String,
		endDate: String,
	}],
	education: [ {
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


userSchema.pre('save', function (monNext) {

    if (!this.isModified('password')) {
        return monNext();
    }
    return bcrypt
        .hash(this.password, SALT_WORK_FACTOR)
        .then(hash => {
            console.log("This is the password: " + hash)
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


// userSchema.method

userSchema.statics = {
    createUser(newUser) {
        newUser.userId = uuid4();
        return newUser
            .save()
            .then(user => {
                return user.toObject();
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
    return transformed;
};

module.exports = User;