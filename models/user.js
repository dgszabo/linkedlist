const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
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
        firstName: String,
        lastName: String,
    },
    { timestamps: true },
)

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;