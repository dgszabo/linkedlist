// npm packages
const jwt = require('jsonwebtoken');

// app imports
const {
  APIError
} = require('../helpers');

function ensureCorrectCompanyByHandle(authHeader, correctCompany) {
  let handle;
  let token = authHeader.split(' ')[1];
  try {
    handle = jwt.decode(token, {
      json: true
    }).handle;
  } catch (e) {
    return e;
  }
  if (handle !== correctCompany) {
    return new APIError(
      401,
      'Unauthorized',
      'You are not authorized to make changes to this resource because permissions belong to another user.'
    );
  }
  return 'OK';
}

module.exports = ensureCorrectCompanyByHandle;