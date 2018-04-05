const mongoose = require('mongoose');
const uuid4 = require('uuid/v4');
const bcrypt = require('bcrypt');

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
        // immutable: true,
    },
    emailAddress: {
        type: String,
        required: true,
        unique: true,
    },
    // password: {
    //     type: String,
    //     required: true
    // },
    firstName: String,
    lastName: String,
}, {
    timestamps: true
}, )

// userSchema.pre('save', function(monNext) {
//     if (!this.isModified)
// })

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