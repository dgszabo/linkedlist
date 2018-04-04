const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
    {
        companyName: {
            type: String,
            required: true,
            unique: true,
        },
        emailAddress: {
            type: String,
            required: true,
            unique: true,
        },
    },
    { timestamps: true },
)

const Company = mongoose.model('Company', companySchema, 'companies');

module.exports = Company;