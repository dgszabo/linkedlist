// npm packages
const jwt = require('jsonwebtoken');

// app imports
const {
  APIError
} = require('../helpers');

function ensureCorrectCompanyById(authHeader, correctCompany) {
  let companyId;
  let token = authHeader.split(' ')[1];
  try {
    companyId = jwt.decode(token, {
      json: true
    }).companyId;
  } catch (e) {
    return e;
  }
  if (companyId !== correctCompany) {
    return new APIError(
      401,
      'Unauthorized',
      'You are not authorized to make changes to this resource because permissions belong to another user.'
    );
  }
  return 'OK';
}

module.exports = ensureCorrectCompanyById;